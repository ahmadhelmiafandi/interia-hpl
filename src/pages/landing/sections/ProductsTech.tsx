import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Maximize, CircleDollarSign, CheckCircle2 } from 'lucide-react';

interface SectionProps {
    cmsData?: any;
}

export function Products({ cmsData }: SectionProps) {
    const defaultProducts = [
        {
            title: 'Kitchen Set Minimalis',
            img: 'https://images.unsplash.com/photo-1556910103-1c02745a8289?q=80&w=800&auto=format&fit=crop',
            features: 'L-Shape / U-Shape, Anti-Rayap (PVC/Blockboard), Engsel Soft-close',
        },
        {
            title: 'Lemari Pakaian Wardrobe',
            img: 'https://images.unsplash.com/photo-1595526114101-23da160c87ad?q=80&w=800&auto=format&fit=crop',
            features: 'Full Plafon 3 Meter, Cermin Terintegrasi, LED Strip Sensor',
        },
        {
            title: 'Meja Kerja & Belajar',
            img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bf?q=80&w=800&auto=format&fit=crop',
            features: 'Ruang Penyimpanan, Cable Management, Desain Ergonomis',
        },
        {
            title: 'Kabinet Rak TV',
            img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop',
            features: 'Floating Design, Hidden Storage, Back panel HPL',
        },
    ];

    const products = Array.isArray(cmsData) && cmsData.length > 0 ? cmsData : defaultProducts;

    return (
        <section id="produk" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 reveal">
                    <div className="max-w-xl">
                        <div className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-4">Katalog Produk</div>
                        <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Furniture yang dirancang <br />untuk ruangan nyata Anda.</h2>
                    </div>
                    <p className="text-slate-500 max-w-sm md:text-right font-light leading-relaxed">
                        Pilih jenis produk yang ingin dibuat, masukkan ukuran Anda, dan kami akan menyesuaikan proporsinya.
                    </p>
                </div>

                {/* Mobile Slider / Desktop Grid */}
                <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar">
                    {products.map((p: any, i: number) => (
                        <div 
                            key={i} 
                            className={`group overflow-hidden rounded-3xl relative h-[450px] shrink-0 w-[85vw] md:w-auto snap-center cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 reveal reveal-delay-${(i+1)*100}`}
                        >
                            <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end transform md:group-hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-0 leading-tight">{p.title}</h3>
                                
                                {/* Features: Auto-show on mobile, hover-show on desktop */}
                                <div className="max-h-48 opacity-100 md:max-h-0 md:opacity-0 overflow-hidden md:group-hover:max-h-48 md:group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                    <ul className="space-y-1.5 md:space-y-2 pt-3 md:pt-4 pb-2">
                                        {(typeof p.features === 'string' ? p.features.split(',') : p.features || []).map((feat: any, idx: number) => (
                                            <li key={idx} className="flex items-center text-slate-300 font-medium text-[13px] md:text-sm gap-2">
                                                <CheckCircle2 size={14} className="text-teal-400 shrink-0" /> {feat.trim()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <Link to="/configurator" className="flex items-center gap-2 cursor-pointer text-indigo-300 hover:text-indigo-200 uppercase text-[12px] md:text-sm font-bold tracking-wider mt-2">
                                    Desain Sekarang &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="flex md:hidden justify-center gap-2 mt-2">
                    {products.map((_: any, i: number) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Technology({ cmsData }: SectionProps) {
    if (!cmsData) return null;
    return (
        <section id="teknologi" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 w-full flex items-center justify-center perspective-1000 order-2 md:order-1">
                    <div className="relative transform rotate-y-[15deg] rotate-x-[5deg] bg-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-700 w-full max-w-lg group">
                        <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
                            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        </div>
                        {/* Mockup UI configurator */}
                        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 h-64 flex flex-col justify-between overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>
                            <div className="space-y-4">
                                <div className="h-4 w-1/3 bg-slate-800 rounded animate-pulse"></div>
                                <div className="h-7 w-2/3 bg-slate-700 rounded-lg"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="aspect-square bg-slate-800/50 rounded-xl border border-teal-500/40 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(176,141,87,0.15)] group-hover:shadow-[0_0_30px_rgba(176,141,87,0.25)] transition-all">
                                    <div className="w-10 h-10 rounded border-2 border-teal-400/80 flex items-center justify-center">
                                       <div className="w-6 h-6 border border-teal-400/30"></div>
                                    </div>
                                    <span className="text-[10px] mt-2 font-black text-teal-400 uppercase tracking-tighter">P. Panjang</span>
                                </div>
                                <div className="aspect-square bg-slate-800/30 rounded-xl border border-slate-700 flex flex-col items-center justify-center opacity-40">
                                    <div className="w-10 h-10 rounded border-2 border-slate-600"></div>
                                    <span className="text-[10px] mt-2 font-bold uppercase tracking-tighter">L-Shape</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-8 order-1 md:order-2 reveal-right">
                    <div className="inline-flex items-center gap-2 text-teal-400 font-black tracking-[0.2em] uppercase text-xs bg-teal-900/40 px-5 py-2.5 rounded-full border border-teal-500/30 shadow-lg shadow-teal-900/20">
                        <Laptop size={16} /> Teknologi Afandi Interior
                    </div>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                        {cmsData.title}
                    </h2>

                    <p className="text-lg text-slate-400 font-light leading-relaxed max-w-xl">
                        {cmsData.desc}
                    </p>

                    <div className="space-y-8 pt-4">
                        <div className="flex gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-xl group-hover:border-teal-500/50 transition-colors">
                                <Maximize className="text-teal-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl mb-1.5 text-white">Input Denah Presisi</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Masukkan ukuran dan konfigurasi dinding asli Anda secara milimeter.</p>
                            </div>
                        </div>

                        <div className="flex gap-5 group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-xl group-hover:border-teal-500/50 transition-colors">
                                <CircleDollarSign className="text-teal-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl mb-1.5 text-white">Estimasi Harga Tepat</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Transparansi biaya instan berdasarkan luas dan jenis HPL pilihan Anda.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <Link
                            to="/configurator"
                            className="inline-flex items-center gap-4 px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(176,141,87,0.2)] hover:shadow-[0_25px_50px_rgba(176,141,87,0.4)] transform hover:-translate-y-1.5 transition-all group active:scale-95"
                        >
                            Coba Configurator <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
