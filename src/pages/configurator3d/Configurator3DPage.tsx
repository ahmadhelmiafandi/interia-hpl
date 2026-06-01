import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSceneState } from '../../hooks/useSceneState';
import SceneCanvas from '../../components/three/SceneCanvas';
import GridCalibration from '../../components/three/GridCalibration';
import CatalogPanel from './panels/CatalogPanel';
import MaterialPanel from './panels/MaterialPanel';
import PropertiesPanel from './panels/PropertiesPanel';
import PerspectivePanel from './panels/PerspectivePanel';
import BOMPanel from './panels/BOMPanel';

import { 
  Layers, 
  Palette, 
  Sliders, 
  Camera, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  Info
} from 'lucide-react';

export default function Configurator3DPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    loadCatalog, 
    resetScene, 
    placedItems, 
    getBOM, 
    selectedItemId,
    setRoomConfig,
    addItem,
    roomConfig
  } = useSceneState();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'material' | 'properties' | 'perspective' | 'bom'

  const handleBackToHome = () => {
    navigate('/');
  };

  // Load catalogs and synchronize passed 2D config state on page mount
  useEffect(() => {
    const initPage = async () => {
      await loadCatalog();

      // Check if we received config from 2D page
      const passedConfig = location.state?.config;
      if (passedConfig && passedConfig.room) {
        console.log("[configurator3d] Synchronizing state from 2D configurator:", passedConfig);
        
        // Reset current scene first to avoid duplication
        resetScene();

        // 1. Synchronize Room Dimensions
        setRoomConfig({
          width: Number(passedConfig.room.width) || 300,
          length: Number(passedConfig.room.length) || 300,
          height: Number(passedConfig.room.height) || 280,
        });

        // 2. Map & Spawn initial 3D models matching their 2D selection
        const prodName = passedConfig.productSelection?.name || '';
        const prodId = passedConfig.productSelection?.productId || '';

        setTimeout(() => {
          if (prodId === '1' || prodName.toLowerCase().includes('kitchen')) {
            // Kitchen Set: spawn base cabinet and countertop
            addItem('item-base-cabinet-60');
            addItem('item-countertop-60');
          } else if (prodId === '2' || prodName.toLowerCase().includes('lemari') || prodName.toLowerCase().includes('wardrobe')) {
            // Wardrobe
            addItem('item-wardrobe-2door');
          } else if (prodId === '4' || prodName.toLowerCase().includes('tv') || prodName.toLowerCase().includes('rack')) {
            // TV Rack
            addItem('item-tv-rack-floating');
          } else {
            // Fallback: spawn base cabinet
            addItem('item-base-cabinet-60');
          }
        }, 300);
      }
    };

    initPage();
  }, [location.state, loadCatalog]);

  // Auto-switch to properties tab when user clicks/selects an item in the 3D scene
  useEffect(() => {
    if (selectedItemId) {
      setActiveTab('properties');
    }
  }, [selectedItemId]);

  const bom = getBOM();

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua item dan foto background di scene 3D ini?')) {
      resetScene();
    }
  };

  const TAB_ITEMS = [
    { id: 'catalog', label: 'Katalog', icon: Layers },
    { id: 'material', label: 'Material', icon: Palette },
    { id: 'properties', label: 'Properties', icon: Sliders },
    { id: 'perspective', label: 'Foto Room', icon: Camera },
    { id: 'bom', label: 'BOM / Pricing', icon: ShoppingCart, badge: placedItems.length },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-6 py-3.5 z-30 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-slate-950 border border-slate-800/80 hover:border-slate-700 py-1.5 px-3 rounded-xl font-medium active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={13} /> Kembali
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
              AFANDI INTERIOR <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full">3D</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">Konfigurator Interior 3D Real-time</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          {placedItems.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">BOM:</span>
              <span className="text-amber-400 font-bold">Rp {bom.total.toLocaleString('id-ID')}</span>
            </div>
          )}
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all font-semibold text-xs flex items-center gap-1 active:scale-95"
            title="Reset Kanvas"
          >
            <Trash2 size={14} /> <span className="hidden sm:inline">Hapus Semua</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: 3D Viewport Area */}
        <div className="flex-1 h-full relative z-10">
          <SceneCanvas />
          
          {/* Overlaid calibration nodes for FASE 3 */}
          <GridCalibration />
          
          {/* Legend helper indicator floating */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-950/75 backdrop-blur border border-slate-800/80 p-3 rounded-xl max-w-xs shadow-xl hidden md:flex items-start gap-2.5">
            <Info size={14} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-relaxed">
              <strong>Kontrol Navigasi:</strong><br />
              • Orbit: Klik kiri & seret mouse<br />
              • Pan: Klik kanan & seret / Shift + Drag<br />
              • Zoom: Scroll wheel mouse
            </div>
          </div>
        </div>

        {/* Right Side: Interactive sidebar with control panels */}
        <div className="w-[360px] md:w-[390px] h-full flex flex-col z-20 shadow-2xl relative">
          
          {/* Render Active Panel */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'catalog' && <CatalogPanel />}
            {activeTab === 'material' && <MaterialPanel />}
            {activeTab === 'properties' && <PropertiesPanel />}
            {activeTab === 'perspective' && <PerspectivePanel />}
            {activeTab === 'bom' && <BOMPanel />}
          </div>

          {/* Navigation/Selector Sidebar Tabs (Glow neon styling) */}
          <div className="flex justify-around items-center bg-slate-900 border-t border-slate-800 p-2 select-none">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 w-[68px] rounded-xl relative transition-all duration-300 active:scale-90 ${
                    isActive 
                      ? 'bg-slate-950/70 border border-teal-500/30 text-teal-400 shadow-inner' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                  <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
                  
                  {/* Glowing bottom line indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 w-8 h-[2px] bg-teal-400 rounded-full shadow-[0_0_8px_#14b8a6]" />
                  )}

                  {/* Badges */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-slate-950 font-extrabold text-[8px] rounded-full flex items-center justify-center shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
