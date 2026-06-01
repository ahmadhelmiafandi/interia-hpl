import React from 'react';
import {
  Layers,
  Paintbrush,
  Lightbulb,
  Sparkles,
  Camera,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tabId: string) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  const sidebarItems = [
    {
      id: 'presets',
      label: 'Ruang Preset',
      icon: <Sparkles className="w-5 h-5" />,
      desc: 'Muat tata letak ruangan instan (Kitchen, Wardrobe, TV Rack)',
    },
    {
      id: 'furniture',
      label: 'Katalog 3D',
      icon: <Layers className="w-5 h-5" />,
      desc: 'Tambahkan unit kabinet, lemari, rak, atau countertop',
    },
    {
      id: 'materials',
      label: 'Dinding & Lantai',
      icon: <Paintbrush className="w-5 h-5" />,
      desc: 'Pilih tipe ubin lantai (Kayu, Marmer) & cat dinding',
    },
    {
      id: 'lighting',
      label: 'Pencahayaan',
      icon: <Lightbulb className="w-5 h-5" />,
      desc: 'Atur intensitas cahaya matahari, bayangan, & ambient',
    },
    {
      id: 'perspective',
      label: 'Foto Room',
      icon: <Camera className="w-5 h-5" />,
      desc: 'Upload foto latar belakang ruangan & kalibrasi perspektif',
    },
    {
      id: 'bom',
      label: 'Estimasi BOM',
      icon: <Calculator className="w-5 h-5" />,
      desc: 'Lihat rincian anggaran biaya & ekspor PDF penawaran',
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden sm:flex w-[84px] h-full bg-white border-r border-[#E5E7EB] flex-col justify-between items-center py-4 select-none z-10 shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center w-full">
          {/* Brand Icon launcher */}
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-md mb-6 transform hover:scale-105 transition-transform">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="text-white font-mono font-black text-xs">AI</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-8 h-[1px] bg-gray-100 mb-6"></div>

          {/* Navigation Tab Group */}
          <nav className="flex flex-col gap-2.5 px-2 w-full">
            {sidebarItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => onChangeTab(item.id)}
                  title={item.label}
                  className={`relative group w-full flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-1.5 hidden sm:block font-sans">
                    {item.label.split(' ')[0]}
                  </span>

                  {/* Floating tooltip hover popup */}
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 text-xs w-48 shadow-lg whitespace-normal leading-relaxed z-40">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-gray-300 text-[10px] mt-0.5">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info details */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-[1px] bg-gray-100"></div>
          <div className="text-[10px] font-mono text-gray-400 text-center select-none leading-tight font-medium">
            v1.0.0
            <span className="block text-[8px] text-gray-300">Beta</span>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="flex sm:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-gray-200 justify-around items-center px-1 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] select-none">
        {sidebarItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-mobile-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 h-full transition-all duration-150 ${
                isSelected
                  ? 'text-gray-900 font-bold scale-105'
                  : 'text-gray-400 active:scale-95'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isSelected ? 'bg-gray-900 text-white shadow-sm' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-medium tracking-tight mt-1 font-sans truncate w-full text-center px-1">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
