import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
    cmsData?: Record<string, any>;
}

export default function Footer({ cmsData }: FooterProps) {
    const contactData = cmsData?.contact;
    const footerSettings = cmsData?.cmsData || cmsData?.footer; // Handle both direct pass and nested
    const settings = cmsData; // Easier access
    const phone = contactData?.phone || '+62 812-3456-7890';
    const email = contactData?.email || 'hello@afandi-interior.com';
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                {/* Brand */}
                <div className="space-y-6">
                    <Link to="/" className="flex items-center gap-4 group inline-flex mb-4">
                        <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                            {settings?.site?.logo ? (
                                <img src={settings.site.logo} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                                <img src="/brand/logo-icon-light.png" alt="Logo Default" className="w-full h-full object-contain drop-shadow-md" />
                            )}
                        </div>
                        <div className="flex flex-col items-start ml-0 mt-1">
                            <span className="font-playfair text-[32px] font-bold leading-[0.85] text-white uppercase">
                                {settings?.site?.name?.split(' ')[0] || 'Afandi'}
                            </span>
                            <span className="font-cinzel text-[11px] mt-2 tracking-[0.34em] font-bold pl-0.5 text-slate-400 uppercase">
                                {settings?.site?.name?.split(' ').slice(1).join(' ') || 'INTERIOR'}
                            </span>
                        </div>
                    </Link>
                    <p className="text-sm leading-relaxed text-slate-400">
                        {settings?.footer?.description || 'Afandi Interior: Spesialis desain dan produksi interior premium. Kami memadukan estetika mewah dengan teknologi configurator untuk mewujudkan ruang impian Anda secara nyata dan presisi.'}
                    </p>
                    <div className="flex gap-4">
                        {contactData?.instagram && (
                            <a href={contactData.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md">
                                <Instagram size={18} />
                            </a>
                        )}
                        {contactData?.facebook && (
                            <a href={contactData.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md">
                                <Facebook size={18} />
                            </a>
                        )}
                        {contactData?.tiktok && (
                            <a href={contactData.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-md group">
                                <svg 
                                    className="w-[18px] h-[18px] fill-current text-slate-300 group-hover:text-white transition-colors" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.25-.8 4.54-2.19 6.27-1.55 1.94-3.8 3.09-6.22 3.33-2.42.23-4.88-.34-6.84-1.74-2.02-1.42-3.32-3.69-3.63-6.13-.3-2.46.3-5.01 1.69-7.06 1.4-2.06 3.63-3.4 6.08-3.72 1.13-.15 2.28-.15 3.41-.01v3.98c-.76-.11-1.55-.13-2.31-.02-1.22.18-2.37.83-3.13 1.83-.75.98-1.07 2.24-.92 3.48.15 1.25.79 2.39 1.77 3.16.97.77 2.22 1.09 3.45.92 1.23-.17 2.36-.8 3.12-1.8.76-.99 1.08-2.25.92-3.49-.03-3.46-.01-6.91-.01-10.37z"/>
                                </svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-white font-semibold mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
                        Layanan
                    </h4>
                    <ul className="space-y-3">
                        <li><a href="#layanan" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Desain Interior Custom</a></li>
                        <li><a href="#layanan" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Produksi Kitchen Set</a></li>
                        <li><a href="#layanan" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Furniture Custom</a></li>
                        <li><a href="#layanan" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Renovasi Ruangan</a></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-semibold mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
                        Perusahaan
                    </h4>
                    <ul className="space-y-3">
                        <li><a href="#tentang" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Tentang Kami</a></li>
                        <li><a href="#portfolio" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Portfolio</a></li>
                        <li><a href="#teknologi" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Teknologi Afandi</a></li>
                        <li><a href="#faq" className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> FAQ</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div id="kontak">
                    <h4 className="text-white font-semibold mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
                        Kontak Kami
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm items-start">
                            <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{settings?.footer?.address || 'GRGQ+X39, Dermayu, Bumiharjo, Kec. Keling, Kabupaten Jepara, Jawa Tengah 59454'}</span>
                        </li>
                        <li className="flex gap-3 text-sm items-center">
                            <Phone size={18} className="text-indigo-400 shrink-0" />
                            <span>{phone}</span>
                        </li>
                        <li className="flex gap-3 text-sm items-center">
                            <Mail size={18} className="text-indigo-400 shrink-0" />
                            <span>{email}</span>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} {settings?.footer?.copyright || settings?.site?.name || 'Afandi Interior'}. All rights reserved.
                </p>
                <div className="flex gap-6 text-xs text-slate-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
