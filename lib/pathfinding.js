// SISTEM PATHFINDING GRID A* (A-Star Navigation System)
// Menavigasikan NPC mengitari rintangan kantor:
// 1. Dinding luar (-10 s/d 10) & Pintu Keluar (0, 11)
// 2. Sekat Kaca Meeting Room: X: -9 s/d -0.5, Z: 0.5; dan Z: 0.5 s/d 7.5, X: -0.5
// 3. Meja Rapat Bundar Conference (X: -5, Z: 5)
// 4. Cluster Meja Kerja Engineering (-5, -5) dan Product Bay (5, -5)
// 5. L-Sofa (5.5, 7.5 & 8.2, 5.5) dan Pantry Bar Counter (5.0, 1.5)

const GRID_SIZE = 72; // Resolusi -18 sampai +18 dengan step 0.5 meter (72x72 grid = 36x36 meter)
const WORLD_MIN = -18;
const WORLD_MAX = 18;
const STEP = 0.5;

function worldToGrid(x, z) {
  const gx = Math.round((x - WORLD_MIN) / STEP);
  const gz = Math.round((z - WORLD_MIN) / STEP);
  return {
    gx: Math.max(0, Math.min(GRID_SIZE - 1, gx)),
    gz: Math.max(0, Math.min(GRID_SIZE - 1, gz)),
  };
}

function gridToWorld(gx, gz) {
  return {
    x: WORLD_MIN + gx * STEP,
    z: WORLD_MIN + gz * STEP,
  };
}

// Daftar Objek Halangan / Collision Boxes di Kantor Pusat Grand 34x30m
const OBSTACLES = [
  // 1. GRAND EXECUTIVE BOARDROOM (X: -14.5 s/d -4.5, Z: 7.2 s/d 14.5)
  { minX: -14.5, maxX: -7.5, minZ: 7.0, maxZ: 7.4 }, // Dinding Utara Boardroom
  { minX: -4.7, maxX: -4.3, minZ: 7.2, maxZ: 14.5 }, // Dinding Timur Boardroom
  { minX: -11.8, maxX: -7.2, minZ: 9.5, maxZ: 11.5 }, // Meja Rapat Konferensi

  // 2. GRAND PANTRY & SOCIAL LOUNGE (X: 4.5 s/d 14.5, Z: 7.2 s/d 14.5)
  { minX: 6.0, maxX: 11.0, minZ: 7.3, maxZ: 8.3 }, // Bar Counter & Mesin Kopi
  { minX: 7.0, maxX: 12.0, minZ: 12.0, maxZ: 13.5 }, // Sofa Utama
  { minX: 12.5, maxX: 14.0, minZ: 8.5, maxZ: 12.0 }, // Sofa Sudut
  { minX: 8.3, maxX: 10.7, minZ: 9.5, maxZ: 10.9 }, // Meja Kopi Tengah

  // 3. SUITE 1: LUNA AI SALES & CRM (X: -3.5 s/d 3.5, Z: -13.5 s/d -7.5)
  { minX: -1.2, maxX: 1.2, minZ: -12.4, maxZ: -11.2 }, // Meja Kerja Luna
  { minX: -3.5, maxX: 3.5, minZ: -13.6, maxZ: -13.4 }, // Tembok Utara
  { minX: -3.6, maxX: -3.4, minZ: -13.5, maxZ: -7.5 }, // Tembok Barat
  { minX: 3.4, maxX: 3.6, minZ: -13.5, maxZ: -7.5 }, // Tembok Timur
  { minX: -3.5, maxX: -1.0, minZ: -7.6, maxZ: -7.4 }, // Pintu Selatan (kiri)
  { minX: 1.0, maxX: 3.5, minZ: -7.6, maxZ: -7.4 }, // Pintu Selatan (kanan)

  // 4. SUITE 2: DIMAS DEV & BACKEND LAB (X: -14.75 s/d -7.25, Z: -13.5 s/d -7.5)
  { minX: -12.2, maxX: -9.8, minZ: -12.4, maxZ: -11.2 }, // Meja Kerja Dimas
  { minX: -14.75, maxX: -7.25, minZ: -13.6, maxZ: -13.4 }, // Tembok Utara
  { minX: -14.75, maxX: -7.25, minZ: -7.6, maxZ: -7.4 }, // Sekat Dimas & Budi
  { minX: -7.35, maxX: -7.15, minZ: -13.5, maxZ: -11.2 }, // Tembok Timur (atas pintu)
  { minX: -7.35, maxX: -7.15, minZ: -9.8, maxZ: -7.5 }, // Tembok Timur (bawah pintu)

  // 5. SUITE 3: RINA DESIGN STUDIO (X: 7.25 s/d 14.75, Z: -13.5 s/d -7.5)
  { minX: 9.8, maxX: 12.2, minZ: -12.4, maxZ: -11.2 }, // Meja Kerja Rina
  { minX: 7.25, maxX: 14.75, minZ: -13.6, maxZ: -13.4 }, // Tembok Utara
  { minX: 7.25, maxX: 14.75, minZ: -7.6, maxZ: -7.4 }, // Sekat Rina & Sari
  { minX: 7.15, maxX: 7.35, minZ: -13.5, maxZ: -11.2 }, // Tembok Barat (atas pintu)
  { minX: 7.15, maxX: 7.35, minZ: -9.8, maxZ: -7.5 }, // Tembok Barat (bawah pintu)

  // 6. SUITE 4: BUDI CS BAY (X: -14.75 s/d -7.25, Z: -6.25 s/d -0.75)
  { minX: -12.2, maxX: -9.8, minZ: -5.4, maxZ: -4.2 }, // Meja Kerja Budi
  { minX: -14.75, maxX: -7.25, minZ: -0.85, maxZ: -0.65 }, // Sekat Budi & PMO
  { minX: -7.35, maxX: -7.15, minZ: -6.25, maxZ: -4.2 }, // Tembok Timur (atas pintu)
  { minX: -7.35, maxX: -7.15, minZ: -2.8, maxZ: -0.75 }, // Tembok Timur (bawah pintu)

  // 7. SUITE 5: SARI FINANCE & AUDIT (X: 7.25 s/d 14.75, Z: -6.25 s/d -0.75)
  { minX: 9.8, maxX: 12.2, minZ: -5.4, maxZ: -4.2 }, // Meja Kerja Sari
  { minX: 7.25, maxX: 14.75, minZ: -0.85, maxZ: -0.65 }, // Sekat Sari & Marketing
  { minX: 7.15, maxX: 7.35, minZ: -6.25, maxZ: -4.2 }, // Tembok Barat (atas pintu)
  { minX: 7.15, maxX: 7.35, minZ: -2.8, maxZ: -0.75 }, // Tembok Barat (bawah pintu)

  // 8. SUITE 6: PRODUCT & PMO (X: -14.75 s/d -7.25, Z: 0.25 s/d 5.75)
  { minX: -12.2, maxX: -9.8, minZ: 1.2, maxZ: 2.4 }, // Meja PMO
  { minX: -14.75, maxX: -7.25, minZ: 5.65, maxZ: 5.85 }, // Sekat Selatan PMO
  { minX: -7.35, maxX: -7.15, minZ: 0.25, maxZ: 2.3 }, // Tembok Timur (atas pintu)
  { minX: -7.35, maxX: -7.15, minZ: 3.7, maxZ: 5.75 }, // Tembok Timur (bawah pintu)

  // 9. SUITE 7: GROWTH MARKETING & MEDIA (X: 7.25 s/d 14.75, Z: 0.25 s/d 5.75)
  { minX: 9.8, maxX: 12.2, minZ: 1.2, maxZ: 2.4 }, // Meja Marketing
  { minX: 7.25, maxX: 14.75, minZ: 5.65, maxZ: 5.85 }, // Sekat Selatan Marketing
  { minX: 7.15, maxX: 7.35, minZ: 0.25, maxZ: 2.3 }, // Tembok Barat (atas pintu)
  { minX: 7.15, maxX: 7.35, minZ: 3.7, maxZ: 5.75 }, // Tembok Barat (bawah pintu)

  // 10. SUITE 8: CLOUD SERVER & NOC ROOM (X: -3.0 s/d 3.0, Z: -5.4 s/d -0.6)
  { minX: -1.2, maxX: 1.2, minZ: -4.6, maxZ: -3.4 }, // Meja Konsol NOC
  { minX: -2.4, maxX: -1.2, minZ: -5.0, maxZ: -4.0 }, // Rak Server Kiri
  { minX: 1.2, maxX: 2.4, minZ: -5.0, maxZ: -4.0 }, // Rak Server Kanan
  { minX: -3.0, maxX: 3.0, minZ: -5.5, maxZ: -5.3 }, // Dinding Utara NOC
  { minX: -3.1, maxX: -2.9, minZ: -5.4, maxZ: -0.6 }, // Dinding Barat NOC
  { minX: 2.9, maxX: 3.1, minZ: -5.4, maxZ: -0.6 }, // Dinding Timur NOC
  { minX: -3.0, maxX: -0.9, minZ: -0.7, maxZ: -0.5 }, // Pintu Selatan NOC (kiri)
  { minX: 0.9, maxX: 3.0, minZ: -0.7, maxZ: -0.5 }, // Pintu Selatan NOC (kanan)

  // Tembok Luar Selatan (Kecuali Pintu Keluar Utama X: -2.5 s/d 2.5)
  { minX: -17.5, maxX: -2.5, minZ: 14.5, maxZ: 15.5 },
  { minX: 2.5, maxX: 17.5, minZ: 14.5, maxZ: 15.5 },

  // Tembok Luar Utara
  { minX: -17.5, maxX: 17.5, minZ: -15.5, maxZ: -14.5 },

  // Tembok Luar Barat & Timur
  { minX: -17.5, maxX: -16.5, minZ: -15.5, maxZ: 15.5 },
  { minX: 16.5, maxX: 17.5, minZ: -15.5, maxZ: 15.5 },
];

function isBlocked(x, z) {
  // Biarkan jalur pintu keluar utama tetap bisa dilewati
  if (Math.abs(x) <= 2.5 && z >= 14.0) return false;

  for (let i = 0; i < OBSTACLES.length; i++) {
    const ob = OBSTACLES[i];
    if (x >= ob.minX && x <= ob.maxX && z >= ob.minZ && z <= ob.maxZ) {
      return true;
    }
  }
  return false;
}

// Inisialisasi Matrix Grid Navigasi
const NAV_GRID = new Uint8Array(GRID_SIZE * GRID_SIZE);
for (let gz = 0; gz < GRID_SIZE; gz++) {
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    const pos = gridToWorld(gx, gz);
    NAV_GRID[gz * GRID_SIZE + gx] = isBlocked(pos.x, pos.z) ? 1 : 0;
  }
}

/**
 * Algoritma A* Pathfinding 2D
 * @param {{x: number, z: number}} startPos 
 * @param {{x: number, z: number}} targetPos 
 * @returns {Array<{x: number, z: number}>} Daftar Waypoints dari start ke target
 */
export function findPath(startPos, targetPos) {
  const start = worldToGrid(startPos.x, startPos.z);
  const target = worldToGrid(targetPos.x, targetPos.z);

  // Jika target berada tepat di dalam halangan (misal persis di tepi meja/kursi),
  // cari node tetangga terdekat yang walkable
  let targetGX = target.gx;
  let targetGZ = target.gz;

  if (NAV_GRID[targetGZ * GRID_SIZE + targetGX] === 1) {
    let foundWalkable = false;
    for (let r = 1; r <= 3 && !foundWalkable; r++) {
      for (let dx = -r; dx <= r && !foundWalkable; dx++) {
        for (let dz = -r; dz <= r && !foundWalkable; dz++) {
          const nx = targetGX + dx;
          const nz = targetGZ + dz;
          if (nx >= 0 && nx < GRID_SIZE && nz >= 0 && nz < GRID_SIZE) {
            if (NAV_GRID[nz * GRID_SIZE + nx] === 0) {
              targetGX = nx;
              targetGZ = nz;
              foundWalkable = true;
            }
          }
        }
      }
    }
  }

  const openList = [];
  const closedSet = new Uint8Array(GRID_SIZE * GRID_SIZE);
  const cameFrom = new Int32Array(GRID_SIZE * GRID_SIZE).fill(-1);
  const gScore = new Float32Array(GRID_SIZE * GRID_SIZE).fill(Infinity);
  const fScore = new Float32Array(GRID_SIZE * GRID_SIZE).fill(Infinity);

  const startIdx = start.gz * GRID_SIZE + start.gx;
  const targetIdx = targetGZ * GRID_SIZE + targetGX;

  gScore[startIdx] = 0;
  fScore[startIdx] = Math.hypot(start.gx - targetGX, start.gz - targetGZ);
  openList.push({ idx: startIdx, f: fScore[startIdx] });

  const DIRS = [
    { dx: 1, dz: 0, cost: 1.0 },
    { dx: -1, dz: 0, cost: 1.0 },
    { dx: 0, dz: 1, cost: 1.0 },
    { dx: 0, dz: -1, cost: 1.0 },
    { dx: 1, dz: 1, cost: 1.414 },
    { dx: -1, dz: 1, cost: 1.414 },
    { dx: 1, dz: -1, cost: 1.414 },
    { dx: -1, dz: -1, cost: 1.414 },
  ];

  let iterations = 0;
  while (openList.length > 0 && iterations < 1200) {
    iterations++;

    // Ambil node dengan fScore terkecil
    let lowestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIdx].f) {
        lowestIdx = i;
      }
    }

    const current = openList[lowestIdx];
    if (current.idx === targetIdx) {
      // Rekonstruksi rute
      const path = [];
      let curr = targetIdx;
      while (curr !== -1) {
        const cgx = curr % GRID_SIZE;
        const cgz = Math.floor(curr / GRID_SIZE);
        const wPos = gridToWorld(cgx, cgz);
        path.unshift(wPos);
        curr = cameFrom[curr];
      }

      // Pastikan titik akhir adalah koordinat target yang sesungguhnya
      if (path.length > 0) {
        path[path.length - 1] = { x: targetPos.x, z: targetPos.z };
      }

      // Lakukan simplifikasi / smoothing path (hilangkan titik lurus redundan)
      return simplifyPath(path);
    }

    // Hapus dari openList
    openList.splice(lowestIdx, 1);
    closedSet[current.idx] = 1;

    const curGx = current.idx % GRID_SIZE;
    const curGz = Math.floor(current.idx / GRID_SIZE);

    for (let i = 0; i < DIRS.length; i++) {
      const dir = DIRS[i];
      const ngx = curGx + dir.dx;
      const ngz = curGz + dir.dz;

      if (ngx < 0 || ngx >= GRID_SIZE || ngz < 0 || ngz >= GRID_SIZE) continue;

      const nIdx = ngz * GRID_SIZE + ngx;
      if (closedSet[nIdx] === 1) continue;
      if (NAV_GRID[nIdx] === 1) continue;

      // Cek corner-cutting untuk gerakan diagonal
      if (dir.dx !== 0 && dir.dz !== 0) {
        const side1 = curGz * GRID_SIZE + ngx;
        const side2 = ngz * GRID_SIZE + curGx;
        if (NAV_GRID[side1] === 1 || NAV_GRID[side2] === 1) continue;
      }

      const tentativeG = gScore[current.idx] + dir.cost;
      if (tentativeG < gScore[nIdx]) {
        cameFrom[nIdx] = current.idx;
        gScore[nIdx] = tentativeG;
        fScore[nIdx] = tentativeG + Math.hypot(ngx - targetGX, ngz - targetGZ);

        const inOpen = openList.find((item) => item.idx === nIdx);
        if (!inOpen) {
          openList.push({ idx: nIdx, f: fScore[nIdx] });
        } else {
          inOpen.f = fScore[nIdx];
        }
      }
    }
  }

  // Jika tidak ditemukan rute grid langsung, fallback ke garis lurus aman
  return [{ x: startPos.x, z: startPos.z }, { x: targetPos.x, z: targetPos.z }];
}

// Menghilangkan waypoint perantara yang berada pada satu garis lurus
function simplifyPath(path) {
  if (path.length <= 2) return path;

  const result = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dx1 = curr.x - prev.x;
    const dz1 = curr.z - prev.z;
    const dx2 = next.x - curr.x;
    const dz2 = next.z - curr.z;

    const angleDiff = Math.abs(Math.atan2(dz1, dx1) - Math.atan2(dz2, dx2));
    if (angleDiff > 0.05) {
      result.push(curr);
    }
  }
  result.push(path[path.length - 1]);
  return result;
}
