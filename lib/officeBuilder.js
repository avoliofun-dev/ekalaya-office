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

  // 1. FLOOR (22x22 meters)
  const floorGeo = new THREE.BoxGeometry(22, 0.4, 22);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.2;
  floorMesh.receiveShadow = true;
  officeGroup.add(floorMesh);

  // Subtle floor grid carpet accents
  const carpet1Geo = new THREE.BoxGeometry(9, 0.02, 8);
  const carpetEngMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.9 });
  const carpetEng = new THREE.Mesh(carpet1Geo, carpetEngMat);
  carpetEng.position.set(-4.5, 0.01, -4.5);
  carpetEng.receiveShadow = true;
  officeGroup.add(carpetEng);

  const carpetProductMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.9 });
  const carpetProd = new THREE.Mesh(carpet1Geo, carpetProductMat);
  carpetProd.position.set(4.5, 0.01, -4.5);
  carpetProd.receiveShadow = true;
  officeGroup.add(carpetProd);

  const carpetLoungeMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
  const carpetLounge = new THREE.Mesh(carpet1Geo, carpetLoungeMat);
  carpetLounge.position.set(4.5, 0.01, 4.5);
  carpetLounge.receiveShadow = true;
  officeGroup.add(carpetLounge);

  const carpetMeetingMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });
  const carpetMeet = new THREE.Mesh(carpet1Geo, carpetMeetingMat);
  carpetMeet.position.set(-4.5, 0.01, 4.5);
  carpetMeet.receiveShadow = true;
  officeGroup.add(carpetMeet);

  // 2. WALLS & BORDERS
  const wallHeight = 3.5;
  const wallThickness = 0.5;

  // North wall (Z = -11)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(22, wallHeight, wallThickness), wallMat);
  northWall.position.set(0, wallHeight / 2, -11);
  officeGroup.add(northWall);

  // South wall (Z = 11) - low wall with entrance
  const southWallL = new THREE.Mesh(new THREE.BoxGeometry(8, wallHeight, wallThickness), wallMat);
  southWallL.position.set(-7, wallHeight / 2, 11);
  officeGroup.add(southWallL);

  const southWallR = new THREE.Mesh(new THREE.BoxGeometry(8, wallHeight, wallThickness), wallMat);
  southWallR.position.set(7, wallHeight / 2, 11);
  officeGroup.add(southWallR);

  // West wall (X = -11)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 22), wallMat);
  westWall.position.set(-11, wallHeight / 2, 0);
  officeGroup.add(westWall);

  // East wall (X = 11)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 22), wallMat);
  eastWall.position.set(11, wallHeight / 2, 0);
  officeGroup.add(eastWall);

  // 3. MEETING ROOM GLASS PARTITIONS (X: -9 to 0, Z: 0.5 to 9)
  const glassDividerX = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.8, 0.1), glassMat);
  glassDividerX.position.set(-4.75, 1.4, 0.5);
  officeGroup.add(glassDividerX);

  const glassDividerZ = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 6.5), glassMat);
  glassDividerZ.position.set(-0.5, 1.4, 4.25);
  officeGroup.add(glassDividerZ);

  // Meeting Room Big Conference Table
  const meetTableGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.15, 32);
  const meetTable = new THREE.Mesh(meetTableGeo, woodMat);
  meetTable.position.set(-5, 0.85, 5);
  meetTable.castShadow = true;
  meetTable.receiveShadow = true;
  meetTable.userData = {
    isInteractive: true,
    interactType: "adminConsole",
    label: "Meja Eksekutif & Konsol Admin",
    hint: "Klik untuk Buka Platform Admin Console",
  };
  officeGroup.add(meetTable);

  const meetLegGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.85, 16);
  const meetLeg = new THREE.Mesh(meetLegGeo, deskMat);
  meetLeg.position.set(-5, 0.425, 5);
  officeGroup.add(meetLeg);

  // Conference Screen / Whiteboard (Interactive)
  const confScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.0, 3.5), deskMat);
  confScreenFrame.position.set(-10.7, 2.0, 5);
  officeGroup.add(confScreenFrame);

  const confScreen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 3.3), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
  confScreen.position.set(-10.55, 2.0, 5);
  confScreen.userData = {
    isInteractive: true,
    interactType: "whiteboard",
    label: "Layar Proyektor Rapat",
    hint: "Klik untuk Buka Catatan Rapat / Whiteboard"
  };
  officeGroup.add(confScreen);

  // Conference Chairs around table
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const chairX = -5 + Math.cos(angle) * 3.2;
    const chairZ = 5 + Math.sin(angle) * 3.2;
    createBlockyChair(officeGroup, chairX, chairZ, angle + Math.PI, "Kursi Rapat");
  }

  // 4. DESK CLUSTERS (Sales & CRM Department at -5, -5)
  createDeskCluster(officeGroup, -5, -5, deskMat, screenMat, {
    type: "salesDesk",
    name: "Meja Sales & CRM",
    hint: "Klik untuk Buka CRM & AI Sales Assistant",
  });

  // 5. DESK CLUSTERS (Operations & Customer Service Bay at 5, -5)
  createDeskCluster(officeGroup, 5, -5, deskMat, screenMat, {
    type: "salesDesk",
    name: "Meja Operasional & CS",
    hint: "Klik untuk Buka CRM & AI Sales Assistant",
  });

  // 6. LOUNGE & PANTRY AREA (X: 1 to 9, Z: 1 to 9)
  // Large L-Sofa (Interactive)
  const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.2), sofaMat);
  sofa1.position.set(5.5, 0.35, 7.5);
  sofa1.userData = {
    isInteractive: true,
    interactType: "sofa",
    sitPos: { x: 5.5, z: 7.2 },
    label: "Sofa Santai",
    hint: "Klik untuk Duduk Santai di Sofa"
  };
  officeGroup.add(sofa1);

  const sofa1Back = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 0.3), sofaMat);
  sofa1Back.position.set(5.5, 0.7, 8.2);
  officeGroup.add(sofa1Back);

  const sofa2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 3.0), sofaMat);
  sofa2.position.set(8.2, 0.35, 5.5);
  sofa2.userData = {
    isInteractive: true,
    interactType: "sofa",
    sitPos: { x: 7.9, z: 5.5 },
    label: "Sofa Santai",
    hint: "Klik untuk Duduk Santai di Sofa"
  };
  officeGroup.add(sofa2);

  // Coffee Table in lounge
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 1.2), woodMat);
  coffeeTable.position.set(5.5, 0.25, 5.5);
  officeGroup.add(coffeeTable);

  // Pantry Bar Counter
  const barCounter = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.1, 0.9), deskMat);
  barCounter.position.set(5.0, 0.55, 1.5);
  officeGroup.add(barCounter);

  // Coffee Machine (Blocky - Interactive)
  const coffeeMachine = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0x330000 })
  );
  coffeeMachine.position.set(4.0, 1.4, 1.5);
  coffeeMachine.userData = {
    isInteractive: true,
    interactType: "coffeeMachine",
    label: "Mesin Espresso Kopi",
    hint: "Klik untuk Seduh Kopi Segar"
  };
  officeGroup.add(coffeeMachine);

  // Water Dispenser (Interactive)
  const waterDispenser = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
  waterDispenser.position.set(8.0, 0.7, 1.5);
  waterDispenser.userData = {
    isInteractive: true,
    interactType: "waterDispenser",
    label: "Dispenser Air Minum",
    hint: "Klik untuk Ambil Air Minum Segar"
  };
  officeGroup.add(waterDispenser);

  const waterBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12), glassMat);
  waterBottle.position.set(8.0, 1.6, 1.5);
  officeGroup.add(waterBottle);

  // 7. DECORATIVE PLANTS (Blocky Minecraft/Roblox styled plants)
  createPlant(officeGroup, -9.5, 0, -9.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 9.5, 0, -9.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 9.5, 0, 9.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, -9.5, 0, 0.5, plantPotMat, plantLeafMat);
  createPlant(officeGroup, 0, 0, -10, plantPotMat, plantLeafMat);

  // 8. CEILING LIGHT FIXTURES (Subtle glowing bars)
  const lightBarGeo = new THREE.BoxGeometry(5, 0.1, 0.4);
  const lightBarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const lb1 = new THREE.Mesh(lightBarGeo, lightBarMat);
  lb1.position.set(-5, 3.4, -5);
  officeGroup.add(lb1);

  const lb2 = new THREE.Mesh(lightBarGeo, lightBarMat);
  lb2.position.set(5, 3.4, -5);
  officeGroup.add(lb2);

  const lb3 = new THREE.Mesh(lightBarGeo, lightBarMat);
  lb3.position.set(-5, 3.4, 5);
  officeGroup.add(lb3);

  const lb4 = new THREE.Mesh(lightBarGeo, lightBarMat);
  lb4.position.set(5, 3.4, 5);
  officeGroup.add(lb4);

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

function createDeskCluster(parent, centerX, centerZ, deskMat, screenMat, deskConfig = null) {
  const cluster = new THREE.Group();
  cluster.position.set(centerX, 0, centerZ);

  // Double Desk
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.8), deskMat);
  deskTop.position.y = 0.85;
  deskTop.castShadow = true;
  if (deskConfig) {
    deskTop.userData = {
      isInteractive: true,
      interactType: deskConfig.type || "salesDesk",
      label: deskConfig.name || "Meja Sales & CRM",
      hint: deskConfig.hint || "Klik untuk Buka CRM & AI Sales Assistant",
    };
  }
  cluster.add(deskTop);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.1, 0.85, 1.7);
  const leg1 = new THREE.Mesh(legGeo, deskMat);
  leg1.position.set(-1.7, 0.425, 0);
  cluster.add(leg1);

  const leg2 = new THREE.Mesh(legGeo, deskMat);
  leg2.position.set(1.7, 0.425, 0);
  cluster.add(leg2);

  // Desk Partition / Screen divider
  const divider = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
  divider.position.set(0, 1.05, 0);
  cluster.add(divider);

  // 2 Dual Monitor setups (facing opposite sides)
  createDualMonitor(cluster, -0.9, 0.9, -0.4, 0, screenMat, deskConfig);
  createDualMonitor(cluster, 0.9, 0.9, -0.4, 0, screenMat, deskConfig);
  createDualMonitor(cluster, -0.9, 0.9, 0.4, Math.PI, screenMat, deskConfig);
  createDualMonitor(cluster, 0.9, 0.9, 0.4, Math.PI, screenMat, deskConfig);

  // Floating Overhead 3D Badge on Sales Desk
  if (deskConfig && deskConfig.type === "salesDesk" && typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        if (ctx.roundRect) {
          ctx.roundRect(4, 4, 248, 56, 12);
        } else {
          ctx.fillRect(4, 4, 248, 56);
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#38bdf8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(deskConfig.name ? `💼 ${deskConfig.name}` : "💼 MEJA SALES & CRM", 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(0, 2.2, 0);
        sprite.scale.set(2.4, 0.6, 1);
        cluster.add(sprite);
      }
    } catch (e) {
      console.error("Gagal buat sprite label meja:", e);
    }
  }

  // Office Chairs
  createBlockyChair(cluster, -0.9, -1.2, 0);
  createBlockyChair(cluster, 0.9, -1.2, 0);
  createBlockyChair(cluster, -0.9, 1.2, Math.PI);
  createBlockyChair(cluster, 0.9, 1.2, Math.PI);

  parent.add(cluster);
}

function createDualMonitor(parent, x, y, z, rotY, screenMat, deskConfig = null) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotY;

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  // Monitor 1
  const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), frameMat);
  monFrame.position.set(0, 0.35, 0);
  if (deskConfig) {
    monFrame.userData = {
      isInteractive: true,
      interactType: deskConfig.type || "salesDesk",
      label: deskConfig.name || "Meja Sales & CRM",
      hint: deskConfig.hint || "Klik untuk Buka CRM & AI Sales Assistant",
    };
  }
  group.add(monFrame);

  const monScreen = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.44, 0.02), screenMat);
  monScreen.position.set(0, 0.35, 0.025);
  if (deskConfig) {
    monScreen.userData = monFrame.userData;
  }
  group.add(monScreen);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), frameMat);
  stand.position.set(0, 0.15, 0);
  group.add(stand);

  // Laptop / Keyboard
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.25), frameMat);
  keyboard.position.set(0, 0.02, 0.35);
  group.add(keyboard);

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

