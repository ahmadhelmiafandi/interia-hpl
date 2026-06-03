import React, { useRef, useState } from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { Camera, Image as ImageIcon, Check, RotateCcw, AlertTriangle, Eye, UploadCloud, Trash2 } from 'lucide-react';
import { solvePerspective } from '../../../lib/perspectiveSolver.ts';

export default function PerspectivePanel() {
  const {
    backgroundPhotoUrl,
    setBackgroundPhoto,
    calibrationPoints,
    roomConfig,
    setCameraConfig,
    isLocked,
    setIsLocked,
    activeTool,
    setActiveTool
  } = useSceneState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentObjUrlRef = useRef<string | null>(null); // track untuk revokeObjectURL
  const [isDragging, setIsDragging] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo Uploads
  const handlePhotoFile = (file: File | undefined) => {
    if (!file) return;
    
    // Check type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file tidak didukung. Harap unggah file gambar (JPG/PNG).');
      return;
    }

    // Check size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    setErrorMsg('');
    // Revoke URL lama untuk mencegah memory leak
    if (currentObjUrlRef.current) {
      URL.revokeObjectURL(currentObjUrlRef.current);
    }
    const localUrl = URL.createObjectURL(file);
    currentObjUrlRef.current = localUrl;
    setBackgroundPhoto(localUrl);
    setActiveTool('calibrate'); // Auto open calibration grid upon upload
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  // Triggers homography solver and applies to state
  const handleLockPerspective = () => {
    setIsSolving(true);
    setErrorMsg('');
    
    setTimeout(() => {
      try {
        const solvedCamera = solvePerspective(calibrationPoints, roomConfig);
        
        if (solvedCamera.isFallback) {
          setErrorMsg('Kalibrasi kurang presisi. Sudut kamera disesuaikan ke estimasi terbaik.');
        }

        // Apply to store
        setCameraConfig({
          fov: solvedCamera.fov,
          position: solvedCamera.position,
          rotation: solvedCamera.rotation
        });

        setIsLocked(true);
        setActiveTool('select'); // Close grid calibration
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal menghitung matriks perspektif. Coba sesuaikan ulang titik kalibrasi.');
      } finally {
        setIsSolving(false);
      }
    }, 400);
  };

  const handleUnlockPerspective = () => {
    setIsLocked(false);
    setActiveTool('calibrate');
  };

  const handleRemovePhoto = () => {
    // Revoke object URL saat foto dihapus untuk bebas memory
    if (currentObjUrlRef.current) {
      URL.revokeObjectURL(currentObjUrlRef.current);
      currentObjUrlRef.current = null;
    }
    setBackgroundPhoto(null);
    setIsLocked(false);
    setActiveTool('select');
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
            <Camera size={18} />
            Perspective Matching
          </h2>
          <p className="text-xs text-slate-400">Integrasikan foto ruangan asli dengan 3D</p>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
        {/* Error Messages */}
        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Zone (Empty state) */}
        {!backgroundPhotoUrl ? (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center h-52 text-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
                isDragging 
                  ? 'border-teal-400 bg-teal-500/5' 
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700/80 hover:bg-slate-950/60'
              }`}
            >
              <UploadCloud size={38} className={`mb-3 ${isDragging ? 'text-teal-400 animate-bounce' : 'text-slate-500'}`} />
              <p className="text-sm font-semibold text-slate-300">Tarik & Lepas Foto Ruangan</p>
              <p className="text-xs text-slate-500 mt-1.5 px-4">
                Atau klik untuk menelusuri file (JPG, PNG, maks 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoFile(e.target.files?.[0])}
                className="hidden"
              />
            </div>

            {/* Photography guidelines list */}
            <div className="bg-slate-950/30 rounded-2xl border border-slate-800 p-4 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye size={13} className="text-teal-400" />
                Panduan Pengambilan Foto:
              </h4>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">1.</span>
                  <span><strong>Sejajar Mata:</strong> Ambil foto berdiri tegak sejajar mata (±1.5m), menghadap sudut ruangan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">2.</span>
                  <span><strong>Lantai Terbuka:</strong> Minimal 2x2 meter area lantai harus terlihat bersih dari penghalang.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">3.</span>
                  <span><strong>Cahaya Cukup:</strong> Nyalakan lampu ruangan agar batas sudut dinding & lantai tampak jelas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">4.</span>
                  <span><strong>Landscape:</strong> Ambil foto berorientasi horizontal/tidur untuk hasil pencocokan terbaik.</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Active State: Photo Uploaded */
          <div className="space-y-4">
            {/* Image Preview thumbnail */}
            <div className="relative rounded-2xl border border-slate-800 overflow-hidden group bg-slate-950">
              <img 
                src={backgroundPhotoUrl} 
                alt="Room Background" 
                className="w-full h-36 object-cover opacity-60 group-hover:opacity-85 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
                    Foto Ruangan Terunggah
                  </span>
                  <button
                    onClick={handleRemovePhoto}
                    className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="Hapus Foto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Calibration Tools */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kalibrasi Kamera</h4>
              
              {!isLocked ? (
                /* Calibration Editing Mode */
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kalibrasi sedang aktif. Silakan geser pin neon pada canvas agar pas dengan batas sudut lantai di foto.
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTool(activeTool === 'calibrate' ? 'select' : 'calibrate')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        activeTool === 'calibrate'
                          ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {activeTool === 'calibrate' ? 'Sembunyikan Grid' : 'Tampilkan Grid'}
                    </button>
                    <button
                      onClick={handleLockPerspective}
                      disabled={isSolving}
                      className="flex-1 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-600/10"
                    >
                      {isSolving ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Check size={13} /> Kunci Perspektif</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Locked Mode */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/20 p-3 rounded-xl text-xs font-semibold">
                    <Check size={16} />
                    <span>Perspektif Terkunci (Matched)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kamera sekarang diselaraskan dengan sudut foto Anda. Posisikan furnitur Anda tepat di atas lantai foto.
                  </p>
                  <button
                    onClick={handleUnlockPerspective}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all active:scale-95"
                  >
                    <RotateCcw size={13} />
                    Sesuaikan Kalibrasi
                  </button>
                </div>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="bg-slate-950/20 rounded-xl border border-slate-800/60 p-3.5 text-xs text-slate-500 leading-relaxed">
              💡 <strong>Tips Peletakan:</strong> Setelah terkunci, gunakan panel katalog untuk memasukkan lemari atau kitchen set. Furnitur akan berdiri pas di atas sumbu lantai nyata!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
