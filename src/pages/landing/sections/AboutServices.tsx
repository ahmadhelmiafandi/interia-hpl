import React from "react";
import {
  Sofa,
  LayoutDashboard,
  Hammer,
  ShieldCheck,
  Ruler,
  ThumbsUp,
  Utensils,
} from "lucide-react";
import TypingText from "../../../components/ui/TypingText";

interface SectionProps {
  cmsData?: any;
}

export function About({ cmsData }: SectionProps) {
  if (!cmsData) return null;
  return (
    <section id="tentang" className="py-24 bg-white overflow-hidden relative">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-teal-50/50 -skew-x-12 transform origin-top translate-x-16 hidden lg:block"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
        <div className="flex-1 space-y-8 reveal-left">
          <div className="inline-flex items-center gap-3 text-xs font-black text-teal-600 uppercase tracking-[0.3em] bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
            <Hammer size={14} /> Lebih Dari Sekadar Furniture
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Afandi Interior: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
              Seni Desain
            </span>{" "}
            & <br className="hidden md:block" />
            <span className="text-slate-800 italic font-playfair">
              Keahlian Presisi
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed font-normal max-w-xl">
            <TypingText
              text={cmsData.description}
              speed={30}
              delay={500}
              startOnVisible
            />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="reveal-left reveal-delay-200 flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-colors">
              <div className="p-3 rounded-xl bg-white shadow-sm text-teal-600 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">
                  Garansi Kualitas
                </h4>
                <p className="text-xs text-slate-400">
                  Material grade-A pilihan
                </p>
              </div>
            </div>
            <div className="reveal-left reveal-delay-300 flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-colors">
              <div className="p-3 rounded-xl bg-white shadow-sm text-teal-600 group-hover:scale-110 transition-transform">
                <Ruler size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">
                  Presisi Milimeter
                </h4>
                <p className="text-xs text-slate-400">
                  Hasil akurat 100% custom
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative w-full reveal-right">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
            <img
              src={
                cmsData.img ||
                "https://images.unsplash.com/photo-1540932239986-30128078f3d5?q=80&w=1200&auto=format&fit=crop"
              }
              className="w-full aspect-[4/5] md:aspect-auto md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Tim Workshop Afandi Interior"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
          </div>

          {/* Floating Experience Badge with Glassmorphism */}
          <div className="absolute -bottom-6 -left-4 md:-bottom-12 md:-left-12 bg-white/90 backdrop-blur-md p-5 md:p-8 rounded-[2rem] shadow-2xl border border-white/50 z-20 animate-float max-w-[280px] md:max-w-none">
            <div className="flex items-center gap-5 md:gap-6">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex flex-col items-center justify-center shadow-lg shadow-teal-500/30">
                <span className="font-black text-2xl md:text-3xl leading-none">
                  {cmsData.badgeValue || "5+"}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">
                  Years
                </span>
              </div>
              <div className="pr-4 md:pr-8 border-r border-slate-100">
                <h5 className="font-black text-lg md:text-2xl text-slate-900 leading-tight mb-1">
                  {cmsData.badgeTitle || "Tahun Pengalaman"}
                </h5>
                <p className="text-teal-600 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em]">
                  {cmsData.badgeSub || "Workshop Produksi Sendiri"}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative element behind the image */}
          <div className="absolute top-12 left-12 right-[-24px] bottom-[-24px] border-2 border-teal-100 rounded-3xl -z-0 hidden md:block"></div>
        </div>
      </div>
    </section>
  );
}

export function Services({ cmsData }: SectionProps) {
  const defaultServices = [
    {
      icon: <LayoutDashboard size={40} className="text-indigo-600" />,
      title: "Desain Interior Custom",
      desc: "Solusi perancangan tata ruang, mulai dari apartemen kecil hingga rumah mewah dengan arsitek in-house.",
    },
    {
      icon: <Utensils size={40} className="text-indigo-600" />,
      title: "Pembuatan Kitchen Set",
      desc: "Dapur estetik dan fungsional (L-shape, U-shape, dll) dengan perhitungan ergonomi presisi dan aksesoris rak cerdas.",
    },
    {
      icon: <Sofa size={40} className="text-indigo-600" />,
      title: "Furniture Custom",
      desc: "Wardrobe lemari pakaian, rak TV, meja kerja cerdas yang didesain khusus menyesuaikan luas ruangan Anda.",
    },
    {
      icon: <Hammer size={40} className="text-indigo-600" />,
      title: "Renovasi Interior Lengkap",
      desc: "Dari perubahan partisi drywall, plafon, elektrikal hingga instalasi akhir furniture oleh tim ahli.",
    },
  ];

  const services =
    Array.isArray(cmsData) && cmsData.length > 0
      ? cmsData.map((d: any, i: number) => ({
          ...d,
          icon: defaultServices[i] ? (
            defaultServices[i].icon
          ) : (
            <Sofa size={40} className="text-indigo-600" />
          ),
        }))
      : defaultServices;

  return (
    <section
      id="layanan"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      {/* Soft decorative circles */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] aspect-square bg-teal-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square bg-indigo-500/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4 reveal">
          <div className="text-xs font-black text-teal-600 uppercase tracking-[0.4em] bg-white inline-block px-4 py-2 rounded-full border border-teal-100 shadow-sm">
            Layanan Afandi Interior
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Spesialisasi Kami dalam <br />
            <span className="italic font-playfair text-teal-600 font-normal">
              Membangun Kenyamanan
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s: any, i: number) => (
            <div
              key={i}
              className={`bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:border-teal-100 transition-all group flex flex-col h-full transform hover:-translate-y-3 duration-500 relative overflow-hidden reveal reveal-delay-${(i + 1) * 100}`}
            >
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-teal-50 transition-colors shadow-inner relative">
                <div className="absolute inset-0 bg-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 scale-110 transition-all duration-500"></div>
                <div className="relative z-10 text-teal-600 group-hover:scale-110 transition-transform duration-500">
                  {s.icon}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-teal-700 transition-colors">
                {s.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-normal text-sm flex-1 group-hover:text-slate-600 transition-colors">
                {s.desc}
              </p>

              <div className="mt-10 overflow-hidden">
                <a
                  href={`https://wa.me/${cmsData?.phone?.replace(/[^0-9]/g, "") || ""}?text=Halo Afandi Interior, saya ingin bertanya tentang ${s.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-black text-teal-600 group-hover:text-teal-700 uppercase tracking-[0.2em] relative"
                >
                  <span className="relative z-10 mr-2">Pelajari</span>
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
