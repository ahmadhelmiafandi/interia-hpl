import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSceneState } from '../../hooks/useSceneState';
import { Edges } from '@react-three/drei';
import { PlacedItem } from '../../types/interior';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface SelectionHighlightProps {
  isSelected: boolean;
}

function SelectionHighlight({ isSelected }: SelectionHighlightProps) {
  const edgesRef = useRef<any>(null);
  const selectionAlpha = useRef(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setActive(true);
    }
  }, [isSelected]);

  useFrame((_, delta) => {
    if (isSelected) {
      selectionAlpha.current = Math.min(1, selectionAlpha.current + delta * 6);
    } else {
      selectionAlpha.current = Math.max(0, selectionAlpha.current - delta * 6);
      if (selectionAlpha.current === 0 && active) {
        setActive(false);
      }
    }

    if (edgesRef.current && edgesRef.current.material) {
      edgesRef.current.material.opacity = selectionAlpha.current;
      edgesRef.current.material.transparent = true;
      edgesRef.current.material.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <Edges
      ref={edgesRef}
      scale={1.002}
      threshold={15}
      color="#14b8a6"
      lineWidth={2.5}
      transparent
      opacity={0}
    />
  );
}

const textureCache: Record<string, THREE.CanvasTexture> = {};

function darkenColor(hex: string, percent: number) {
  let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent * 100),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
}

function getProceduralHplTexture(material: any) {
  if (!material) return null;
  const cacheKey = `${material.id}-${material.color_hex}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const baseColor = material.color_hex || '#e8d5b7';
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  if (material.category === 'wood') {
    // Draw wood grain lines
    ctx.strokeStyle = darkenColor(baseColor, 0.12);
    ctx.lineWidth = 1.2;
    for (let y = 0; y < 256; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 256; x += 8) {
        const wave = Math.sin(x * 0.04 + y * 0.05) * 2.5;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  } else if (material.category === 'stone') {
    // Concrete noise/marble vein styling
    ctx.fillStyle = darkenColor(baseColor, 0.08);
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache[cacheKey] = texture;
  return texture;
}

interface FurnitureItemProps {
  item: PlacedItem;
  isSelected: boolean;
}

export default function FurnitureItem({ item, isSelected }: FurnitureItemProps) {
  const { itemsCatalog, materialsCatalog, selectItem, updateItemTransform, setIsDraggingItem, roomConfig } = useSceneState();
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  // === SPAWN ANIMATION ===
  // Starts at 0 every mount, eases to 1 with "ease-out-back" bounce
  const spawnProgress = useRef(0);
  useFrame((_, delta) => {
    if (spawnProgress.current < 1) {
      spawnProgress.current = Math.min(1, spawnProgress.current + delta * 5);
      if (groupRef.current) {
        const t = spawnProgress.current;
        // Ease out back formula: bounces slightly past 1 before settling
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const s = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        groupRef.current.scale.setScalar(Math.max(0, s));
      }
    }
  });

  const catalogItem = itemsCatalog.find(i => i.id === item.item3dId);
  if (!catalogItem) return null;

  // Resolve dimensions (scale * default sizes, converted from cm to meters for 3D world)
  const w = (catalogItem.default_width * item.scale[0]) / 100;
  const h = (catalogItem.default_height * item.scale[1]) / 100;
  const d = (catalogItem.default_depth * item.scale[2]) / 100;

  // Helper to fetch material properties based on ID assignment
  const getMaterialProps = (partName: string) => {
    const matId = item.materialAssignments[partName];
    const material = materialsCatalog.find(m => m.id === matId);
    
    if (material) {
      const tex = getProceduralHplTexture(material);
      return {
        color: material.color_hex || '#e8d5b7',
        roughness: material.roughness !== undefined ? Number(material.roughness) : 0.7,
        metalness: material.metalness !== undefined ? Number(material.metalness) : 0.05,
        map: tex || undefined
      };
    }
    
    // Default fallback styling
    return {
      color: '#c4a06a', // natural wood/oak tone
      roughness: 0.7,
      metalness: 0.0,
    };
  };

  // ─── DRAG TO MOVE (Floor-Plane Projection + Wall Collision) ───────────────────
  // Menggunakan invisible drag plane di y=0 (lantai).
  // Posisi di-clamp agar furniture tidak menembus tembok (efek "mentok tembok").

  // Hitung batas ruangan dalam meter (room origin di center)
  const roomW = (roomConfig.width || 300) / 100; // lebar ruangan (meter)
  const roomL = (roomConfig.length || 300) / 100; // panjang ruangan (meter)

  // Hitung half-extents furniture, memperhitungkan rotasi
  const clampPosition = (rawX: number, rawZ: number) => {
    const cos = Math.abs(Math.cos(item.rotationY));
    const sin = Math.abs(Math.sin(item.rotationY));
    // Rotated bounding box half-extents
    const halfExtX = (w * cos + d * sin) / 2;
    const halfExtZ = (w * sin + d * cos) / 2;

    // Batas minimum/maksimum agar bounding box tidak keluar tembok
    const minX = -roomW / 2 + halfExtX;
    const maxX = roomW / 2 - halfExtX;
    const minZ = -roomL / 2 + halfExtZ;
    const maxZ = roomL / 2 - halfExtZ;

    return {
      x: Math.max(minX, Math.min(maxX, rawX)),
      z: Math.max(minZ, Math.min(maxZ, rawZ)),
    };
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    selectItem(item.id);
    setIsDragging(true);
    setIsDraggingItem(true); // Nonaktifkan OrbitControls selama drag
  };

  const handleDragPlaneMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Jika tombol mouse sudah dilepas, hentikan drag
    if (e.buttons !== 1) {
      setIsDragging(false);
      setIsDraggingItem(false);
      return;
    }
    // Snap ke grid 5cm lalu clamp ke batas tembok
    const snappedX = Math.round(e.point.x * 20) / 20;
    const snappedZ = Math.round(e.point.z * 20) / 20;
    const clamped = clampPosition(snappedX, snappedZ);

    updateItemTransform(item.id, {
      position: { x: clamped.x, z: clamped.z }
    });
  };

  const handleDragPlaneUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    setIsDraggingItem(false);
  };

  // ──── PROCEDURAL MODEL RENDERERS (Fallback when GLB not provided) ────

  // 1. Kitchen Base / Wall Cabinet Model
  const renderCabinet = (isWall = false) => {
    const bodyProps = getMaterialProps('body');
    const doorProps = getMaterialProps('door');
    const handleColor = '#94a3b8'; // stainless silver

    return (
      <group>
        {/* Main Cabinet Body (Outer Box shell) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...bodyProps} />
          <SelectionHighlight isSelected={isSelected} />
        </mesh>

        {/* Toe kick base panel (Only for base kitchen cabinets) */}
        {!isWall && h > 0.4 && (
          <mesh position={[0, -h / 2 + 0.05, d / 2 - 0.03]} castShadow>
            <boxGeometry args={[w - 0.01, 0.1, 0.02]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        )}

        {/* Cabinet Door panel on the front face */}
        <mesh position={[0, 0, d / 2 + 0.005]} castShadow>
          <boxGeometry args={[w - 0.01, h - 0.02, 0.015]} />
          <meshStandardMaterial {...doorProps} />
        </mesh>

        {/* Minimalist Stainless Handle */}
        <mesh position={[w / 2 - 0.06, 0, d / 2 + 0.016]} castShadow>
          <boxGeometry args={[0.012, 0.15, 0.015]} />
          <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  };

  // 2. Kitchen Countertop Slab Model
  const renderCountertop = () => {
    const matProps = getMaterialProps('countertop');
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...matProps} />
        <SelectionHighlight isSelected={isSelected} />
      </mesh>
    );
  };

  // 3. Tall 2-Door Wardrobe Model
  const renderWardrobe = () => {
    const bodyProps = getMaterialProps('body');
    const doorProps = getMaterialProps('door');
    const sideProps = getMaterialProps('side_panel') || bodyProps;

    return (
      <group>
        {/* Wardrobe Outer Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...sideProps} />
          <SelectionHighlight isSelected={isSelected} />
        </mesh>

        {/* Left Door */}
        <mesh position={[-w / 4 + 0.002, 0, d / 2 + 0.006]} castShadow>
          <boxGeometry args={[w / 2 - 0.006, h - 0.04, 0.018]} />
          <meshStandardMaterial {...doorProps} />
        </mesh>

        {/* Right Door */}
        <mesh position={[w / 4 - 0.002, 0, d / 2 + 0.006]} castShadow>
          <boxGeometry args={[w / 2 - 0.006, h - 0.04, 0.018]} />
          <meshStandardMaterial {...doorProps} />
        </mesh>

        {/* Long Modern Vertical Handles */}
        <mesh position={[-0.015, 0, d / 2 + 0.018]} castShadow>
          <boxGeometry args={[0.01, 0.6, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.015, 0, d / 2 + 0.018]} castShadow>
          <boxGeometry args={[0.01, 0.6, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  };

  // 4. TV Floating Rack Drawer
  const renderTVRack = () => {
    const bodyProps = getMaterialProps('body');
    const doorProps = getMaterialProps('door');

    return (
      <group>
        {/* Floating Cabinet Main Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...bodyProps} />
          <SelectionHighlight isSelected={isSelected} />
        </mesh>

        {/* Front Drawers */}
        <mesh position={[0, 0, d / 2 + 0.004]} castShadow>
          <boxGeometry args={[w - 0.02, h - 0.02, 0.015]} />
          <meshStandardMaterial {...doorProps} />
        </mesh>
      </group>
    );
  };

  // Determine model style depending on category
  const renderModel = () => {
    switch (catalogItem.category) {
      case 'kitchen':
        if (catalogItem.slug.includes('countertop')) {
          return renderCountertop();
        }
        return renderCabinet(catalogItem.slug.includes('wall'));
      case 'wardrobe':
        return renderWardrobe();
      case 'tv-rack':
        return renderTVRack();
      default:
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} />
            <SelectionHighlight isSelected={isSelected} />
          </mesh>
        );
    }
  };

  // Bottom of object snaps to floor plane (y = 0)
  const posY = h / 2 + item.position[1];

  return (
    <group
      ref={groupRef}
      position={[item.position[0], posY, item.position[2]]}
      rotation={[0, item.rotationY, 0]}
      onPointerDown={handlePointerDown}
    >
      {renderModel()}

      {/*
        INVISIBLE DRAG PLANE — Muncul hanya saat drag aktif.
        Posisi [0, -posY, 0] dalam local space = world y=0 (lantai).
        Ukuran 50x50m mencakup seluruh ruangan sehingga pointer tidak
        "keluar" dari area drag meskipun cursor melewati batas furniture.
        e.point dari plane ini selalu ada di lantai (y=0 world space).
      */}
      {isDragging && (
        <mesh
          position={[0, -posY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={handleDragPlaneMove}
          onPointerUp={handleDragPlaneUp}
        >
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
