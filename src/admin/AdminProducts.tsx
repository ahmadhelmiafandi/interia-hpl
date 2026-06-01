import React, { useEffect, useState } from 'react';
import { api, Product } from '../lib/api';
import { Plus, X, Tag, Ruler, CircleDollarSign, Loader2 } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newShapes, setNewShapes] = useState('Lurus, L-shape, U-shape');

    const fetchProducts = (showLoader = false) => {
        if (showLoader) setLoading(true);
        api.getProducts().then((data) => {
            setProducts(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handlePriceChange = async (id: string, newPrice: string) => {
        try {
            await api.updateProduct(id, { basePrice: Number(newPrice) });
            fetchProducts();
        } catch (err) {
            console.error('Update failed:', err);
            alert('Gagal memperbarui harga.');
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const shapesArray = newShapes.split(',').map(s => s.trim()).filter(s => s !== '');
            await api.addProduct({
                name: newName,
                basePrice: Number(newPrice),
                shapes: shapesArray
            });
            
            // Reset form & close modal
            setNewName('');
            setNewPrice('');
            setNewShapes('Lurus, L-shape, U-shape');
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error('Add failed:', err);
            alert('Gagal menambah produk.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Katalog Produk & Harga</h2>
                        <p className="text-sm text-slate-500 mt-1">Kelola daftar item yang tersedia di configurator.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                        <Plus size={18} /> Tambah Produk
                    </button>
                </div>
                <div className="p-6 grid gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="group border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-200 transition-colors bg-white hover:shadow-md">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-teal-50 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors font-bold">
                                    {product.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {product.shapes.map((s: string, idx: number) => (
                                            <span key={idx} className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl group-hover:bg-teal-50/50 transition-colors">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Harga Dasar /m</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                                    <input
                                        type="number"
                                        defaultValue={product.basePrice}
                                        onBlur={(e) => handlePriceChange(product.id, e.target.value)}
                                        className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-36 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Tambah Produk Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Produk</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                                        placeholder="Contoh: Meja Rias"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Harga Dasar (m1/m2)</label>
                                <div className="relative">
                                    <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                                        placeholder="2000000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Varian Bentuk (Pisahkan koma)</label>
                                <div className="relative">
                                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={newShapes}
                                        onChange={(e) => setNewShapes(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                                        placeholder="Lurus, L-shape, U-shape"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 px-6 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] py-4 px-6 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

