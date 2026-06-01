/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
  id: string;
  name: string;
  shapes: string[];
  basePrice: number;
  active: boolean;
}

export interface Material {
  id: string;
  name: string;
  priceModifier: number;
  type: string;
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface Settings {
  [key: string]: any;
  hero: {
    title: string;
    subtitle: string;
  };
  about: {
    description: string;
    badgeValue: string;
    badgeTitle: string;
    badgeSub: string;
    img: string;
  };
  contact: {
    [key: string]: any;
    phone: string;
    email: string;
    mapUrl: string;
  };
  faqs: Array<{ q: string; a: string }>;
  testimonials: Array<{ text: string; name: string; loc: string }>;
  team: Array<{ name: string; role: string; img: string }>;
  services: Array<{ title: string; desc: string }>;
  howItWorks: Array<{ title: string; desc: string }>;
  portfolio: Array<{ img: string; title: string }>;
  products: Array<{ title: string; img: string; features: string }>;
  tech: {
    title: string;
    desc: string;
  };
  articles: Array<{ title: string; date: string; img: string; desc: string; content?: string }>;
}

export interface WebsiteData {
  products: Product[];
  materials: Material[];
  accessories: Accessory[];
  settings: Settings;
}

const defaultData: WebsiteData = {
    products: [
        { id: '1', name: 'Kitchen Set', shapes: ['Lurus', 'L-shape', 'U-shape'], basePrice: 2000000, active: true },
        { id: '2', name: 'Lemari Pakaian', shapes: ['Lurus', 'L-shape'], basePrice: 1800000, active: true },
        { id: '3', name: 'Meja Kerja', shapes: ['Lurus', 'L-shape'], basePrice: 1200000, active: true },
        { id: '4', name: 'Rak TV', shapes: ['Lurus'], basePrice: 1500000, active: true }
    ],
    materials: [
        { id: '1', name: 'Multiplek + HPL', priceModifier: 1.0, type: 'core' },
        { id: '2', name: 'PVC', priceModifier: 1.2, type: 'core' },
        { id: '3', name: 'Kayu Solid', priceModifier: 2.0, type: 'core' }
    ],
    accessories: [
        { id: '1', name: 'Engsel Soft Closing', price: 150000, type: 'hardware' },
        { id: '2', name: 'Lampu LED Strip', price: 250000, type: 'lighting' },
        { id: '3', name: 'Rak Piring Tarik', price: 450000, type: 'rack' }
    ],
    settings: {
        hero: {
            title: "Estetika Modern,\nPresisi Sempurna.",
            subtitle: "Wujudkan ruangan impian Anda dengan Afandi Interior. Teknologi Configurator Cerdas kami membantu Anda merancang, mengestimasi harga, hingga memesan produksi ke workshop kami tanpa ribet."
        },
        about: {
            description: "Workshop Afandi Interior tidak hanya mendesain; kami adalah eksekutor ahli dengan jam terbang ribuan jam di belakang mesin-mesin kayu. Spesialisasi kami adalah perpaduan antara gaya modern dengan kekuatan material yang tahan lama (Multiplek/Blockboard grade A).",
            badgeValue: '5+',
            badgeTitle: 'Tahun Pengalaman',
            badgeSub: 'Workshop Produksi Sendiri',
            img: 'https://images.unsplash.com/photo-1540932239986-30128078f3d5?q=80&w=1200&auto=format&fit=crop'
        },
        contact: {
            phone: "+62 812 3456 7890",
            email: "hello@afandi-interior.com",
            mapUrl: ""
        },
        faqs: [
            { q: 'Apakah harga di Configurator sudah termasuk pemasangan?', a: 'Ya, harga yang muncul di estimator sudah mencakup material, pengerjaan di workshop, dan jasa instalasi perakitan di rumah Anda.' },
            { q: 'Berapa lama proses pembuatan Kitchen Set?', a: 'Setelah Desain & Survey final, waktu pengerjaan di workshop kami rata-rata memakan waktu 2 hingga 3 minggu tergantung tingkat kesulitan dan aksesoris yang dipilih.' },
            { q: 'Saya punya gambar desain 3D sendiri, bisakah diproduksi?', a: 'Tentu bisa! Silakan upload gambar referensi Anda di tahapan konfigurator, dan tim kami akan menghubungi untuk penyesuaian detail bahan.' },
            { q: 'Apakah Afandi Interior melayani luar kota?', a: 'Saat ini workshop kami melayani area Jabodetabek. Untuk di luar kota, silakan hubungi WhatsApp kami untuk negosiasi biaya transport tim instalasi.' }
        ],
        testimonials: [
            { text: "Sangat terbantu dengan aplikasinya! Saya bisa coba-coba desain lemari dan langsung lihat harganya tanpa harus bolak-balik nanya admin.", name: "Rudi Hartono", loc: "Jakarta Selatan" },
            { text: "Hasil kitchen set untuk L-shape saya rapi banget. Tim workshop datang tepat waktu untuk survey ukuran ulang, memastikan semuanya presisi.", name: "Sinta Maharani", loc: "Tangerang" },
            { text: "Material HPL nya top tier. Ngga nyangka bisa dapet harga segini untuk kualitas setara high-end boutique interior. Teknologinya bener-bener motong biaya marketing mereka!", name: "Kevin Aprilio", loc: "Bekasi" }
        ],
        team: [
            { name: 'Aldo Pratama', role: 'Head of Architecture', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' },
            { name: 'Diana Risa', role: 'Interior Designer', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop' },
            { name: 'Bimo', role: 'Workshop Supervisor', img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop' }
        ],
        services: [
            { title: 'Desain Interior Custom', desc: 'Solusi perancangan tata ruang, mulai dari apartemen kecil hingga rumah mewah dengan arsitek in-house.' },
            { title: 'Pembuatan Kitchen Set', desc: 'Dapur estetik dan fungsional (L-shape, U-shape, dll) dengan perhitungan ergonomi presisi dan aksesoris rak cerdas.' },
            { title: 'Furniture Custom', desc: 'Wardrobe lemari pakaian, rak TV, meja kerja cerdas yang didesain khusus menyesuaikan luas ruangan Anda.' },
            { title: 'Renovasi Interior Lengkap', desc: 'Dari perubahan partisi drywall, plafon, elektrikal hingga instalasi akhir furniture oleh tim ahli.' }
        ],
        howItWorks: [
            { title: 'Online Configurator', desc: 'Pilih jenis perabot, masukkan ukuran dinding/ruangan secara instan, dan lihat harga estimasinya.' },
            { title: 'Survey Lokasi', desc: 'Tim ukur profesional Afandi Interior akan datang mensurvey ruang Anda untuk sinkronisasi layout.' },
            { title: 'Produksi Workshop', desc: 'Pengerjaan 1-3 minggu di fasilitas mandiri (workshop kami) dengan material custom.' },
            { title: 'Instalasi', desc: 'Pemasangan rapi dan cepat minimal debu. Ruangan baru Anda siap digunakan.' }
        ],
        portfolio: [
            { img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop', title: 'Modern Minimalist Kitchen' },
            { img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop', title: 'Cozy Living Area' },
            { img: 'https://images.unsplash.com/photo-1595522904535-ba2c628e93ad?q=80&w=800&auto=format&fit=crop', title: 'Master Bedroom Wardrobe' },
            { img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop', title: 'Open Space TV Setup' }
        ],
        products: [
            { title: 'Kitchen Set Minimalis', img: 'https://images.unsplash.com/photo-1556910103-1c02745a8289?q=80&w=800&auto=format&fit=crop', features: 'L-Shape / U-Shape, Anti-Rayap, Engsel Soft-close' },
            { title: 'Lemari Pakaian Wardrobe', img: 'https://images.unsplash.com/photo-1595526114101-23da160c87ad?q=80&w=800&auto=format&fit=crop', features: 'Full Plafon 3 Meter, Cermin Terintegrasi, LED Strip' },
            { title: 'Meja Kerja & Belajar', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bf?q=80&w=800&auto=format&fit=crop', features: 'Ruang Penyimpanan, Cable Management, Ergonomis' },
            { title: 'Kabinet Rak TV', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop', features: 'Floating Design, Hidden Storage, Back panel HPL' }
        ],
        tech: {
            title: "Desain Sendiri dengan Web Configurator Modern",
            desc: "Ucapkan selamat tinggal pada kesulitan menjelaskan ukuran atau model! Kami membangun alat Configurator visual yang memudahkan Anda."
        },
        articles: [
            { title: '5 Tips Memilih Material HPL', date: '12 Feb 2026', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop', desc: 'Pelajari karakter masing-masing pelapis kayu agar awet puluhan tahun...' },
            { title: 'Warna Interior Paling Dicari', date: '08 Feb 2026', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop', desc: 'Dari Sage Green hingga warna-warna earth tone yang menenangkan...' },
            { title: 'Perbedaan Multiplek vs Blockboard', date: '24 Jan 2026', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop', desc: 'Sebelum membuat lemari custom, kenali jenis kayu inti terbaik untuk budget Anda.' }
        ]
    }
};

const getWebsiteData = async (): Promise<WebsiteData> => {
    try {
        const { data, error } = await supabase
            .from('website_data')
            .select('content')
            .eq('id', 'primary_data')
            .maybeSingle();

        if (error) throw error;
        
        if (!data) {
            // Seed default data if not exists
            const { error: seedError } = await supabase
                .from('website_data')
                .insert([{ id: 'primary_data', content: defaultData }]);
            if (seedError) console.error('Seeding error:', seedError);
            return defaultData;
        }
        
        return data.content as WebsiteData;
    } catch (e) {
        console.error('Supabase fetch error, using local defaults:', e);
        return defaultData;
    }
};

export const api = {
    getProducts: async (): Promise<Product[]> => {
        const data = await getWebsiteData();
        return data.products;
    },
    updateProduct: async (id: string, productData: Partial<Product>): Promise<Product[]> => {
        const currentData = await getWebsiteData();
        const newProducts = currentData.products.map(p => 
            p.id === id ? { ...p, ...productData } : p
        );
        const newData = { ...currentData, products: newProducts };
        
        const { error } = await supabase
            .from('website_data')
            .update({ content: newData })
            .eq('id', 'primary_data');
        
        if (error) throw error;
        return newProducts;
    },
    addProduct: async (productData: Omit<Product, 'id' | 'active'>): Promise<Product[]> => {
        const currentData = await getWebsiteData();
        const newProduct: Product = { 
            id: Date.now().toString(), 
            active: true,
            ...productData 
        };
        const newProducts = [...currentData.products, newProduct];
        const newData = { ...currentData, products: newProducts };
        
        const { error } = await supabase
            .from('website_data')
            .update({ content: newData })
            .eq('id', 'primary_data');
        
        if (error) throw error;
        return newProducts;
    },
    getMaterials: async (): Promise<Material[]> => {
        const data = await getWebsiteData();
        return data.materials;
    },
    getAccessories: async (): Promise<Accessory[]> => {
        const data = await getWebsiteData();
        return data.accessories;
    },
    getOrders: async (): Promise<any[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Orders fetch error:', error);
            return [];
        }
        return data.map(item => ({ ...item.data, id: item.id, createdAt: item.created_at }));
    },
    submitOrder: async (orderData: any): Promise<any> => {
        const { data, error } = await supabase
            .from('orders')
            .insert([{ data: orderData }])
            .select()
            .single();
        
        if (error) throw error;
        return { ...data.data, id: data.id, createdAt: data.created_at };
    },
    updateOrderStatus: async (id: string, status: string): Promise<any> => {
        const { data: currentOrder, error: fetchError } = await supabase
            .from('orders')
            .select('data')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;

        const updatedData = { ...currentOrder.data, status };
        
        const { data, error } = await supabase
            .from('orders')
            .update({ data: updatedData })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return { ...data.data, id: data.id, createdAt: data.created_at };
    },
    getSettings: async (): Promise<Settings> => {
        const data = await getWebsiteData();
        return data.settings;
    },
    updateSettings: async (settingsData: Settings): Promise<Settings> => {
        const currentData = await getWebsiteData();
        const newData = { ...currentData, settings: settingsData };
        
        const { error } = await supabase
            .from('website_data')
            .update({ content: newData })
            .eq('id', 'primary_data');
        
        if (error) throw error;
        return newData.settings;
    },
    saveDesign: async (config: any, totalPrice: number): Promise<string> => {
        const { data, error } = await supabase
            .from('orders')
            .insert([{ data: { config, totalPrice, isDraft: true, status: 'Draft' } }])
            .select()
            .single();
        
        if (error) throw error;
        return data.id;
    },
    getDesign: async (id: string): Promise<any> => {
        const { data, error } = await supabase
            .from('orders')
            .select('data')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data.data;
    },
    uploadImage: async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('content')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('content')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
