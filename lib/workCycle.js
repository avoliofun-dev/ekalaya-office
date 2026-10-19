// ALGORITMA SISTEM KECERDASAN KEGIATAN KARYAWAN (Autonomous Employee Behavior Engine)
// Menggunakan finite-state machine (FSM) probabilistik dan navigasi cerdas
// untuk menghasilkan jadwal aksi tak terbatas, dinamis, dan sangat realistis bagi 4 karyawan.

// 1. Peta Titik-Titik Lokasi (Waypoints) di Seluruh Kantor 3D
export const OFFICE_WAYPOINTS = {
  // Meja Kerja Rani (Lead Product)
  RANI_DESK: { x: 4.5, z: -4.0, rot: Math.PI, zone: "Product & Design Bay", defaultAction: "typing" },
  // Meja Kerja Budi (Backend Dev)
  BUDI_DESK: { x: -4.5, z: -4.0, rot: 0, zone: "Engineering Bay", defaultAction: "typing" },
  // Meja Kerja Siti (UI/UX Designer)
  SITI_DESK: { x: 5.5, z: -6.0, rot: Math.PI, zone: "Product & Design Bay", defaultAction: "typing" },
  // Meja Kerja Dimas (DevOps)
  DIMAS_DESK: { x: -5.5, z: -6.0, rot: 0, zone: "Engineering Bay", defaultAction: "typing" },

  // Executive Meeting Room (Sekitar Meja Bundar Rapat)
  MEETING_CHAIR_NORTH: { x: -5.0, z: 3.2, rot: 0, zone: "Executive Meeting Room", defaultAction: "sitting" },
  MEETING_CHAIR_SOUTH: { x: -5.0, z: 6.8, rot: Math.PI, zone: "Executive Meeting Room", defaultAction: "sitting" },
  MEETING_CHAIR_WEST: { x: -6.8, z: 5.0, rot: Math.PI / 2, zone: "Executive Meeting Room", defaultAction: "sitting" },
  MEETING_CHAIR_EAST: { x: -3.2, z: 5.0, rot: -Math.PI / 2, zone: "Executive Meeting Room", defaultAction: "sitting" },
  MEETING_WHITEBOARD: { x: -9.5, z: 5.0, rot: Math.PI / 2, zone: "Executive Meeting Room", defaultAction: "waving" },

  // Relax & Coffee Lounge Pantry
  PANTRY_COFFEE_MACHINE: { x: 4.2, z: 2.2, rot: Math.PI, zone: "Relax & Coffee Lounge", defaultAction: "idle" },
  PANTRY_WATER_DISPENSER: { x: 7.8, z: 2.2, rot: Math.PI, zone: "Relax & Coffee Lounge", defaultAction: "idle" },
  SOFA_MAIN: { x: 5.5, z: 7.2, rot: 0, zone: "Relax & Coffee Lounge", defaultAction: "sitting" },
  SOFA_CORNER: { x: 7.8, z: 5.5, rot: -Math.PI / 2, zone: "Relax & Coffee Lounge", defaultAction: "sitting" },
  LOUNGE_OPEN_STAGE: { x: 6.0, z: 4.5, rot: 0, zone: "Relax & Coffee Lounge", defaultAction: "dance" },

  // Koridor & Lobi Kantor
  LOBBY_CENTER: { x: 0, z: 3.0, rot: 0, zone: "Lobi Kantor", defaultAction: "idle" },
  LOBBY_ENTRANCE: { x: 0, z: 7.0, rot: Math.PI, zone: "Lobi Kantor", defaultAction: "waving" },
};

// 2. Daftar Rutinitas Makro (Siklus Global)
export const MACRO_CYCLES = [
  {
    phaseId: "pagi_fokus",
    title: "Sesi Pagi: Deep Work & Sprint Coding",
    icon: "💻",
    description: "Semua tim berada di workstation masing-masing mengerjakan task sprint utama.",
    durationSeconds: 40,
    assignments: {
      "bot-1": { waypoint: OFFICE_WAYPOINTS.RANI_DESK, action: "typing", status: "Busy", task: "Review Roadmap Q4 & PRD Backlog", chat: "Fokus sprint pagi ini, target selesai tepat waktu ya tim." },
      "bot-2": { waypoint: OFFICE_WAYPOINTS.BUDI_DESK, action: "typing", status: "Busy", task: "Optimasi Query Database & API Gateway", chat: "Staging server stabil, respons time tembus < 15ms." },
      "bot-3": { waypoint: OFFICE_WAYPOINTS.SITI_DESK, action: "typing", status: "Busy", task: "Finalisasi Figma Prototype & 3D Icons", chat: "Desain UI dark mode sudah siap di-inspect frontend." },
      "bot-4": { waypoint: OFFICE_WAYPOINTS.DIMAS_DESK, action: "typing", status: "Busy", task: "Deploy Docker Container ke K8s Cluster", chat: "Cluster load balancing berjalan lancar tanpa kendala." },
    },
  },
  {
    phaseId: "standup_meeting",
    title: "Sesi Rapat: Daily Standup di Executive Room",
    icon: "📊",
    description: "Seluruh tim berkumpul di Executive Meeting Room untuk sinkronisasi progress dan demo layar.",
    durationSeconds: 40,
    assignments: {
      "bot-1": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_NORTH, action: "sitting", status: "Busy", task: "Memimpin Daily Standup Meeting", chat: "Yuk mulai standup harian, apa saja blocker kalian kemarin?" },
      "bot-2": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_WEST, action: "sitting", status: "Busy", task: "Presentasi Latency WebSocket", chat: "Integrasi multiplayer berjalan lancar tanpa lag." },
      "bot-3": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_EAST, action: "sitting", status: "Busy", task: "Demo Alur Pengguna Baru", chat: "Conversion rate uji coba naik 28% minggu ini." },
      "bot-4": { waypoint: OFFICE_WAYPOINTS.MEETING_WHITEBOARD, action: "waving", status: "Busy", task: "Menjelaskan Arsitektur Cloud di Layar", chat: "Trafik server siap melonjak untuk peluncuran sore nanti." },
    },
  },
  {
    phaseId: "istirahat_pantry",
    title: "Sesi Istirahat: Coffee & Refreshment Break",
    icon: "☕",
    description: "Tim santai di Sofa Pantry, menikmati kopi barista, ngobrol ringan atau berjoget santai.",
    durationSeconds: 40,
    assignments: {
      "bot-1": { waypoint: OFFICE_WAYPOINTS.SOFA_MAIN, action: "sitting", status: "Available", task: "Ngopi santai di Sofa Lounge", chat: "Segar banget kopinya, istirahat sejenak recharge energi ☕" },
      "bot-2": { waypoint: OFFICE_WAYPOINTS.PANTRY_COFFEE_MACHINE, action: "idle", status: "Available", task: "Menyeduh Espresso di Bar Pantry", chat: "Kopi fresh baru diseduh, siapa mau ikutan?" },
      "bot-3": { waypoint: OFFICE_WAYPOINTS.SOFA_CORNER, action: "sitting", status: "Available", task: "Mengobrol santai & baca tips desain", chat: "Pantry kantor kita nyaman banget, pencahayaannya adem." },
      "bot-4": { waypoint: OFFICE_WAYPOINTS.LOUNGE_OPEN_STAGE, action: "dance", status: "Available", task: "Peregangan otot & musik santai", chat: "Peregangan dulu kawan-kawan biar tetap bugar! 💃🕺" },
    },
  },
  {
    phaseId: "kolaborasi_silang",
    title: "Sesi Kolaborasi: Pair Review & Cross-Check",
    icon: "🤝",
    description: "Developer & Designer berpasangan cross-checking fitur sebelum rilis sore hari.",
    durationSeconds: 40,
    assignments: {
      "bot-1": { waypoint: OFFICE_WAYPOINTS.LOBBY_CENTER, action: "waving", status: "Available", task: "Koordinasi evaluasi sprint harian", chat: "Progress hari ini luar biasa, kerja bagus tim! 👋" },
      "bot-2": { waypoint: OFFICE_WAYPOINTS.BUDI_DESK, action: "typing", status: "Busy", task: "Cross-review kode dengan tim desainer", chat: "Semua linting clean, kode siap dimerge ke main branch." },
      "bot-3": { waypoint: { x: -3.5, z: -4.0, rot: -Math.PI / 4 }, action: "cheer", status: "Busy", task: "Cek visual polish di meja Budi", chat: "Keren banget hasilnya, animasi transisinya sangat presisi! 🎉" },
      "bot-4": { waypoint: { x: 5.5, z: -4.0, rot: Math.PI / 4 }, action: "typing", status: "Available", task: "Sinkronisasi security credentials", chat: "Semua SSL cert & token terverifikasi aman." },
    },
  },
  {
    phaseId: "evaluasi_sore",
    title: "Sesi Evaluasi & Sharing Tech",
    icon: "💡",
    description: "Sesi berbagi wawasan teknologi baru dan apresiasi pencapaian tim hari ini.",
    durationSeconds: 40,
    assignments: {
      "bot-1": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_NORTH, action: "cheer", status: "Available", task: "Memberi apresiasi milestone minggu ini", chat: "Terima kasih untuk kerja keras hari ini semuanya! 🎉" },
      "bot-2": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_SOUTH, action: "sitting", status: "Available", task: "Sharing arsitektur micro-frontend", chat: "Next sprint kita bisa adaptasi Three.js WebGPU." },
      "bot-3": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_WEST, action: "sitting", status: "Available", task: "Review feedback user testing", chat: "Respon klien sangat positif dengan tampilan baru." },
      "bot-4": { waypoint: OFFICE_WAYPOINTS.MEETING_CHAIR_EAST, action: "sitting", status: "Available", task: "Audit performa server & uptime", chat: "Uptime 100% tanpa downtime sedikit pun 🚀" },
    },
  },
];

// Helper: Menghasilkan format jadwal lengkap untuk Three.js
export function generateScheduleFromPhase(macroPhase) {
  const botsConfig = {};
  Object.entries(macroPhase.assignments).forEach(([botId, assign]) => {
    botsConfig[botId] = {
      position: { x: assign.waypoint.x, y: 0, z: assign.waypoint.z },
      rotation: assign.waypoint.rot,
      action: assign.action,
      status: assign.status,
      task: assign.task,
      chat: assign.chat,
    };
  });

  return {
    phaseId: macroPhase.phaseId,
    title: macroPhase.title,
    icon: macroPhase.icon,
    description: macroPhase.description,
    durationSeconds: macroPhase.durationSeconds || 40,
    bots: botsConfig,
  };
}

export const WORK_CYCLE_SCHEDULE = MACRO_CYCLES.map(generateScheduleFromPhase);
