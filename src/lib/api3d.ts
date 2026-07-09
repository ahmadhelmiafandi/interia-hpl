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

import { fallbackItems3D, fallbackMaterials } from '../data/fallback3dData';

const USE_SUPABASE_CATALOG = false;

async function fetchWithFallback<T>(tableName: string, fallbackData: T, queryFn: () => PromiseLike<any>): Promise<T> {
  if (!USE_SUPABASE_CATALOG) {
    return fallbackData;
  }
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

  getAllItems3DAdmin: async (): Promise<CatalogItem[]> => {
    // Admin needs to see all items, including inactive ones
    if (!USE_SUPABASE_CATALOG) return fallbackItems3D;
    
    try {
      const { data, error } = await supabase
        .from('items_3d')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CatalogItem[];
    } catch (e: any) {
      console.warn('[api3d] Failed to fetch all items for admin:', e.message);
      return fallbackItems3D;
    }
  },

  createItem3D: async (item: Partial<CatalogItem>): Promise<CatalogItem> => {
    if (!USE_SUPABASE_CATALOG) throw new Error("Supabase is disabled. Cannot create item.");
    
    const { data, error } = await supabase
      .from('items_3d')
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data as CatalogItem;
  },

  updateItem3D: async (id: string, updates: Partial<CatalogItem>): Promise<CatalogItem> => {
    if (!USE_SUPABASE_CATALOG) throw new Error("Supabase is disabled. Cannot update item.");
    
    const { data, error } = await supabase
      .from('items_3d')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as CatalogItem;
  },

  deleteItem3D: async (id: string): Promise<void> => {
    if (!USE_SUPABASE_CATALOG) throw new Error("Supabase is disabled. Cannot delete item.");
    
    const { error } = await supabase
      .from('items_3d')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

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
    if (!USE_SUPABASE_CATALOG) {
      return fallback;
    }
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
