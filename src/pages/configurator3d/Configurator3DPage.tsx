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
import CheckoutModal from '../../components/CheckoutModal';

import { 
  Layers, 
  Palette, 
  Sliders, 
  Camera, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  Info,
  Undo2,
  Redo2
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
    roomConfig,
    undo,
    redo,
    past,
    future,
    itemsCatalog
  } = useSceneState();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'material' | 'properties' | 'perspective' | 'bom'
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Check screen size for mobile layouts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide toast notifications
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3005);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleItemAdded = (item3dId: string) => {
    const item = itemsCatalog.find(i => i.id === item3dId);
    if (item) {
      setToast({ message: `✓ ${item.name} berhasil ditambahkan!` });
    }
  };

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
      if (isMobile) {
        setIsPanelExpanded(true); // Auto expand panel on item select on mobile
      }
    }
  }, [selectedItemId, isMobile]);

  const bom = getBOM();

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua item dan foto background di scene 3D ini?')) {
      resetScene();
      setToast({ message: 'Kanvas berhasil dibersihkan!' });
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
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3.5 z-30 select-none">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1 text-[11px] md:text-xs text-slate-400 hover:text-white transition-colors bg-slate-950 border border-slate-800/80 hover:border-slate-700 py-1.5 px-2.5 md:px-3 rounded-xl font-medium active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={13} /> <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
              AFANDI INTERIOR <span className="text-[9px] md:text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded-full">3D</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">Konfigurator Interior 3D Real-time</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl p-0.5 select-none shadow-inner">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className={`p-1.5 rounded-lg transition-all ${
                past.length > 0
                  ? 'text-slate-200 hover:bg-slate-800 active:scale-90 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Urungkan)"
            >
              <Undo2 size={13} />
            </button>
            <div className="w-[1px] h-3 bg-slate-800" />
            <button
              onClick={redo}
              disabled={future.length === 0}
              className={`p-1.5 rounded-lg transition-all ${
                future.length > 0
                  ? 'text-slate-200 hover:bg-slate-800 active:scale-90 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ulangi)"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {placedItems.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">BOM:</span>
              <span className="text-amber-400 font-bold">Rp {bom.total.toLocaleString('id-ID')}</span>
            </div>
          )}
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all font-semibold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Reset Kanvas"
          >
            <Trash2 size={14} /> <span className="hidden sm:inline">Hapus Semua</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      {isMobile ? (
        /* Mobile Viewport Layout: Full-Screen Canvas + Bottom Sheet Drawer */
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Full-Screen Canvas container */}
          <div className="absolute inset-0 z-0 h-full w-full">
            <SceneCanvas />
            
            {/* Perspective Calibration Grid layer */}
            <GridCalibration />
          </div>

          {/* Floating HUD info for mobile navigation */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-950/75 backdrop-blur border border-slate-800/80 p-2.5 rounded-xl shadow-lg max-w-[200px]">
            <div className="text-[9px] text-slate-400 leading-relaxed font-semibold">
              <span className="text-teal-400">💡 Navigasi Sentuh:</span><br />
              • Putar: 1 Jari Seret<br />
              • Geser: 2 Jari Seret<br />
              • Zoom: Cubit / Pinch
            </div>
          </div>

          {/* Collapsible Bottom Sheet Panel */}
          <div 
            className={`absolute bottom-0 left-0 right-0 z-25 bg-slate-900 border-t border-slate-800 shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${
              isPanelExpanded ? 'h-[55vh]' : 'h-[50px]'
            }`}
          >
            {/* Sheet Drag Handle & Collapse bar */}
            <div 
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="flex justify-between items-center px-4 py-2 border-b border-slate-800/50 cursor-pointer hover:bg-slate-850 active:bg-slate-800 flex-shrink-0"
            >
              <div className="w-8" />
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                {isPanelExpanded ? 'Sembunyikan' : 'Edit Desain'}
              </span>
            </div>

            {/* Active panel content when expanded */}
            {isPanelExpanded && (
              <div className="flex-1 overflow-hidden">
                {activeTab === 'catalog' && <CatalogPanel onAddItem={handleItemAdded} />}
                {activeTab === 'material' && <MaterialPanel />}
                {activeTab === 'properties' && <PropertiesPanel />}
                {activeTab === 'perspective' && <PerspectivePanel />}
                {activeTab === 'bom' && <BOMPanel onCheckout={() => setIsCheckoutOpen(true)} />}
              </div>
            )}

            {/* Fixed Bottom Tab Bar */}
            <div className="flex justify-around items-center bg-slate-950 border-t border-slate-850 py-1.5 px-1.5 select-none h-[50px] flex-shrink-0">
              {TAB_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsPanelExpanded(true);
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-0.5 w-[60px] rounded-xl relative transition-all duration-200 active:scale-90 ${
                      isActive 
                        ? 'text-teal-400 font-bold' 
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
                    <span className="text-[8px] tracking-tight">{item.label}</span>
                    
                    {/* Active tab glow underline */}
                    {isActive && (
                      <div className="absolute bottom-0 w-6 h-[2px] bg-teal-400 rounded-full shadow-[0_0_8px_#14b8a6]" />
                    )}

                    {/* Count badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-teal-500 text-slate-950 font-extrabold text-[8px] rounded-full flex items-center justify-center shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Viewport Layout: Canvas + Sidebar Split */
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Side: 3D Viewport Area */}
          <div className="flex-1 h-full relative z-10">
            <SceneCanvas />
            
            {/* Calibration nodes */}
            <GridCalibration />
            
            {/* Legend helper indicator floating */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-950/75 backdrop-blur border border-slate-800/80 p-3 rounded-xl max-w-xs shadow-xl flex items-start gap-2.5">
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
          <div className="w-[360px] md:w-[390px] h-full flex flex-col z-20 shadow-2xl relative bg-slate-900 border-l border-slate-800">
            {/* Render Active Panel */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'catalog' && <CatalogPanel onAddItem={handleItemAdded} />}
              {activeTab === 'material' && <MaterialPanel />}
              {activeTab === 'properties' && <PropertiesPanel />}
              {activeTab === 'perspective' && <PerspectivePanel />}
              {activeTab === 'bom' && <BOMPanel onCheckout={() => setIsCheckoutOpen(true)} />}
            </div>

            {/* Navigation/Selector Sidebar Tabs (Glow neon styling) */}
            <div className="flex justify-around items-center bg-slate-900 border-t border-slate-800 p-2 select-none flex-shrink-0">
              {TAB_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 w-[68px] rounded-xl relative transition-all duration-300 active:scale-90 cursor-pointer ${
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
      )}

      {/* Premium Toast System */}
      {toast && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur border border-teal-500/35 px-4.5 py-2.5 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.25)] flex items-center gap-2 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
          <span className="text-xs font-bold text-teal-300 tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Checkout Wizard & Payment Gateway Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
