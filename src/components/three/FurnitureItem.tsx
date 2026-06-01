import React, { useRef } from 'react';
import * as THREE from 'three';
import { useSceneState } from '../../hooks/useSceneState';
import { Edges } from '@react-three/drei';
import { PlacedItem } from '../../types/interior';
import { ThreeEvent } from '@react-three/fiber';

interface FurnitureItemProps {
  item: PlacedItem;
  isSelected: boolean;
}

export default function FurnitureItem({ item, isSelected }: FurnitureItemProps) {
  const { itemsCatalog, materialsCatalog, selectItem, updateItemTransform } = useSceneState();
  const groupRef = useRef<THREE.Group>(null);

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
      return {
        color: material.color_hex || '#e8d5b7',
        roughness: material.roughness !== undefined ? Number(material.roughness) : 0.7,
        metalness: material.metalness !== undefined ? Number(material.metalness) : 0.05,
      };
    }
    
    // Default fallback styling
    return {
      color: '#c4a06a', // natural wood/oak tone
      roughness: 0.7,
      metalness: 0.0,
    };
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    selectItem(item.id);
  };

  // Drag-to-move implementation on floor plane (simple projection)
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isSelected || e.buttons !== 1) return; // Only drag when selected and mouse down
    e.stopPropagation();
    
    // Project intersection coordinate to Floor (y = 0 plane)
    const floorIntersectPoint = e.point;
    if (floorIntersectPoint) {
      updateItemTransform(item.id, {
        position: { 
          x: Math.round(floorIntersectPoint.x * 20) / 20, // snap to 5cm grid
          z: Math.round(floorIntersectPoint.z * 20) / 20 
        }
      });
    }
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
          {isSelected && <Edges scale={1.002} threshold={15} color="#14b8a6" lineWidth={2.5} />}
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
        {isSelected && <Edges scale={1.002} threshold={15} color="#14b8a6" lineWidth={2.5} />}
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
          {isSelected && <Edges scale={1.002} threshold={15} color="#14b8a6" lineWidth={2.5} />}
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
          {isSelected && <Edges scale={1.002} threshold={15} color="#14b8a6" lineWidth={2.5} />}
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
            {isSelected && <Edges scale={1.002} threshold={15} color="#14b8a6" lineWidth={2.5} />}
          </mesh>
        );
    }
  };

  // Euler rotation calculation in world space
  const posY = h / 2 + item.position[1]; // Make bottom of object snap to floor plane (y = 0)

  return (
    <group
      ref={groupRef}
      position={[item.position[0], posY, item.position[2]]}
      rotation={[0, item.rotationY, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {renderModel()}
    </group>
  );
}
