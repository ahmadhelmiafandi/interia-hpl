import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MoveRight, ChevronDown } from "lucide-react";
import TypingText from "../../../components/ui/TypingText";

interface HeroProps {
  cmsData?: Record<string, any>;
}

export default function Hero({ cmsData }: HeroProps) {
  if (!cmsData) return null;

  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-20 lg:pt-32 justify-center bg-slate-900 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 text-white flex justify-center items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
          alt="Modern Interior Design"
          className="min-w-full min-h-full object-cover opacity-30 object-center scale-105 animate-[slow-scale_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900/90 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-2xl text-left space-y-8 flex-1 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-black text-teal-300 uppercase tracking-[0.3em] drop-shadow-sm">
              Interior Design & Custom Furniture
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] whitespace-pre-line">
            {cmsData.title.split("\n").map((line: string, i: number) => (
              <React.Fragment key={i}>
                {i === 0 ? (
                  line
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                    {line}
                  </span>
                )}
                {i < cmsData.title.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light max-w-xl">
            <TypingText text={cmsData.subtitle} speed={30} delay={500} />
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Link
              to="/configurator"
              className="relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-teal-600 text-white rounded-2xl font-black transition-all shadow-[0_20px_50px_rgba(176,141,87,0.3)] hover:shadow-[0_25px_60px_rgba(176,141,87,0.5)] transform hover:-translate-y-1.5 active:scale-95 text-lg group overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shine_2s_ease-out]"></span>
              <span className="relative z-10 flex items-center gap-2">
                Mulai Desain Sekarang
                <MoveRight
                  size={22}
                  className="group-hover:translate-x-1.5 transition-transform"
                />
              </span>
            </Link>
            <a
              href="#portfolio"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-2xl font-black transition-all hover:-translate-y-1.5 active:scale-95 text-lg"
            >
              Lihat Portfolio
            </a>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg hidden lg:block perspective-1000 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"></div>
          <div className="relative transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
              className="rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-white/10"
              alt="Preview App"
            />

            {/* Floating UI Elements matching Configurator theme */}
            <div className="absolute -left-12 top-10 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl animate-float">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                Estimasi Realtime
              </div>
              <div className="text-xl text-slate-800 font-extrabold text-indigo-700">
                Rp 12.500.000
              </div>
            </div>
            <div
              className="absolute -right-8 bottom-20 bg-slate-900/95 border border-slate-700 backdrop-blur-md p-4 rounded-xl shadow-2xl animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">
                    Bentuk Dapur
                  </div>
                  <div className="text-sm font-bold text-white">
                    L-Shape Custom
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#tentang"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}
