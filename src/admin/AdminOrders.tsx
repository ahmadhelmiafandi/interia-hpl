import React, { useEffect, useState } from 'react';
import { Eye, X, Image as ImageIcon, ShoppingBag, Clock, CheckCircle2, AlertCircle, Phone, MapPin, Package, Wrench, User, FileText, ShoppingCart, Mail, Copy, MessageSquare, RefreshCw, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { api, supabase } from '../lib/api';
import { MATERIAL_COLORS, WALL_POS } from '../lib/constants';
import { CMSHeader } from './cms/CMSComponents';
import { useToast } from '../components/ui/Toast';

interface Order {
    id: string;
    status: string;
    createdAt: string;
    totalPrice?: number;
    estimatedPrice?: number;
    customer?: Record<string, any>;
    config?: Record<string, any>;
    product?: Record<string, any>;
    [key: string]: any;
}

export default function AdminOrders() {
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [settings, setSettings] = useState<Record<string, any> | null>(null);
    const [activeTab, setActiveTab] = useState('summary');

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} berhasil disalin!`);
    };

    const handleSendEmail = (order: Order) => {
        const subject = encodeURIComponent(`Dokumen Pesanan Afandi Interior - #${String(order.id).split('-')[0].toUpperCase()}`);
        const body = encodeURIComponent(`Halo ${order.customer?.name},\n\nTerima kasih telah melakukan pemesanan di Afandi Interior.\nBerikut adalah rincian pesanan Anda:\n\nProduk: ${order.config?.productSelection?.name}\nTotal: Rp ${order.totalPrice?.toLocaleString('id-ID')}\n\nSilakan cek lampiran atau buka link berikut untuk detailnya.\n\nSalam,\nAfandi Interior`);
        window.location.href = `mailto:${order.customer?.email}?subject=${subject}&body=${body}`;
    };

    const getChatTemplate = (order: Order) => {
        return `Halo Kak ${order.customer?.name}, Kami dari *Afandi Interior* ingin mengonfirmasi pesanan furnitur Kakak (#${String(order.id).split('-')[0].toUpperCase()}).

Berikut Ringkasan Pesanan:
- Produk: ${order.config?.productSelection?.name}
- Model: ${order.config?.productSelection?.shape}
- Estimasi Total: *Rp ${order.totalPrice?.toLocaleString('id-ID')}*
- Metode Bayar: ${order.customer?.paymentMethod || 'Transfer BCA'}

Apakah Kakak ada waktu luang untuk kami jadwalkan *Survey Lokasi* dalam waktu dekat? Terima kasih. 🙏`;
    };

    const fetchOrders = (showLoader = false) => {
        if (showLoader) setLoading(true);
        api.getOrders().then((data) => {
            if (!Array.isArray(data)) {
                setOrders([]);
                setLoading(false);
                return;
            }
            const realOrders = data.filter((o: any) => o && o.status !== 'Draft' && o.customer?.name);
            setOrders(realOrders as Order[]);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching orders:', err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchOrders();
        api.getSettings().then(setSettings);

        // Realtime Subscription
        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes', 
                { event: '*', table: 'orders', schema: 'public' }, 
                () => {
                    console.log('Realtime update detected in orders table');
                    fetchOrders(false); // Silent refresh
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            
            // If selecting from modal, update local state
            
            return true;
        } catch (err) {
            console.error('Update status error:', err);
            return false;
        }
    };

    const handleQuickAction = async (order: Order, nextStatus: string) => {
        const success = await handleStatusChange(order.id, nextStatus);
        if (success) {
            sendStatusNotification(order, nextStatus);
        }
    };

    const getNotificationMessage = (order: Order, status: string) => {
        const id = String(order.id).split('-')[0].toUpperCase();
        switch (status) {
            case 'SUDAH DP':
                return `Halo Kak ${order.customer?.name}, DP untuk pesanan #${id} telah kami terima. Terima kasih! Pesanan Anda kini masuk ke antrean produksi. 🙏`;
            case 'DIPROSES':
                return `Halo Kak ${order.customer?.name}, pesanan #${id} sedang dalam tahap PROSES PRODUKSI di workshop kami. Kami akan kabari jika sudah siap kirim. 🔨`;
            case 'LUNAS':
                return `Halo Kak ${order.customer?.name}, pembayaran LUNAS untuk pesanan #${id} telah kami terima. Terima kasih banyak! Pesanan segera kami jadwalkan untuk pengiriman/pemasangan. ✅`;
            case 'SELESAI':
                return `Halo Kak ${order.customer?.name}, pesanan #${id} telah SELESAI dipasang dengan baik. Terima kasih telah memilih Afandi Interior. Semoga puas dengan hasilnya! ⭐⭐⭐⭐⭐`;
            default:
                return '';
        }
    };

    const sendStatusNotification = (order: Order, status: string) => {
        const msg = getNotificationMessage(order, status);
        if (!msg) return;

        // WhatsApp
        const waMsg = encodeURIComponent(msg);
        window.open(`https://wa.me/${String(order.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${waMsg}`, '_blank');

        // Email
        if (order.customer?.email) {
            setTimeout(() => {
                const subject = encodeURIComponent(`Update Pesanan Afandi Interior - ${status} #${String(order.id).split('-')[0].toUpperCase()}`);
                const body = encodeURIComponent(msg.replace(/\*/g, ''));
                window.location.href = `mailto:${order.customer?.email}?subject=${subject}&body=${body}`;
            }, 1000);
        }
    };

    const getStatusStyle = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUDAH DP': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'DIPROSES': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'LUNAS': return 'bg-teal-50 text-teal-600 border-teal-100';
            case 'SELESAI': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sinkronisasi Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Pesanan</h1>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <span>Admin</span>
                        <ChevronRight size={10} />
                        <span className="text-slate-900">Pesanan</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchOrders(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button 
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} />
                        Tambah Baru
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estimasi</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <ShoppingBag size={48} strokeWidth={1.5} />
                                            <p className="text-sm font-bold uppercase tracking-widest">Belum ada pesanan masuk</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-white shadow-sm">
                                                {order.customer?.name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none mb-1">{order.customer?.name || 'Anonim'}</p>
                                                <p className="text-xs text-slate-400 font-medium">{order.customer?.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{order.config?.productSelection?.name || order.product?.name || '-'}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{order.config?.productSelection?.shape || 'Custom'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-slate-900">
                                        Rp {(order.totalPrice || order.estimatedPrice || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                                {order.status || 'PENDING'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-all active:scale-95 shadow-sm"
                                                title="Lihat"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-all active:scale-95 shadow-sm"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                className="p-2 bg-rose-500 text-white hover:bg-rose-600 rounded-md transition-all active:scale-95 shadow-sm"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modern Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-modal-in border border-white/20">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-50 bg-white sticky top-0 z-20 no-print">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pesanan #{String(selectedOrder.id || '').split('-')[0]}</h3>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Workflow Quick Actions */}
                                    <div className="flex items-center gap-2">
                                        {selectedOrder.status === 'PENDING' && (
                                            <button 
                                                onClick={() => handleQuickAction(selectedOrder, 'SUDAH DP')}
                                                className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Konfirmasi DP
                                            </button>
                                        )}
                                        {selectedOrder.status === 'SUDAH DP' && (
                                            <button 
                                                onClick={() => handleQuickAction(selectedOrder, 'DIPROSES')}
                                                className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                            >
                                                <Wrench size={14} /> Mulai Produksi
                                            </button>
                                        )}
                                        {selectedOrder.status === 'DIPROSES' && (
                                            <button 
                                                onClick={() => handleQuickAction(selectedOrder, 'LUNAS')}
                                                className="px-4 py-2 bg-teal-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center gap-2"
                                            >
                                                <ShoppingCart size={14} /> Konfirmasi Lunas
                                            </button>
                                        )}
                                        {selectedOrder.status === 'LUNAS' && (
                                            <button 
                                                onClick={() => handleQuickAction(selectedOrder, 'SELESAI')}
                                                className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Selesaikan Proyek
                                            </button>
                                        )}
                                    </div>

                                    <div className="w-px h-8 bg-slate-100 mx-1"></div>

                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                        {['PENDING', 'SUDAH DP', 'DIPROSES', 'LUNAS', 'SELESAI'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => handleStatusChange(selectedOrder.id, st)}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black transition-all ${selectedOrder.status === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="w-px h-8 bg-slate-100 mx-1"></div>
                                    
                                    <button 
                                        onClick={() => handleSendEmail(selectedOrder)}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-teal-100"
                                        title="Kirim Dokumen ke Email"
                                    >
                                        <Mail size={14} />
                                    </button>
                                    <button 
                                        onClick={() => copyToClipboard(getChatTemplate(selectedOrder), 'Template Chat')}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100"
                                        title="Salin Template Chat Konfirmasi"
                                    >
                                        <MessageSquare size={14} />
                                    </button>
                                    <button 
                                        onClick={() => window.print()}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
                                        title="Cetak RAB / Invoice"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedOrder(null)}
                                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all bg-slate-50"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                                {[
                                    { id: 'summary', label: 'Ringkasan Desain', icon: <Package size={14} /> },
                                    { id: 'rab', label: 'RAB (Penawaran)', icon: <FileText size={14} /> },
                                    { id: 'invoice', label: 'Nota / Invoice', icon: <ShoppingCart size={14} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${activeTab === tab.id 
                                                ? 'bg-white text-slate-900 shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}
                                        `}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/30">
                            <div id="printable-area">
                                {activeTab === 'summary' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                                    {/* Left Side: Customer & Design Info */}
                                    <div className="space-y-10">
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100"><User size={16} /></div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Informasi Pelanggan</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
                                                    <p className="text-sm font-bold text-slate-900">{selectedOrder.customer?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                                    <p className="text-sm font-bold text-slate-900">{selectedOrder.customer?.phone || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                    <p className="text-sm font-bold text-slate-900">{selectedOrder.customer?.email || 'Tidak dicantumkan'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
                                                    <p className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg w-fit">{selectedOrder.customer?.paymentMethod || 'Transfer BCA'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Pemasangan</p>
                                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedOrder.customer?.address || '-'}</p>
                                                </div>
                                                <div className="col-span-2 p-4 bg-slate-50 rounded-xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catatan Pesanan</p>
                                                    <p className="text-sm font-medium text-slate-500 italic">"{selectedOrder.customer?.notes || 'Tidak ada catatan khusus.'}"</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><Wrench size={16} /></div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Detail Konfigurasi</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Package size={20} /></div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk Utama</p>
                                                            <p className="text-sm font-black text-slate-900">{selectedOrder.config?.productSelection?.name || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bentuk</p>
                                                        <p className="text-sm font-bold text-teal-600">{selectedOrder.config?.productSelection?.shape || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dimensi Ruang</p>
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-xl font-black text-slate-900">{selectedOrder.config?.room?.length} x {selectedOrder.config?.room?.width}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 pb-1">CM</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tinggi Unit</p>
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-xl font-black text-slate-900">{selectedOrder.config?.room?.height}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 pb-1">CM</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Wrench size={80} /></div>
                                                    <div className="relative z-10">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilihan Material & Finishing</p>
                                                        <p className="text-xl font-black mb-4">{MATERIAL_COLORS[selectedOrder.config?.design?.materialId]?.name || 'Plywood High Grade'}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedOrder.config?.design?.accessories?.map((accId: string, i: number) => (
                                                                <span key={i} className="text-[9px] font-black bg-white/10 text-white/90 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
                                                                    {accId}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Side: 2D Visual & Photos */}
                                    <div className="space-y-10">
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100"><Package size={16} /></div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Visualisasi Desain (3D)</h4>
                                            </div>
                                            <div className="aspect-square w-full bg-white rounded-[3rem] p-10 border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden relative group">
                                                <div className="text-center text-slate-400 p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 max-w-[280px]">
                                                    <Package size={42} className="mx-auto mb-3 text-teal-500 animate-pulse" />
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-800">Desain 3D Terkonfigurasi</p>
                                                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                                        Pesanan ini dikonfigurasi menggunakan 3D Configurator. Detail rincian modul, material HPL, dan estimasi biaya per bagian dapat dilihat pada tab **RAB** dan **Nota**.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        {(selectedOrder.config?.photos || []).length > 0 && (
                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100"><ImageIcon size={16} /></div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Foto Lokasi ({(selectedOrder.config?.photos || []).length})</h4>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    {(selectedOrder.config?.photos || []).map((photo: string, i: number) => (
                                                        <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:ring-4 hover:ring-slate-900/5 transition-all group">
                                                            <img src={photo} alt="Lokasi" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rab' && (
                                <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 animate-fade-in print:shadow-none print:border-none relative overflow-hidden">
                                    {/* Subtle Watermark */}
                                    <div className="absolute -right-20 top-20 rotate-45 opacity-[0.03] select-none pointer-events-none">
                                        <h1 className="text-[12rem] font-black tracking-tighter">AFANDI</h1>
                                    </div>

                                    {/* Document Header */}
                                    <div className="flex justify-between items-start mb-20 pb-12 border-b-2 border-slate-100 relative z-10">
                                        <div>
                                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-200">
                                                <Package size={40} className="text-white" />
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">Penawaran Harga</h2>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Official Quotation</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-4">
                                                ID: RAB-{String(selectedOrder.id || '').split('-')[0].toUpperCase()}
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 italic">Diterbitkan: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Berlaku s/d: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    {/* Client & Project Info */}
                                    <div className="grid grid-cols-2 gap-20 mb-20 relative z-10">
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <User size={12} /> Data Pelanggan
                                            </h5>
                                            <p className="text-2xl font-black text-slate-900 mb-1">{selectedOrder.customer?.name}</p>
                                            <p className="text-sm font-bold text-slate-600 mb-3">{selectedOrder.customer?.phone}</p>
                                            <div className="w-10 h-1 bg-slate-200 mb-3 rounded-full"></div>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{selectedOrder.customer?.address}"</p>
                                        </div>
                                        <div className="text-right flex flex-col justify-center">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ringkasan Proyek</h5>
                                            <p className="text-2xl font-black text-slate-900 mb-1">{selectedOrder.config?.productSelection?.name}</p>
                                            <p className="text-sm font-bold text-teal-600 mb-2">Konfigurasi: {selectedOrder.config?.productSelection?.shape}</p>
                                            <div className="flex items-center justify-end gap-3 mt-4">
                                                <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase">Dimensi: {selectedOrder.config?.room?.length}x{selectedOrder.config?.room?.width}cm</div>
                                                <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase">Tinggi: {selectedOrder.config?.room?.height}cm</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itemized Table */}
                                    <div className="mb-20 relative z-10">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-4 border-slate-900">
                                                    <th className="py-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-900">Deskripsi Produksi</th>
                                                    <th className="py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-900">Spesifikasi Material</th>
                                                    <th className="py-6 text-right text-[11px] font-black uppercase tracking-widest text-slate-900">Nilai Investasi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr>
                                                    <td className="py-10">
                                                        <p className="text-lg font-black text-slate-900 mb-2">Pabrikasi Furnitur Utama</p>
                                                        <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> Plywood/Blockboard High Grade 18mm</li>
                                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> Finishing HPL (High Pressure Laminate)</li>
                                                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> Engsel Slow-Motion & Rel Double Track</li>
                                                        </ul>
                                                    </td>
                                                    <td className="py-10 text-center">
                                                        <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100">
                                                            {MATERIAL_COLORS[selectedOrder.config?.design?.materialId]?.name || 'Premium HPL'}
                                                        </span>
                                                    </td>
                                                    <td className="py-10 text-right">
                                                        <p className="text-xl font-black text-slate-900">Rp {(selectedOrder.totalPrice || 0).toLocaleString('id-ID')}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1">Nett / Include Installation</p>
                                                    </td>
                                                </tr>
                                                {(selectedOrder.config?.design?.accessories || []).length > 0 && (
                                                    <tr>
                                                        <td className="py-10">
                                                            <p className="font-black text-slate-900 mb-2">Hardware & Aksesoris</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(selectedOrder.config?.design?.accessories || []).map((acc: string, i: number) => (
                                                                    <span key={i} className="text-[9px] font-black bg-slate-50 text-slate-500 px-3 py-1 rounded-md uppercase tracking-widest border border-slate-100">
                                                                        {acc}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-10 text-center text-xs font-bold text-slate-400 italic">Custom Selection</td>
                                                        <td className="py-10 text-right text-[10px] font-black text-teal-600 uppercase tracking-widest">Sudah Termasuk</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="py-10">
                                                        <p className="font-black text-slate-900 mb-2">Transportasi & Pemasangan</p>
                                                        <p className="text-xs text-slate-400 font-medium">Pengiriman armada workshop dan instalasi profesional di lokasi.</p>
                                                    </td>
                                                    <td className="py-10 text-center text-xs font-bold text-slate-400 uppercase">Jabodetabek Area</td>
                                                    <td className="py-10 text-right">
                                                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest line-through opacity-30 mr-2">Rp 750.000</span>
                                                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Gratis</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-[6px] border-slate-900">
                                                    <td colSpan={2} className="py-10 text-right">
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Total Investasi Proyek</p>
                                                    </td>
                                                    <td className="py-10 text-right">
                                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">Rp {(selectedOrder.totalPrice || 0).toLocaleString('id-ID')}</p>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Terms & Authorization */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t border-slate-100 relative z-10">
                                        <div className="space-y-6">
                                            <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" /> Syarat & Ketentuan:
                                            </h6>
                                            <ul className="text-[10px] text-slate-500 space-y-3 font-medium leading-relaxed">
                                                {(settings?.templates?.rabTerms || "Penawaran ini bersifat final berdasarkan data dimensi yang diberikan secara online.\nPembayaran Down Payment (DP) 50% wajib dilakukan sebagai tanda approval produksi.\nWaktu produksi estimasi 10-14 hari kerja sejak DP diterima.\nGaransi material dan hardware selama 1 tahun untuk penggunaan normal.").split('\n').map((term: string, i: number) => (
                                                    <li key={i} className="flex gap-3">
                                                        <span>{String(i + 1).padStart(2, '0')}.</span> 
                                                        <span>{term}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-16">Hormat Kami,</p>
                                            <div className="relative mb-4">
                                                {/* Simulated Stamp/Signature */}
                                                <div className="absolute inset-0 flex items-center justify-center -rotate-12 opacity-10 pointer-events-none">
                                                    <div className="border-4 border-rose-600 rounded-full px-4 py-2 text-rose-600 font-black text-xl uppercase tracking-tighter">AFANDI INTERIOR</div>
                                                </div>
                                                <div className="w-48 h-0.5 bg-slate-900"></div>
                                            </div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Manajemen Afandi Interior</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1">Furnitur Custom & Interior Design</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'invoice' && (
                                <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border-t-[16px] border-slate-900 animate-fade-in print:shadow-none print:border-none relative">
                                    {/* Invoice Status Tag */}
                                    <div className="absolute top-10 right-10 rotate-12">
                                        <div className="px-6 py-2 border-4 border-amber-500/30 rounded-2xl">
                                            <span className="text-xl font-black text-amber-600 opacity-40 uppercase tracking-tighter">AWATING DP</span>
                                        </div>
                                    </div>

                                    {/* Invoice Header */}
                                    <div className="flex justify-between items-end mb-20">
                                        <div className="space-y-6">
                                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                                <ShoppingCart size={32} />
                                            </div>
                                            <div>
                                                <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2">Invoice</h1>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em]">Tagihan Resmi Penjualan</p>
                                            </div>
                                        </div>
                                        <div className="text-right pb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diterbitkan Oleh</p>
                                            <p className="text-sm font-black text-slate-900">AFANDI INTERIOR CUSTOM</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workshop Solo, Indonesia</p>
                                        </div>
                                    </div>

                                    {/* Invoice Details Grid */}
                                    <div className="grid grid-cols-3 gap-12 mb-20 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={12} /> Billed To:</p>
                                            <p className="text-lg font-black text-slate-900">{selectedOrder.customer?.name}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{selectedOrder.customer?.phone}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-2 leading-relaxed italic truncate">{selectedOrder.customer?.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Invoice Details:</p>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">#INV/{new Date().getFullYear()}/{String(selectedOrder.id || '').split('-')[0].toUpperCase()}</p>
                                            <p className="text-xs font-bold text-slate-500 italic">Issued: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Status:</p>
                                            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-amber-200 shadow-sm">PENDING</span>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="space-y-6 mb-20">
                                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <div className="col-span-7">Deskripsi Item & Layanan</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-3 text-right">Subtotal</div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-4 p-8 bg-white border border-slate-100 rounded-[2rem] items-center shadow-sm">
                                            <div className="col-span-7">
                                                <p className="text-lg font-black text-slate-900 mb-1">Pemesanan Furnitur Custom</p>
                                                <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Model: {selectedOrder.config?.productSelection?.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Material: {MATERIAL_COLORS[selectedOrder.config?.design?.materialId]?.name || 'Premium Plywood'}</p>
                                            </div>
                                            <div className="col-span-2 text-center text-sm font-black text-slate-900">01</div>
                                            <div className="col-span-3 text-right text-xl font-black text-slate-900">Rp {(selectedOrder.totalPrice || 0).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>

                                    {/* Totals & QR Section */}
                                    <div className="flex flex-col md:flex-row gap-16 items-start justify-between border-t-2 border-slate-50 pt-16">
                                        <div className="flex gap-8 items-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            {/* Simulated QR Code */}
                                            <div className="w-24 h-24 bg-white p-2 border border-slate-200 rounded-xl grid grid-cols-4 grid-rows-4 gap-1 opacity-60">
                                                {[...Array(16)].map((_, i) => (
                                                    <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'}`} />
                                                ))}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingCart size={12} /> Panduan Pembayaran:</p>
                                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white font-black">{settings?.payment?.bankName || 'BCA'}</div>
                                                        <p className="text-xs font-black text-slate-900 tracking-widest">{settings?.payment?.bankAccount || '890 1234 567'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50">
                                                        <div className="w-10 h-6 bg-rose-600 rounded flex items-center justify-center text-[10px] text-white font-black uppercase">QRIS</div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Scan QR di Toko / Chat Admin</p>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-14">A/N {settings?.payment?.bankHolder || 'Ahmad Helmi Afandi'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-96 space-y-5">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Subtotal Pekerjaan</span>
                                                <span className="text-slate-600">Rp {(selectedOrder.totalPrice || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Pajak (PPN 0%)</span>
                                                <span className="text-slate-600">Rp 0</span>
                                            </div>
                                            <div className="w-full h-px bg-slate-100 my-2"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Total Billing</span>
                                                <span className="text-4xl font-black text-slate-900 tracking-tighter">Rp {(selectedOrder.totalPrice || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-slate-200">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Down Payment (50%)</p>
                                                    <p className="text-sm font-black tracking-widest">Minimum Deposit</p>
                                                </div>
                                                <p className="text-xl font-black">Rp {((selectedOrder.totalPrice || 0) * 0.5).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Footer */}
                                    <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col items-center">
                                        <div className="px-6 py-2 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-[0.4em] mb-4">Official Electronic Invoice</div>
                                        <div className="text-center space-y-2 mb-4">
                                            {(settings?.templates?.invoiceTerms || "Barang yang sudah dibeli tidak dapat ditukar.\nGaransi produk selama 12 bulan pengerjaan.\nBukti pembayaran ini sah sebagai nota resmi.").split('\n').map((term: string, i: number) => (
                                                <p key={i} className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">{term}</p>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-300 font-medium italic text-center max-w-md">Terima kasih telah mempercayakan interior Anda kepada Afandi Interior.</p>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4 sticky bottom-0 z-20 no-print">
                            {selectedOrder.customer?.phone && (
                                <a 
                                    href={`https://wa.me/${String(selectedOrder.customer.phone || '').replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-[#25D366] hover:bg-[#1da851] text-white font-black rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 text-xs uppercase tracking-widest"
                                >
                                    <Phone size={16} /> Hubungi via WhatsApp
                                </a>
                            )}
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl transition-all hover:bg-slate-50 active:scale-95 text-xs uppercase tracking-widest"
                            >
                                Tutup Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
