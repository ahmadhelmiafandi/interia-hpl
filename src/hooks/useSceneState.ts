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

export interface SceneState {
  itemsCatalog: CatalogItem[];
  materialsCatalog: Material3D[];
  placedItems: PlacedItem[];
  selectedItemId: string | null;
  activeTool: 'select' | 'move' | 'rotate' | 'scale' | 'calibrate';
  roomConfig: RoomConfig;
  backgroundPhotoUrl: string | null;
  isLocked: boolean;
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
  setIsLocked: (locked: boolean) => void;
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
    width: 300,
    length: 300,
    height: 250,
    wallColor: '#f1f5f9',
    floorColor: '#e2e8f0',
    ambientIntensity: 0.6,
    sunIntensity: 0.8,
    shadowsEnabled: true,
    floorType: 'wood_light',
  },

  // === PERSPECTIVE MATCHING STATE ===
  backgroundPhotoUrl: null,
  isLocked: false,
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
    try {
      const items = await api3d.getItems3D();
      const materials = await api3d.getMaterials3D();
      set({ itemsCatalog: items as CatalogItem[], materialsCatalog: materials as Material3D[] });
    } catch (e) {
      console.warn("Failed to load catalog from Supabase, using fallback:", e);
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

      const newItem: PlacedItem = {
        id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item3dId,
        position: [0, 0, 0],
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

      return {
        ...item,
        position: nextPos,
        rotationY: updates.rotationY !== undefined ? updates.rotationY : item.rotationY,
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

  setBackgroundPhoto: (url) => set({ backgroundPhotoUrl: url }),

  setIsLocked: (locked) => set({ isLocked: locked }),

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
