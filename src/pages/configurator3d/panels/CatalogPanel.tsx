import React, { useState } from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { Layers, Plus } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'wardrobe', label: 'Lemari' },
  { id: 'tv-rack', label: 'TV Rack' },
];

interface CatalogPanelProps {
  onAddItem?: (item3dId: string) => void;
}

export default function CatalogPanel({ onAddItem }: CatalogPanelProps) {
  const { itemsCatalog, addItem, isLoadingCatalog } = useSceneState();
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = activeTab === 'all'
    ? itemsCatalog
    : itemsCatalog.filter(item => item.category === activeTab);

  const getIcon = (slug: string) => {
    if (slug.includes('kitchen')) {
      return (
        <svg className="w-9 h-9 text-teal-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="3" rx="0.5" className="fill-teal-500/10" />
          <rect x="3" y="6" width="18" height="15" rx="1" />
          <line x1="12" y1="6" x2="12" y2="21" />
          <line x1="10" y1="11" x2="10" y2="14" strokeWidth="2.5" />
          <line x1="14" y1="11" x2="14" y2="14" strokeWidth="2.5" />
        </svg>
      );
    }
    if (slug.includes('wardrobe')) {
      return (
        <svg className="w-9 h-9 text-indigo-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="1.5" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="10" y1="10" x2="10" y2="14" strokeWidth="2.5" />
          <line x1="14" y1="10" x2="14" y2="14" strokeWidth="2.5" />
          <line x1="4" y1="17" x2="20" y2="17" />
          <line x1="12" y1="17" x2="12" y2="22" />
        </svg>
      );
    }
    if (slug.includes('tv')) {
      return (
        <svg className="w-9 h-9 text-amber-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="3" width="12" height="7" rx="1" />
          <line x1="10" y1="10" x2="14" y2="10" />
          <line x1="12" y1="10" x2="12" y2="12" />
          <rect x="2" y="12" width="20" height="7" rx="1" className="fill-amber-500/10" />
          <line x1="8" y1="12" x2="8" y2="19" />
          <line x1="16" y1="12" x2="16" y2="19" />
          <circle cx="5" cy="15.5" r="0.75" fill="currentColor" />
          <circle cx="12" cy="15.5" r="0.75" fill="currentColor" />
          <circle cx="19" cy="15.5" r="0.75" fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg className="w-9 h-9 text-slate-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </svg>
    );
  };

  const handleAddItem = (id: string) => {
    addItem(id);
    if (onAddItem) {
      onAddItem(id);
    }
  };

  if (isLoadingCatalog) {
    return (
      <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
        {/* Header */}
        <div className="pb-4 border-b border-slate-800">
          <div className="h-6 w-36 bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-800/60 rounded mt-1.5 animate-pulse" />
        </div>
        {/* Tabs */}
        <div className="flex gap-1.5 py-3 border-b border-slate-800/50">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-7 w-16 bg-slate-800 rounded-full animate-pulse" />
          ))}
        </div>
        {/* Grid List Skeleton */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 no-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 bg-slate-950/20 rounded-xl border border-slate-800/50 p-3.5 animate-pulse">
              <div className="w-14 h-14 bg-slate-800/60 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
                <div className="h-3 w-3/4 bg-slate-800/40 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4.5 w-24 bg-slate-800/40 rounded" />
                  <div className="h-4.5 w-16 bg-slate-800/40 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              onClick={() => handleAddItem(item.id)}
              className="group flex gap-4 bg-slate-950/45 hover:bg-slate-950/80 transition-all rounded-xl border border-slate-800 hover:border-teal-500/40 p-3.5 cursor-pointer relative overflow-hidden active:scale-98"
            >
              {/* Product Visual Box */}
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                {getIcon(item.slug)}
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
