import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, 
    Laptop, 
    Maximize, 
    CircleDollarSign, 
    CheckCircle2, 
    Check, 
    Layers, 
    FileDown, 
    CalendarRange 
} from 'lucide-react';

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
        <section id="produk" className="py-12 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-14 lg:mb-16 gap-4 md:gap-6 reveal">
                    <div className="max-w-xl">
                        <div className="text-xs md:text-sm font-bold text-teal-600 uppercase tracking-widest mb-3 md:mb-4">Katalog Produk</div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">Furniture yang dirancang <br />untuk ruangan nyata Anda.</h2>
                    </div>
                    <p className="text-slate-500 max-w-sm md:text-right font-light text-sm md:text-base leading-relaxed">
                        Pilih jenis produk yang ingin dibuat, masukkan ukuran Anda, dan kami akan menyesuaikan proporsinya.
                    </p>
                </div>

                {/* Mobile Slider / Desktop Grid */}
                <div className="flex md:grid md:grid-cols-2 gap-6 lg:gap-10 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar">
                    {products.map((p: any, i: number) => (
                        <div 
                            key={i} 
                            className={`group overflow-hidden rounded-2xl md:rounded-3xl relative h-[420px] md:h-[450px] lg:h-[550px] shrink-0 w-[85vw] md:w-auto snap-center cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 reveal reveal-delay-${(i+1)*100}`}
                        >
                            <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                            <div className="absolute inset-0 p-5 md:p-6 lg:p-8 flex flex-col justify-end transform md:group-hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-0 leading-tight">{p.title}</h3>
                                
                                {/* Features: Auto-show on mobile, hover-show on desktop */}
                                <div className="max-h-48 opacity-100 md:max-h-0 md:opacity-0 overflow-hidden md:group-hover:max-h-48 md:group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                    <ul className="space-y-1.5 md:space-y-2 pt-3 md:pt-4 pb-2">
                                        {(typeof p.features === 'string' ? p.features.split(',') : p.features || []).map((feat: any, idx: number) => (
                                            <li key={idx} className="flex items-center text-slate-300 font-medium text-xs md:text-[13px] gap-2">
                                                <CheckCircle2 size={14} className="text-teal-400 shrink-0" /> {feat.trim()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <Link to="/configurator" className="flex items-center gap-2 cursor-pointer text-indigo-300 hover:text-indigo-200 uppercase text-[11px] md:text-[12px] font-bold tracking-wider mt-2">
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
        <section id="teknologi" className="py-12 md:py-20 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-16">
                
                {/* Desktop Laptop Mockup (Kiri) */}
                <div className="hidden md:flex flex-1 w-full flex-col items-center justify-center relative group">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 rounded-3xl blur-3xl opacity-60 group-hover:opacity-85 transition-opacity duration-700 pointer-events-none"></div>
                    
                    <div className="relative w-full max-w-[500px] md:max-w-[650px] lg:max-w-[800px] rounded-xl md:rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/40 backdrop-blur-md p-2 md:p-3 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-teal-500/10">
                        {/* Decorative Screen Glare */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
                        
                        <img 
                            src={(cmsData?.techImage || "/brand/configurator-laptop-mockup.png") + "?v=new"} 
                            alt="Afandi Interior 3D Configurator Laptop Mockup" 
                            className="w-full h-auto rounded-lg md:rounded-xl object-cover relative z-10 border border-slate-900 shadow-inner"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-6 md:space-y-8 reveal-right">
                    <div className="inline-flex items-center gap-2 text-teal-400 font-black tracking-[0.2em] uppercase text-[10px] md:text-xs bg-teal-900/40 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-teal-500/30 shadow-lg shadow-teal-900/20">
                        <Laptop size={14} className="md:w-4 md:h-4" /> {cmsData?.badge || "Teknologi Afandi Interior"}
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                        {cmsData.title}
                    </h2>

                    <p className="text-base md:text-lg text-slate-400 font-light leading-relaxed max-w-xl">
                        {cmsData.desc}
                    </p>

                    {/* Mobile Laptop Mockup */}
                    <div className="flex md:hidden w-full flex-col items-center justify-center relative group py-2">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
                        <div className="relative w-full max-w-[95%] sm:max-w-[500px] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/40 backdrop-blur-md p-2 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
                            <img 
                                src={(cmsData?.techImage || "/brand/configurator-laptop-mockup.png") + "?v=new"} 
                                alt="Afandi Interior 3D Configurator Laptop Mockup" 
                                className="w-full h-auto rounded-lg object-cover relative z-10 border border-slate-900 shadow-inner"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2">
                        {cmsData?.features && Array.isArray(cmsData.features) ? (
                            cmsData.features.map((feature: any, idx: number) => {
                                const iconMap: any = { Layers, CircleDollarSign, FileDown, CalendarRange };
                                const IconComponent = iconMap[feature.icon] || Layers;
                                return (
                                    <div key={idx} className="flex flex-col items-start gap-3 group p-4 rounded-xl md:rounded-2xl bg-slate-950/20 border border-slate-800/40 hover:border-teal-500/30 hover:bg-[#111827]/40 transition-all duration-300 shadow-sm h-full">
                                        <div className="w-10 h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-md group-hover:border-teal-500/50 group-hover:text-teal-400 text-slate-300 transition-colors">
                                            <IconComponent size={18} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm md:text-base mb-1 text-white">{feature.title}</h4>
                                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                <div className="flex flex-col items-start gap-3 group p-4 rounded-xl md:rounded-2xl bg-slate-950/20 border border-slate-800/40 hover:border-teal-500/30 hover:bg-[#111827]/40 transition-all duration-300 shadow-sm h-full">
                                    <div className="w-10 h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-md group-hover:border-teal-500/50 group-hover:text-teal-400 text-slate-300 transition-colors">
                                        <Layers size={18} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm md:text-base mb-1 text-white">Visualisasi Real-Time 3D</h4>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">Rancang layout kabinet & dekorasi ruangan HPL Anda dan saksikan hasilnya merespons secara instan.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-3 group p-4 rounded-xl md:rounded-2xl bg-slate-950/20 border border-slate-800/40 hover:border-teal-500/30 hover:bg-[#111827]/40 transition-all duration-300 shadow-sm h-full">
                                    <div className="w-10 h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-md group-hover:border-teal-500/50 group-hover:text-teal-400 text-slate-300 transition-colors">
                                        <CircleDollarSign size={18} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm md:text-base mb-1 text-white">Kalkulator BOM Transparan</h4>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">Transparansi harga total terinci per modul kabinet, tipe HPL, engsel, laci, hingga LED strip tanpa biaya siluman.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-3 group p-4 rounded-xl md:rounded-2xl bg-slate-950/20 border border-slate-800/40 hover:border-teal-500/30 hover:bg-[#111827]/40 transition-all duration-300 shadow-sm h-full">
                                    <div className="w-10 h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-md group-hover:border-teal-500/50 group-hover:text-teal-400 text-slate-300 transition-colors">
                                        <FileDown size={18} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm md:text-base mb-1 text-white">Ekspor PDF Quotation Instan</h4>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">Unduh surat penawaran harga resmi (BOM lengkap) secara langsung untuk dicetak atau dijadikan perbandingan budget.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-3 group p-4 rounded-xl md:rounded-2xl bg-slate-950/20 border border-slate-800/40 hover:border-teal-500/30 hover:bg-[#111827]/40 transition-all duration-300 shadow-sm h-full">
                                    <div className="w-10 h-10 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 shadow-md group-hover:border-teal-500/50 group-hover:text-teal-400 text-slate-300 transition-colors">
                                        <CalendarRange size={18} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm md:text-base mb-1 text-white">WhatsApp Survey Sync</h4>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">Kirim spesifikasi kustomisasi Anda ke WhatsApp kami untuk langsung memesan survey lokasi secara presisi.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4 md:pt-6">
                        <Link
                            to="/configurator"
                            className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-[#b08d57] hover:bg-[#8e7246] text-white rounded-full font-bold text-sm md:text-base transition-all shadow-lg shadow-[#b08d57]/30 hover:shadow-[#b08d57]/50 active:scale-95 group w-full sm:w-auto justify-center"
                        >
                            {cmsData?.btnText || "Coba Configurator"} 
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
