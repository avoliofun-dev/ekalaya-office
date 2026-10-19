# 📜 Log Catatan Perkembangan Proyek Virtual Office 3D

Dokumen ini mencatat setiap tahap perkembangan dan evolusi aplikasi web **Virtual Office 3D (Ekalaya)** sejak inisialisasi awal hingga fitur-fitur mutakhir.

---

## 🏛️ Profil Pendirian Perusahaan & Arsip Karyawan

### 📌 Data Pendirian Perusahaan
* **Nama Perusahaan**: PT Ekalaya Inovasi Digital (Ekalaya Tech HQ)
* **Tanggal Berdiri**: **19 Oktober 2026**
* **Pendiri (Founder & CEO)**: **Raja (Owner)**
* **Visi & Misi**: Menciptakan platform virtual office 3D berbasis web browser yang interaktif, ringan, dan membawa kehangatan kerja bersama di era remote work.
* **Status Kantor**: Operasional Penuh (*Live & Active*)

### 👥 Jadwal & Tanggal Karyawan Mulai Aktif Bekerja
| No | ID Pegawai | Nama Karyawan | Jabatan / Divisi | Mulai Aktif Bekerja | Tugas Utama |
|---|---|---|---|---|---|
| 1 | **EKA-000** | **Raja (Owner)** | Founder & CEO | 19 Oktober 2026, 07:00 WIB | Kepemimpinan & Pengambilan Keputusan Strategis |
| 2 | **EKA-001** | **Rani** | Lead Product (Admin) | 19 Oktober 2026, 08:00 WIB | Meninjau PRD, Roadmap Q4 & Sprint Koordinasi |
| 3 | **EKA-002** | **Budi** | Backend Dev (Member) | 19 Oktober 2026, 08:30 WIB | WebSocket Handler, Colyseus Engine & Arsitektur Server |
| 4 | **EKA-003** | **Siti** | UI/UX Designer (Member) | 19 Oktober 2026, 09:00 WIB | Figma Design System v2.0 & Desain Aset 3D |
| 5 | **EKA-004** | **Dimas** | DevOps & Cloud (Member) | 19 Oktober 2026, 09:15 WIB | Kubernetes Cluster, CI/CD Pipeline & Keamanan Jaringan |

---

## 📅 Tahap 1: Inisialisasi Proyek & Arsitektur Frontend
* **Teknologi**: Next.js 16 (App Router) + Three.js + Lucide React + TailwindCSS.
* **Tujuan**: Membuat web yang siap di-deploy langsung ke Vercel tanpa dependensi database awal.
* **Hasil**:
  - Konfigurasi RootLayout & Page modern dengan tema gelap (slate-950).
  - Setup struktur kode modular: `lib/officeBuilder.js` untuk 3D Three.js dan `lib/mockData.js` untuk entitas kantor.

---

## 📅 Tahap 2: Pembangunan Lingkungan Kantor 3D (Office Geometry)
* **Pembangunan Model 3D Low-Poly Berkarakter**:
  - **4 Ruangan / Zona**:
    1. *Engineering Bay* (Cluster meja ganda, dual monitor, kursi putar blocky).
    2. *Product & Design Bay* (Area kerja desainer & manajer produk).
    3. *Executive Meeting Room* (Meja rapat kayu melingkar, sekat kaca transparan, layar proyektor).
    4. *Relax & Coffee Lounge* (Sofa santai L-shape, dispenser air, mesin kopi barista).
  - **Avatar Blocky Ala Roblox**:
    - Karakter avatar manusia 3D dengan kepala kubus, ekspresi mata & senyum, topi/headphone, serta lengan dan kaki berayun saat bergerak.
  - **Pencahayaan & Bayangan**: Dynamic DirectionalLight dengan soft shadow map + AmbientLight.

---

## 📅 Tahap 3: Fitur Interaksi, Radar Jarak & Chat
* **Sistem Gerak WASD**: Avatar bergerak responsif dan menghadap ke arah tujuan dengan mulus.
* **Kamera Follow Third-Person**: Kamera orbit yang mengikuti posisi pemain secara halus (*lerping*).
* **Audio Spasial (Proximity Radar)**:
  - Sistem mendeteksi otomatis saat pemain mendekati rekan kerja dalam jarak < 5 meter.
* **Obrolan Kantor & Emote Interaktif**:
  - Chat drawer untuk saling mengirim pesan teks.
  - Emote: Melambaikan tangan (Wave 👋), Tepuk tangan bersorak (Cheer 🎉) dengan partikel konfeti, dan istirahat kopi (Coffee ☕).
* **Kustomisasi Profil Avatar**: Pengguna bisa mengganti nama tampilan, warna baju/outfit, dan status kerja (*Available / Busy / Away*).

---

## 📅 Tahap 4: Sinkronisasi Multiplayer Live Antar Tab & Pengguna Nyata
* **Modul Peer Network (`lib/peerNetwork.js`)**:
  - Memungkinkan dua atau lebih tab/browser saling mendeteksi kehadiran avatar satu sama lain.
  - Gerakan, posisi, dan rotasi avatar tersinkronisasi live pada frekuensi 20 Hz dengan interpolasi posisi halus.
  - Chat terkirim langsung antar pengguna nyata tanpa server berbayar luar.

---

## 📅 Tahap 5: Kontrol Sentuh Mobile (Virtual D-Pad)
* **Kebutuhan**: Avatar sebelumnya hanya bisa digerakkan via keyboard laptop/PC.
* **Implementasi**:
  - Menambahkan Virtual D-Pad sentuh on-screen (<kbd>▲</kbd> <kbd>◀</kbd> <kbd>▶</kbd> <kbd>▼</kbd>) dengan event `onTouchStart` dan `onTouchEnd`.
  - Multi-touch handling memungkinkan pemain di smartphone berjalan dengan kontrol satu jempol.

---

## 📅 Tahap 6: Mode Siang/Malam & Kontrol Sudut Pandang Luas (Wide View)
* **Fitur Siang & Malam (Day/Night)**:
  - Tombol toggle Sun/Moon di header.
  - Mode Siang: Langit cerah, sinar matahari hangat, dan bayangan alami.
  - Mode Malam: Suasana malam cyber dengan pencahayaan neon dan ambient gelap estetik.
* **Kontrol Sudut Pandang (Camera Zoom / Wide View)**:
  - Tombol toggle sudut pandang: **Wide (1.5x)** untuk melihat denah kantor secara luas dan utuh, **Normal (1x)**, serta **Close (0.7x)**.

---

## 📅 Tahap 8: Analog Joystick Ala Mobile Legends, Rotasi Kamera Ala Roblox, Tombol Loncat & 5 Gerakan Emote
* **Analog Joystick Sentuh Ala Mobile Legends (MLBB)**:
  - Menggantikan tombol D-pad kotak dengan joystick analog melingkar 360° transparan yang nyaman digeser dengan ibu jari kiri.
  - Vektor gerakan analog responsif dan lancar ke segala arah mata angin.
* **Rotasi Bebas Kamera Lingkungan (Orbit Cam Ala Roblox)**:
  - Layar sekarang bisa disentuh/digeser (drag/swipe) menggunakan jari (di HP) atau mouse (di laptop) untuk memutar kamera 360° mengitari avatar secara bebas (*spherical orbit*).
  - Arah jalan avatar otomatis sinkron dengan sudut pandang kamera yang sedang diarahkan.
* **Tombol Aksi Loncat (Jump)**:
  - Tombol aksi lingkaran besar di pojok kanan bawah khusus untuk **LONCAT** dengan fisika gravitasi melompat di udara.
  - Pengguna keyboard PC juga bisa menekan tombol <kbd>Space</kbd> untuk melompat.
* **5 Pilihan Gerakan & Emote Interaktif**:
  1. 👋 **Halo / Wave**: Melambaikan tangan ramah.
  2. 🎉 **Tepuk Tangan / Cheer**: Bersorak tepuk tangan meriah dengan konfeti.
  3. 💃 **Joget Disco / Dance**: Berjoget disko asyik dengan tangan berayun dan hentakan tubuh.
  4. 🌀 **Putar 360 / Spin**: Berputar cepat 360 derajat.
  5. ☕ **Istirahat Kopi / Relax**: Status santai duduk rehat di pantry.

## 📅 Tahap 9: Perbaikan Tombol & Joystick di Mode Fullscreen + Default Siang Hari
* **Default Mode Siang (Daylight)**:
  - Saat web dibuka pertama kali, default suasana kantor sekarang adalah **Siang Hari** yang terang, segar, dan berenergi. Pengguna tetap bisa mengganti ke mode malam kapan saja dengan tombol Sun/Moon.
* **Perbaikan Fullscreen (Kursor, Joystick & Tombol Tetap Muncul)**:
  - Masalah sebelumnya: saat fullscreen diaktifkan pada beberapa browser HP, elemen UI melorot atau tersembunyi karena fullscreen di-request pada elemen root HTML terluar.
  - Perbaikan: Fullscreen sekarang di-binding langsung ke komponen utama (`rootRef`) dan ditambahkan sinkronisasi `fullscreenchange` otomatis. Hasilnya, saat masuk mode fullscreen, seluruh kontrol analog joystick, tombol loncat, dock bawah, serta tombol header **tetap tampil utuh dan interaktif 100%**.

## 📅 Tahap 10: Toggle Mode Bersih (Clean UI / Immersive Mode)
* **Tombol Sembunyikan/Tampilkan UI (Eye / EyeOff)**:
  - Ditambahkan tombol toggle baru di pojok kanan atas dengan ikon mata (<kbd>👁️ Sembunyikan UI</kbd>).
* **Fokus Penuh pada Gerak & Emote**:
  - Saat tombol ini diaktifkan, seluruh elemen non-esensial (nama kantor, zona radar, chat drawer, panel anggota, tombol mic, kamera, share screen, dan setting) otomatis disembunyikan secara rapi.
  - **Yang Tetap Aktif & Tampil**:
    1. **Analog Joystick 360° (Mobile Legends)** di pojok kiri bawah untuk berjalan.
    2. **Tombol Loncat (Jump)** di pojok kanan bawah.
    3. **5 Tombol Emote** (👋 Halo, 🎉 Tepuk, 💃 Joget Disco, 🌀 Spin 360, ☕ Kopi) di bagian bawah.
    4. **Tombol Toggle Mata** untuk mengembalikan tampilan UI kapan saja.

## 📅 Tahap 11: Perbaikan Rotasi Kamera 360° (Roblox Orbit Cam) di Desktop & HP
* **Masalah**: Event pointer pada versi sebelumnya terdaftar di objek `window` global sehingga terhalang/ter-cancel oleh layer kanvas WebGL atau browser gesture saat touch drag di smartphone.
* **Solusi**:
  - Event `pointerdown`, `pointermove`, dan `pointerup` dipindahkan langsung mengikat ke kontainer kanvas WebGL 3D dengan API `setPointerCapture(pointerId)`.
  - Sekarang rotasi kamera **100% responsif**:
    - **Di Layar HP**: Cukup sentuh dan geser jari Anda di luar area joystick/tombol, kamera langsung berputar halus 360° horizontal dan naik/turun vertikal.
    - **Di Desktop/Laptop**: Klik dan tahan mouse di mana saja pada kanvas 3D lalu geser mouse untuk mengitari avatar.

## 📅 Tahap 12: Siklus Kegiatan Harian Otomatis (Work Cycle), Pergerakan Nyata 4 Pegawai & Tombol Masuk/Keluar Kantor
* **Sistem Siklus Kegiatan Kerja Otomatis (`lib/workCycle.js`)**:
  - Menyediakan 4 fase rutinitas kantor dinamis yang berputar otomatis (atau dikontrol manual):
    1. 💻 **Sesi Pagi (Deep Work & Sprint Coding)**: Semua pegawai berada di meja masing-masing mengetik kode, review PRD, dan memonitor cluster server.
    2. 📊 **Sesi Rapat (Daily Standup di Executive Room)**: Seluruh 4 pegawai serentak berjalan menuju Executive Meeting Room, duduk melingkari meja bundar dan berdiskusi.
    3. ☕ **Sesi Istirahat (Coffee & Refreshment Break)**: Pegawai berjalan ke Pantry & Sofa Lounge, menyeduh kopi di barista bar, duduk santai dan berjoget disko.
    4. 🤝 **Sesi Kolaborasi (Pair Review & Cross-Check)**: Tim bergerak saling mengunjungi meja rekan kerja, melambaikan tangan dan bersorak apresiasi (cheer).
* **Animasi Berjalan Realistis untuk 4 Pegawai (Bot Walking Interpolation)**:
  - Bot tidak berpindah secara instan (teleport), melainkan memutar arah badan dan **berjalan kaki secara mulus dengan ayunan tangan dan langkah kaki 3D** melintasi koridor kantor menuju ke ruangan berikutnya.
  - Setiap fase baru otomatis memunculkan pengumuman sistem dan obrolan percakapan bot di chat kantor.
* **Tombol Masuk / Keluar Kantor (Check-in & Check-out)**:
  - Tersedia tombol interaktif di header atas: **"Keluar Kantor" (merah)** dan **"Masuk Kantor" (hijau)**.
  - Saat Owner menekan *Keluar Kantor*, status berubah menjadi *Away*, avatar menghilang/keluar ruangan, dan muncul banner status elegan.
  - 4 pegawai tetap terlihat hidup dan aktif bekerja menjalankan sekejul kantor.
## 📅 Tahap 13: Aksi Otomatis Berdasarkan Ruangan/Zona (Contextual Auto Actions) & Random Gestures
* **Sistem Aksi Otomatis Kontekstual (Hands-Free)**:
  - Pengguna tidak perlu lagi menekan tombol apa pun untuk melakukan kegiatan:
    1. ☕ **Area Pantry & Sofa Lounge**: Saat avatar berdiri di area ini, avatar **otomatis duduk santai di sofa** dan tangan memegang cangkir kopi.
    2. 📊 **Area Executive Meeting Room**: Saat avatar masuk ke ruang rapat kaca, avatar **otomatis duduk menyimak diskusi** di meja bundar.
    3. 💻 **Area Workstation (Engineering & Product Bay)**: Saat avatar berada di dekat meja kerja, avatar **otomatis duduk dan mengetik laptop** (posisi mengetik dengan ayunan tangan dinamis).
    4. 🏢 **Lobi & Koridor**: Saat berjalan bebas, avatar berdiri tegak dan siap berinteraksi.
* **Random Idle Emotes & Gestures (Karakter Terasa Hidup)**:
  - Ketika avatar berhenti berjalan selama beberapa detik, sistem otomatis memicu gerakan acak spontan yang hidup:
    - Melambaikan tangan (Wave 👋)
    - Bersorak apresiasi (Cheer 🎉)
    - Berjoget disko santai (Dance 💃)
    - Putar badan 360 derajat (Spin 🌀)

---

*Log ini diperbarui secara berkala pada repositori GitHub: [avoliofun-dev/ekalaya-office](https://github.com/avoliofun-dev/ekalaya-office)*
