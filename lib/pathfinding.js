// SISTEM PATHFINDING GRID A* (A-Star Navigation System)
// Menavigasikan NPC mengitari rintangan kantor:
// 1. Dinding luar (-10 s/d 10) & Pintu Keluar (0, 11)
// 2. Sekat Kaca Meeting Room: X: -9 s/d -0.5, Z: 0.5; dan Z: 0.5 s/d 7.5, X: -0.5
// 3. Meja Rapat Bundar Conference (X: -5, Z: 5)
// 4. Cluster Meja Kerja Engineering (-5, -5) dan Product Bay (5, -5)
// 5. L-Sofa (5.5, 7.5 & 8.2, 5.5) dan Pantry Bar Counter (5.0, 1.5)

const GRID_SIZE = 44; // Resolusi -11 sampai +11 dengan step 0.5 meter (44x44 grid)
const WORLD_MIN = -11;
const WORLD_MAX = 11;
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

// Daftar Objek Halangan / Collision Boxes di Kantor
const OBSTACLES = [
  // Sekat Kaca Meeting Room Horizontal (X: -9 s/d -0.5, Z: 0.5) dengan pintu masuk di dekat tengah
  { minX: -8.8, maxX: -1.2, minZ: 0.3, maxZ: 0.7 },
  // Sekat Kaca Meeting Room Vertikal (X: -0.5, Z: 0.5 s/d 7.5) dengan pintu masuk di Z: 1.0 s/d 2.5
  { minX: -0.7, maxX: -0.3, minZ: 2.5, maxZ: 7.5 },

  // Meja Bundar Meeting Room (Tengah Meeting Room: X: -5, Z: 5)
  { minX: -6.4, maxX: -3.6, minZ: 3.6, maxZ: 6.4 },

  // Cluster Meja Kerja Engineering (X: -5, Z: -5)
  { minX: -6.8, maxX: -3.2, minZ: -5.9, maxZ: -4.1 },

  // Cluster Meja Kerja Product & Design (X: 5, Z: -5)
  { minX: 3.2, maxX: 6.8, minZ: -5.9, maxZ: -4.1 },

  // Pantry Bar Counter & Mesin Kopi (X: 5, Z: 1.5)
  { minX: 3.0, maxX: 7.0, minZ: 1.0, maxZ: 2.0 },

  // Sofa L Utama & Meja Kopi Lounge (X: 5.5, Z: 7.5 & Meja X: 5.5, Z: 5.5)
  { minX: 3.2, maxX: 7.8, minZ: 7.0, maxZ: 8.5 },
  { minX: 7.4, maxX: 8.8, minZ: 4.5, maxZ: 7.0 },
  { minX: 4.5, maxX: 6.5, minZ: 4.9, maxZ: 6.1 },

  // Tembok Luar Selatan (Kecuali Pintu Keluar X: -1.5 s/d 1.5)
  { minX: -11.0, maxX: -1.5, minZ: 10.5, maxZ: 11.5 },
  { minX: 1.5, maxX: 11.0, minZ: 10.5, maxZ: 11.5 },

  // Tembok Luar Utara
  { minX: -11.0, maxX: 11.0, minZ: -11.5, maxZ: -10.5 },

  // Tembok Luar Barat & Timur
  { minX: -11.5, maxX: -10.5, minZ: -11.0, maxZ: 11.0 },
  { minX: 10.5, maxX: 11.5, minZ: -11.0, maxZ: 11.0 },
];

function isBlocked(x, z) {
  // Biarkan jalur pintu keluar tetap bisa dilewati
  if (Math.abs(x) <= 1.5 && z >= 10.0) return false;

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
