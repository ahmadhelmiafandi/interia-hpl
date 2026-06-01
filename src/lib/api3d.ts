/**
 * api3d.ts — Supabase API layer untuk Konfigurator 3D
 * 
 * Menyediakan CRUD operations untuk:
 * - items_3d (katalog furnitur 3D)
 * - materials (katalog HPL textures)
 * - user_designs (blueprint desain user)
 * - File uploads ke Supabase Storage
 * 
 * @module api3d
 */

import { supabase } from './api';

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  default_width: number;
  default_height: number;
  default_depth: number;
  min_width: number;
  max_width: number;
  scalable_axis: string[];
  glb_url: string;
  thumbnail_url: string;
  base_price: number;
  price_unit: 'per_piece' | 'per_meter';
  mesh_parts: Record<string, string>;
  tags: string[];
  sort_order: number;
  is_active: boolean;
}

export interface Material3D {
  id: string;
  slug: string;
  name: string;
  brand: string;
  code: string;
  texture_url: string;
  normal_map_url: string;
  roughness: number;
  metalness: number;
  texture_repeat_x: number;
  texture_repeat_y: number;
  color_hex: string;
  price_modifier: number;
  price_per_sheet: number;
  category: 'wood' | 'solid' | 'stone' | string;
  finish: 'matte' | 'glossy' | 'textured' | string;
  applicable_parts: string[];
  is_active: boolean;
  sort_order: number;
}

// ─────────────────────────────────────────────────────────
// FALLBACK DATA (digunakan saat tabel Supabase belum ada)
// ─────────────────────────────────────────────────────────

const fallbackItems3D: CatalogItem[] = [
  {
    id: 'item-base-cabinet-60',
    slug: 'kitchen-base-cabinet-60',
    name: 'Base Cabinet 60cm',
    category: 'kitchen',
    description: 'Kabinet bawah standar Kitchen Set lebar 60cm',
    default_width: 60,
    default_height: 72,
    default_depth: 55,
    min_width: 30,
    max_width: 120,
    scalable_axis: ['x'],
    glb_url: '',
    thumbnail_url: '',
    base_price: 1200000,
    price_unit: 'per_piece',
    mesh_parts: { body: 'Cabinet_Body', door: 'Cabinet_Door' },
    tags: ['kitchen', 'base'],
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'item-wall-cabinet-60',
    slug: 'kitchen-wall-cabinet-60',
    name: 'Wall Cabinet 60cm',
    category: 'kitchen',
    description: 'Kabinet atas (gantung) Kitchen Set lebar 60cm',
    default_width: 60,
    default_height: 40,
    default_depth: 35,
    min_width: 30,
    max_width: 120,
    scalable_axis: ['x'],
    glb_url: '',
    thumbnail_url: '',
    base_price: 900000,
    price_unit: 'per_piece',
    mesh_parts: { body: 'Cabinet_Body', door: 'Cabinet_Door' },
    tags: ['kitchen', 'wall'],
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'item-countertop-60',
    slug: 'kitchen-countertop-60',
    name: 'Countertop 60cm',
    category: 'kitchen',
    description: 'Meja countertop Kitchen Set per 60cm',
    default_width: 60,
    default_height: 4,
    default_depth: 60,
    min_width: 30,
    max_width: 300,
    scalable_axis: ['x', 'z'],
    glb_url: '',
    thumbnail_url: '',
    base_price: 800000,
    price_unit: 'per_meter',
    mesh_parts: { countertop: 'Countertop_Surface' },
    tags: ['kitchen', 'countertop'],
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'item-wardrobe-2door',
    slug: 'wardrobe-2-door',
    name: 'Lemari Pakaian 2 Pintu',
    category: 'wardrobe',
    description: 'Lemari pakaian 2 pintu tinggi full plafon',
    default_width: 100,
    default_height: 240,
    default_depth: 60,
    min_width: 80,
    max_width: 200,
    scalable_axis: ['x'],
    glb_url: '',
    thumbnail_url: '',
    base_price: 3500000,
    price_unit: 'per_piece',
    mesh_parts: { body: 'Wardrobe_Body', door: 'Wardrobe_Door', side_panel: 'Wardrobe_Side' },
    tags: ['wardrobe'],
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'item-tv-rack-floating',
    slug: 'tv-rack-floating',
    name: 'Rak TV Floating 120cm',
    category: 'tv-rack',
    description: 'Rak TV floating design minimalis',
    default_width: 120,
    default_height: 40,
    default_depth: 35,
    min_width: 80,
    max_width: 240,
    scalable_axis: ['x'],
    glb_url: '',
    thumbnail_url: '',
    base_price: 2000000,
    price_unit: 'per_meter',
    mesh_parts: { body: 'TVRack_Body', door: 'TVRack_Door' },
    tags: ['tv-rack'],
    sort_order: 5,
    is_active: true,
  },
];

const fallbackMaterials: Material3D[] = [
  {
    id: 'mat-hpl-natural-oak',
    slug: 'hpl-natural-oak-FW368',
    name: 'FW368 Natural Oak',
    brand: 'Taco HPL',
    code: 'FW368',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.7,
    metalness: 0.0,
    texture_repeat_x: 2.0,
    texture_repeat_y: 2.0,
    color_hex: '#c4a06a',
    price_modifier: 1.0,
    price_per_sheet: 350000,
    category: 'wood',
    finish: 'matte',
    applicable_parts: ['body', 'door', 'countertop', 'side_panel'],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'mat-hpl-dark-walnut',
    slug: 'hpl-dark-walnut-FW232',
    name: 'FW232 Dark Walnut',
    brand: 'Taco HPL',
    code: 'FW232',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.65,
    metalness: 0.0,
    texture_repeat_x: 2.0,
    texture_repeat_y: 2.0,
    color_hex: '#5c3d2e',
    price_modifier: 1.15,
    price_per_sheet: 380000,
    category: 'wood',
    finish: 'matte',
    applicable_parts: ['body', 'door', 'side_panel'],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'mat-hpl-white-glossy',
    slug: 'hpl-super-white-S001',
    name: 'S001 Super White',
    brand: 'Aica',
    code: 'S001',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.2,
    metalness: 0.1,
    texture_repeat_x: 1.0,
    texture_repeat_y: 1.0,
    color_hex: '#f5f5f5',
    price_modifier: 1.0,
    price_per_sheet: 320000,
    category: 'solid',
    finish: 'glossy',
    applicable_parts: ['body', 'door', 'countertop', 'side_panel'],
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'mat-hpl-sage-green',
    slug: 'hpl-sage-green-S045',
    name: 'S045 Sage Green',
    brand: 'Taco HPL',
    code: 'S045',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.5,
    metalness: 0.05,
    texture_repeat_x: 1.0,
    texture_repeat_y: 1.0,
    color_hex: '#9caf88',
    price_modifier: 1.1,
    price_per_sheet: 360000,
    category: 'solid',
    finish: 'matte',
    applicable_parts: ['body', 'door'],
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'mat-hpl-marble-carrara',
    slug: 'hpl-marble-carrara-ST880',
    name: 'ST880 Carrara Marble',
    brand: 'Aica',
    code: 'ST880',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.3,
    metalness: 0.15,
    texture_repeat_x: 1.5,
    texture_repeat_y: 1.5,
    color_hex: '#e8e4df',
    price_modifier: 1.3,
    price_per_sheet: 450000,
    category: 'stone',
    finish: 'glossy',
    applicable_parts: ['countertop'],
    is_active: true,
    sort_order: 5,
  },
  {
    id: 'mat-hpl-concrete-grey',
    slug: 'hpl-concrete-grey-IN220',
    name: 'IN220 Concrete Grey',
    brand: 'Taco HPL',
    code: 'IN220',
    texture_url: '',
    normal_map_url: '',
    roughness: 0.85,
    metalness: 0.0,
    texture_repeat_x: 2.0,
    texture_repeat_y: 2.0,
    color_hex: '#a0a0a0',
    price_modifier: 1.05,
    price_per_sheet: 340000,
    category: 'stone',
    finish: 'textured',
    applicable_parts: ['body', 'countertop', 'side_panel'],
    is_active: true,
    sort_order: 6,
  },
];

// ─────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────

async function fetchWithFallback<T>(tableName: string, fallbackData: T, queryFn: () => PromiseLike<any>): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    if (!data || data.length === 0) return fallbackData;
    return data as T;
  } catch (e: any) {
    console.warn(`[api3d] Supabase "${tableName}" unavailable, using fallback:`, e.message);
    return fallbackData;
  }
}

export const api3d = {
  // ──── Items 3D ────

  getItems3D: async (category?: string): Promise<CatalogItem[]> => {
    const fallback = category
      ? fallbackItems3D.filter((i) => i.category === category)
      : fallbackItems3D;

    return fetchWithFallback<CatalogItem[]>('items_3d', fallback, () => {
      let query = supabase.from('items_3d').select('*').eq('is_active', true).order('sort_order');
      if (category) query = query.eq('category', category);
      return query;
    });
  },

  getItem3DById: async (id: string): Promise<CatalogItem | null> => {
    const fallback = fallbackItems3D.find((i) => i.id === id) || null;
    try {
      const { data, error } = await supabase.from('items_3d').select('*').eq('id', id).single();
      if (error) throw error;
      return data as CatalogItem;
    } catch {
      return fallback;
    }
  },

  // ──── Materials ────

  getMaterials3D: async (category?: string): Promise<Material3D[]> => {
    const fallback = category
      ? fallbackMaterials.filter((m) => m.category === category)
      : fallbackMaterials;

    return fetchWithFallback<Material3D[]>('materials', fallback, () => {
      let query = supabase.from('materials').select('*').eq('is_active', true).order('sort_order');
      if (category) query = query.eq('category', category);
      return query;
    });
  },

  getMaterialsByPart: async (partName: string): Promise<Material3D[]> => {
    const fallback = fallbackMaterials.filter((m) => m.applicable_parts.includes(partName));

    return fetchWithFallback<Material3D[]>('materials', fallback, () =>
      supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .contains('applicable_parts', [partName])
        .order('sort_order')
    );
  },

  // ──── User Designs ────

  saveDesign3D: async (designData: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('user_designs')
        .insert([designData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('[api3d] saveDesign3D error:', e);
      return { ...designData, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
    }
  },

  updateDesign3D: async (id: string, data: any): Promise<any> => {
    try {
      const { data: result, error } = await supabase
        .from('user_designs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    } catch (e) {
      console.error('[api3d] updateDesign3D error:', e);
      return null;
    }
  },

  getDesign3D: async (id: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('user_designs')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('[api3d] getDesign3D error:', e);
      return null;
    }
  },

  // ──── File Uploads ────

  uploadModel: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `models/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('models-3d').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('models-3d').getPublicUrl(path);
    return publicUrl;
  },

  uploadTexture: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `textures/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('textures-hpl').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('textures-hpl').getPublicUrl(path);
    return publicUrl;
  },

  uploadPhoto: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('user-photos').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('user-photos').getPublicUrl(path);
    return publicUrl;
  },

  _fallbackItems3D: fallbackItems3D,
  _fallbackMaterials: fallbackMaterials,
};
