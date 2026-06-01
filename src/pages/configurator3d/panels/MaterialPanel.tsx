import React, { useState, useEffect } from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { Palette, Check, Sparkles } from 'lucide-react';

const MATERIAL_TABS = [
  { id: 'all', label: 'Semua HPL' },
  { id: 'wood', label: 'Motif Kayu' },
  { id: 'solid', label: 'Warna Solid' },
  { id: 'stone', label: 'Batu/Semen' },
];

export default function MaterialPanel() {
  const { 
    placedItems, 
    selectedItemId, 
    itemsCatalog, 
    materialsCatalog, 
    assignMaterial 
  } = useSceneState();

  const [activePart, setActivePart] = useState('');
  const [activeType, setActiveType] = useState('all');

  const selectedItem = placedItems.find(item => item.id === selectedItemId);
  const catalogItem = selectedItem 
    ? itemsCatalog.find(i => i.id === selectedItem.item3dId) 
    : null;

  // Auto select first mesh part when selected item changes
  useEffect(() => {
    if (catalogItem && catalogItem.mesh_parts) {
      const parts = Object.keys(catalogItem.mesh_parts);
      if (parts.length > 0 && !parts.includes(activePart)) {
        setActivePart(parts[0]);
      }
    } else {
      setActivePart('');
    }
  }, [catalogItem, activePart]);

  if (!selectedItemId || !selectedItem || !catalogItem) {
    return (
      <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 justify-center items-center text-center">
        <div className="w-16 h-16 bg-slate-950/60 border border-slate-800 rounded-full flex items-center justify-center text-2xl text-slate-500 mb-4 animate-pulse">
          🎨
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Belum ada item dipilih</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
          Pilih salah satu furnitur di canvas untuk mulai menyesuaikan warna & motif HPL.
        </p>
      </div>
    );
  }

  const partsList = catalogItem.mesh_parts ? Object.keys(catalogItem.mesh_parts) : [];
  
  // Filter materials based on current active mesh part and tab category
  const filteredMaterials = materialsCatalog.filter(mat => {
    const isPartApplicable = mat.applicable_parts.includes(activePart);
    const isTabMatch = activeType === 'all' || mat.category === activeType;
    return isPartApplicable && isTabMatch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
          <Palette size={18} />
          Material & Swapper
        </h2>
        <p className="text-xs text-slate-400">Kustomisasi motif HPL per bagian</p>
      </div>

      {/* Part Selectors */}
      <div className="py-4 border-b border-slate-800/50">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Pilih Bagian Furnitur:
        </label>
        <div className="flex flex-wrap gap-2 select-none">
          {partsList.map(part => {
            const assignedMatId = selectedItem.materialAssignments[part];
            const assignedMat = materialsCatalog.find(m => m.id === assignedMatId);

            return (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1 active:scale-95 ${
                  activePart === part
                    ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md shadow-teal-500/5'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="capitalize">{part}</span>
                <span className="text-[9px] font-mono text-slate-500 truncate max-w-[90px]">
                  {assignedMat ? assignedMat.code : 'Default'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials Categories filter */}
      <div className="flex gap-1.5 py-3 border-b border-slate-800/30 overflow-x-auto no-scrollbar">
        {MATERIAL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeType === tab.id
                ? 'bg-slate-200 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swatches Grid */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        <div className="grid grid-cols-2 gap-3">
          {filteredMaterials.map(material => {
            const isAssigned = selectedItem.materialAssignments[activePart] === material.id;
            const hasModifier = Number(material.price_modifier) > 1.0;

            return (
              <div
                key={material.id}
                onClick={() => assignMaterial(selectedItem.id, activePart, material.id)}
                className={`group flex flex-col bg-slate-950/40 hover:bg-slate-950/80 transition-all rounded-xl border p-2.5 cursor-pointer relative overflow-hidden active:scale-98 ${
                  isAssigned 
                    ? 'border-teal-500 shadow-lg shadow-teal-500/5' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Material Swatch Circle */}
                <div 
                  className="w-full h-16 rounded-lg relative overflow-hidden shadow-inner border border-slate-800/50 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300"
                  style={{ backgroundColor: material.color_hex }}
                >
                  {/* Swatch glossy / finish reflections */}
                  {material.finish === 'glossy' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 transform skew-x-12" />
                  )}
                  {material.finish === 'textured' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px] opacity-10" />
                  )}
                  
                  {isAssigned && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg border border-slate-950/10">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}

                  {/* Premium Modifier Tag */}
                  {hasModifier && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold bg-amber-400/90 text-slate-950 px-1 rounded flex items-center gap-0.5 shadow-sm">
                      <Sparkles size={7} />
                      +{Math.round((Number(material.price_modifier) - 1.0) * 100)}%
                    </span>
                  )}
                </div>

                {/* Swatch Info */}
                <div className="mt-2 min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                    {material.brand}
                  </span>
                  <h5 className="font-semibold text-xs text-slate-200 truncate group-hover:text-white transition-colors">
                    {material.name}
                  </h5>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    Kode: {material.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
