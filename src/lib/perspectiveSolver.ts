/**
 * perspectiveSolver.ts
 * 
 * Modul pemecah matematika untuk Perspective Matching.
 * Menggunakan metode Direct Linear Transform (DLT) & Homography Decomposition
 * untuk mencari FOV, Posisi, dan Rotasi kamera berdasarkan 4 titik sudut lantai.
 */

interface ScreenPoint {
  x: number;
  y: number;
}

interface WorldPoint {
  x: number;
  z: number;
}

interface RoomConfig {
  width?: number;
  length?: number;
  height?: number;
}

export interface PerspectiveResult {
  fov: number;
  position: [number, number, number];
  rotation: [number, number, number];
  isFallback: boolean;
}

/**
 * Memecahkan Homografi 2D-ke-2D menggunakan 4 pasangan titik.
 * Memetakan koordinat lantai 3D (x, z) ke koordinat gambar 2D (u, v).
 */
function solveHomography(screenPoints: ScreenPoint[], worldPoints: WorldPoint[]): number[] | null {
  // Membuat matriks persamaan A * h = 0
  const A: number[][] = [];
  
  for (let i = 0; i < 4; i++) {
    const w = worldPoints[i];
    const s = screenPoints[i];
    const X = w.x;
    const Z = w.z;
    const u = s.x;
    const v = s.y;
    
    A.push([ -X, -Z, -1,   0,   0,  0,  u*X,  u*Z,  u ]);
    A.push([   0,   0,  0, -X, -Z, -1,  v*X,  v*Z,  v ]);
  }
  
  // Karena A adalah matriks 8x9, kita bisa mencari nilai h (kernel A)
  // menggunakan penyederhanaan Gauss-Jordan dengan mengasumsikan h33 (h[8]) = 1.
  const b: number[] = [];
  const M: number[][] = [];
  for (let i = 0; i < 8; i++) {
    M.push(A[i].slice(0, 8));
    b.push(-A[i][8]); // Pindahkan kolom ke-9 ke sisi kanan
  }
  
  const h = solveLinearSystem(M, b);
  if (!h) return null;
  
  h.push(1.0); // h33
  return h;
}

/**
 * Solver Sistem Persamaan Linear sederhana (Gauss-Jordan elimination)
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    // Cari pivot terbesar
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    const tempA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tempA;
    
    const tempB = b[i];
    b[i] = b[maxRow];
    b[maxRow] = tempB;
    
    if (Math.abs(A[i][i]) < 1e-10) {
      return null; // Singular matrix
    }
    
    // Kurangi baris di bawahnya
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      b[k] -= factor * b[i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n).fill(0) as number[];
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (b[i] - sum) / A[i][i];
  }
  
  return x;
}

/**
 * Estimasi parameter kamera dari titik kalibrasi.
 * 
 * @param screenPoints - 4 pasang titik kalibrasi (normalized [0..1] dari SVG screen)
 * @param roomConfig - Ukuran ruangan { width, length } dalam cm
 * @returns { fov, position: [x,y,z], rotation: [rx, ry, rz] }
 */
export function solvePerspective(screenPoints: ScreenPoint[], roomConfig: RoomConfig): PerspectiveResult {
  // Convert room size to meters
  const W = (roomConfig.width || 300) / 100;
  const L = (roomConfig.length || 300) / 100;
  
  // 3D coordinates of floor corners (clock-wise starting from bottom-left in standard view)
  const worldPoints: WorldPoint[] = [
    { x: -W / 2, z: L / 2 },  // Bottom-Left
    { x: W / 2,  z: L / 2 },  // Bottom-Right
    { x: W / 2,  z: -L / 2 }, // Top-Right
    { x: -W / 2, z: -L / 2 }, // Top-Left
  ];

  // Ubah koordinat screen Y dari (0=atas, 1=bawah) menjadi sistem kartesian (0=bawah, 1=atas)
  const adjustedScreen: ScreenPoint[] = screenPoints.map(p => ({
    x: p.x - 0.5,
    y: (1.0 - p.y) - 0.5
  }));

  const H = solveHomography(adjustedScreen, worldPoints);

  // Jika kalkulasi homografi gagal, berikan fallback stabil yang terlihat bagus
  const fallback: PerspectiveResult = {
    fov: 48,
    position: [0, 2.3, L * 1.2],
    rotation: [-0.35, 0, 0],
    isFallback: true
  };

  if (!H) {
    console.warn("[perspectiveSolver] Homography singular, using fallback.");
    return fallback;
  }

  // Decompose Homography to retrieve camera components
  const h1 = [H[0], H[3], H[6]];
  const h2 = [H[1], H[4], H[7]];
  const h3 = [H[2], H[5], H[8]];

  // Skala normalisasi
  const norm1 = Math.sqrt(h1[0]*h1[0] + h1[1]*h1[1] + h1[2]*h1[2]);
  const norm2 = Math.sqrt(h2[0]*h2[0] + h2[1]*h2[1] + h2[2]*h2[2]);
  const scale = (norm1 + norm2) / 2;

  if (scale < 1e-5) return fallback;

  // Rotasi sumbu
  const r1 = h1.map(val => val / scale);
  const r2 = h2.map(val => val / scale);
  const t  = h3.map(val => val / scale);

  // Cari r3 = r1 x r2 (ortogonalisasi)
  const r3 = [
    r1[1]*r2[2] - r1[2]*r2[1],
    r1[2]*r2[0] - r1[0]*r2[2],
    r1[0]*r2[1] - r1[1]*r2[0]
  ];

  // Translasi kamera di 3D = -R^T * t
  const cameraX = -(r1[0]*t[0] + r1[1]*t[1] + r1[2]*t[2]);
  const cameraY = -(r2[0]*t[0] + r2[1]*t[1] + r2[2]*t[2]);
  const cameraZ = -(r3[0]*t[0] + r3[1]*t[1] + r3[2]*t[2]);

  // Estimasi FOV
  let focalLength = 1.0;
  if (Math.abs(H[6]) > 1e-4 || Math.abs(H[7]) > 1e-4) {
    focalLength = 1.0 / Math.max(Math.abs(H[6]), Math.abs(H[7]));
  }
  
  let fov = 2 * Math.atan(0.5 / (focalLength || 1)) * (180 / Math.PI);
  
  // Batasi FOV pada rentang lensa kamera normal (20 s.d 85 derajat)
  if (isNaN(fov) || fov < 20 || fov > 85) {
    fov = 48;
  }

  // Hitung sudut rotasi Euler (Pitch, Yaw, Roll) dari matriks R
  const pitch = Math.asin(-r2[2] || 0); // Rotasi X
  const yaw = Math.atan2(r1[2], r3[2] || 1);   // Rotasi Y
  const roll = Math.atan2(r2[0], r2[1] || 1);  // Rotasi Z (kita abaikan)

  // Validasi posisi kamera agar logis
  const finalX = isNaN(cameraX) ? 0 : Math.max(-5, Math.min(5, cameraX));
  const finalY = isNaN(cameraY) || cameraY <= 0.2 ? 2.0 : Math.max(1.0, Math.min(4.0, cameraY));
  const finalZ = isNaN(cameraZ) || cameraZ <= 0.5 ? L * 1.2 : Math.max(1.0, Math.min(10, cameraZ));

  const finalPitch = isNaN(pitch) ? -0.3 : Math.max(-1.0, Math.min(0.2, pitch));
  const finalYaw = isNaN(yaw) ? 0 : Math.max(-1.0, Math.min(1.0, yaw));

  return {
    fov: Math.round(fov),
    position: [finalX, finalY, finalZ],
    rotation: [finalPitch, finalYaw, 0], // Roll di-nol-kan agar tegak lurus
    isFallback: false
  };
}
