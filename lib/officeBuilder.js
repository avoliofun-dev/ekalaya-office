import * as THREE from "three";

/**
 * Creates the entire 3D blocky office interior
 */
export function buildOfficeScene(scene) {
  const officeGroup = new THREE.Group();
  officeGroup.name = "office-geometry";

  // Materials with vibrant, modern pastel & cyber aesthetics
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1e2433,
    roughness: 0.8,
    metalness: 0.1,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.5,
  });

  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.6,
  });

  const screenMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  const sofaMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    roughness: 0.7,
  });

  const plantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.6,
  });

  const plantPotMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.5,
  });

  // 1. FLOOR (34x30 meters Grand Corporate Office)
  const floorGeo = new THREE.BoxGeometry(34, 0.4, 30);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.2;
  floorMesh.receiveShadow = true;
  officeGroup.add(floorMesh);

  // Grand Corridor Carpet Boulevard (Center Hallway)
  const carpetBoulevardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const carpetBoulevard = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 28), carpetBoulevardMat);
  carpetBoulevard.position.set(0, 0.01, 0);
  carpetBoulevard.receiveShadow = true;
  officeGroup.add(carpetBoulevard);

  // Subtle floor grid carpet accents for Boardroom and Lounge
  const carpetMeetingMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const carpetMeet = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.02, 6.8), carpetMeetingMat);
  carpetMeet.position.set(-9.5, 0.01, 10.5);
  carpetMeet.receiveShadow = true;
  officeGroup.add(carpetMeet);

  const carpetLoungeMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
  const carpetLounge = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.02, 6.8), carpetLoungeMat);
  carpetLounge.position.set(9.5, 0.01, 10.5);
  carpetLounge.receiveShadow = true;
  officeGroup.add(carpetLounge);

  // 2. WALLS & PERIMETER BORDERS
  const wallHeight = 3.6;
  const wallThickness = 0.5;

  // North wall (Z = -15)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(34, wallHeight, wallThickness), wallMat);
  northWall.position.set(0, wallHeight / 2, -15);
  officeGroup.add(northWall);

  // South wall (Z = 15) - with 5m Grand Entrance
  const southWallL = new THREE.Mesh(new THREE.BoxGeometry(14.5, wallHeight, wallThickness), wallMat);
  southWallL.position.set(-9.75, wallHeight / 2, 15);
  officeGroup.add(southWallL);

  const southWallR = new THREE.Mesh(new THREE.BoxGeometry(14.5, wallHeight, wallThickness), wallMat);
  southWallR.position.set(9.75, wallHeight / 2, 15);
  officeGroup.add(southWallR);

  // West wall (X = -17)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 30), wallMat);
  westWall.position.set(-17, wallHeight / 2, 0);
  officeGroup.add(westWall);

  // East wall (X = 17)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 30), wallMat);
  eastWall.position.set(17, wallHeight / 2, 0);
  officeGroup.add(eastWall);

  // 3. GRAND EXECUTIVE BOARDROOM (X: -14.5 to -4.5, Z: 7.2 to 14.5)
  const glassDividerMeetN = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.8, 0.1), glassMat);
  glassDividerMeetN.position.set(-11.0, 1.4, 7.2);
  officeGroup.add(glassDividerMeetN);

  const glassDividerMeetE = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 7.3), glassMat);
  glassDividerMeetE.position.set(-4.5, 1.4, 10.85);
  officeGroup.add(glassDividerMeetE);

  // Grand Boardroom Conference Table (seats 8-10 people)
  const meetTableGeo = new THREE.BoxGeometry(4.6, 0.15, 2.0);
  const meetTable = new THREE.Mesh(meetTableGeo, woodMat);
  meetTable.position.set(-9.5, 0.85, 10.5);
  meetTable.castShadow = true;
  meetTable.receiveShadow = true;
  meetTable.userData = {
    isInteractive: true,
    interactType: "adminConsole",
    label: "Meja Rapat Eksekutif & Admin Console",
    hint: "Klik untuk Buka Platform Konsol Admin Ekalaya",
  };
  officeGroup.add(meetTable);

  const meetLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.85, 1.4), deskMat);
  meetLeg1.position.set(-11.2, 0.425, 10.5);
  officeGroup.add(meetLeg1);

  const meetLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.85, 1.4), deskMat);
  meetLeg2.position.set(-7.8, 0.425, 10.5);
  officeGroup.add(meetLeg2);

  // Giant 4K Presentation Wall & Whiteboard
  const confScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 4.2), deskMat);
  confScreenFrame.position.set(-16.7, 2.1, 10.5);
  officeGroup.add(confScreenFrame);

  const confScreen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 4.0), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
  confScreen.position.set(-16.55, 2.1, 10.5);
  confScreen.userData = {
    isInteractive: true,
    interactType: "whiteboard",
    label: "Layar Proyektor & Dashboard Rapat",
    hint: "Klik untuk Buka Catatan Rapat / Whiteboard"
  };
  officeGroup.add(confScreen);

  // Executive Conference Chairs around table
  const confChairPositions = [
    { x: -11.2, z: 9.1, rot: 0 },
    { x: -9.5, z: 9.1, rot: 0 },
    { x: -7.8, z: 9.1, rot: 0 },
    { x: -11.2, z: 11.9, rot: Math.PI },
    { x: -9.5, z: 11.9, rot: Math.PI },
    { x: -7.8, z: 11.9, rot: Math.PI },
    { x: -12.4, z: 10.5, rot: Math.PI / 2 },
    { x: -6.6, z: 10.5, rot: -Math.PI / 2 },
  ];
  confChairPositions.forEach((pos, idx) => {
    createBlockyChair(officeGroup, pos.x, pos.z, pos.rot, `Kursi Rapat ${idx + 1}`);
  });

  // =========================================================================
  // 8 DEDICATED CORPORATE DIVISIONS / PRIVATE EXECUTIVE SUITES
  // =========================================================================

  // 1. DEVISI AI SALES: LUNA (Pusat Utara)
  createPrivateSuite(officeGroup, {
    name: "Luna",
    title: "✨ LUNA • AI SALES & AUTOMATION",
    role: "AI Sales Assistant 24/7 & CRM Automation",
    themeColor: 0x0891b2,
    centerX: 0,
    centerZ: -10.5,
    width: 7.0,
    depth: 6.0,
    deskX: 0,
    deskZ: -11.8,
    deskRot: 0,
    doorwaySide: "south",
    deskConfig: {
      type: "salesDesk",
      name: "Meja AI Sales Luna",
      hint: "Klik untuk Buka AI Sales Assistant Luna & CRM",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 2. DEVISI TEKNIK & DEV LAB: DIMAS (Barat Laut)
  createPrivateSuite(officeGroup, {
    name: "Dimas",
    title: "💻 DIMAS • DEV & BACKEND LAB",
    role: "Programmer & Backend Architecture",
    themeColor: 0x1e3a8a,
    centerX: -11.0,
    centerZ: -10.5,
    width: 7.5,
    depth: 6.0,
    deskX: -11.0,
    deskZ: -11.8,
    deskRot: 0,
    doorwaySide: "east",
    deskConfig: {
      type: "devDesk",
      name: "Meja Kerja Dimas",
      hint: "Programmer & Backend Developer",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 3. DEVISI DESAIN & KREATIF: RINA (Timur Laut)
  createPrivateSuite(officeGroup, {
    name: "Rina",
    title: "🎨 RINA • DESIGN & CREATIVE STUDIO",
    role: "Desainer Grafis & UI/UX Product Design",
    themeColor: 0x831843,
    centerX: 11.0,
    centerZ: -10.5,
    width: 7.5,
    depth: 6.0,
    deskX: 11.0,
    deskZ: -11.8,
    deskRot: 0,
    doorwaySide: "west",
    deskConfig: {
      type: "designDesk",
      name: "Meja Kerja Rina",
      hint: "Desainer Grafis & UI/UX",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 4. DEVISI CUSTOMER SERVICE: BUDI (Barat Tengah)
  createPrivateSuite(officeGroup, {
    name: "Budi",
    title: "🎧 BUDI • CUSTOMER OPERATIONS BAY",
    role: "Layanan Pelanggan & Operasional Klien",
    themeColor: 0x065f46,
    centerX: -11.0,
    centerZ: -3.5,
    width: 7.5,
    depth: 5.5,
    deskX: -11.0,
    deskZ: -4.8,
    deskRot: 0,
    doorwaySide: "east",
    deskConfig: {
      type: "csDesk",
      name: "Meja Kerja Budi",
      hint: "Customer Service & Operasional",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 5. DEVISI KEUANGAN & AUDIT: SARI (Timur Tengah)
  createPrivateSuite(officeGroup, {
    name: "Sari",
    title: "📊 SARI • FINANCE, TAX & AUDIT",
    role: "Keuangan, Pembukuan, Payroll & Perpajakan",
    themeColor: 0x581c87,
    centerX: 11.0,
    centerZ: -3.5,
    width: 7.5,
    depth: 5.5,
    deskX: 11.0,
    deskZ: -4.8,
    deskRot: 0,
    doorwaySide: "west",
    deskConfig: {
      type: "financeDesk",
      name: "Meja Kerja Sari",
      hint: "Admin & Keuangan",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 6. DEVISI BARU: PRODUCT & PROJECT MANAGEMENT (Barat Bawah)
  createPrivateSuite(officeGroup, {
    name: "PMO",
    title: "🚀 PRODUCT & PROJECT MANAGEMENT",
    role: "Product Roadmap, Scrum & QA Management",
    themeColor: 0xb45309,
    centerX: -11.0,
    centerZ: 3.0,
    width: 7.5,
    depth: 5.5,
    deskX: -11.0,
    deskZ: 1.8,
    deskRot: 0,
    doorwaySide: "east",
    deskConfig: {
      type: "pmoDesk",
      name: "Meja Product Manager & QA",
      hint: "Klik untuk Cek Roadmap Produk & Sprint",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 7. DEVISI BARU: GROWTH MARKETING & MEDIA STUDIO (Timur Bawah)
  createPrivateSuite(officeGroup, {
    name: "Marketing",
    title: "📢 GROWTH MARKETING & MEDIA",
    role: "Digital Campaign, SEO, Media & Ads Studio",
    themeColor: 0x9f1239,
    centerX: 11.0,
    centerZ: 3.0,
    width: 7.5,
    depth: 5.5,
    deskX: 11.0,
    deskZ: 1.8,
    deskRot: 0,
    doorwaySide: "west",
    deskConfig: {
      type: "marketingDesk",
      name: "Meja Marketing & Content Media",
      hint: "Klik untuk Cek Kampanye Iklan & Leads Growth",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // 8. DEVISI BARU: CLOUD SERVER & NOC ROOM (Pusat Tengah)
  createPrivateSuite(officeGroup, {
    name: "Server",
    title: "🔒 CLOUD SERVER & CYBERSECURITY NOC",
    role: "Data Center, Cyber Security & Infrastructure",
    themeColor: 0x312e81,
    centerX: 0,
    centerZ: -3.0,
    width: 6.0,
    depth: 4.8,
    deskX: 0,
    deskZ: -4.0,
    deskRot: 0,
    doorwaySide: "south",
    deskConfig: {
      type: "serverDesk",
      name: "Terminal Konsol Server & NOC",
      hint: "Klik untuk Cek Status Server & Keamanan Jaringan",
    },
    deskMat,
    woodMat,
    screenMat,
    glassMat,
    plantLeafMat,
    plantPotMat,
  });

  // Server Racks inside NOC Room
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3 });
  const ledBlueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  [-1.8, 1.8].forEach((rx) => {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.8), rackMat);
    rack.position.set(rx, 1.1, -4.5);
    officeGroup.add(rack);

    for (let l = 0; l < 4; l++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.02), l % 2 === 0 ? ledBlueMat : ledGreenMat);
      led.position.set(rx, 0.5 + l * 0.45, -4.09);
      officeGroup.add(led);
    }
  });

  // =========================================================================
  // 9. GRAND LOUNGE & SOCIAL PANTRY HUB (Tenggara X: 4.5 to 14.5, Z: 7.2 to 14.5)
  // =========================================================================
  
  // Sofa 1 (Horizontal - Main)
  const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 1.3), sofaMat);
  sofa1.position.set(9.5, 0.35, 12.5);
  sofa1.userData = {
    isInteractive: true,
    interactType: "sofa",
    sitPos: { x: 9.5, z: 12.0 },
    label: "Sofa Santai Utama",
    hint: "Klik untuk Duduk Santai di Sofa Lounge"
  };
  officeGroup.add(sofa1);

  const sofa1Back = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 0.3), sofaMat);
  sofa1Back.position.set(9.5, 0.7, 13.25);
  officeGroup.add(sofa1Back);

  // Sofa 2 (Vertical - Corner)
  const sofa2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 3.6), sofaMat);
  sofa2.position.set(13.2, 0.35, 10.2);
  sofa2.userData = {
    isInteractive: true,
    interactType: "sofa",
    sitPos: { x: 12.5, z: 10.2 },
    label: "Sofa Santai Sudut",
    hint: "Klik untuk Duduk Santai di Sofa Lounge"
  };
  officeGroup.add(sofa2);

  const sofa2Back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 3.6), sofaMat);
  sofa2Back.position.set(13.95, 0.7, 10.2);
  officeGroup.add(sofa2Back);

  // Coffee Table in lounge
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.4), woodMat);
  coffeeTable.position.set(9.5, 0.25, 10.2);
  officeGroup.add(coffeeTable);

  // Pantry Bar Counter (Island Barista)
  const barCounter = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.1, 1.1), deskMat);
  barCounter.position.set(8.5, 0.55, 7.8);
  officeGroup.add(barCounter);

  // Coffee Machine (Interactive)
  const coffeeMachine = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0x330000 })
  );
  coffeeMachine.position.set(7.2, 1.45, 7.8);
  coffeeMachine.userData = {
    isInteractive: true,
    interactType: "coffeeMachine",
    label: "Mesin Espresso Kopi Barista",
    hint: "Klik untuk Seduh Kopi Segar"
  };
  officeGroup.add(coffeeMachine);

  // Water Dispenser (Interactive)
  const waterDispenser = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.7), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
  waterDispenser.position.set(10.2, 0.75, 7.8);
  waterDispenser.userData = {
    isInteractive: true,
    interactType: "waterDispenser",
    label: "Dispenser Air Minum Sehat",
    hint: "Klik untuk Ambil Air Minum Segar"
  };
  officeGroup.add(waterDispenser);

  const waterBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 12), glassMat);
  waterBottle.position.set(10.2, 1.75, 7.8);
  officeGroup.add(waterBottle);

  // 10. DECORATIVE PLANTS
  createPlant(officeGroup, -15.5, 0, -13.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 15.5, 0, -13.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, -15.5, 0, 13.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 15.5, 0, 13.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, -4.0, 0, 0, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 4.0, 0, 0, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 0, 0, 13.5, plantPotMat, plantLeafMat);

  // 11. CEILING LIGHT FIXTURES
  const lightBarGeo = new THREE.BoxGeometry(6, 0.1, 0.4);
  const lightBarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  [-10, 0, 10].forEach((lx) => {
    [-9, 0, 9].forEach((lz) => {
      const lb = new THREE.Mesh(lightBarGeo, lightBarMat);
      lb.position.set(lx, 3.5, lz);
      officeGroup.add(lb);
    });
  });

  scene.add(officeGroup);
  return officeGroup;
}

function createBlockyChair(parent, x, z, rotation, chairName = "Kursi Kerja") {
  const chairGroup = new THREE.Group();
  chairGroup.position.set(x, 0, z);
  chairGroup.rotation.y = rotation;

  const seatMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), seatMat);
  seat.position.y = 0.5;
  seat.userData = {
    isInteractive: true,
    interactType: "chair",
    sitPos: { x, z },
    label: chairName,
    hint: `Klik untuk Duduk di ${chairName}`
  };
  chairGroup.add(seat);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.1), seatMat);
  backrest.position.set(0, 0.8, -0.3);
  chairGroup.add(backrest);

  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  leg.position.y = 0.25;
  chairGroup.add(leg);

  parent.add(chairGroup);
}

// HELPER: MEMBUAT RUANG PRIBADI / PRIVATE SUITE TIAP KARYAWAN
function createPrivateSuite(parent, {
  name,
  role,
  title,
  themeColor,
  centerX,
  centerZ,
  width,
  depth,
  deskX,
  deskZ,
  deskRot = 0,
  doorwaySide = "south",
  deskConfig = null,
  deskMat,
  woodMat,
  screenMat,
  glassMat,
  plantLeafMat,
  plantPotMat,
}) {
  const suiteGroup = new THREE.Group();
  suiteGroup.position.set(centerX, 0, centerZ);

  // 1. Karpet Ruang Khusus Sesuai Warna Departemen
  const carpetMat = new THREE.MeshStandardMaterial({
    color: themeColor,
    roughness: 0.85,
  });
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.2, 0.02, depth - 0.2),
    carpetMat
  );
  carpet.position.set(0, 0.01, 0);
  carpet.receiveShadow = true;
  suiteGroup.add(carpet);

  // 2. Sekat Kaca Modern dengan Pintu Masuk Terbuka
  const halfW = width / 2;
  const halfD = depth / 2;
  const wallH = 2.4;
  const wallThick = 0.08;

  // Dinding Utara
  if (doorwaySide !== "north") {
    const northGlass = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, wallThick), glassMat);
    northGlass.position.set(0, wallH / 2, -halfD);
    suiteGroup.add(northGlass);
  } else {
    const segmentW = (width - 1.4) / 2;
    const gL = new THREE.Mesh(new THREE.BoxGeometry(segmentW, wallH, wallThick), glassMat);
    gL.position.set(-halfW + segmentW / 2, wallH / 2, -halfD);
    const gR = new THREE.Mesh(new THREE.BoxGeometry(segmentW, wallH, wallThick), glassMat);
    gR.position.set(halfW - segmentW / 2, wallH / 2, -halfD);
    suiteGroup.add(gL);
    suiteGroup.add(gR);
  }

  // Dinding Selatan
  if (doorwaySide !== "south") {
    const southGlass = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, wallThick), glassMat);
    southGlass.position.set(0, wallH / 2, halfD);
    suiteGroup.add(southGlass);
  } else {
    const segmentW = (width - 1.4) / 2;
    const gL = new THREE.Mesh(new THREE.BoxGeometry(segmentW, wallH, wallThick), glassMat);
    gL.position.set(-halfW + segmentW / 2, wallH / 2, halfD);
    const gR = new THREE.Mesh(new THREE.BoxGeometry(segmentW, wallH, wallThick), glassMat);
    gR.position.set(halfW - segmentW / 2, wallH / 2, halfD);
    suiteGroup.add(gL);
    suiteGroup.add(gR);
  }

  // Dinding Barat
  if (doorwaySide !== "west") {
    const westGlass = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, depth), glassMat);
    westGlass.position.set(-halfW, wallH / 2, 0);
    suiteGroup.add(westGlass);
  } else {
    const segmentD = (depth - 1.4) / 2;
    const gA = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, segmentD), glassMat);
    gA.position.set(-halfW, wallH / 2, -halfD + segmentD / 2);
    const gB = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, segmentD), glassMat);
    gB.position.set(-halfW, wallH / 2, halfD - segmentD / 2);
    suiteGroup.add(gA);
    suiteGroup.add(gB);
  }

  // Dinding Timur
  if (doorwaySide !== "east") {
    const eastGlass = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, depth), glassMat);
    eastGlass.position.set(halfW, wallH / 2, 0);
    suiteGroup.add(eastGlass);
  } else {
    const segmentD = (depth - 1.4) / 2;
    const gA = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, segmentD), glassMat);
    gA.position.set(halfW, wallH / 2, -halfD + segmentD / 2);
    const gB = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, segmentD), glassMat);
    gB.position.set(halfW, wallH / 2, halfD - segmentD / 2);
    suiteGroup.add(gA);
    suiteGroup.add(gB);
  }

  // 3. Meja Eksekutif Pribadi di dalam Ruang (Besar & Mewah: 2.2m x 1.1m)
  const deskRelX = deskX - centerX;
  const deskRelZ = deskZ - centerZ;

  const deskMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 1.1), woodMat);
  deskMesh.position.set(deskRelX, 0.375, deskRelZ);
  deskMesh.castShadow = true;
  deskMesh.receiveShadow = true;
  if (deskConfig) {
    deskMesh.userData = {
      isInteractive: true,
      interactType: deskConfig.type || "salesDesk",
      label: deskConfig.name || `Meja ${name}`,
      hint: deskConfig.hint || `Klik untuk interaksi dengan ${name}`,
    };
  }
  suiteGroup.add(deskMesh);

  // Dual Monitor & Keyboard di atas Meja menghadap langsung ke arah kursi
  createDualMonitor(suiteGroup, deskRelX, 0.75, deskRelZ, deskRot, screenMat, deskConfig);

  // Kursi Eksekutif Utama (Menghadap Meja & Komputer ke arah Utara)
  createBlockyChair(suiteGroup, deskRelX, deskRelZ + 0.75, Math.PI, `Kursi ${name}`);

  // Kursi Tamu / Klien di seberang meja
  createBlockyChair(suiteGroup, deskRelX, deskRelZ - 0.85, 0, `Kursi Tamu ${name}`);

  // Lemari Arsip / Rak Dokumen Eksekutif di dinding belakang
  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.4), cabinetMat);
  cabinet.position.set(deskRelX + 2.0, 0.7, -halfD + 0.3);
  suiteGroup.add(cabinet);

  // Tanaman Hias Sudut Ruangan
  createPlant(suiteGroup, halfW - 0.7, 0, -halfD + 0.7, plantPotMat, plantLeafMat);

  // 4. Papan Nama 3D Melayang di Atas Ruangan (3D Room Signboard)
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        if (ctx.roundRect) {
          ctx.roundRect(4, 4, 352, 82, 16);
        } else {
          ctx.fillRect(4, 4, 352, 82);
        }
        ctx.fill();

        ctx.strokeStyle = themeColor ? `#${themeColor.toString(16).padStart(6, "0")}` : "#06b6d4";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.font = "bold 19px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(title || name.toUpperCase(), 180, 32);

        ctx.font = "13px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(role || "Ruang Karyawan", 180, 60);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(0, 2.85, 0);
        sprite.scale.set(3.6, 0.9, 1);
        suiteGroup.add(sprite);
      }
    } catch (e) {
      console.error("Gagal buat sprite label ruang:", e);
    }
  }

  parent.add(suiteGroup);
}

function createDualMonitor(parent, x, y, z, rotY, screenMat, deskConfig = null) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotY;

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  // Monitor 1 (Main Screen - Menghadap Selatan ke Kursi +Z)
  const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.05), frameMat);
  monFrame.position.set(-0.45, 0.35, -0.12);
  monFrame.rotation.y = 0.08;
  if (deskConfig) {
    monFrame.userData = {
      isInteractive: true,
      interactType: deskConfig.type || "salesDesk",
      label: deskConfig.name || "Meja Sales & CRM",
      hint: deskConfig.hint || "Klik untuk Buka CRM & AI Sales Assistant",
    };
  }
  group.add(monFrame);

  const monScreen = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.46, 0.02), screenMat);
  monScreen.position.set(-0.45, 0.35, -0.09);
  monScreen.rotation.y = 0.08;
  if (deskConfig) {
    monScreen.userData = monFrame.userData;
  }
  group.add(monScreen);

  // Monitor 2 (Secondary Screen)
  const monFrame2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.05), frameMat);
  monFrame2.position.set(0.45, 0.35, -0.12);
  monFrame2.rotation.y = -0.08;
  group.add(monFrame2);

  const monScreen2 = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.46, 0.02), screenMat);
  monScreen2.position.set(0.45, 0.35, -0.09);
  monScreen2.rotation.y = -0.08;
  group.add(monScreen2);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.15), frameMat);
  stand.position.set(0, 0.15, -0.15);
  group.add(stand);

  // Mechanical Keyboard & Mousepad di depan layar (pada sisi +Z di depan pengguna)
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.22), frameMat);
  keyboard.position.set(-0.1, 0.02, 0.22);
  group.add(keyboard);

  const mouseMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.14), mouseMat);
  mouse.position.set(0.35, 0.02, 0.22);
  group.add(mouse);

  parent.add(group);
}

function createPlant(parent, x, y, z, potMat, leafMat) {
  const plant = new THREE.Group();
  plant.position.set(x, y, z);

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6, 8), potMat);
  pot.position.y = 0.3;
  plant.add(pot);

  // Blocky leaves
  const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), leafMat);
  leaf1.position.y = 0.8;
  plant.add(leaf1);

  const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), leafMat);
  leaf2.position.set(0.1, 1.1, 0);
  plant.add(leaf2);

  parent.add(plant);
}

/**
 * Creates a Roblox-style blocky avatar with animations & accessory
 */
export function createBlockyAvatar({
  name = "Player",
  color = "#3b82f6",
  hatColor = "#1e40af",
  isPlayer = false,
  status = "Available",
}) {
  const avatarGroup = new THREE.Group();
  avatarGroup.name = `avatar-${name}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffdbac, // natural blocky skin tone
    roughness: 0.5,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.4,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
  });

  const hatMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hatColor),
    roughness: 0.3,
  });

  // 1. TORSO (width 0.8, height 0.9, depth 0.45)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), shirtMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  avatarGroup.add(torso);

  // 2. HEAD (cube 0.6 x 0.6 x 0.6)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
  head.position.y = 1.78;
  head.castShadow = true;
  avatarGroup.add(head);

  // Face elements: Cute blocky eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.1, 0.02);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.14, 1.82, 0.28);
  avatarGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.14, 1.82, 0.28);
  avatarGroup.add(rightEye);

  // Smile
  const smileGeo = new THREE.BoxGeometry(0.16, 0.04, 0.02);
  const smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.position.set(0, 1.7, 0.28);
  avatarGroup.add(smile);

  // Headphone / Cool Cap
  const capGeo = new THREE.BoxGeometry(0.62, 0.15, 0.65);
  const cap = new THREE.Mesh(capGeo, hatMat);
  cap.position.set(0, 2.05, 0.03);
  avatarGroup.add(cap);

  // 3. ARMS
  const armGeo = new THREE.BoxGeometry(0.3, 0.85, 0.35);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.58, 1.45, 0);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.y = -0.4;
  leftArmPivot.add(leftArm);
  avatarGroup.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.58, 1.45, 0);
  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.y = -0.4;
  rightArmPivot.add(rightArm);
  avatarGroup.add(rightArmPivot);

  // 4. LEGS
  const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.4);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.22, 0.9, 0);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.y = -0.45;
  leftLegPivot.add(leftLeg);
  avatarGroup.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.22, 0.9, 0);
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.y = -0.45;
  rightLegPivot.add(rightLeg);
  avatarGroup.add(rightLegPivot);

  // 5. DYNAMIC OVERHEAD NAMETAG & STATUS SPRITE (Canvas Texture)
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const nametagTexture = new THREE.CanvasTexture(canvas);
  nametagTexture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: nametagTexture, transparent: true });
  const overheadSprite = new THREE.Sprite(spriteMat);
  overheadSprite.position.set(0, 2.9, 0);
  overheadSprite.scale.set(3.2, 1.6, 1);
  avatarGroup.add(overheadSprite);

  // Fungsi helper untuk me-render teks nametag, status, dan bubble chat
  const updateOverheadDisplay = (currentName, currentStatus, speechBubble = null) => {
    ctx.clearRect(0, 0, 512, 256);

    // Jika ada bubble chat aktif
    if (speechBubble) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      
      // Rounded bubble box
      const bx = 30, by = 15, bw = 452, bh = 100, br = 16;
      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + bw - br, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
      ctx.lineTo(bx + bw, by + bh - br);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
      // Bubble tail
      ctx.lineTo(256 + 15, by + bh);
      ctx.lineTo(256, by + bh + 16);
      ctx.lineTo(256 - 15, by + bh);
      ctx.lineTo(bx + br, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
      ctx.lineTo(bx, by + br);
      ctx.quadraticCurveTo(bx, by, bx + br, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bubble text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      
      // Word wrap simple
      const words = speechBubble.split(" ");
      let line = "";
      let lines = [];
      for (let w of words) {
        if ((line + w).length > 28) {
          lines.push(line);
          line = w + " ";
        } else {
          line += w + " ";
        }
      }
      lines.push(line);

      if (lines.length === 1) {
        ctx.fillText(lines[0], 256, 70);
      } else {
        ctx.fillText(lines[0], 256, 55);
        ctx.fillText(lines[1] || "", 256, 85);
      }
    }

    // Badge Nama & Status di bawah
    const ny = speechBubble ? 165 : 130;

    // Background pill nama
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(100, ny, 312, 70, 16);
    ctx.fill();

    // Border pill
    ctx.strokeStyle = isPlayer ? "#06b6d4" : "rgba(100, 116, 139, 0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Nama
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(currentName, 256, ny + 32);

    // Status Label
    ctx.font = "600 18px system-ui, sans-serif";
    if (currentStatus && (currentStatus.includes("Bekerja") || currentStatus.includes("Coding") || currentStatus.includes("Desain"))) {
      ctx.fillStyle = "#38bdf8"; // cyan
    } else if (currentStatus && (currentStatus.includes("Meeting") || currentStatus.includes("Rapat"))) {
      ctx.fillStyle = "#fbbf24"; // amber
    } else if (currentStatus && (currentStatus.includes("Makan") || currentStatus.includes("Kopi") || currentStatus.includes("Istirahat"))) {
      ctx.fillStyle = "#34d399"; // emerald
    } else if (currentStatus && (currentStatus.includes("Pulang") || currentStatus.includes("Tidur"))) {
      ctx.fillStyle = "#94a3b8"; // slate
    } else {
      ctx.fillStyle = "#a78bfa"; // purple
    }
    ctx.fillText(currentStatus || "Aktif", 256, ny + 58);

    nametagTexture.needsUpdate = true;
  };

  // Render awal
  updateOverheadDisplay(name, status || "Aktif");

  // Reference for animation & updates
  avatarGroup.userData = {
    name,
    isPlayer,
    status,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    torso,
    shirtMat,
    hatMat,
    stepCycle: 0,
    action: "idle",
    updateOverheadDisplay,
  };

  return avatarGroup;
}

