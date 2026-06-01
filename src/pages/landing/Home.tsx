import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { api } from '../../lib/api';

// Impor semua section
import Hero from './sections/Hero';
import { About, Services } from './sections/AboutServices';
import { Products, Technology } from './sections/ProductsTech';
import { HowItWorks, Portfolio } from './sections/ProcessPortfolio';
import { Team, Testimonials, FAQ } from './sections/MoreInfo';
import { Blog, Contact } from './sections/BlogContact';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function Home() {
    const [settings, setSettings] = useState<Record<string, any> | null>(null);
    useScrollReveal();

    // Gulir ke atas saat halaman dimuat
    useEffect(() => {
        window.scrollTo(0, 0);
        api.getSettings().then(setSettings);
    }, []);

    if (!settings) return null; // Or a subtle loading screen

    return (
        <div className="min-h-screen font-sans bg-slate-50 text-slate-800 selection:bg-indigo-500/30">
            <Navbar cmsData={settings} />

            <main>
                <Hero cmsData={settings.hero} />
                <About cmsData={settings.about} />
                <Services cmsData={settings.services} />
                <Products cmsData={settings.products} />
                <HowItWorks cmsData={settings.howItWorks} />
                <Portfolio cmsData={settings.portfolio} />
                <Technology cmsData={settings.tech} />
                <Team cmsData={settings.team} />
                <Testimonials cmsData={settings.testimonials} />
                <FAQ cmsData={settings.faqs} />
                <Blog cmsData={settings.articles} contactData={settings.contact} />
                <Contact cmsData={settings.contact} />
            </main>

            <Footer cmsData={settings} />
        </div>
    );
}
