import React, { Suspense, useMemo, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { useSceneState } from '../../hooks/useSceneState';
import FurnitureItem from './FurnitureItem';
import { CanvasTexture, RepeatWrapping } from 'three';
import * as THREE from 'three';

// Linear Congruential Generator helper for deterministic random numbers
function createRandom(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Camera Manager for smooth lerp transitions on preset switch
function CameraManager() {
  const { camera, controls } = useThree();
  const { cameraConfig } = useSceneState();
  const animating = useRef(false);
  const lastPreset = useRef(cameraConfig.preset);

  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useEffect(() => {
    if (cameraConfig.preset !== lastPreset.current) {
      lastPreset.current = cameraConfig.preset;
      animating.current = true;

      const p = cameraConfig.preset;
      if (p === 'top') {
        targetPos.current.set(0.001, 8.5, 0);
        targetLook.current.set(0, 0, 0);
      } else if (p === 'front') {
        targetPos.current.set(0, 2.0, 7.5);
        targetLook.current.set(0, 1.0, 0);
      } else if (p === 'side') {
        targetPos.current.set(7.5, 2.0, 0);
        targetLook.current.set(0, 1.0, 0);
      } else {
        // isometric
        targetPos.current.set(5.5, 4.5, 6.5);
        targetLook.current.set(0, 0.5, 0);
      }
    }
  }, [cameraConfig.preset]);

  useFrame((_, delta) => {
    if (!animating.current) return;

    // Lerp position
    camera.position.lerp(targetPos.current, delta * 6);

    // Lerp controls target if available
    if (controls) {
      const ctrl = controls as any;
      if (ctrl.target) {
        const tempTarget = new THREE.Vector3(ctrl.target.x, ctrl.target.y, ctrl.target.z);
        tempTarget.lerp(targetLook.current, delta * 6);
        ctrl.target.set(tempTarget.x, tempTarget.y, tempTarget.z);
      }
    }

    // Stop animating when we get very close
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      animating.current = false;
      camera.position.copy(targetPos.current);
      if (controls) {
        (controls as any).target.set(targetLook.current.x, targetLook.current.y, targetLook.current.z);
      }
    }
  });

  return null;
}

// Custom hook to generate procedural floor texture based on type
function useFloorTexture(floorType: string) {
  const texture = useMemo(() => {
    const rand = createRandom(56789); // seedable random
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    if (floorType === 'wood_light' || floorType === 'wood_dark') {
      // Background base plank color
      ctx.fillStyle = floorType === 'wood_dark' ? '#4C3020' : '#D2B088';
      ctx.fillRect(0, 0, 512, 512);

      // Plank lines
      ctx.strokeStyle = floorType === 'wood_dark' ? '#321E14' : '#B8946E';
      ctx.lineWidth = 4;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
      // Staggered horizontal borders
      ctx.lineWidth = 2;
      for (let row = 0; row < 8; row++) {
        const y = row * 64;
        const shift = (row % 2) * 128;
        for (let col = -1; col < 6; col++) {
          const x = col * 128 + shift;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 64);
          ctx.stroke();
        }
      }
      
      // Subtle wood veins
      ctx.strokeStyle = floorType === 'wood_dark' ? 'rgba(30,15,5,0.12)' : 'rgba(255,255,255,0.15)';
      for (let row = 0; row < 8; row++) {
        const y = row * 64 + 32;
        ctx.beginPath();
        ctx.arc(256, y, 200, 0, Math.PI, false);
        ctx.stroke();
      }
    } else if (floorType === 'marble_white' || floorType === 'marble_dark') {
      ctx.fillStyle = floorType === 'marble_dark' ? '#18181A' : '#FAF9F6';
      ctx.fillRect(0, 0, 512, 512);

      // Tile lines
      ctx.strokeStyle = floorType === 'marble_dark' ? '#2c2c2e' : '#E5E5E5';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, 512, 512);
      ctx.beginPath();
      ctx.moveTo(256, 0); ctx.lineTo(256, 512);
      ctx.moveTo(0, 256); ctx.lineTo(512, 256);
      ctx.stroke();

      // Veins
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = floorType === 'marble_dark' ? 'rgba(255,255,255,0.18)' : 'rgba(100,100,100,0.12)';
      const drawVein = (x: number, y: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x;
        let cy = y;
        for (let i = 0; i < 12; i++) {
          cx += (rand() - 0.4) * 20;
          cy += (rand() - 0.1) * 22;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      };
      drawVein(50, 40);
      drawVein(300, 100);
      drawVein(120, 320);
      drawVein(400, 350);
    } else if (floorType === 'concrete') {
      ctx.fillStyle = '#9C9C9E';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 300; i++) {
        const x = rand() * 512;
        const y = rand() * 512;
        const r = 20 + rand() * 60;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(140,140,140,0.15)');
        grad.addColorStop(1, 'rgba(140,140,140,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Carpet
      ctx.fillStyle = '#F4ECE1';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(100,90,80,0.05)';
      for (let i = 0; i < 8000; i++) {
        const x = rand() * 512;
        const y = rand() * 512;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    if (floorType === 'carpet') {
      tex.repeat.set(3, 3);
    } else if (floorType === 'wood_light' || floorType === 'wood_dark') {
      tex.repeat.set(1.5, 1.5);
    } else {
      tex.repeat.set(1, 1);
    }
    return tex;
  }, [floorType]);

  return texture;
}

// Room boundaries visualization (procedural walls and floor)
function RoomShell() {
  const { roomConfig, backgroundPhotoUrl } = useSceneState();
  const w = (roomConfig.width || 300) / 100;
  const l = (roomConfig.length || 300) / 100;
  const h = (roomConfig.height || 250) / 100;

  const floorTexture = useFloorTexture(roomConfig.floorType || 'wood_light');

  let floorRoughness = 0.5;
  let floorMetalness = 0.05;
  if (roomConfig.floorType?.startsWith('marble')) {
    floorRoughness = 0.15;
    floorMetalness = 0.1;
  } else if (roomConfig.floorType === 'concrete') {
    floorRoughness = 0.65;
    floorMetalness = 0.0;
  } else if (roomConfig.floorType === 'carpet') {
    floorRoughness = 0.95;
    floorMetalness = 0.0;
  }

  return (
    <group>
      {/* Floor - standard plane with shadow receiving */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        {floorTexture && (
          <meshStandardMaterial 
            map={floorTexture}
            roughness={floorRoughness}
            metalness={floorMetalness}
          />
        )}
      </mesh>

      {/* Render walls only when NO photo background is set */}
      {!backgroundPhotoUrl && (
        <>
          {/* Back Wall */}
          <mesh position={[0, h / 2, -l / 2]} receiveShadow castShadow>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color={roomConfig.wallColor || '#f8fafc'} roughness={0.9} />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
            <planeGeometry args={[l, h]} />
            <meshStandardMaterial color={roomConfig.wallColor || '#f1f5f9'} roughness={0.9} />
          </mesh>
          {/* Right Wall */}
          <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
            <planeGeometry args={[l, h]} />
            <meshStandardMaterial color={roomConfig.wallColor || '#f1f5f9'} roughness={0.9} />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function SceneCanvas() {
  const { 
    placedItems, 
    backgroundPhotoUrl, 
    isLocked, 
    isDraggingItem,
    selectedItemId, 
    selectItem,
    roomConfig,
    cameraConfig
  } = useSceneState();

  const handleCanvasPointerMissed = (e: MouseEvent) => {
    if (e.target && (e.target as HTMLElement).tagName === 'CANVAS') {
      selectItem(null);
    }
  };

  const w = (roomConfig.width || 300) / 100;
  const l = (roomConfig.length || 300) / 100;

  return (
    <div className="relative w-full h-full bg-[#F0F2F5] overflow-hidden select-none">
      {/* Background Room Photo (HTML layer behind transparent canvas) */}
      {backgroundPhotoUrl && (
        <img
          src={backgroundPhotoUrl}
          alt="Room Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        />
      )}

      {/* R3F Canvas Layer */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <Canvas
          shadows
          gl={{ alpha: true, preserveDrawingBuffer: true, antialias: true }}
          onPointerMissed={handleCanvasPointerMissed}
        >
          <CameraManager />
          {/* Declarative Camera System */}
          {cameraConfig.mode === 'orthographic' ? (
            <OrthographicCamera
              makeDefault
              position={
                cameraConfig.preset === 'top' ? [0.001, 8.5, 0] :
                cameraConfig.preset === 'front' ? [0, 2.0, 7.5] :
                cameraConfig.preset === 'side' ? [7.5, 2.0, 0] :
                [5.5, 4.5, 6.5]
              }
              zoom={140}
              far={100}
              near={0.1}
            />
          ) : (
            <PerspectiveCamera
              makeDefault
              fov={cameraConfig.fov || 45}
              position={
                cameraConfig.preset === 'top' ? [0.01, 8.5, 0] :
                cameraConfig.preset === 'front' ? [0, 2.0, 7.5] :
                cameraConfig.preset === 'side' ? [7.5, 2.0, 0] :
                [5.5, 4.5, 6.5]
              }
              far={100}
              near={0.1}
            />
          )}

          {/* Real-time lighting system */}
          <ambientLight intensity={roomConfig.ambientIntensity ?? 0.6} />
          
          {/* Main sunlight source casting soft shadows */}
          <directionalLight
            position={[-7, 5, 4]}
            intensity={roomConfig.sunIntensity ?? 0.85}
            color="#fffbe0"
            castShadow={roomConfig.shadowsEnabled ?? true}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0003}
          />
          
          {/* Fill light */}
          <directionalLight 
            position={[5, 5, -5]} 
            intensity={0.3} 
            color="#bae6fd" 
          />

          <Suspense fallback={null}>
            {/* Environment map for realistic specular gloss and HPL reflection */}
            <Environment preset="apartment" background={false} />
            
            {/* Floor, ceiling & walls */}
            <RoomShell />
            
            {/* Render 3D list items */}
            {placedItems.map((item) => (
              <FurnitureItem 
                key={item.id} 
                item={item} 
                isSelected={item.id === selectedItemId} 
              />
            ))}
          </Suspense>

          {/* SketchUp-style Grid Helper */}
          {!backgroundPhotoUrl && cameraConfig.gridVisible && (
            <Grid
              renderOrder={-1}
              position={[0, -0.001, 0]}
              args={[10.5, 10.5]}
              cellSize={0.2}
              cellThickness={0.5}
              cellColor="#cbd5e1"
              sectionSize={1}
              sectionThickness={1.2}
              sectionColor="#94a3b8"
              fadeDistance={25}
              fadeStrength={1}
              infiniteGrid
            />
          )}

          {/* SketchUp-style Axes Helper at corner of room grid */}
          {!backgroundPhotoUrl && cameraConfig.helperVisible && (
            <axesHelper args={[3]} position={[-w / 2 + 0.01, 0.01, -l / 2 + 0.01]} />
          )}

          {/* Camera OrbitControls */}
          <OrbitControls
            makeDefault
            enabled={!isLocked && !isDraggingItem}
            maxPolarAngle={Math.PI / 2 - 0.05} // don't go below floor
            minDistance={1}
            maxDistance={15}
            dampingFactor={0.05}
            enableDamping
            target={
              cameraConfig.preset === 'top' ? [0, 0, 0] :
              cameraConfig.preset === 'front' || cameraConfig.preset === 'side' ? [0, 1.0, 0] :
              [0, 0.5, 0]
            }
          />
        </Canvas>
      </div>
    </div>
  );
}
