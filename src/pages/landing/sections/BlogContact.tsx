import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, X, Clock, Calendar } from 'lucide-react';

interface BlogProps {
    cmsData?: any[];
    contactData?: Record<string, any>;
}

interface ContactProps {
    cmsData?: Record<string, any>;
}

export function Blog({ cmsData, contactData }: BlogProps) {
    const [selectedArticle, setSelectedArticle] = useState<Record<string, any> | null>(null);

    const defaultArticles = [
        {
            title: '5 Tips Memilih Material HPL untuk Dapur Minimalis',
            date: '12 Feb 2026',
            img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop',
            desc: 'Pelajari karakter masing-masing pelapis kayu agar awet puluhan tahun. Material HPL (High Pressure Laminate) adalah pilihan populer untuk finishing interior karena daya tahannya yang luar biasa terhadap panas dan goresan.',
            content: 'Material HPL (High Pressure Laminate) telah menjadi standar emas dalam dunia desain interior modern, khususnya untuk area dapur. Kelebihannya terletak pada durabilitas tinggi, kemudahan perawatan, dan variasi motif yang sangat luas, mulai dari tekstur kayu alami hingga beton industrial.\n\nDalam artikel ini, kami merangkum 5 poin utama yang harus Anda perhatikan:\n1. Periksa ketebalan lapisan (grade).\n2. Pilih tekstur yang tidak mudah meninggalkan sidik jari (anti-fingerprint).\n3. Pastikan proses edging rapi dan menggunakan lem tahan panas.\n4. Sesuaikan motif dengan pencahayaan ruangan.\n5. Pilih merk yang memiliki reputasi garansi yang baik.'
        },
        {
            title: 'Warna Interior Paling Dicari Tahun Ini',
            date: '08 Feb 2026',
            img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop',
            desc: 'Dari Sage Green hingga warna-warna earth tone yang menenangkan. Tren warna tahun ini bergeser ke arah alam dan ketenangan.',
            content: 'Tahun 2026 membawa kita kembali ke akar alamiah. Warna-warna seperti Sage Green, Terracotta, dan Warm Sand mendominasi permintaan klien kami di Afandi Interior. Warna-warna ini tidak hanya menciptakan suasana yang menenangkan, tetapi juga sangat fleksibel untuk dipadukan dengan berbagai jenis furnitur kayu.\n\nKenapa warna earth tone begitu populer?\n- Memberikan kesan ruangan yang lebih luas dan cerah.\n- Meningkatkan mood dan produktivitas (psikologi warna).\n- Lebih awet secara estetika (timeless) dibandingkan warna neon yang cepat membosankan.'
        },
        {
            title: 'Perbedaan Multiplek vs Blockboard Jati',
            date: '24 Jan 2026',
            img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop',
            desc: 'Sebelum membuat lemari custom, kenali jenis kayu inti terbaik untuk budget Anda. Memahami struktur dasar furnitur Anda.',
            content: 'Banyak konsumen yang masih bingung membedakan antara Multiplek (Plywood) dan Blockboard. Meskipun keduanya tampak sama setelah dilapisi HPL, kekuatannya berbeda.\n\nMultiplek dibuat dari lapisan tipis kayu yang ditumpuk silang, memberikan kekuatan struktural yang sangat stabil. Sementara Blockboard menggunakan potongan kayu persegi panjang (block) yang disusun sejajar. Untuk lemari yang menampung beban berat, kami selalu menyarankan penggunaan Multiplek grade A demi daya tahan jangka panjang.'
        },
    ];

    const articles = (cmsData || []).length > 0 ? cmsData!.map((a: any, i: number) => ({
        ...a,
        content: a.content || (defaultArticles[i] ? defaultArticles[i].content : 'Artikel detail sedang dalam proses penulisan. Silakan hubungi tim kami untuk informasi lebih lanjut mengenai topik ini.')
    })) : defaultArticles;

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold text-slate-900">Inspirasi & Edukasi</h2>
                        <p className="text-slate-500 font-light text-lg">Tips merawat dan ide desain dari arsitek kami.</p>
                    </div>
                    <button 
                        onClick={() => document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 font-bold text-teal-600 hover:text-indigo-600 transition-colors uppercase tracking-widest text-sm"
                    >
                        Lihat Blog Lainnya <ArrowRight size={16} />
                    </button>
                </div>

                {/* Mobile Slider / Desktop Grid */}
                <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    {articles.map((a: any, i: number) => (
                        <article key={i} className={`bg-white rounded-[2rem] overflow-hidden border border-slate-100 group shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2 shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-center reveal reveal-delay-${(i+1)*100}`}>
                            <div className="h-56 overflow-hidden relative">
                                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur text-[9px] font-black text-slate-900 px-3 py-1.5 rounded-full z-10 shadow-sm border border-slate-100 uppercase tracking-widest">
                                    {a.date}
                                </div>
                                <img src={a.img} alt={a.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-extrabold text-lg md:text-xl text-slate-900 mb-3 group-hover:text-teal-600 transition-colors leading-tight line-clamp-2">{a.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light line-clamp-3">{a.desc}</p>
                                <button 
                                    onClick={() => setSelectedArticle(a)}
                                    className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] cursor-pointer inline-flex items-center gap-3 group-hover:gap-5 transition-all border-none bg-transparent"
                                >
                                    Baca Selengkapnya
                                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Mobile Slider Dots */}
                <div className="flex md:hidden justify-center gap-2.5 mt-6">
                    {articles.map((_: any, i: number) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    ))}
                </div>
            </div>

            {/* Blog Detail Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-modal-in">
                        <button 
                            onClick={() => setSelectedArticle(null)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 lg:bg-slate-100 lg:hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-900 transition-all z-20 shadow-lg"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="overflow-y-auto">
                            <div className="h-64 md:h-[450px] overflow-hidden relative">
                                <img src={selectedArticle.img} alt={selectedArticle.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4">
                                        <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">{selectedArticle.date}</span>
                                        <span className="bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-sm">Editorial</span>
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{selectedArticle.title}</h3>
                                </div>
                            </div>
                            
                            <div className="p-8 md:p-16 pt-0">
                                <div className="max-w-2xl">
                                    <div className="flex flex-wrap items-center gap-6 text-[10px] text-slate-400 mb-10 font-bold uppercase tracking-widest border-b border-slate-100 pb-8">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-teal-500" />
                                            5 Mins Read
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-teal-500" />
                                            Material Insights
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-slate max-w-none">
                                        {selectedArticle.content.split('\n').map((paragraph: string, idx: number) => (
                                            <p key={idx} className="text-slate-600 text-lg leading-relaxed mb-6 font-light">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="mt-12 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                                        <div className="flex items-center gap-4">
                                            <img src="/brand/logo-icon-dark.png" alt="Afandi Logo" className="w-12 h-12" />
                                            <div>
                                                <p className="font-extrabold text-slate-900">Afandi Interior Editorial</p>
                                                <p className="text-sm text-slate-500">Spesialis Desain & Produksi Furnitur</p>
                                            </div>
                                        </div>
                                        <a 
                                            href={`https://wa.me/${contactData?.phone?.replace(/[^0-9]/g, '') || ''}?text=Halo Afandi Interior, saya baru saja membaca artikel: ${selectedArticle.title}. Saya ingin konsultasi lebih lanjut.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
                                        >
                                            Chat via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export function Contact({ cmsData }: ContactProps) {
    if (!cmsData) return null;

    return (
        <section id="kontak" className="py-24 bg-slate-900 text-slate-300 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-16 items-center">

                <div className="flex-1 space-y-8">
                    <div className="text-sm font-bold text-teal-400 uppercase tracking-widest relative inline-block reveal">
                        Siap untuk memulai?
                        <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-teal-400 rounded-full"></div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight reveal">
                        Kunjungi <span className="text-indigo-400">Workshop</span><br />atau hubungi kami.
                    </h2>

                    <p className="text-lg leading-relaxed font-light text-slate-400 max-w-md reveal">
                        Tim desain dan spesialis perakitan kami siap menjawab setiap pertanyaan Anda mengenai pembuatan furnitur.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="flex items-start gap-4 reveal-left">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                <Phone className="text-teal-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">WhatsApp Langsung</h4>
                                <p className="text-slate-400">{cmsData.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 reveal-right">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                <Mail className="text-teal-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Email Pertanyaan</h4>
                                <p className="text-slate-400">{cmsData.email}</p>
                            </div>
                        </div>
                    </div>

                    <a href={`https://wa.me/${cmsData.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mt-8 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-1 w-full max-w-xs justify-center uppercase tracking-wider text-sm">
                        Chat WhatsApp
                    </a>
                </div>

                <div className="flex-1 w-full">
                    <div className="bg-slate-800 rounded-3xl p-6 border-2 border-slate-700 shadow-2xl relative">
                        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg z-10 hidden md:block border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <img src="/brand/logo-icon-dark.png" alt="Icon" className="w-8 h-8 object-contain drop-shadow-sm" />
                                <div>
                                    <h5 className="font-bold text-slate-900 leading-none">Afandi Interior Workshop</h5>
                                    <p className="text-[10px] text-slate-500">Jepara, Jawa Tengah</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 border-t border-slate-100 pt-2 flex items-center gap-1 font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Buka hingga 17:00 WIB
                            </div>
                        </div>
                        <div className="w-full h-80 bg-slate-700 rounded-2xl overflow-hidden relative">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d442.94821240468525!2d110.83739174259163!3d-6.472642271122013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7124cca95fb529%3A0xbb7fcdc31e37790d!2sGRGQ%2BX39%2C%20Dermayu%2C%20Bumiharjo%2C%20Kec.%20Keling%2C%20Kabupaten%20Jepara%2C%20Jawa%20Tengah%2059454!5e0!3m2!1sid!2sid!4v1780306784042!5m2!1sid!2sid" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Afandi Interior Workshop Location"
                            ></iframe>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
