// Sistem Siklus Kegiatan Kerja Otomatis (Office Daily Work Cycle)
// Menyediakan rutinitas harian real-time untuk 4 pegawai bot:
// 1. Rani (Lead Product)
// 2. Budi (Backend Dev)
// 3. Siti (UI/UX Designer)
// 4. Dimas (DevOps)

export const WORK_CYCLE_SCHEDULE = [
  {
    phaseId: "pagi_fokus",
    title: "Sesi Pagi: Deep Work & Sprint Coding",
    icon: "💻",
    description: "Semua tim berada di workstation masing-masing mengerjakan task sprint utama.",
    durationSeconds: 45, // Otomatis berputar setiap 45 detik untuk demo dinamis (atau bisa diset manual)
    bots: {
      "bot-1": {
        position: { x: 4.5, y: 0, z: -4 },
        rotation: Math.PI,
        action: "typing",
        status: "Busy",
        task: "Meninjau PRD & Sprint Roadmap Q4",
        chat: "Lagi review PRD sprint minggu ini di workstation ya tim 👍",
      },
      "bot-2": {
        position: { x: -4.5, y: 0, z: -4 },
        rotation: 0,
        action: "typing",
        status: "Busy",
        task: "Coding WebSocket handler & Colyseus engine",
        chat: "Push update API backend ke staging selesai, lagi optimasi latency.",
      },
      "bot-3": {
        position: { x: 5.5, y: 0, z: -6 },
        rotation: Math.PI,
        action: "typing",
        status: "Busy",
        task: "Design Figma UI Design System v2.0",
        chat: "Desain komponen 3D hud baru sudah di-upload ke Figma ya.",
      },
      "bot-4": {
        position: { x: -5.5, y: 0, z: -6 },
        rotation: 0,
        action: "typing",
        status: "Busy",
        task: "Monitor Kubernetes cluster & CI/CD",
        chat: "Pipeline CI/CD aman, semua service green checklist ✅",
      },
    },
  },
  {
    phaseId: "standup_meeting",
    title: "Sesi Rapat: Daily Standup di Executive Room",
    icon: "📊",
    description: "Seluruh tim berkumpul di Executive Meeting Room untuk sinkronisasi progress dan demo layar.",
    durationSeconds: 45,
    bots: {
      "bot-1": {
        position: { x: -5.0, y: 0, z: 3.2 }, // Sekitar meja bundar meeting room
        rotation: 0,
        action: "sitting",
        status: "Busy",
        task: "Memimpin Daily Standup di Meeting Room",
        chat: "Halo semuanya, yuk kumpul di Meeting Room untuk cek target hari ini!",
      },
      "bot-2": {
        position: { x: -6.8, y: 0, z: 5.0 },
        rotation: Math.PI / 2,
        action: "sitting",
        status: "Busy",
        task: "Presentasi arsitektur microservices",
        chat: "Saya siapkan diagram proyektor untuk arsitektur multi-tenant.",
      },
      "bot-3": {
        position: { x: -3.2, y: 0, z: 5.0 },
        rotation: -Math.PI / 2,
        action: "sitting",
        status: "Busy",
        task: "Diskusi review UX dengan Lead Product",
        chat: "Feedback user testing kemarin menunjukkan kepuasan naik 35%!",
      },
      "bot-4": {
        position: { x: -5.0, y: 0, z: 6.8 },
        rotation: Math.PI,
        action: "sitting",
        status: "Busy",
        task: "Laporan uptime 99.98% cloud deployment",
        chat: "Server siap menghadapi traffic rilis baru jam 18:00 nanti.",
      },
    },
  },
  {
    phaseId: "istirahat_pantry",
    title: "Sesi Istirahat: Coffee & Refreshment Break",
    icon: "☕",
    description: "Tim santai di Sofa Pantry, menikmati kopi barista, ngobrol ringan atau berjoget santai.",
    durationSeconds: 45,
    bots: {
      "bot-1": {
        position: { x: 5.5, y: 0, z: 7.2 }, // Di sofa L
        rotation: 0,
        action: "sitting",
        status: "Available",
        task: "Ngopi santai di Sofa Lounge",
        chat: "Waktunya rehat sejenak, kopinya mantap! ☕",
      },
      "bot-2": {
        position: { x: 4.2, y: 0, z: 2.2 }, // Dekat coffee machine
        rotation: Math.PI,
        action: "idle",
        status: "Available",
        task: "Menyeduh espresso di pantry bar",
        chat: "Ada yang mau dibuatkan Americano atau Cappuccino? ☕",
      },
      "bot-3": {
        position: { x: 7.8, y: 0, z: 5.5 }, // Di sisi sofa kanan
        rotation: -Math.PI / 2,
        action: "sitting",
        status: "Available",
        task: "Mengobrol santai & baca majalah tech",
        chat: "Enak banget ruang santai kantor baru ini, adem!",
      },
      "bot-4": {
        position: { x: 6.0, y: 0, z: 4.2 }, // Area tengah lounge
        rotation: 0,
        action: "dance", // Joget santai
        status: "Available",
        task: "Peregangan otot & musik santai",
        chat: "Peregangan dulu kawan-kawan biar nggak kram pinggang! 💃",
      },
    },
  },
  {
    phaseId: "kolaborasi_silang",
    title: "Sesi Kolaborasi: Pair Review & Cross-Check",
    icon: "🤝",
    description: "Developer & Designer berpasangan cross-checking fitur sebelum rilis sore hari.",
    durationSeconds: 45,
    bots: {
      "bot-1": {
        position: { x: 4.5, y: 0, z: -3.0 },
        rotation: 0,
        action: "waving",
        status: "Available",
        task: "Menyambut kedatangan owner & koordinasi tim",
        chat: "Siap pak, rilis hari ini on-schedule dan fitur sudah terverifikasi! 👋",
      },
      "bot-2": {
        position: { x: -4.5, y: 0, z: -3.0 },
        rotation: 0,
        action: "typing",
        status: "Busy",
        task: "Live code walkthrough & QA test",
        chat: "Unit testing 100% pass, siap sync dengan frontend.",
      },
      "bot-3": {
        position: { x: -3.5, y: 0, z: -4.0 }, // Siti mampir ke meja Budi untuk cross-check
        rotation: -Math.PI / 4,
        action: "cheer",
        status: "Busy",
        task: "Mengecek integrasi animasi 3D Three.js",
        chat: "Animasi dan transisinya super smooth, mantap mas Budi! 🎉",
      },
      "bot-4": {
        position: { x: 5.5, y: 0, z: -4.0 }, // Dimas ke meja Rani
        rotation: Math.PI / 4,
        action: "typing",
        status: "Available",
        task: "Audit security & load balancing",
        chat: "SSL certificates renewed, latency under 20ms.",
      },
    },
  },
];
