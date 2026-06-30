import React from "react";
import { Camera } from "lucide-react";

export default function PerspectivePanel() {
  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
            <Camera size={18} />
            Foto Room
          </h2>
          <p className="text-xs text-slate-400">
            Fitur upload foto ruangan akan segera hadir.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 text-teal-300 mb-6">
          <Camera size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Coming Soon</h3>
        <p className="max-w-md text-sm text-slate-400 leading-relaxed">
          Fitur Foto Ruangan sedang dalam pengembangan. Nantikan update
          berikutnya untuk mengunggah foto ruangan Anda dan menyesuaikannya
          dengan model 3D.
        </p>
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-left text-slate-400 shadow-lg shadow-slate-950/20 w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.24em] text-teal-400 mb-3">
            Apa yang akan hadir
          </p>
          <ul className="space-y-2 text-sm leading-6 list-disc list-inside">
            <li>Unggah foto ruangan real-time</li>
            <li>Kalibrasi perspektif otomatis</li>
            <li>Integrasi dengan layout 3D Anda</li>
            <li>Penyesuaian cahaya dan sudut tampilan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
