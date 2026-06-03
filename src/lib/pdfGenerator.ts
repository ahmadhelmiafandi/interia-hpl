import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- BRAND COLORS ---
const colorGold: [number, number, number] = [176, 141, 87]; // #b08d57
const colorEspresso: [number, number, number] = [74, 66, 62]; // #4a423e

// --- Types ---
interface RoomConfig {
  width: number;
  length: number;
  height: number;
  shape?: string;
}

interface ProductSelection {
  productId: string;
  shape?: string;
  name?: string;
}

interface DesignConfig {
  model: string;
  materialId: string;
  accessories: string[];
}

interface FixtureItem {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface Config2D {
  room: RoomConfig;
  productSelection: ProductSelection;
  design: DesignConfig;
  fixtures: FixtureItem[];
}

interface Product {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface Material {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface Accessory {
  id: string;
  name: string;
  price: number;
  [key: string]: unknown;
}

interface Metadata2D {
  products: Product[];
  materials: Material[];
  accessories: Accessory[];
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
}

interface QuotationPDFParams {
  config: Config2D;
  metadata: Metadata2D;
  estimatedPrice: number;
  customer?: CustomerInfo;
}

interface BOMItemMaterial {
  part: string;
  name: string;
  brand: string;
}

interface BOMItemDimensions {
  width: number;
  depth: number;
  height: number;
}

interface BOMItem {
  name: string;
  dimensions: BOMItemDimensions;
  materials: BOMItemMaterial[];
  subtotal: number;
}

interface BOMData {
  items: BOMItem[];
  total: number;
}

interface Quotation3DPDFParams {
  bom: BOMData;
  customer?: CustomerInfo;
}

export async function generateQuotationPDF({ config, metadata, estimatedPrice, customer }: QuotationPDFParams): Promise<void> {
    const doc = new jsPDF();
    const { room, productSelection, design, fixtures } = config;
    const { products, materials, accessories } = metadata;

    const product = products.find(p => p.id === productSelection.productId);
    const material = materials.find(m => m.id === design.materialId);
    const accs = accessories.filter(a => design.accessories.includes(a.id));

    // --- HEADER ---
    doc.setFillColor(...colorEspresso);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AFANDI INTERIOR', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Custom Modern Furniture & Interior Specialist', 20, 32);

    // Date & ID
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Quotation No: AFN-${Date.now().toString().slice(-6)}`, 150, 20);
    doc.text(`Tanggal: ${dateStr}`, 150, 25);

    // --- CUSTOMER INFO ---
    doc.setTextColor(...colorEspresso);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PELANGGAN', 20, 55);

    autoTable(doc, {
        startY: 60,
        margin: { left: 20 },
        theme: 'plain',
        body: [
            ['Nama Lengkap', customer?.name || '-'],
            ['Nomor WhatsApp', customer?.phone || '-'],
            ['Alamat Lokasi', customer?.address || '-'],
        ],
        bodyStyles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // --- CONFIGURATION DETAILS ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RINCIAN PESANAN', 20, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: colorGold, textColor: 255, fontStyle: 'bold' },
        head: [['Kategori', 'Detail Spesifikasi']],
        body: [
            ['Produk Utama', `${product?.name || '-'} (${productSelection.shape})`],
            ['Gaya Desain', design.model],
            ['Material Utama', material?.name || '-'],
            ['Ukuran Ruangan', `${room.length}cm x ${room.width}cm x ${room.height}cm`],
            ['Bentuk Ruangan', room.shape || '-'],
            ['Pintu & Jendela', `${fixtures.length} item ditemukan`],
        ],
        styles: { fontSize: 10, cellPadding: 5 }
    });

    // --- ADD-ONS / ACCESSORIES ---
    if (accs.length > 0) {
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            margin: { left: 20, right: 20 },
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            head: [['Aksesori Tambahan', 'Biaya']],
            body: accs.map(a => [a.name, `Rp ${a.price.toLocaleString('id-ID')}`]),
            styles: { fontSize: 9, cellPadding: 4 }
        });
    }

    // --- SUMMARY & PRICE ---
    const finalY: number = (doc as any).lastAutoTable.finalY + 15;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(20, finalY, 170, 30, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(20, finalY, 170, 30, 'S');

    doc.setTextColor(...colorEspresso);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL ESTIMASI BIAYA:', 30, finalY + 13);

    doc.setTextColor(...colorGold);
    doc.setFontSize(18);
    doc.text(`Rp ${estimatedPrice.toLocaleString('id-ID')}`, 30, finalY + 23);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('*Estimasi harga ini belum termasuk diskon promo (jika ada).', 30, finalY + 38);
    doc.text('*Harga final akan ditentukan setelah survey lokasi dan pengecekan material.', 30, finalY + 43);

    // --- FOOTER ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Afandi Interior - Workshop: Dermayu, Bumiharjo, Kec. Keling, Jepara, Jawa Tengah 59454', 105, 285, { align: 'center' });
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
    }

    // --- SAVE FILE ---
    doc.save(`Afandi-Interior-Quotation-${customer?.name?.replace(/\s+/g, '-') || 'Draft'}.pdf`);
}

/**
 * generate3DQuotationPDF — Export Quotation PDF dari 3D Configurator
 */
export async function generate3DQuotationPDF({ bom, customer }: Quotation3DPDFParams): Promise<void> {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const quoteNo = `AFN-3D-${Date.now().toString().slice(-6)}`;

    // --- HEADER ---
    doc.setFillColor(...colorEspresso);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AFANDI INTERIOR 3D', 20, 23);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Quotation Desain Interior 3D Interaktif', 20, 31);

    // Quote details
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Quotation No: ${quoteNo}`, 145, 18);
    doc.text(`Tanggal: ${dateStr}`, 145, 24);
    doc.text(`Tipe Konfigurasi: Kustom 3D`, 145, 30);

    // --- CUSTOMER INFO ---
    doc.setTextColor(...colorEspresso);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PELANGGAN', 20, 56);

    autoTable(doc, {
        startY: 60,
        margin: { left: 20 },
        theme: 'plain',
        body: [
            ['Nama Pelanggan', customer?.name || '-'],
            ['WhatsApp', customer?.phone || '-'],
            ['Alamat Survey', customer?.address || '-'],
        ],
        bodyStyles: { fontSize: 10, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: colorEspresso } }
    });

    // --- BILL OF MATERIALS TABLE ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DAFTAR FURNITUR & BILL OF MATERIALS (BOM) 3D', 20, (doc as any).lastAutoTable.finalY + 14);

    const tableRows = bom.items.map((item, index) => {
      const matStr = item.materials.map(m => 
        `- ${m.part}: ${m.name} (${m.brand})`
      ).join('\n');
      
      const dims = `${item.dimensions.width}x${item.dimensions.depth}x${item.dimensions.height} cm`;

      return [
        index + 1,
        item.name,
        dims,
        matStr || 'Default Material',
        `Rp ${item.subtotal.toLocaleString('id-ID')}`
      ];
    });

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 19,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: colorGold, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        head: [['No', 'Modul Furnitur', 'Dimensi (cm)', 'Spesifikasi Material / HPL', 'Subtotal']],
        body: tableRows,
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 40, fontStyle: 'bold' },
            2: { cellWidth: 35 },
            3: { cellWidth: 55, fontSize: 8.5 },
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: colorEspresso }
        },
        styles: { fontSize: 9.5, cellPadding: 4, valign: 'middle' }
    });

    // --- PRICING SUMMARY ---
    const finalY: number = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if total summary fits on this page
    let currentY = finalY;
    if (currentY > 230) {
      doc.addPage();
      currentY = 30;
    }

    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(20, currentY, 170, 32, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(20, currentY, 170, 32, 'S');

    doc.setTextColor(...colorEspresso);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL ESTIMASI HARGA PRODUKSI (3D):', 28, currentY + 12);

    doc.setTextColor(...colorGold);
    doc.setFontSize(19);
    doc.text(`Rp ${bom.total.toLocaleString('id-ID')}`, 28, currentY + 23);

    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8.5);
    doc.text('*Harga di atas mencakup pembuatan plywood kabinet, finishing HPL Taco/Aica, hinges soft-close, pengiriman, & instalasi.', 20, currentY + 42);
    doc.text('*Harga final akan disesuaikan setelah tim Afandi Interior melakukan survey pengukuran langsung ke lokasi Anda.', 20, currentY + 47);

    // --- FOOTER ON ALL PAGES ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Afandi Interior - Workshop: Dermayu, Bumiharjo, Kec. Keling, Jepara, Jawa Tengah 59454', 105, 285, { align: 'center' });
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
    }

    // --- SAVE ---
    doc.save(`Afandi-Interior-3D-Quotation-${customer?.name?.replace(/\s+/g, '-') || 'Draft'}.pdf`);
}
