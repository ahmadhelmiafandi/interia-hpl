import React, { useRef, useEffect, useState } from 'react';
import { useSceneState } from '../../hooks/useSceneState';

interface Point2D {
  x: number;
  y: number;
}

export default function GridCalibration() {
  const { calibrationPoints, setCalibrationPoints, activeTool } = useSceneState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing of the viewport container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Periodically check size to handle panel transitions
    const interval = setInterval(updateSize, 300);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearInterval(interval);
    };
  }, []);

  if (activeTool !== 'calibrate') return null;

  // Convert normalized coordinate [0..1] to pixel coordinate
  const toPixels = (point: Point2D) => ({
    x: point.x * dimensions.width,
    y: point.y * dimensions.height,
  });

  const p0 = toPixels(calibrationPoints[0]); // Bottom-Left
  const p1 = toPixels(calibrationPoints[1]); // Bottom-Right
  const p2 = toPixels(calibrationPoints[2]); // Top-Right
  const p3 = toPixels(calibrationPoints[3]); // Top-Left

  // Dragging event handlers
  const handleStartDrag = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(index);
  };

  useEffect(() => {
    if (activeHandle === null) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Support both mouse and touch events
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Calculate normalized position relative to container
      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;

      // Bound coordinates inside viewport
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      const newPoints = [...calibrationPoints];
      newPoints[activeHandle] = { x, y };
      setCalibrationPoints(newPoints);
    };

    const handleStop = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [activeHandle, calibrationPoints, setCalibrationPoints]);

  // Generate subdivisions for visual perspective grid (3x3 grid lines)
  const getGridLines = () => {
    const lines = [];
    const divisions = 4; // creates 4x4 squares (3 intermediate lines)

    // Helper to interpolate between two points
    const lerp = (ptA: Point2D, ptB: Point2D, t: number) => ({
      x: ptA.x + (ptB.x - ptA.x) * t,
      y: ptA.y + (ptB.y - ptA.y) * t,
    });

    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;

      // Horizontal grid lines (connecting Left and Right sides)
      const leftPt = lerp(p0, p3, t);
      const rightPt = lerp(p1, p2, t);
      lines.push(
        <line
          key={`h-${i}`}
          x1={leftPt.x}
          y1={leftPt.y}
          x2={rightPt.x}
          y2={rightPt.y}
          className="stroke-teal-400/30 stroke-1"
          strokeDasharray="4 2"
        />
      );

      // Vertical grid lines (connecting Bottom and Top sides)
      const bottomPt = lerp(p0, p1, t);
      const topPt = lerp(p3, p2, t);
      lines.push(
        <line
          key={`v-${i}`}
          x1={bottomPt.x}
          y1={bottomPt.y}
          x2={topPt.x}
          y2={topPt.y}
          className="stroke-teal-400/30 stroke-1"
          strokeDasharray="4 2"
        />
      );
    }
    return lines;
  };

  const handleLabels = ["Kiri Depan", "Kanan Depan", "Kanan Belakang", "Kiri Belakang"];

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none select-none"
    >
      <svg className="w-full h-full">
        {/* Draw semi-transparent background outside floor polygon for focus */}
        <defs>
          <mask id="floor-mask">
            <rect width="100%" height="100%" fill="white" />
            <polygon 
              points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} 
              fill="black" 
            />
          </mask>
        </defs>
        
        {/* Dark dim overlay on screen except floor area */}
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(15, 23, 42, 0.45)" 
          mask="url(#floor-mask)"
        />

        {/* Floor polygon boundary */}
        <polygon
          points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          className="fill-teal-500/10 stroke-teal-400 stroke-2"
        />

        {/* Perspective grid division lines */}
        {dimensions.width > 0 && getGridLines()}

        {/* Draggable circles */}
        {[p0, p1, p2, p3].map((p, idx) => (
          <g key={idx} className="pointer-events-auto cursor-grab active:cursor-grabbing">
            {/* Draggable glow ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r={24}
              fill="transparent"
              onMouseDown={(e) => handleStartDrag(idx, e)}
              onTouchStart={(e) => handleStartDrag(idx, e)}
            />
            {/* Outer neon border */}
            <circle
              cx={p.x}
              cy={p.y}
              r={10}
              className="stroke-teal-400 stroke-2 fill-slate-900/90 shadow-lg drop-shadow-[0_0_8px_rgba(20,184,166,0.8)] transition-transform duration-100 hover:scale-125"
            />
            {/* Inner solid point */}
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              className="fill-teal-400"
            />
            {/* Corner labels */}
            <text
              x={p.x}
              y={p.y - 15}
              textAnchor="middle"
              className="fill-teal-300 font-bold text-[9px] bg-slate-950 px-1 py-0.5 rounded font-mono uppercase tracking-wider filter drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
            >
              {handleLabels[idx]}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Visual instructions badge */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950/80 backdrop-blur border border-teal-500/30 px-5 py-3 rounded-full text-center text-xs text-teal-300 shadow-xl max-w-sm pointer-events-auto">
        🔧 Geser **4 Titik Neon** untuk menyelaraskan dengan **4 sudut lantai asli** di foto Anda.
      </div>
    </div>
  );
}
