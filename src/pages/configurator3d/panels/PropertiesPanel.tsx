import React from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { Sliders, Move, RotateCw, Maximize2, Trash2, Copy } from 'lucide-react';

export default function PropertiesPanel() {
  const { 
    placedItems, 
    selectedItemId, 
    itemsCatalog, 
    updateItemTransform, 
    removeItem,
    duplicateItem
  } = useSceneState();

  const selectedItem = placedItems.find(item => item.id === selectedItemId);
  const catalogItem = selectedItem 
    ? itemsCatalog.find(i => i.id === selectedItem.item3dId) 
    : null;

  if (!selectedItemId || !selectedItem || !catalogItem) {
    return (
      <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 justify-center items-center text-center">
        <div className="w-16 h-16 bg-slate-950/60 border border-slate-800 rounded-full flex items-center justify-center text-2xl text-slate-500 mb-4 animate-pulse">
          ⚙️
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Belum ada item dipilih</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
          Pilih salah satu furnitur di canvas untuk memodifikasi dimensi, posisi, dan rotasi.
        </p>
      </div>
    );
  }

  // Position updates
  const handlePositionChange = (axis: 'x' | 'z', value: string) => {
    updateItemTransform(selectedItem.id, {
      position: { [axis]: Number(value) }
    });
  };

  // Rotation Y (Euler, converted from degrees to radians)
  const handleRotationChange = (degValue: string) => {
    const rad = (Number(degValue) * Math.PI) / 180;
    updateItemTransform(selectedItem.id, {
      rotationY: rad
    });
  };

  // Scaling width (with min_width/max_width checks)
  const handleWidthChange = (targetWidthCm: string) => {
    const minW = catalogItem.min_width || 30;
    const maxW = catalogItem.max_width || 120;
    
    // Clamp within constraints
    const clampedW = Math.max(minW, Math.min(maxW, Number(targetWidthCm)));
    
    // Scale factor = target_width / default_width
    const scaleX = clampedW / catalogItem.default_width;
    
    updateItemTransform(selectedItem.id, {
      scale: { x: scaleX }
    });
  };

  const currentWidth = Math.round(catalogItem.default_width * selectedItem.scale[0]);
  // Normalize rotation degrees to [0, 359] to prevent slider from getting stuck at 360
  const currentRotationDeg = ((Math.round((selectedItem.rotationY * 180) / Math.PI) % 360) + 360) % 360;

  const canScaleX = catalogItem.scalable_axis?.includes('x');

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
          <Sliders size={18} />
          Properties & Transform
        </h2>
        <p className="text-xs text-slate-400">Atur dimensi, orientasi, dan peletakan</p>
      </div>

      {/* Info card */}
      <div className="bg-slate-950/45 rounded-xl border border-slate-800 p-3 mt-4 flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-xs text-slate-200">{catalogItem.name}</h4>
          <span className="text-[10px] text-slate-500 font-mono">ID: {selectedItem.id.slice(-8)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => duplicateItem(selectedItem.id)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
            title="Duplikat item ini"
          >
            <Copy size={10} /> Duplikat
          </button>
          <button
            onClick={() => removeItem(selectedItem.id)}
            className="px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 hover:bg-red-500 text-red-400 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
          >
            <Trash2 size={10} /> Hapus
          </button>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 select-none">
        
        {/* 1. Dimension Resize Slider */}
        {canScaleX && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Maximize2 size={13} className="text-teal-400" />
              Sesuaikan Ukuran (Modular)
            </h4>
            <div className="bg-slate-950/30 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Panjang Modul:</span>
                <span className="text-teal-400">{currentWidth} cm</span>
              </div>
              <input
                type="range"
                min={catalogItem.min_width || 30}
                max={catalogItem.max_width || 120}
                step={5}
                value={currentWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
                <span>Min: {catalogItem.min_width || 30}cm</span>
                <span>Max: {catalogItem.max_width || 120}cm</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Rotation Y Slider */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <RotateCw size={13} className="text-teal-400" />
            Rotasi Furnitur
          </h4>
          <div className="bg-slate-950/30 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Sudut (Y-Axis):</span>
              <span className="text-teal-400">{currentRotationDeg}°</span>
            </div>
          <input
              type="range"
              min={0}
              max={359}
              step={15}
              value={currentRotationDeg}
              onChange={(e) => handleRotationChange(e.target.value)}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
              <span>0°</span>
              <span>180°</span>
              <span>360°</span>
            </div>
          </div>
        </div>

        {/* 3. Floor translation values */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Move size={13} className="text-teal-400" />
            Pergeseran Posisi (Lantai)
          </h4>
          <div className="bg-slate-950/30 rounded-xl border border-slate-800 p-4 space-y-4">
            {/* Axis X */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold font-mono">Geser X (Kiri/Kanan):</span>
                <span className="text-slate-200 font-bold font-mono">{selectedItem.position[0].toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.05}
                value={selectedItem.position[0]}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Axis Z */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold font-mono">Geser Z (Depan/Belakang):</span>
                <span className="text-slate-200 font-bold font-mono">{selectedItem.position[2].toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.05}
                value={selectedItem.position[2]}
                onChange={(e) => handlePositionChange('z', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto bg-slate-950/20 border border-slate-800/80 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed">
        💡 <strong>Tips Cepat:</strong> Anda juga bisa langsung menggeser/drag objek pada canvas untuk menggeser posisinya secara interaktif.
      </div>
    </div>
  );
}
