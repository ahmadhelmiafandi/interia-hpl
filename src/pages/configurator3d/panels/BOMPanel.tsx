import React, { useState } from 'react';
import { useSceneState } from '../../../hooks/useSceneState';
import { FileDown, Trash2, Hammer, Layers, AlertCircle, ShoppingCart } from 'lucide-react';
import { generate3DQuotationPDF } from '../../../lib/pdfGenerator.ts';

export default function BOMPanel({ onCheckout }: { onCheckout?: () => void }) {
  const { placedItems, getBOM, removeItem } = useSceneState();
  const bom = getBOM();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleExportPDF = async () => {
    try {
      await generate3DQuotationPDF({
        bom,
        customer
      });
    } catch (err) {
      console.error('Gagal memuat modul cetak PDF:', err);
    }
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-6 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
            <ShoppingCart size={18} />
            Bill of Materials (BOM)
          </h2>
          <p className="text-xs text-slate-400">Kalkulasi harga modular real-time</p>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30">
          Live Pricing
        </span>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {bom.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-6">
            <AlertCircle size={32} className="text-slate-500 mb-2" />
            <p className="text-sm font-semibold text-slate-400">Belum ada item di scene</p>
            <p className="text-xs text-slate-600 mt-1">Pilih furnitur dari panel katalog untuk mulai merancang</p>
          </div>
        ) : (
          bom.items.map((item) => (
            <div 
              key={item.id}
              className="group bg-slate-950/50 hover:bg-slate-950/80 transition-all rounded-xl border border-slate-800 hover:border-slate-700/80 p-4 relative overflow-hidden"
            >
              {/* Top Row: Title & Remove */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                    Dimensi: {item.dimensions.width}w × {item.dimensions.depth}d × {item.dimensions.height}h cm
                  </span>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Hapus Item"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Middle Row: Materials assignment */}
              <div className="space-y-1.5 border-t border-slate-800/80 pt-2 mb-3">
                {item.materials.map((mat, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 capitalize flex items-center gap-1">
                      <Layers size={10} className="text-slate-600" />
                      {mat.part}
                    </span>
                    <span className="text-slate-300 font-medium text-right max-w-[150px] truncate" title={`${mat.brand} ${mat.name} (${mat.code})`}>
                      {mat.code !== '-' ? `${mat.name} [x${mat.modifier}]` : 'Default'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Pricing breakdown */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Hammer size={10} className="text-slate-600" />
                  {item.priceUnit === 'per_meter' ? 'Per Meter' : 'Per Piece'}
                </span>
                <span className="font-bold text-sm text-amber-400">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Hover highlight line */}
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/30 group-hover:bg-teal-500 transition-all" />
            </div>
          ))
        )}
      </div>

      {/* Pricing Summary */}
      <div className="pt-4 border-t border-slate-800 bg-slate-900/40 mt-auto">
        <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">
            <span>Estimasi Biaya</span>
            <span className="text-teal-400 font-semibold">{bom.items.length} Modul</span>
          </div>
          
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-400">Rp</span>
            <span>{bom.total.toLocaleString('id-ID')}</span>
          </div>
          
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
            *Sudah termasuk bahan plywood, instalasi standar HPL, & fitting.
          </p>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => bom.items.length > 0 && onCheckout?.()}
              disabled={bom.items.length === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm tracking-wide shadow-lg transition-all duration-300 ${
                bom.items.length > 0
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-teal-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed opacity-50'
              }`}
            >
              <ShoppingCart size={16} />
              Pesan & Bayar Sekarang
            </button>

            <button
              onClick={() => bom.items.length > 0 && setShowExportModal(true)}
              disabled={bom.items.length === 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 ${
                bom.items.length > 0
                  ? 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed opacity-50'
              }`}
            >
              <FileDown size={14} />
              Unduh Draft Quotation (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Export Details Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
            {/* Background Accent glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
              <FileDown size={18} className="text-teal-400" />
              Detail Penawaran Harga
            </h3>
            <p className="text-xs text-slate-400 mb-4">Lengkapi data di bawah ini untuk dicantumkan dalam PDF penawaran resmi.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nama Pelanggan</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Contoh: 0812XXXXXXXX"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Lokasi</label>
                <textarea
                  placeholder="Contoh: Jl. Raya Keling No. 12, Bumiharjo, Jepara"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800/50 text-slate-400 font-semibold text-xs transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95"
              >
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
