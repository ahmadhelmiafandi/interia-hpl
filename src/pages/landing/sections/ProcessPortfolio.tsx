import React, { useState } from 'react';
import { MousePointerClick, CalendarCheck, Wrench, PartyPopper, X, Maximize2, Instagram, ArrowRight } from 'lucide-react';

interface SectionProps {
    cmsData?: any;
}

interface PortfolioItem {
    span: string;
    img: string;
    title: string;
    desc: string;
    category: string;
}

export function HowItWorks({ cmsData }: SectionProps) {
    const defaultSteps = [
        {
            icon: <MousePointerClick className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
            title: 'Online Configurator',
            desc: 'Pilih jenis perabot, masukkan ukuran dinding/ruangan secara instan, dan lihat harga estimasinya.',
            color: 'bg-indigo-600',
        },
        {
            icon: <CalendarCheck className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
            title: 'Survey Lokasi',
            desc: 'Tim ukur profesional Afandi Interior akan datang mensurvey ruang Anda untuk sinkronisasi layout.',
            color: 'bg-teal-500',
        },
        {
            icon: <Wrench className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
            title: 'Produksi Workshop',
            desc: 'Pengerjaan 1-3 minggu di fasilitas mandiri (workshop kami) dengan material custom.',
            color: 'bg-amber-500',
        },
        {
            icon: <PartyPopper className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />,
            title: 'Instalasi',
            desc: 'Pemasangan rapi dan cepat minimal debu. Ruangan baru Anda siap digunakan.',
            color: 'bg-rose-500',
        },
    ];

    const finalSteps = Array.isArray(cmsData) && cmsData.length > 0 ? cmsData.map((s: any, i: number) => ({
        ...s,
        icon: defaultSteps[i % defaultSteps.length].icon,
        color: defaultSteps[i % defaultSteps.length].color
    })) : defaultSteps;

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4 reveal">
                    <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Alur Kerja Mudah</div>
                    <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Cara Kerja Pemesanan</h2>
                </div>

                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block rounded-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {finalSteps.map((step: any, idx: number) => (
                            <div key={idx} className={`relative group p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 reveal reveal-delay-${(idx+1)*100}`}>
                                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative z-10 mb-8 border border-white" style={{ backgroundColor: 'var(--tw-colors-slate-50)' }}>
                                    <div className={`absolute inset-1 rounded-xl ${step.color} flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_var(--color-current)]`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border-2 border-white text-white font-bold text-sm flex items-center justify-center shadow-md">
                                        {idx + 1}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                                <p className="text-slate-500 font-light leading-relaxed px-4">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Portfolio({ cmsData }: SectionProps) {
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    const defaultWorks = [
        { span: 'col-span-1 row-span-2', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop', title: 'Modern Minimalist Kitchen', desc: 'Dapur minimalis dengan material HPL premium dan pencahayaan cerdas yang menciptakan suasana hangat namun tetap fungsional.', category: 'Kitchen Set' },
        { span: 'col-span-1 row-span-1', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop', title: 'Cozy Living Area', desc: 'Ruang tamu yang hangat dengan sentuhan kayu solid dan desain ergonomis untuk kenyamanan keluarga.', category: 'Living Room' },
        { span: 'col-span-1 row-span-1', img: 'https://images.unsplash.com/photo-1595522904535-ba2c628e93ad?q=80&w=800&auto=format&fit=crop', title: 'Master Bedroom Wardrobe', desc: 'Lemari pakaian custom yang memaksimalkan setiap jengkal ruang penyimpanan kamar tidur utama.', category: 'Bedroom' },
        { span: 'col-span-2 row-span-1', img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop', title: 'Open Space TV Setup', desc: 'Instalasi TV gantung dengan backdrop HPL bermotif serat kayu alami dan laci penyimpanan tersembunyi.', category: 'Entertainment' },
    ];

    const works = Array.isArray(cmsData) && cmsData.length > 0 ? cmsData.map((w: any, i: number) => ({
        ...w,
        span: defaultWorks[i] ? defaultWorks[i].span : 'col-span-1 row-span-1',
        desc: w.desc || (defaultWorks[i] ? defaultWorks[i].desc : 'Project interior berkualitas tinggi dari Afandi Interior.'),
        category: w.category || (defaultWorks[i] ? defaultWorks[i].category : 'Custom Furniture')
    })) : defaultWorks;

    return (
        <section id="portfolio" className="py-24 bg-[#fdfaf6]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 reveal">
                    <div className="space-y-4">
                        <div className="text-sm font-bold text-teal-600 uppercase tracking-[0.3em]">Signature Collection</div>
                        <h2 className="text-5xl font-black text-slate-900">Mahakarya Kami</h2>
                        <p className="text-slate-500 text-lg font-light max-w-md italic">"Setiap sudut ruangan memiliki cerita, dan kami di sini untuk menulisnya bersama Anda."</p>
                    </div>
                    <a 
                        href="https://instagram.com/afandi_interior" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-full font-black transition-all hover:bg-slate-900 hover:text-white active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-slate-200 w-full md:w-auto"
                    >
                        <span>Eksplorasi di Instagram</span>
                        <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                    </a>
                </div>

                {/* Magazine Grid */}
                <div className="flex md:grid md:grid-cols-3 md:auto-rows-[280px] gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    {works.map((w: any, i: number) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedItem(w)}
                            className={`
                                relative rounded-[2rem] overflow-hidden group shadow-lg transition-all duration-700 
                                shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-center cursor-pointer magazine-card
                                ${w.span} ${w.span.includes('col-span-2') ? 'md:col-span-2' : ''} 
                                h-[420px] md:h-auto reveal reveal-delay-${(i+1)*100}
                                border border-white/40
                            `}
                        >
                            <img src={w.img} alt={w.title} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000" />
                            
                            <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent">
                                <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 inline-block">{w.category}</span>
                                    <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                                        {w.title}
                                    </h3>
                                    <div className="h-0.5 w-8 bg-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                </div>
                            </div>

                            {/* Hover/Mobile Overlay Icon */}
                            <div className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-slate-900 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-100 md:scale-50 md:group-hover:scale-100 shadow-lg">
                                <Maximize2 size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Refined Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-12">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500" onClick={() => setSelectedItem(null)}></div>
                    
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col lg:flex-row h-auto max-h-[90vh] animate-modal-in border border-white/10">
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white lg:text-slate-900 lg:bg-slate-100 lg:hover:bg-slate-200 transition-all z-30 shadow-lg"
                        >
                            <X size={24} />
                        </button>
                        
                        {/* Left: Image */}
                        <div className="w-full lg:w-3/5 h-64 lg:h-auto overflow-hidden relative">
                            <img src={selectedItem.img} alt={selectedItem.title} className="w-full h-full object-cover" />
                            <div className="absolute top-6 left-6">
                                <span className="bg-teal-600 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
                                    {selectedItem.category}
                                </span>
                            </div>
                        </div>
                        
                        {/* Right: Content */}
                        <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between overflow-y-auto bg-white">
                            <div className="space-y-6">
                                <div>
                                    <div className="h-1 w-12 bg-teal-600 mb-6 rounded-full"></div>
                                    <h3 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                                        {selectedItem.title}
                                    </h3>
                                    <p className="text-slate-500 text-base leading-relaxed">
                                        {selectedItem.desc}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                                            <CalendarCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                            <p className="text-sm font-bold text-slate-800">Selesai & Terpasang</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                            <Wrench size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Material</p>
                                            <p className="text-sm font-bold text-slate-800">Premium HPL Finishing</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <a 
                                    href={`https://wa.me/628123456789?text=Halo Afandi Interior, saya menyukai proyek: ${selectedItem.title}. Boleh tanya estimasi harganya?`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    Konsultasi Desain Ini
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
