import React, { useEffect, useState, useRef } from 'react';
import { api3d } from '../lib/api3d';
import { CatalogItem } from '../types/interior';
import { 
    Plus, X, Tag, Ruler, CircleDollarSign, Loader2, 
    Image as ImageIcon, Box, Trash2, Edit2, CheckCircle2, 
    Power, PowerOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper slugify
const slugify = (text: string) => text.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

export default function AdminProducts() {
    const [products, setProducts] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState<Partial<CatalogItem>>({
        name: '',
        slug: '',
        category: 'kitchen',
        description: '',
        base_price: 0,
        price_unit: 'per_meter',
        default_width: 60,
        default_height: 80,
        default_depth: 60,
        min_width: 30,
        max_width: 240,
        scalable_axis: ['x'],
        thumbnail_url: '',
        glb_url: '',
        is_active: true,
        sort_order: 0,
        mesh_parts: { body: "material-wood-01", door: "material-wood-02" }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const glbInputRef = useRef<HTMLInputElement>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingGlb, setUploadingGlb] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await api3d.getAllItems3DAdmin();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            category: 'kitchen',
            description: '',
            base_price: 0,
            price_unit: 'per_meter',
            default_width: 60,
            default_height: 80,
            default_depth: 60,
            min_width: 30,
            max_width: 240,
            scalable_axis: ['x'],
            thumbnail_url: '',
            glb_url: '',
            is_active: true,
            sort_order: products.length,
            mesh_parts: { body: "material-wood-01", door: "material-wood-02" }
        });
        setEditingId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: CatalogItem) => {
        setFormData({ ...item });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const url = await api3d.uploadPhoto(file); // Reusing uploadPhoto for thumbnails
            setFormData(prev => ({ ...prev, thumbnail_url: url }));
        } catch (error) {
            console.error('Upload image failed:', error);
            alert('Gagal mengunggah gambar.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.glb')) {
            alert('File harus berformat .glb');
            return;
        }

        setUploadingGlb(true);
        try {
            const url = await api3d.uploadModel(file);
            setFormData(prev => ({ ...prev, glb_url: url }));
        } catch (error) {
            console.error('Upload GLB failed:', error);
            alert('Gagal mengunggah file 3D (.glb). Pastikan storage "models-3d" telah dibuat di Supabase.');
        } finally {
            setUploadingGlb(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await api3d.updateItem3D(id, { is_active: !currentStatus });
            setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
        } catch (err) {
            console.error('Toggle failed:', err);
            alert('Gagal mengubah status aktif produk.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Yakin ingin menghapus produk ini dari katalog? Data di Configurator 3D juga akan hilang.')) return;
        try {
            await api3d.deleteItem3D(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Gagal menghapus produk.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Auto generate slug if empty
            let finalData = { ...formData };
            if (!finalData.slug && finalData.name) {
                finalData.slug = slugify(finalData.name);
            }

            if (editingId) {
                await api3d.updateItem3D(editingId, finalData);
            } else {
                await api3d.createItem3D(finalData);
            }
            
            setIsModalOpen(false);
            fetchProducts();
        } catch (err: any) {
            console.error('Save failed:', err);
            alert(`Gagal menyimpan produk: ${err.message || 'Error internal'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof CatalogItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumberChange = (field: keyof CatalogItem, value: string) => {
        setFormData(prev => ({ ...prev, [field]: Number(value) }));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32">
            <Loader2 className="animate-spin text-teal-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium animate-pulse">Memuat Katalog 3D...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Katalog Konfigurator 3D</h2>
                        <p className="text-sm text-slate-500 mt-1">Kelola data furnitur, harga, batas ukuran, dan file 3D untuk Configurator.</p>
                    </div>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} /> Tambah Furnitur 3D
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                            <tr>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga / Satuan</th>
                                <th className="px-6 py-4">Dimensi Default (PxLxT)</th>
                                <th className="px-6 py-4">File 3D</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <Box size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>Belum ada produk di katalog 3D.</p>
                                    </td>
                                </tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                                                {product.thumbnail_url ? (
                                                    <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="text-slate-400" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-base">{product.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-700">Rp {product.base_price.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{product.price_unit === 'per_meter' ? 'Per Meter (Lari)' : 'Per Pcs'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 w-max px-2 py-1 rounded">
                                            <span>{product.default_width}</span>
                                            <X size={10} className="text-slate-400" />
                                            <span>{product.default_depth}</span>
                                            <X size={10} className="text-slate-400" />
                                            <span>{product.default_height}</span>
                                            <span className="text-slate-400 ml-1">cm</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.glb_url ? (
                                            <div className="flex items-center gap-1.5 text-teal-600 text-[11px] font-bold bg-teal-50 px-2 py-1 rounded-full w-max border border-teal-100">
                                                <CheckCircle2 size={12} /> Tersedia
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-bold bg-amber-50 px-2 py-1 rounded-full w-max border border-amber-100">
                                                <Box size={12} /> Procedural / Kosong
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleToggleActive(product.id, product.is_active)}
                                            className={`p-1.5 rounded-full transition-colors ${
                                                product.is_active 
                                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                            title={product.is_active ? "Nonaktifkan" : "Aktifkan"}
                                        >
                                            {product.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenEditModal(product)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Produk"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Hapus Produk"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal (Add / Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)}></div>
                    
                    <div className="bg-white rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                                    <Box size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                        {editingId ? 'Edit Furnitur 3D' : 'Tambah Furnitur 3D Baru'}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Konfigurasi produk untuk dipakai di Configurator 3D</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body / Scrollable Form */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="productForm" onSubmit={handleFormSubmit} className="space-y-8">
                                
                                {/* Section 1: Info Dasar */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                        <Tag size={16} className="text-teal-500" /> Informasi Dasar
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nama Produk *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium"
                                                placeholder="Contoh: Kabinet Atas 2 Pintu"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kategori *</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium appearance-none"
                                                required
                                            >
                                                <option value="kitchen">Kitchen Set</option>
                                                <option value="wardrobe">Lemari Pakaian / Wardrobe</option>
                                                <option value="tv-rack">Rak TV / TV Cabinet</option>
                                                <option value="desk">Meja / Desk</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Harga Dasar *</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    value={formData.base_price}
                                                    onChange={(e) => handleNumberChange('base_price', e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Satuan Harga *</label>
                                            <select
                                                value={formData.price_unit}
                                                onChange={(e) => handleInputChange('price_unit', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium appearance-none"
                                                required
                                            >
                                                <option value="per_meter">Per Meter Lari (/m)</option>
                                                <option value="per_piece">Per Pcs / Unit</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Dimensi & Skala */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                        <Ruler size={16} className="text-indigo-500" /> Dimensi & Skala 3D (cm)
                                    </h4>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Lebar Default (X)</label>
                                            <input type="number" value={formData.default_width} onChange={e => handleNumberChange('default_width', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kedalaman (Z)</label>
                                            <input type="number" value={formData.default_depth} onChange={e => handleNumberChange('default_depth', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tinggi Default (Y)</label>
                                            <input type="number" value={formData.default_height} onChange={e => handleNumberChange('default_height', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col md:flex-row gap-4 items-center">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-indigo-900 mb-1">Batasan Resizing (Lebar X)</p>
                                            <p className="text-[10px] text-indigo-600/80 leading-relaxed">
                                                Tentukan batas seberapa panjang atau pendek furnitur ini bisa ditarik oleh user di configurator.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Min (cm)</label>
                                                <input type="number" value={formData.min_width} onChange={e => handleNumberChange('min_width', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono" />
                                            </div>
                                            <div className="text-slate-300 mt-4">-</div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Max (cm)</label>
                                                <input type="number" value={formData.max_width} onChange={e => handleNumberChange('max_width', e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Media & Aset 3D */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                        <Box size={16} className="text-rose-500" /> Aset Media & File 3D
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Thumbnail Upload */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gambar Thumbnail (Katalog)</label>
                                            <div 
                                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${formData.thumbnail_url ? 'border-teal-200 bg-teal-50/30' : 'border-slate-300 hover:border-teal-400 bg-slate-50'}`}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                
                                                {uploadingImage ? (
                                                    <Loader2 className="animate-spin text-teal-500 my-4" size={24} />
                                                ) : formData.thumbnail_url ? (
                                                    <>
                                                        <img src={formData.thumbnail_url} alt="Preview" className="h-24 object-contain rounded-lg mb-2 shadow-sm" />
                                                        <span className="text-[10px] text-teal-600 font-bold bg-white px-2 py-1 rounded shadow-sm border border-teal-100">Ganti Gambar</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="text-slate-400 mb-2" size={28} />
                                                        <span className="text-xs font-medium text-slate-600">Klik untuk upload gambar .PNG/.JPG</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* GLB File Upload */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">File Model 3D (.glb) *Opsional</label>
                                            <div 
                                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-full ${formData.glb_url ? 'border-rose-200 bg-rose-50/30' : 'border-slate-300 hover:border-rose-400 bg-slate-50'}`}
                                                onClick={() => glbInputRef.current?.click()}
                                            >
                                                <input type="file" ref={glbInputRef} className="hidden" accept=".glb" onChange={handleGlbUpload} />
                                                
                                                {uploadingGlb ? (
                                                    <Loader2 className="animate-spin text-rose-500 my-4" size={24} />
                                                ) : formData.glb_url ? (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Box className="text-rose-500 mb-2" size={32} />
                                                        <span className="text-xs font-bold text-rose-700 truncate max-w-[200px] bg-white px-2 py-1 rounded border border-rose-100">
                                                            Model 3D Tersimpan
                                                        </span>
                                                        <p className="text-[9px] text-rose-500/70 mt-2">Klik untuk ganti file</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Box className="text-slate-400 mb-2" size={28} />
                                                        <span className="text-xs font-medium text-slate-600">Upload file 3D (.glb)</span>
                                                        <p className="text-[10px] text-slate-400 mt-1 px-4 leading-tight">Jika kosong, sistem akan menggunakan procedural geometry 3D bawaan.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white rounded-b-3xl shrink-0 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 px-6 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="productForm"
                                disabled={isSaving || uploadingImage || uploadingGlb}
                                className="flex-[2] py-3 px-6 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Simpan Perubahan' : 'Tambahkan Produk')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}