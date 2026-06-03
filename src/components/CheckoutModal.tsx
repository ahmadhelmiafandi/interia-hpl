import React, { useState, useEffect, useRef } from 'react';
import { useSceneState } from '../hooks/useSceneState';
import { generate3DQuotationPDF } from '../lib/pdfGenerator.ts';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Clipboard, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  Copy, 
  MessageSquare, 
  Download, 
  RefreshCw, 
  FileText,
  AlertCircle,
  Sparkles,
  Building
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'info' | 'review' | 'payment-method' | 'gateway' | 'success';
type PaymentMethod = 'va_bca' | 'va_mandiri' | 'qris' | 'credit_card';

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { placedItems, getBOM, resetScene } = useSceneState();
  const bom = getBOM();

  const [step, setStep] = useState<Step>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('va_bca');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment gateway simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [invoiceId, setInvoiceId] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown for VA/QRIS
  const [copied, setCopied] = useState(false);

  // Credit card form states
  const [ccNumber, setCcNumber] = useState('');
  const [ccName, setCcName] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [ccFocus, setCcFocus] = useState<'front' | 'back'>('front');

  // References
  const timerRef = useRef<any>(null);

  // Generate unique invoice number on checkout initialization
  useEffect(() => {
    if (isOpen && !invoiceId) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      setInvoiceId(`INV-AFN-2026-${rand}`);
    }
  }, [isOpen, invoiceId]);

  // Countdown timer for payment gateway
  useEffect(() => {
    if (step === 'gateway' && (paymentMethod === 'va_bca' || paymentMethod === 'va_mandiri' || paymentMethod === 'qris')) {
      setTimeLeft(600);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, paymentMethod]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateInfo = () => {
    const tempErrors: Record<string, string> = {};
    if (!customer.name.trim()) tempErrors.name = 'Nama pelanggan wajib diisi';
    if (!customer.phone.trim()) {
      tempErrors.phone = 'Nomor WhatsApp wajib diisi';
    } else if (!/^\d{9,15}$/.test(customer.phone.replace(/[\s+-]/g, ''))) {
      tempErrors.phone = 'Format nomor WhatsApp tidak valid (9-15 digit)';
    }
    if (!customer.address.trim()) tempErrors.address = 'Alamat survey wajib diisi';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNextFromInfo = () => {
    if (validateInfo()) {
      setStep('review');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulates processing with progressive logging messages
  const simulatePayment = (shouldSucceed: boolean) => {
    setIsProcessing(true);
    setProcessingStatus('Mengirim data transaksi ke Secure Gateway...');
    
    setTimeout(() => {
      setProcessingStatus('Memverifikasi detail pembayaran...');
      setTimeout(() => {
        setProcessingStatus('Melakukan otorisasi 3D-Secure...');
        setTimeout(() => {
          setIsProcessing(false);
          if (shouldSucceed) {
            setPaymentStatus('success');
            setStep('success');
          } else {
            setPaymentStatus('failed');
          }
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    try {
      await generate3DQuotationPDF({
        bom,
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        }
      });
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Halo Afandi Interior, saya ingin menindaklanjuti pesanan kustom 3D saya.\n\n` +
      `*Detail Invoice & Survey:*\n` +
      `• Invoice ID: *${invoiceId}*\n` +
      `• Nama: *${customer.name}*\n` +
      `• WhatsApp: *${customer.phone}*\n` +
      `• Alamat: *${customer.address}*\n` +
      `• Total Pesanan: *Rp ${bom.total.toLocaleString('id-ID')}* (${bom.items.length} Modul)\n\n` +
      `Link file PDF Quotation telah diunduh. Mohon dijadwalkan survey lokasi untuk finalisasi produksi. Terima kasih!`;
    
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/628123456789?text=${encodedText}`, '_blank');
  };

  const handleFinishCheckout = () => {
    resetScene();
    onClose();
  };

  // Format CC Number
  const handleCcNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCcNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleCcExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCcExpiry(value);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" 
        onClick={step === 'success' || isProcessing ? undefined : onClose}
      />
      
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-modal-in flex flex-col max-h-[90vh]">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
        
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Checkout & Pembayaran Aman
              </h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Secured by Afandi Gateway</p>
            </div>
          </div>
          {step !== 'success' && !isProcessing && (
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </header>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="px-6 py-4.5 bg-slate-950/30 border-b border-slate-800/60 flex justify-center items-center flex-shrink-0 select-none">
            <div className="flex items-center justify-between w-full max-w-lg">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                  step === 'info' 
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(176,141,87,0.45)]' 
                    : 'bg-emerald-500 text-slate-950'
                }`}>
                  {step === 'info' ? '1' : <Check size={13} strokeWidth={3.5} />}
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${step === 'info' ? 'text-teal-400 font-extrabold' : 'text-emerald-400'}`}>
                  Kontak
                </span>
              </div>

              {/* Line 1 */}
              <div className={`flex-1 h-[2px] mx-3 -mt-5 transition-colors duration-300 ${step !== 'info' ? 'bg-emerald-500' : 'bg-slate-800'}`} />

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                  step === 'review' 
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(176,141,87,0.45)]' 
                    : (step === 'payment-method' || step === 'gateway' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 border border-slate-800 text-slate-500')
                }`}>
                  {step === 'payment-method' || step === 'gateway' ? <Check size={13} strokeWidth={3.5} /> : '2'}
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${step === 'review' ? 'text-teal-400 font-extrabold' : (step === 'payment-method' || step === 'gateway' ? 'text-emerald-400' : 'text-slate-500')}`}>
                  Review
                </span>
              </div>

              {/* Line 2 */}
              <div className={`flex-1 h-[2px] mx-3 -mt-5 transition-colors duration-300 ${step === 'payment-method' || step === 'gateway' ? 'bg-emerald-500' : 'bg-slate-800'}`} />

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                  step === 'payment-method' 
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(176,141,87,0.45)]' 
                    : (step === 'gateway' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 border border-slate-800 text-slate-500')
                }`}>
                  {step === 'gateway' ? <Check size={13} strokeWidth={3.5} /> : '3'}
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${step === 'payment-method' ? 'text-teal-400 font-extrabold' : (step === 'gateway' ? 'text-emerald-400' : 'text-slate-500')}`}>
                  Metode Bayar
                </span>
              </div>

              {/* Line 3 */}
              <div className={`flex-1 h-[2px] mx-3 -mt-5 transition-colors duration-300 ${step === 'gateway' ? 'bg-emerald-500' : 'bg-slate-800'}`} />

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                  step === 'gateway' 
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(176,141,87,0.45)]' 
                    : 'bg-slate-850 border border-slate-800 text-slate-500'
                }`}>
                  4
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${step === 'gateway' ? 'text-teal-400 font-extrabold' : 'text-slate-500'}`}>
                  Sandbox
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: CUSTOMER INFO */}
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <User size={15} className="text-teal-400" />
                  Informasi Pengenal & Kontak
                </h4>
                <p className="text-[11px] text-slate-400">Pastikan nomor WhatsApp Anda aktif agar tim survey kami dapat menghubungi Anda dengan mudah.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Masukkan nama lengkap Anda..."
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-teal-500'} focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor WhatsApp</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      placeholder="Contoh: 081234567890"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className={`w-full bg-slate-950 border ${errors.phone ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-teal-500'} focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alamat Survey & Pemasangan</label>
                  <textarea 
                    placeholder="Masukkan alamat lengkap rumah, perumahan, blok, nomor, kota..."
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    rows={3}
                    className={`w-full bg-slate-950 border ${errors.address ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-teal-500'} focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 transition-all resize-none`}
                  />
                  {errors.address && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea 
                    placeholder="Contoh: Ukuran dinding belakang sedikit melengkung, dsb..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER REVIEW */}
          {step === 'review' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <FileText size={15} className="text-teal-400" />
                  Tinjau Ulang Desain & Spesifikasi
                </h4>
                <p className="text-[11px] text-slate-400">Tinjau kembali struktur modular furnitur yang telah Anda susun di kanvas 3D.</p>
              </div>

              {/* Placed Items Table */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 max-h-60 overflow-y-auto">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Item Rencana Produksi</span>
                
                {bom.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start gap-4 pb-3 border-b border-slate-800 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                      <p className="text-[9px] text-slate-500 font-mono">Dimensi: {item.dimensions.width}x{item.dimensions.depth}x{item.dimensions.height} cm</p>
                      
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 pt-1">
                        {item.materials.map((m, idx) => (
                          <span key={idx} className="text-[8px] bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                            <span className="capitalize">{m.part}:</span> <span className="font-semibold text-slate-300">{m.code !== '-' ? m.name : 'Default'}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Total Card */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900/90 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Harga</span>
                  <div className="text-2xl font-extrabold text-teal-400 mt-0.5">Rp {bom.total.toLocaleString('id-ID')}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">No. Transaksi</span>
                  <span className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-lg block mt-1">{invoiceId}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 'payment-method' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-teal-400" />
                  Pilih Metode Pembayaran
                </h4>
                <p className="text-[11px] text-slate-400">Silakan pilih opsi pembayaran aman di bawah ini untuk memulai simulasi transaksi.</p>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BCA VA */}
                <button
                  onClick={() => setPaymentMethod('va_bca')}
                  className={`flex items-center gap-4.5 p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer active:scale-98 ${
                    paymentMethod === 'va_bca'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/10 scale-[1.01]'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-950/60 text-slate-300'
                  }`}
                >
                  {/* High fidelity BCA SVG logo */}
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-8 rounded-lg shadow-inner overflow-hidden" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="40" rx="8" fill="#0066AE"/>
                      {/* Double Wave Shape decoration */}
                      <path d="M 10 32 Q 25 24, 45 28 T 90 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                      <text x="50" y="26" fill="white" fontSize="17" fontFamily="'Inter', sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="0.5">BCA</text>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200">BCA Virtual Account</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Transfer instan dengan verifikasi otomatis</p>
                  </div>
                  {paymentMethod === 'va_bca' && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 animate-scale-in">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Mandiri VA */}
                <button
                  onClick={() => setPaymentMethod('va_mandiri')}
                  className={`flex items-center gap-4.5 p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer active:scale-98 ${
                    paymentMethod === 'va_mandiri'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/10 scale-[1.01]'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-950/60 text-slate-300'
                  }`}
                >
                  {/* High fidelity Mandiri SVG logo */}
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-8 rounded-lg shadow-inner overflow-hidden" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="40" rx="8" fill="#1C3F60"/>
                      {/* Yellow brand decoration ribbon */}
                      <path d="M 62 10 Q 75 8, 88 28 C 76 25, 70 21, 62 10 Z" fill="#F1A80A"/>
                      <text x="44" y="25" fill="white" fontSize="12" fontFamily="'Inter', sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-0.5">mandırı</text>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200">Mandiri Virtual Account</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Transfer cepat via Livin Mandiri</p>
                  </div>
                  {paymentMethod === 'va_mandiri' && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 animate-scale-in">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* QRIS */}
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex items-center gap-4.5 p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer active:scale-98 ${
                    paymentMethod === 'qris'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/10 scale-[1.01]'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-950/60 text-slate-300'
                  }`}
                >
                  {/* High fidelity QRIS SVG logo */}
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-8 rounded-lg shadow-inner overflow-hidden border border-slate-200" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="40" rx="8" fill="#FFFFFF"/>
                      <text x="32" y="25" fill="#1E293B" fontSize="13" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="-0.5">QR</text>
                      <text x="50" y="25" fill="#EF4444" fontSize="13" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="-0.5">IS</text>
                      <rect x="74" y="10" width="8" height="8" fill="#0066AE"/>
                      <rect x="84" y="20" width="8" height="8" fill="#EF4444"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200">QRIS E-Wallet</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Scan cepat GoPay, OVO, ShopeePay, Dana</p>
                  </div>
                  {paymentMethod === 'qris' && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 animate-scale-in">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Credit Card */}
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex items-center gap-4.5 p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer active:scale-98 ${
                    paymentMethod === 'credit_card'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/10 scale-[1.01]'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-950/60 text-slate-300'
                  }`}
                >
                  {/* High fidelity CC SVG logo */}
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-8 rounded-lg shadow-inner overflow-hidden" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="40" rx="8" fill="#1E293B"/>
                      <circle cx="32" cy="20" r="9" fill="#EB001B" opacity="0.9"/>
                      <circle cx="45" cy="20" r="9" fill="#F79E1B" opacity="0.9"/>
                      <rect x="68" y="14" width="10" height="12" rx="2.5" fill="#D4AF37" opacity="0.85"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200">Kartu Kredit / Debit</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Mendukung Visa, MasterCard, & JCB</p>
                  </div>
                  {paymentMethod === 'credit_card' && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 animate-scale-in">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>

              {/* Secured Badge floating */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck size={28} className="text-teal-400 flex-shrink-0 animate-pulse" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Kami menjamin keamanan 100% data transaksi Anda. Gateway pembayaran disimulasikan menggunakan standar enkripsi bank-grade, tidak ada uang riil yang dipotong pada sandbox demo ini.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: DUMMY PAYMENT GATEWAY ACCENT INTERFACE */}
          {step === 'gateway' && (
            <div className="space-y-5 relative">
              
              {/* Overlay Payment Processing Animation */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 rounded-2xl flex flex-col justify-center items-center p-8 text-center animate-fade-in">
                  <RefreshCw size={36} className="text-teal-400 animate-spin mb-4" />
                  <h4 className="text-sm font-bold text-slate-100 mb-2">Sedang Memproses Transaksi...</h4>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-[10px] font-mono text-teal-400 animate-pulse">
                    {processingStatus}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-4">Harap jangan menutup halaman ini atau mematikan koneksi internet Anda.</p>
                </div>
              )}

              {/* FAILED POPUP LOGIC */}
              {paymentStatus === 'failed' && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 rounded-2xl flex flex-col justify-center items-center p-8 text-center animate-fade-in">
                  <XCircle size={42} className="text-red-500 mb-3" />
                  <h4 className="text-sm font-bold text-slate-100 mb-1">Transaksi Ditolak / Gagal</h4>
                  <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed mb-6">
                    Penerbit kartu atau jaringan bank melaporkan kegagalan saldo atau limit. Silakan coba metode lain atau hubungi bank penerbit.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStatus('idle');
                      setStep('payment-method');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    Ubah Metode Pembayaran
                  </button>
                </div>
              )}

              {/* SANDBOX GATEWAY CONTENT FRAME */}
              <div className="bg-slate-100 text-slate-900 rounded-3xl border border-slate-300 p-6 shadow-2xl space-y-4">
                
                {/* Gateway Top bar */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
                      Sandbox Secure Checkout
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">
                    <Clock size={11} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Amount / Merchant information */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Merchant</span>
                    <h4 className="text-xs font-bold text-slate-800">Afandi Interior Workshop</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Pembayaran</span>
                    <h3 className="text-sm font-extrabold text-slate-900">Rp {bom.total.toLocaleString('id-ID')}</h3>
                  </div>
                </div>

                {/* 1. BANK VIRTUAL ACCOUNT TEMPLATE */}
                {(paymentMethod === 'va_bca' || paymentMethod === 'va_mandiri') && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Nomor Rekening Virtual Account</span>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xl font-mono font-extrabold text-slate-900 tracking-wider">
                          {paymentMethod === 'va_bca' ? '88301 82749 50381' : '89502 91820 48201'}
                        </span>
                        <button
                          onClick={() => handleCopyText(paymentMethod === 'va_bca' ? '883018274950381' : '895029182048201')}
                          className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                          title="Salin Nomor"
                        >
                          {copied ? <Check size={12} className="text-teal-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[10px] text-slate-600 space-y-2 leading-relaxed">
                      <h5 className="font-bold text-slate-800 uppercase tracking-wide">Petunjuk Transfer:</h5>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Buka aplikasi m-Banking Anda, pilih menu *Transfer*.</li>
                        <li>Pilih menu *Virtual Account* atau *VA*.</li>
                        <li>Masukkan nomor VA di atas dan masukkan jumlah nominal Rp {bom.total.toLocaleString('id-ID')}.</li>
                        <li>Konfirmasi nama merchant *Afandi Interior* dan lakukan pembayaran.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* 2. QRIS QR CODE TEMPLATE */}
                {paymentMethod === 'qris' && (
                  <div className="flex flex-col items-center gap-3 animate-fade-in">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Scan Kode QRIS di Bawah</span>
                    
                    {/* Simulated QR Box */}
                    <div className="relative w-44 h-44 bg-white border border-slate-300 rounded-2xl p-3 flex items-center justify-center shadow-md overflow-hidden">
                      <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100">
                        {/* Dynamic QR squares path representation */}
                        <path fill="currentColor" d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z M45,45 h10 v10 h-10 z M40,20 h5 v5 h-5 z M55,30 h10 v5 h-10 z M45,60 h5 v10 h-5 z M60,60 h20 v5 h-20 z M80,80 h10 v10 h-10 z M70,75 h5 v5 h-5 z" />
                      </svg>
                      {/* Laser scanning bar effect */}
                      <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444] animate-sweep" />
                    </div>

                    <p className="text-[10px] text-slate-500 text-center max-w-[280px]">
                      Dukung semua mobile banking (BCA, Mandiri, BRI) & dompet digital (GoPay, OVO, Dana, LinkAja).
                    </p>
                  </div>
                )}

                {/* 3. CREDIT CARD FORM TEMPLATE */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4 animate-fade-in text-slate-900">
                    
                    {/* 3D CREDIT CARD CONTAINER IN LIGHT GATEWAY VIEW */}
                    <div className="flex justify-center py-2.5">
                      <div 
                        className={`w-72 h-44 rounded-2xl p-5 text-white flex flex-col justify-between shadow-2xl relative transition-transform duration-700 transform-style-3d cursor-pointer ${
                          ccFocus === 'back' ? 'rotate-y-180' : ''
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          boxShadow: '0 15px 35px rgba(15, 23, 42, 0.4)'
                        }}
                      >
                        {/* FRONT FACE */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">CREDIT CARD</span>
                            {/* Card Network Logo */}
                            <span className="text-sm italic font-extrabold tracking-tighter text-teal-400">VISA</span>
                          </div>
                          
                          {/* Card Number */}
                          <div className="text-sm font-mono tracking-widest text-slate-200 my-2">
                            {ccNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-[7px] text-slate-500 block uppercase">Pemegang Kartu</span>
                              <span className="text-[10px] font-bold tracking-wide uppercase truncate max-w-[120px] inline-block">{ccName || 'Nama Pelanggan'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[7px] text-slate-500 block uppercase">Exp Date</span>
                              <span className="text-[10px] font-mono font-bold">{ccExpiry || 'MM/YY'}</span>
                            </div>
                          </div>
                        </div>

                        {/* BACK FACE */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-between rotate-y-180 backface-hidden">
                          {/* Black magnetic strip */}
                          <div className="w-full h-8 bg-slate-950 -mx-5 mt-1" />
                          
                          <div className="flex justify-end items-center gap-2 pr-2">
                            <span className="text-[7px] text-slate-400 uppercase">CVV Code</span>
                            <div className="bg-white text-slate-900 font-mono px-2 py-0.5 rounded text-[10px] font-bold text-center w-10">
                              {ccCvv || '•••'}
                            </div>
                          </div>
                          
                          <p className="text-[6px] text-slate-500 leading-tight text-center">
                            Kartu ini disimulasikan secara aman dalam mode sandbox. Semua transaksi dilindungi oleh sistem keamanan palsu.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CC Form Inputs */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor Kartu Kredit</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={ccNumber}
                          onChange={handleCcNumberChange}
                          onFocus={() => setCcFocus('front')}
                          className="w-full bg-white border border-slate-300 focus:border-teal-500 focus:outline-none rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Pemegang Kartu</label>
                        <input
                          type="text"
                          placeholder="Nama lengkap di kartu"
                          value={ccName}
                          onChange={(e) => setCcName(e.target.value)}
                          onFocus={() => setCcFocus('front')}
                          className="w-full bg-white border border-slate-300 focus:border-teal-500 focus:outline-none rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expired Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={ccExpiry}
                          onChange={handleCcExpiryChange}
                          onFocus={() => setCcFocus('front')}
                          className="w-full bg-white border border-slate-300 focus:border-teal-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={ccCvv}
                          onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, ''))}
                          onFocus={() => setCcFocus('back')}
                          onBlur={() => setCcFocus('front')}
                          className="w-full bg-white border border-slate-300 focus:border-teal-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Payment Actions */}
                <div className="flex gap-3 border-t border-slate-200 pt-4 mt-2">
                  <button
                    onClick={() => simulatePayment(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-red-300 hover:bg-red-50 text-red-500 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Simulasikan Gagal
                  </button>
                  <button
                    onClick={() => simulatePayment(true)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Simulasikan Bayar (Sukses)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-4 flex flex-col items-center">
              
              {/* Success Badge check */}
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2 animate-bounce">
                <CheckCircle2 size={38} className="animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-teal-400 flex items-center justify-center gap-1.5">
                  Pembayaran Berhasil!
                  <Sparkles size={16} />
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pesanan Anda telah resmi terdaftar di database kami.</p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-5 w-full max-w-sm text-left text-xs space-y-3 shadow-inner">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-medium">No. Invoice</span>
                  <span className="font-mono text-slate-300 font-bold">{invoiceId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-medium">Nama Pelanggan</span>
                  <span className="text-slate-300 font-bold">{customer.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-medium">WhatsApp</span>
                  <span className="text-slate-300 font-bold">{customer.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-medium">Total Terbayar</span>
                  <span className="text-teal-400 font-extrabold">Rp {bom.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-start pt-1">
                  <span className="text-slate-500 font-medium">Estimasi Survey</span>
                  <span className="text-slate-300 font-bold text-right max-w-[180px] leading-relaxed">
                    {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} (±2 Hari Kerja)
                  </span>
                </div>
              </div>

              {/* Download & Share Actions */}
              <div className="w-full max-w-sm flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <Download size={14} />
                  Unduh Surat Penawaran (PDF)
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs transition-all active:scale-95 shadow-lg shadow-teal-500/10 cursor-pointer"
                >
                  <MessageSquare size={14} />
                  Bagikan Status ke WhatsApp
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step !== 'success' && (
          <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center flex-shrink-0">
            {/* Back button */}
            {step === 'info' ? (
              <button 
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (step === 'review') setStep('info');
                  else if (step === 'payment-method') setStep('review');
                  else if (step === 'gateway') setStep('payment-method');
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={13} />
                Kembali
              </button>
            )}

            {/* Next / Pay button */}
            {step === 'info' && (
              <button 
                onClick={handleNextFromInfo}
                className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-teal-500/10 cursor-pointer"
              >
                Lanjut ke Review
                <ArrowRight size={13} />
              </button>
            )}

            {step === 'review' && (
              <button 
                onClick={() => setStep('payment-method')}
                className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-teal-500/10 cursor-pointer"
              >
                Pilih Pembayaran
                <ArrowRight size={13} />
              </button>
            )}

            {step === 'payment-method' && (
              <button 
                onClick={() => setStep('gateway')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-teal-500/15 cursor-pointer"
              >
                Proses Pembayaran
                <ArrowRight size={13} />
              </button>
            )}
          </footer>
        )}

        {step === 'success' && (
          <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex justify-center items-center flex-shrink-0">
            <button 
              onClick={handleFinishCheckout}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
            >
              Selesai & Bersihkan Kanvas
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
