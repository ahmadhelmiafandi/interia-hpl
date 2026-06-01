import React, { useState } from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { Layers, Plus } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'wardrobe', label: 'Lemari' },
  { id: 'tv-rack', label: 'TV Rack' },
];

export default function CatalogPanel() {
  const { itemsCatalog, addItem } = useSceneState();
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = activeTab === 'all'
    ? itemsCatalog
    : itemsCatalog.filter(item => item.category === activeTab);

  const getEmoji = (slug: string) => {
    if (slug.includes('kitchen')) return '🍳';
    if (slug.includes('wardrobe')) return '👗';
    if (slug.includes('tv')) return '📺';
    return '🪑';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
          <Layers size={18} />
          Katalog Furnitur 3D
        </h2>
        <p className="text-xs text-slate-400">Klik item untuk menambahkannya ke scene</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 py-3 border-b border-slate-800/50 overflow-x-auto select-none no-scrollbar">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeTab === tab.id
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Tidak ada item di kategori ini.</p>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => addItem(item.id)}
              className="group flex gap-4 bg-slate-950/45 hover:bg-slate-950/80 transition-all rounded-xl border border-slate-800 hover:border-teal-500/40 p-3.5 cursor-pointer relative overflow-hidden active:scale-98"
            >
              {/* Product Visual Box */}
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300">
                {getEmoji(item.slug)}
              </div>

              {/* Product Info details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
                    {item.default_width} × {item.default_depth} × {item.default_height} cm
                  </span>
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-0.5">
                    Rp {item.base_price.toLocaleString('id-ID')}
                    <span className="text-[8px] text-slate-500 font-normal">
                      {item.price_unit === 'per_meter' ? '/m' : '/pc'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Plus add indicator floating */}
              <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-slate-950 text-teal-400 rounded-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
