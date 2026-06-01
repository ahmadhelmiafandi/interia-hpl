import React, { useRef } from 'react';
import {
  Undo,
  Redo,
  Camera,
  FolderOpen,
  Download,
  RotateCcw,
  MapPin,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetScene: () => void;
  onTakeSnapshot: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
  roomName?: string;
  onBackTo2D: () => void;
}

export default function TopBar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetScene,
  onTakeSnapshot,
  onExportJSON,
  onImportJSON,
  roomName,
  onBackTo2D
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const txt = event.target?.result;
      if (typeof txt === 'string') {
        onImportJSON(txt);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-3 sm:px-6 z-20 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.01)] select-none">
      {/* 1. Back to 2D & Project Title (SketchUp Homage) */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
        <button
          onClick={onBackTo2D}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-200 py-1.5 px-3 rounded-xl font-semibold active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={13} className="text-gray-600" />
          <span className="hidden xs:inline">Kembali ke 2D</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 hidden xs:block" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {roomName || 'ruang_tamu_modern_v1.skp'}
            </h1>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-amber-50 text-amber-850 px-1 sm:px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
              3D CAD v1.0
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">
            <span className="hidden md:flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> Afandi-Interior
            </span>
            <span className="text-gray-300 hidden md:inline">|</span>
            <span className="text-green-600 flex items-center gap-0.5 font-semibold shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Auto-Save
            </span>
          </div>
        </div>
      </div>

      {/* 2. Core Actions: Undo, Redo, Snapshot, Import/Export */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl mr-1 sm:mr-3 border border-gray-100">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              canUndo
                ? 'text-gray-700 hover:bg-white hover:shadow-sm active:scale-95'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              canRedo
                ? 'text-gray-700 hover:bg-white hover:shadow-sm active:scale-95'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Snapshot Button */}
        <button
          onClick={onTakeSnapshot}
          id="btn-take-snapshot"
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-55 hover:bg-gray-100 active:scale-95 border border-gray-200 text-gray-700 font-bold text-[11px] sm:text-xs transition-all shadow-sm"
          title="Ambil Foto Screenshot 3D Canvas"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          <span className="hidden sm:inline">Ambil Gambar</span>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          id="btn-import-project"
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-55 hover:bg-gray-100 active:scale-95 border border-gray-200 text-gray-700 font-bold text-[11px] sm:text-xs transition-all shadow-sm"
          title="Muat Proyek Cad Lama (.json)"
        >
          <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          <span className="hidden sm:inline">Buka Proyek</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportChange}
          className="hidden"
        />

        {/* Export JSON */}
        <button
          onClick={onExportJSON}
          id="btn-export-project"
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gray-55 hover:bg-gray-100 active:scale-95 border border-gray-200 text-gray-700 font-bold text-[11px] sm:text-xs transition-all shadow-sm"
          title="Simpan Proyek Cad (.json)"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
          <span className="hidden sm:inline">Ekspor CAD</span>
        </button>

        {/* Reset Scene layout */}
        <button
          onClick={onResetScene}
          id="btn-reset-scene"
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] sm:text-xs transition-all border border-red-250 font-sans"
          title="Hapus semua elemen dan material"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden md:inline">Kosongkan Ruang</span>
        </button>
      </div>
    </div>
  );
}
