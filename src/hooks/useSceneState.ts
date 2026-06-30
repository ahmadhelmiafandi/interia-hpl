import { create } from 'zustand';
import { api3d } from '../lib/api3d.ts';
import {
  RoomConfig,
  PlacedItem,
  CameraConfig,
  CatalogItem,
  Material3D,
  BOMBreakdown,
  MaterialAssignment
} from '../types/interior';
import { calculateBOM } from '../components/PriceEstimator.tsx';

export interface SceneHistoryFrame {
  placedItems: PlacedItem[];
  roomConfig: RoomConfig;
}

export interface PhotoTransform {
  offsetX: number; // -100 to 100 (percent)
  offsetY: number; // -100 to 100 (percent)
  scale: number;   // 1.0 to 2.5
}

export interface SceneState {
  itemsCatalog: CatalogItem[];
  materialsCatalog: Material3D[];
  placedItems: PlacedItem[];
  selectedItemId: string | null;
  activeTool: 'select' | 'move' | 'rotate' | 'scale' | 'calibrate';
  roomConfig: RoomConfig;
  backgroundPhotoUrl: string | null;
  photoTransform: PhotoTransform;
  isLocked: boolean;
  isDraggingItem: boolean;
  isLoadingCatalog: boolean;
  cameraConfig: CameraConfig;
  calibrationPoints: Array<{ x: number; y: number }>;
  past: SceneHistoryFrame[];
  future: SceneHistoryFrame[];
  
  // Actions
  setCatalogData: (items: CatalogItem[], materials: Material3D[]) => void;
  loadCatalog: () => Promise<void>;
  setRoomConfig: (config: Partial<RoomConfig>) => void;
  updateRoomConfig: (config: Partial<RoomConfig>) => void;
  updateCameraConfig: (config: Partial<CameraConfig>) => void;
  setCameraConfig: (config: Partial<CameraConfig>) => void;
  addItem: (item3dId: string) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setActiveTool: (tool: 'select' | 'move' | 'rotate' | 'scale' | 'calibrate') => void;
  updateItemTransform: (
    id: string,
    updates: {
      position?: Partial<{ x: number; y: number; z: number }> | [number, number, number];
      rotationY?: number;
      scale?: Partial<{ x: number; y: number; z: number }> | [number, number, number];
    }
  ) => void;
  assignMaterial: (itemId: string, partName: string, materialId: string) => void;
  setBackgroundPhoto: (url: string | null) => void;
  setPhotoTransform: (transform: Partial<PhotoTransform>) => void;
  resetPhotoTransform: () => void;
  setIsLocked: (locked: boolean) => void;
  setIsDraggingItem: (v: boolean) => void;
  setCalibrationPoints: (points: Array<{ x: number; y: number }>) => void;
  resetScene: () => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
  loadPresetLayout: (presetId: string) => void;
  getBOM: () => BOMBreakdown;
}

export const useSceneState = create<SceneState>((set, get) => ({
  // === CATALOG DATA ===
  itemsCatalog: api3d._fallbackItems3D as CatalogItem[],
  materialsCatalog: api3d._fallbackMaterials as Material3D[],
  
  // === SCENE STATE ===
  placedItems: [],
  selectedItemId: null,
  activeTool: 'select',
  
  // === ROOM SHELL CONFIG ===
  roomConfig: {
    width: 500,
    length: 400,
    height: 280,
    wallColor: '#f1f5f9',
    floorColor: '#e2e8f0',
    ambientIntensity: 0.6,
    sunIntensity: 0.8,
    shadowsEnabled: true,
    floorType: 'wood_light',
  },

  // === PERSPECTIVE MATCHING STATE ===
  backgroundPhotoUrl: null,
  photoTransform: { offsetX: 0, offsetY: 0, scale: 1.0 },
  isLocked: false,
  isDraggingItem: false,
  isLoadingCatalog: false,
  cameraConfig: {
    fov: 50,
    position: [0, 2.2, 5],
    rotation: [-0.3, 0, 0],
    mode: 'perspective',
    preset: 'isometric',
    gridVisible: true,
    helperVisible: true,
  },
  calibrationPoints: [
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.25 },
  ],

  // === HISTORY TRACKING ===
  past: [],
  future: [],

  // === ACTIONS ===
  setCatalogData: (items, materials) => set({
    itemsCatalog: items || (api3d._fallbackItems3D as CatalogItem[]),
    materialsCatalog: materials || (api3d._fallbackMaterials as Material3D[])
  }),

  loadCatalog: async () => {
    set({ isLoadingCatalog: true });
    try {
      const items = await api3d.getItems3D();
      const materials = await api3d.getMaterials3D();
      set({ itemsCatalog: items as CatalogItem[], materialsCatalog: materials as Material3D[] });
    } catch (e) {
      console.warn("Failed to load catalog from Supabase, using fallback:", e);
    } finally {
      set({ isLoadingCatalog: false });
    }
  },

  saveToHistory: () => {
    const { placedItems, roomConfig, past } = get();
    const snapshot: SceneHistoryFrame = {
      placedItems: JSON.parse(JSON.stringify(placedItems)),
      roomConfig: { ...roomConfig }
    };
    const nextPast = [...past, snapshot];
    if (nextPast.length > 30) {
      nextPast.shift();
    }
    set({
      past: nextPast,
      future: []
    });
  },

  undo: () => {
    const { past, future, placedItems, roomConfig } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [
      {
        placedItems: JSON.parse(JSON.stringify(placedItems)),
        roomConfig: { ...roomConfig }
      },
      ...future
    ];
    set({
      placedItems: previous.placedItems,
      roomConfig: previous.roomConfig,
      past: newPast,
      future: newFuture,
      selectedItemId: null
    });
  },

  redo: () => {
    const { past, future, placedItems, roomConfig } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [
      ...past,
      {
        placedItems: JSON.parse(JSON.stringify(placedItems)),
        roomConfig: { ...roomConfig }
      }
    ];
    set({
      placedItems: next.placedItems,
      roomConfig: next.roomConfig,
      past: newPast,
      future: newFuture,
      selectedItemId: null
    });
  },

  commitHistory: () => {
    get().saveToHistory();
  },

  setRoomConfig: (config) => {
    get().saveToHistory();
    set((state) => ({
      roomConfig: { ...state.roomConfig, ...config }
    }));
  },

  updateRoomConfig: (config) => {
    get().saveToHistory();
    set((state) => ({
      roomConfig: { ...state.roomConfig, ...config }
    }));
  },

  updateCameraConfig: (config) => set((state) => ({
    cameraConfig: { ...state.cameraConfig, ...config }
  })),

  setCameraConfig: (config) => set((state) => ({
    cameraConfig: { ...state.cameraConfig, ...config }
  })),

  loadPresetLayout: (presetId) => {
    get().saveToHistory();
    
    let newWallColor = '#f1f5f9';
    let newFloorType = 'wood_light';
    let newAmbientIntensity = 0.6;
    let newSunIntensity = 0.8;
    let newItems: PlacedItem[] = [];
    
    if (presetId === 'kitchen-set') {
      newWallColor = '#FAF9F6';
      newFloorType = 'wood_light';
      newAmbientIntensity = 0.7;
      newSunIntensity = 0.8;
      
      const defaultMaterialsBase: MaterialAssignment = { body: 'mat-hpl-natural-oak', door: 'mat-hpl-white-glossy' };
      const defaultMaterialsCountertop: MaterialAssignment = { countertop: 'mat-hpl-marble-carrara' };
      const defaultMaterialsWall: MaterialAssignment = { body: 'mat-hpl-white-glossy', door: 'mat-hpl-white-glossy' };
      
      newItems = [
        { id: `placed-preset-k1-${Date.now()}`, item3dId: 'item-base-cabinet-60', position: [-0.6, 0, -0.5], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsBase },
        { id: `placed-preset-k2-${Date.now()}`, item3dId: 'item-base-cabinet-60', position: [0, 0, -0.5], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsBase },
        { id: `placed-preset-k3-${Date.now()}`, item3dId: 'item-base-cabinet-60', position: [0.6, 0, -0.5], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsBase },
        { id: `placed-preset-k4-${Date.now()}`, item3dId: 'item-countertop-60', position: [0, 0.72, -0.5], rotationY: 0, scale: [3.0, 1, 1.1], materialAssignments: defaultMaterialsCountertop },
        { id: `placed-preset-k5-${Date.now()}`, item3dId: 'item-wall-cabinet-60', position: [-0.6, 1.4, -0.4], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsWall },
        { id: `placed-preset-k6-${Date.now()}`, item3dId: 'item-wall-cabinet-60', position: [0, 1.4, -0.4], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsWall },
        { id: `placed-preset-k7-${Date.now()}`, item3dId: 'item-wall-cabinet-60', position: [0.6, 1.4, -0.4], rotationY: 0, scale: [1, 1, 1], materialAssignments: defaultMaterialsWall },
      ];
    } else if (presetId === 'wardrobe-room') {
      newWallColor = '#eae6df';
      newFloorType = 'wood_dark';
      newAmbientIntensity = 0.6;
      newSunIntensity = 0.7;
      
      const defaultMaterialsWardrobe: MaterialAssignment = { body: 'mat-hpl-dark-walnut', door: 'mat-hpl-dark-walnut', side_panel: 'mat-hpl-dark-walnut' };
      
      newItems = [
        { id: `placed-preset-w1-${Date.now()}`, item3dId: 'item-wardrobe-2door', position: [-0.6, 0, -0.8], rotationY: 0, scale: [1.2, 1.2, 1.0], materialAssignments: defaultMaterialsWardrobe },
        { id: `placed-preset-w2-${Date.now()}`, item3dId: 'item-wardrobe-2door', position: [0.6, 0, -0.8], rotationY: 0, scale: [1.2, 1.2, 1.0], materialAssignments: defaultMaterialsWardrobe }
      ];
    } else if (presetId === 'living-room-tv') {
      newWallColor = '#f1f5f9';
      newFloorType = 'marble_white';
      newAmbientIntensity = 0.8;
      newSunIntensity = 0.6;
      
      const defaultMaterialsTV: MaterialAssignment = { body: 'mat-hpl-natural-oak', door: 'mat-hpl-white-glossy' };
      
      newItems = [
        { id: `placed-preset-t1-${Date.now()}`, item3dId: 'item-tv-rack-floating', position: [0, 0.4, -1.0], rotationY: 0, scale: [1.5, 1.0, 1.0], materialAssignments: defaultMaterialsTV }
      ];
    }
    
    set((state) => ({
      roomConfig: {
        ...state.roomConfig,
        wallColor: newWallColor,
        floorType: newFloorType,
        ambientIntensity: newAmbientIntensity,
        sunIntensity: newSunIntensity,
      },
      placedItems: newItems,
      selectedItemId: null,
    }));
  },

  addItem: (item3dId) => {
    get().saveToHistory();
    set((state) => {
      const catalogItem = state.itemsCatalog.find(item => item.id === item3dId);
      if (!catalogItem) return {};

      const materialAssignments: MaterialAssignment = {};
      if (catalogItem.mesh_parts) {
        Object.keys(catalogItem.mesh_parts).forEach(part => {
          const applicableMat = state.materialsCatalog.find(m =>
            m.applicable_parts.includes(part)
          );
          if (applicableMat) {
            materialAssignments[part] = applicableMat.id;
          }
        });
      }

      // Auto-stagger: spawn next to last item to avoid overlap at origin
      let spawnX = 0;
      let spawnZ = 0;
      if (state.placedItems.length > 0) {
        const lastItem = state.placedItems[state.placedItems.length - 1];
        const lastCatalog = state.itemsCatalog.find(i => i.id === lastItem.item3dId);
        const lastW = lastCatalog ? (lastCatalog.default_width * lastItem.scale[0]) / 100 : 0.6;
        const newW = catalogItem.default_width / 100;
        spawnX = lastItem.position[0] + lastW / 2 + newW / 2 + 0.05;
        spawnZ = lastItem.position[2];
        // Wrap to next row if item goes too far right (> 2.5m)
        if (Math.abs(spawnX) > 2.5) {
          spawnX = 0;
          spawnZ = lastItem.position[2] - 0.8;
        }
      }

      // Clamp spawn position to room walls
      const roomW = (state.roomConfig.width || 300) / 100;
      const roomL = (state.roomConfig.length || 300) / 100;
      const halfW = (catalogItem.default_width / 100) / 2;
      const halfD = (catalogItem.default_depth / 100) / 2;
      spawnX = Math.max(-roomW / 2 + halfW, Math.min(roomW / 2 - halfW, spawnX));
      spawnZ = Math.max(-roomL / 2 + halfD, Math.min(roomL / 2 - halfD, spawnZ));

      const newItem: PlacedItem = {
        id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item3dId,
        position: [spawnX, 0, spawnZ],
        rotationY: 0,
        scale: [1, 1, 1],
        materialAssignments,
      };

      return {
        placedItems: [...state.placedItems, newItem],
        selectedItemId: newItem.id
      };
    });
  },

  duplicateItem: (id) => {
    get().saveToHistory();
    set((state) => {
      const item = state.placedItems.find(i => i.id === id);
      if (!item) return {};
      const catalogItem = state.itemsCatalog.find(i => i.id === item.item3dId);
      const itemW = catalogItem ? (catalogItem.default_width * item.scale[0]) / 100 : 0.6;
      let dupX = item.position[0] + itemW + 0.05;
      // Clamp duplicate position to room walls
      const roomW = (state.roomConfig.width || 300) / 100;
      const roomL = (state.roomConfig.length || 300) / 100;
      const halfExtX = itemW / 2;
      const halfExtZ = catalogItem ? (catalogItem.default_depth * item.scale[2]) / 200 : 0.3;
      dupX = Math.max(-roomW / 2 + halfExtX, Math.min(roomW / 2 - halfExtX, dupX));
      const dupZ = Math.max(-roomL / 2 + halfExtZ, Math.min(roomL / 2 - halfExtZ, item.position[2]));
      const newItem: PlacedItem = {
        ...item,
        id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        position: [dupX, item.position[1], dupZ],
      };
      return {
        placedItems: [...state.placedItems, newItem],
        selectedItemId: newItem.id,
      };
    });
  },

  removeItem: (id) => {
    get().saveToHistory();
    set((state) => ({
      placedItems: state.placedItems.filter(item => item.id !== id),
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId
    }));
  },

  selectItem: (id) => set({ selectedItemId: id }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),

  updateItemTransform: (id, updates) => set((state) => ({
    placedItems: state.placedItems.map(item => {
      if (item.id !== id) return item;
      
      let nextPos = [...item.position] as [number, number, number];
      if (updates.position) {
        if (Array.isArray(updates.position)) {
          nextPos = updates.position;
        } else {
          nextPos = [
            updates.position.x !== undefined ? updates.position.x : item.position[0],
            updates.position.y !== undefined ? updates.position.y : item.position[1],
            updates.position.z !== undefined ? updates.position.z : item.position[2]
          ];
        }
      }

      let nextScale = [...item.scale] as [number, number, number];
      if (updates.scale) {
        if (Array.isArray(updates.scale)) {
          nextScale = updates.scale;
        } else {
          nextScale = [
            updates.scale.x !== undefined ? updates.scale.x : item.scale[0],
            updates.scale.y !== undefined ? updates.scale.y : item.scale[1],
            updates.scale.z !== undefined ? updates.scale.z : item.scale[2]
          ];
        }
      }

      const nextRotY = updates.rotationY !== undefined ? updates.rotationY : item.rotationY;

      // ── WALL COLLISION CLAMPING ("mentok tembok") ──
      const catalogItem = state.itemsCatalog.find(ci => ci.id === item.item3dId);
      if (catalogItem) {
        const roomW = (state.roomConfig.width || 300) / 100;
        const roomL = (state.roomConfig.length || 300) / 100;
        const roomH = (state.roomConfig.height || 280) / 100;

        const fw = (catalogItem.default_width * nextScale[0]) / 100;
        const fh = (catalogItem.default_height * nextScale[1]) / 100;
        const fd = (catalogItem.default_depth * nextScale[2]) / 100;

        // Rotated AABB half-extents
        const cos = Math.abs(Math.cos(nextRotY));
        const sin = Math.abs(Math.sin(nextRotY));
        const halfExtX = (fw * cos + fd * sin) / 2;
        const halfExtZ = (fw * sin + fd * cos) / 2;

        nextPos[0] = Math.max(-roomW / 2 + halfExtX, Math.min(roomW / 2 - halfExtX, nextPos[0]));
        nextPos[2] = Math.max(-roomL / 2 + halfExtZ, Math.min(roomL / 2 - halfExtZ, nextPos[2]));

        // Clamp Y (tinggi) untuk item dinding agar tidak tembus plafon/lantai
        const isWallItem = catalogItem.slug.includes('wall') || catalogItem.slug.includes('tv');
        if (isWallItem) {
          nextPos[1] = Math.max(0, Math.min(roomH - fh, nextPos[1]));
        }
      }

      return {
        ...item,
        position: nextPos,
        rotationY: nextRotY,
        scale: nextScale
      };
    })
  })),

  assignMaterial: (itemId, partName, materialId) => {
    get().saveToHistory();
    set((state) => ({
      placedItems: state.placedItems.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          materialAssignments: {
            ...item.materialAssignments,
            [partName]: materialId
          }
        };
      })
    }));
  },

  setBackgroundPhoto: (url) => set({ backgroundPhotoUrl: url, photoTransform: { offsetX: 0, offsetY: 0, scale: 1.0 } }),

  setPhotoTransform: (transform) => set((state) => ({
    photoTransform: { ...state.photoTransform, ...transform }
  })),

  resetPhotoTransform: () => set({ photoTransform: { offsetX: 0, offsetY: 0, scale: 1.0 } }),

  setIsLocked: (locked) => set({ isLocked: locked }),

  setIsDraggingItem: (v) => set({ isDraggingItem: v }),

  setCalibrationPoints: (points) => set({ calibrationPoints: points }),

  resetScene: () => {
    get().saveToHistory();
    set({
      placedItems: [],
      selectedItemId: null,
      backgroundPhotoUrl: null,
      isLocked: false,
      activeTool: 'select'
    });
  },

  getBOM: () => {
    const { placedItems, itemsCatalog, materialsCatalog } = get();
    return calculateBOM(placedItems, itemsCatalog, materialsCatalog);
  }
}));
