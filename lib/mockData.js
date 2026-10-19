// Profil Resmi Perusahaan & Arsip Pendirian
export const COMPANY_PROFILE = {
  name: "PT Ekalaya Inovasi Digital (Ekalaya Tech HQ)",
  foundedDate: "19 Oktober 2026",
  owner: "Raja (Founder & CEO)",
  description: "Perusahaan pengembang Virtual Office 3D & Solusi Kolaborasi Interaktif Generasi Baru.",
  location: "Metaverse HQ - Virtual Office Floor 1",
  status: "Operasional Penuh (Live & Active)",
};

// Data mock untuk simulasi multiplayer, arsip karyawan, dan workspace
export const INITIAL_BOTS = [
  {
    id: "bot-1",
    name: "Rani (Lead Product)",
    role: "Admin",
    status: "Busy", // "Available" | "Busy" | "Away"
    color: "#ec4899", // pink
    hatColor: "#f43f5e",
    position: { x: 4.5, y: 0, z: -4 },
    rotation: Math.PI,
    action: "typing", // "idle" | "walking" | "sitting" | "waving"
    avatarStyle: "casual",
    task: "Meninjau roadmap Q4",
    joinedDate: "19 Oktober 2026, 08:00 WIB",
    employeeId: "EKA-001",
    department: "Product Management",
  },
  {
    id: "bot-2",
    name: "Budi (Backend Dev)",
    role: "Member",
    status: "Available",
    color: "#3b82f6", // blue
    hatColor: "#1d4ed8",
    position: { x: -4.5, y: 0, z: -4 },
    rotation: 0,
    action: "idle",
    avatarStyle: "hoodie",
    task: "Debugging Colyseus server",
    joinedDate: "19 Oktober 2026, 08:30 WIB",
    employeeId: "EKA-002",
    department: "Engineering",
  },
  {
    id: "bot-3",
    name: "Siti (UI/UX Designer)",
    role: "Member",
    status: "Available",
    color: "#8b5cf6", // purple
    hatColor: "#7c3aed",
    position: { x: -6, y: 0, z: 5 },
    rotation: Math.PI / 2,
    action: "sitting",
    avatarStyle: "business",
    task: "Kopi santai di Lounge Pantry",
    joinedDate: "19 Oktober 2026, 09:00 WIB",
    employeeId: "EKA-003",
    department: "Creative & Design",
  },
  {
    id: "bot-4",
    name: "Dimas (DevOps)",
    role: "Member",
    status: "Away",
    color: "#10b981", // green
    hatColor: "#059669",
    position: { x: 6, y: 0, z: 6 },
    rotation: -Math.PI / 3,
    action: "sitting",
    avatarStyle: "casual",
    task: "Istirahat makan siang",
    joinedDate: "19 Oktober 2026, 09:15 WIB",
    employeeId: "EKA-004",
    department: "Infrastructure & Security",
  },
];

export const OFFICE_ZONES = [
  {
    id: "work-station-1",
    name: "Engineering Bay",
    bounds: { minX: -8, maxX: -1, minZ: -8, maxZ: -1 },
    color: "#3b82f6",
    description: "Area kerja fokus tim teknik & developer.",
  },
  {
    id: "work-station-2",
    name: "Product & Design Bay",
    bounds: { minX: 1, maxX: 8, minZ: -8, maxZ: -1 },
    color: "#ec4899",
    description: "Area kerja fokus product manager & desainer.",
  },
  {
    id: "meeting-room",
    name: "Executive Meeting Room",
    bounds: { minX: -8, maxX: -1, minZ: 2, maxZ: 8 },
    color: "#eab308",
    description: "Ruang rapat privat dengan proyektor & meja bundar.",
  },
  {
    id: "lounge-pantry",
    name: "Relax & Coffee Lounge",
    bounds: { minX: 1, maxX: 8, minZ: 2, maxZ: 8 },
    color: "#10b981",
    description: "Area santai sofa, dispenser kopi, dan interaksi bebas.",
  },
];

export const AVATAR_COLORS = [
  { name: "Cyan Tech", hex: "#06b6d4" },
  { name: "Emerald Pro", hex: "#10b981" },
  { name: "Royal Blue", hex: "#3b82f6" },
  { name: "Violet Creative", hex: "#8b5cf6" },
  { name: "Rose Passion", hex: "#f43f5e" },
  { name: "Amber Energetic", hex: "#f59e0b" },
];
