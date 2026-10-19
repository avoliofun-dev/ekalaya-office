// KONSTANTA & KOORDINAT LANDMARK BEHAVIOR ENGINE KANTOR EKALAYA
// Sesuai aturan: Saklar tunggal untuk mengaktifkan / menonaktifkan behavior engine
export const ENABLE_BEHAVIOR = true;

// Titik Koordinat Landmark Kantor 34x30 Meter
export const OFFICE_LANDMARKS = {
  // Pintu Masuk & Lobi
  entrance: { x: 0, z: 15.0, rot: 3.14, label: "Pintu Masuk Utama" },
  lobby: { x: 0, z: 13.5, rot: 0, label: "Lobi & Meja Resepsionis" },
  
  // Toilet Kantor (Barat Daya)
  toilet: { x: -15.5, z: 6.5, rot: 1.57, label: "Toilet Kantor" },
  
  // Musala / Tempat Salat (Barat Tengah)
  musala: { x: -15.5, z: 0.5, rot: 0, label: "Musala Kantor" },
  
  // Jendela Kaca Pemandangan Luar
  window_west: { x: -16.2, z: -8.0, rot: 1.57, label: "Jendela Kaca Barat" },
  window_east: { x: 16.2, z: -8.0, rot: -1.57, label: "Jendela Kaca Timur" },
  
  // Mesin Fotokopi / Printer Center (Dekat Koridor Tengah)
  printer: { x: 4.8, z: 0.5, rot: 3.14, label: "Mesin Fotokopi & Printer" },
  
  // Fasilitas Pantry & Lounge
  dispenser: { x: 10.2, z: 9.0, rot: 3.14, label: "Dispenser Air Minum" },
  coffeeMachine: { x: 7.2, z: 9.0, rot: 3.14, label: "Mesin Espresso Barista" },
  pantry_sofa_main: { x: 9.5, z: 12.0, rot: 0, label: "Sofa Santai Pantry" },
  pantry_sofa_corner: { x: 12.5, z: 10.2, rot: -1.57, label: "Sofa Sudut Pantry" },
  pantry_table: { x: 9.5, z: 9.6, rot: 3.14, label: "Meja Tengah Lounge" },
  
  // Boardroom / Ruang Rapat & Ruang Bos
  boardroom_center: { x: -9.5, z: 10.5, rot: 0, label: "Meja Rapat Eksekutif" },
  boardroom_boss: { x: -9.5, z: 9.1, rot: 0, label: "Kursi Pimpinan Rapat" },
  boardroom_guest: { x: -9.5, z: 11.9, rot: 3.14, label: "Kursi Tamu Rapat" },
  
  // Saklar Lampu Kantor (Dekat Pintu Keluar & Koridor)
  light_switch: { x: 2.0, z: 14.5, rot: 3.14, label: "Panel Saklar Lampu" },
};

// Mapping Animasi & Aksi Avatar
// Menggunakan animasi yang sudah ada (typing, sitting, waving, cheer, idle)
// Aksi baru menggunakan placeholder idle + label teks overhead
export const ACTION_ANIMATION_MAP = {
  // Aksi Kerja & Meja
  kerja_fokus: "typing",
  ngetik_cepat: "typing",
  nyalakan_komputer: "typing",
  matikan_komputer: "typing",
  absen_pagi: "waving",
  absen_pulang: "waving",
  beres_meja: "idle", // TODO: Tambahkan animasi clean_desk kustom nanti
  tidur_meja: "sitting", // TODO: Tambahkan animasi sleep_desk kustom nanti
  cek_hp: "sitting", // TODO: Tambahkan animasi phone_scroll kustom nanti
  
  // Aksi Jalan & Ruangan
  jalan_iseng: "idle",
  ke_ruangan_teman: "waving",
  ke_toilet: "idle",
  ngelamun_jendela: "idle",
  fotokopi_print: "idle", // TODO: Tambahkan animasi paper_print kustom nanti
  bantu_teman: "waving",
  
  // Aksi Sosial & Pantry
  bikin_kopi_teh: "idle",
  ambil_air: "idle",
  ngobrol_pantry: "cheer",
  makan_camilan: "sitting",
  makan_siang: "sitting",
  
  // Aksi Formal
  rapat: "sitting",
  dipanggil_bos: "sitting",
  dimarahi_bos: "idle", // TODO: Tambahkan animasi sad_bow kustom nanti
  salat: "sitting", // TODO: Tambahkan animasi pray kustom nanti
  nelpon: "idle", // TODO: Tambahkan animasi phone_call kustom nanti
  tamu_diskusi: "sitting",
  
  // Pulang
  nyalakan_lampu: "idle",
  matikan_lampu: "idle",
  pamitan: "waving",
  beli_makan: "idle",
  isi_bensin: "idle",
  kena_macet: "idle",
  nongkrong: "cheer",
  belanja: "idle",
  jemput_keluarga: "idle",
  langsung_pulang: "idle",
};
