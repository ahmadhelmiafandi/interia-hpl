import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
    cmsData?: Record<string, any>;
}

export default function Navbar({ cmsData }: NavbarProps) {
    const contactData = cmsData?.contact;
    const headerSettings = cmsData?.header;
    const siteSettings = cmsData?.site;
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Layanan', href: '#layanan' },
        { name: 'Portfolio', href: '#portfolio' },
        { name: 'Teknologi', href: '#teknologi' },
        { name: 'Tentang Kami', href: '#tentang' },
        { name: 'Kontak', href: '#kontak' },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (location.pathname !== '/') return;
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            const offsetTop = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: offsetTop - 80,
                behavior: 'smooth'
            });
            setMobileMenuOpen(false);
        }
    };

    const isHeaderSolid = isScrolled || mobileMenuOpen;
    const navTextColor = isHeaderSolid ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-200 hover:text-white';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHeaderSolid ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-[72px] h-[72px] flex items-center justify-center overflow-hidden">
                        {siteSettings?.logo ? (
                            <img src={siteSettings.logo} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                            <img src={isHeaderSolid ? "/brand/logo-icon-dark.png" : "/brand/logo-icon-light.png"} alt="Logo Default" className="w-full h-full object-contain drop-shadow-md" />
                        )}
                    </div>
                    <div className="flex flex-col items-start ml-0 mt-1">
                        <span className={`font-playfair text-[28px] font-bold leading-[0.85] transition-colors duration-300 uppercase ${isHeaderSolid ? 'text-[#b08d57]' : 'text-white'}`}>
                            {siteSettings?.name?.split(' ')[0] || 'Afandi'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                             <span className={`font-cinzel text-[10px] tracking-[0.34em] font-bold pl-0.5 transition-colors duration-300 uppercase ${isHeaderSolid ? 'text-[#4a423e]' : 'text-slate-300'}`}>
                                {siteSettings?.name?.split(' ').slice(1).join(' ') || 'INTERIOR'}
                             </span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`relative text-sm font-medium transition-colors group ${navTextColor}`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${isHeaderSolid ? 'bg-[#b08d57]' : 'bg-white'}`}></span>
                        </a>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center">
                    <Link
                        to={headerSettings?.buttonLink || "/configurator"}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg 
                            active:scale-95 active:shadow-inner
                            ${isHeaderSolid 
                                ? 'bg-[#b08d57] text-white hover:bg-[#8e7246] shadow-[#b08d57]/30' 
                                : 'bg-white text-slate-900 hover:bg-[#f8f5f0] hover:text-[#8e7246] shadow-white/20'
                            }
                        `}
                    >
                        {headerSettings?.buttonLabel || 'Mulai Desain'} <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Mobile menu toggle */}
                <button
                    className={`md:hidden p-2 rounded-lg transition-colors ${isHeaderSolid ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X size={28} className={isHeaderSolid ? 'text-slate-900' : 'text-white'} />
                    ) : (
                        <Menu size={28} className={isHeaderSolid ? 'text-slate-900' : 'text-white'} />
                    )}
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 flex flex-col p-6 space-y-4 animate-fade-in">
                    {navLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="text-slate-700 font-medium text-lg py-2 border-b border-slate-50 hover:text-[#b08d57] transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        to="/configurator"
                        className="flex items-center justify-center gap-2 w-full py-4 mt-4 bg-[#b08d57] text-white rounded-xl font-bold shadow-md shadow-[#b08d57]/20 active:scale-[0.98] transition-all"
                    >
                        Mulai Desain Sekarang <ArrowRight size={20} />
                    </Link>
                    {contactData?.phone && (
                        <a 
                            href={`https://wa.me/${contactData.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold"
                        >
                            Hubungi WhatsApp
                        </a>
                    )}
                </div>
            )}
        </header>
    );
}
