import React, { useState } from 'react';
import { Star, ChevronDown, Quote } from 'lucide-react';

interface SectionProps {
    cmsData?: any[];
}

export function Team({ cmsData }: SectionProps) {
    const members = cmsData || [];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4 reveal">
                    <div className="text-sm font-bold text-teal-600 uppercase tracking-widest">Orang-Orang Hebat di Balik Afandi Interior</div>
                    <h2 className="text-4xl font-extrabold text-slate-900">Tim Profesional Kami</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {members.map((m: any, i: number) => (
                        <div key={i} className={`group flex flex-col items-center reveal reveal-delay-${(i+1)*100}`}>
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mb-6 shadow-xl border-4 border-slate-50 relative">
                                <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-all duration-500 md:group-hover:scale-110" />
                                <div className="absolute inset-0 bg-teal-500/20 mix-blend-multiply opacity-0 md:group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{m.name}</h3>
                            <p className="text-slate-500 font-medium">{m.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Testimonials({ cmsData }: SectionProps) {
    const reviews = cmsData || [];

    return (
        <section className="py-24 bg-slate-900 relative">
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-slate-900 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="reveal">
                        <div className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4">Ulasan Klien</div>
                        <h2 className="text-4xl font-extrabold text-white">Apa Kata Mereka</h2>
                    </div>
                </div>

                <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar">
                    {reviews.map((r: any, i: number) => (
                        <div key={i} className={`bg-slate-800 p-8 rounded-2xl border border-slate-700 relative shadow-xl transform md:hover:-translate-y-2 transition-transform duration-300 shrink-0 w-[85vw] md:w-auto snap-center reveal reveal-delay-${(i+1)*100}`}>
                            <Quote className="absolute top-6 right-6 text-slate-700 opacity-50" size={40} />
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} className="fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-slate-300 italic mb-8 leading-relaxed font-light z-10 relative">"{r.text}"</p>
                            <div className="border-t border-slate-700 pt-6">
                                <h4 className="font-bold text-white mb-1">{r.name}</h4>
                                <p className="text-sm text-slate-400">{r.loc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Slider Dots Indicator */}
                <div className="flex md:hidden justify-center gap-2.5 mt-6">
                    {reviews.map((_: any, i: number) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQ({ cmsData }: SectionProps) {
    const faqs = cmsData || [];

    const [open, setOpen] = useState(0);

    return (
        <section id="faq" className="py-24 bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900">Pertanyaan Umum</h2>
                    <p className="text-slate-500 font-light text-lg">Jawaban untuk hal yang sering ditanyakan sebelum memulai kolaborasi desain.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpen(open === i ? -1 : i)}
                                className="w-full text-left p-6 font-bold text-slate-900 flex justify-between items-center bg-white"
                            >
                                {faq.q}
                                <ChevronDown className={`transform transition-transform ${open === i ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out ${open === i ? 'max-h-40 opacity-100 p-6 pt-0 border-t border-slate-100' : 'max-h-0 opacity-0 px-6 py-0'}`}
                            >
                                <p className="text-slate-500 leading-relaxed font-light">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
