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
## 📅 Tahap 14: Mode Kamera Pengawas (Owner Spectator) & Algoritma Jadwal Otonom Karyawan
* **Penonaktifan Avatar Pemain (Mode Observasi / CCTV Penuh)**:
  - Sesuai instruksi owner, avatar user dibuang/disembunyikan dari ruangan kantor secara default.
  - Kamera WebGL otomatis berganti dari *Third-Person Follow* menjadi **Mode Kamera Pengawas Panoramic (CCTV 360°)** yang mencakup pemandangan utuh seluruh ruangan kantor dan 4 pegawai.
  - Kontrol analog joystick disembunyikan otomatis agar layar bersih dan fokus pada kegiatan pegawai.
  - Owner tetap bisa masuk kembali menjadi avatar kapan saja jika diinginkan melalui tombol *Masuk Sebagai Avatar*.
* **Algoritma Sistem Kegiatan Karyawan (`lib/workCycle.js`)**:
  - Mengimplementasikan **Autonomous Employee Navigation Engine** dengan titik-titik koordinat waypoints terpetakan presisi di setiap divisi:
    1. *Workstation Bay*: Meja Rani, Budi, Siti, Dimas.
    2. *Executive Meeting Room*: Kursi Utara, Selatan, Barat, Timur, dan Layar Proyektor Whiteboard.
    3. *Pantry & Coffee Lounge*: Mesin Kopi Barista, Sofa Utama, Sofa Sudut, Panggung Santai.
    4. *Lobi & Koridor Transit*: Titik sambut dan koordinasi antar tim.
  - Fase siklus kegiatan diperluas hingga Sesi Evaluasi & Sharing Tech, dilengkapi sinkronisasi obrolan cerdas dan animasi gerak realistis.

## 📅 Tahap 15: Penataan Ulang UI (UI Restructuring & Overlap Fix)
* **Penyatuan & Penataan Header Atas (Top Bar Integration)**:
  - Masalah sebelumnya: Banner sekejul HUD melayang di tengah dan bertubrukan dengan tombol header atas serta radar spasial di layar kecil/ponsel.
  - Solusi:
    1. **Header Responsif Terpadu**: Brand kantor (kiri), HUD Siklus Sekejul Kerja (tengah), dan Tombol Kontrol (kanan) kini berada dalam satu baris header fleksibel (*flex wrap*) yang rapi dan tidak saling tumpang tindih.
    2. **Perapian Banner Status Pengawas**: Dipindahkan ke pojok kanan atas secara minimalis tanpa menutupi area tengah kantor.
    3. **Penyesuaian Chat Drawer**: Kotak obrolan kantor diposisikan presisi di kanan bawah sehingga tidak menghalangi dock kontrol bawah maupun kanvas tengah.
    4. **Radar Spasial Nyaman**: Kotak deteksi suara spasial kini berada di kiri atas dengan margin aman di bawah header.

## 📅 Tahap 16: Sistem Karyawan Otonom 24 Jam (Autonomous 24h NPC Engine)
* **4 Karakter Karyawan Otonom Penuh**:
  1. **Rina (Desainer Grafis)**: Ramah & suka ngobrol. Datang 08.30, kerja 09.00-12.00, makan 12.00-13.00, kerja 13.00-15.30, ngopi 15.30, meeting 16.00, pulang 17.30.
  2. **Dimas (Programmer)**: Fokus & pendiam. Datang 09.00, coding maraton, makan telat 13.00, ngopi sore, lembur hingga 19.00.
  3. **Sari (Admin & Keuangan)**: Teliti & disiplin. Datang 08.00, kerja 08.30-12.00, makan 12.00-12.45, pantry 10.00 & 15.00, pulang 17.00.
  4. **Budi (Customer Support)**: Sabar & suka bercanda. Datang 08.30, bolak-balik meja dan ruang meeting, makan 12.30, pulang 17.30.
* **Fitur Utama yang Diimplementasikan**:
  1. **Konfigurasi Terpisah (`lib/npcData.json`)**: Seluruh jadwal, koordinat meja/pantry/meeting/sofa, kepribadian, dan percakapan tersimpan dalam JSON terstruktur. Sangat mudah menambah karyawan baru.
  2. **A* Grid Pathfinding 2D (`lib/pathfinding.js`)**: Navigasi akurat menghindari dinding luar, sekat kaca ruang meeting, meja kerja, dan sofa lounge tanpa menembus dinding (*no clipping*).
  3. **Needs System & Variasi Alami**: Setiap karyawan memiliki indikator Energi, Lapar, dan Sosial, serta variasi waktu acak (jitter 0-15 menit) sehingga tidak bergerak kaku seperti robot.
  4. **Interaksi Spasial & Chat Bubble Bahasa Indonesia**: Saat berada berdekatan di pantry/sofa, muncul balon obrolan teks di atas kepala dengan gaya bahasa santai dan log ke chat kantor.
  5. **Overhead Billboard 3D Dynamic Sprite**: Nametag 3D, badge status kegiatan (*Bekerja, Istirahat, Meeting, Makan, Pulang, Tidur*), serta speech bubble otomatis menghadap ke kamera.
  6. **Kontrol Waktu Fleksibel**:
     - Mode Waktu Nyata (24 Jam Realtime): Sinkron langsung dengan jam pengguna saat ini.
     - Mode Dipercepat (⚡ 1 Hari = 10 Menit): Untuk pengujian siklus penuh harian secara cepat.
     - Tombol `+1 Jam`: Majukan simulasi 1 jam ke depan seketika.
  7. **Persistensi & Determinisme**: Refresh halaman atau pengguna baru masuk langsung menampilkan posisi dan aktivitas karyawan sesuai jam saat ini tanpa reset ke awal.
  8. **Interface LLM Eksternal (`lib/dialogueEngine.js`)**: Arsitektur modular `IDialogueProvider` siap disambungkan ke Claude API / OpenAI di masa mendatang.

## 📅 Tahap 17: Suara Latar Kantor Alami (Office Ambience Sound Engine)
* **Web Audio API Ambient Generator (`lib/ambienceEngine.js`)**:
  - Dibuat menggunakan sintesis Web Audio API murni: tanpa file MP3 eksternal yang berat, zero latency, hemat kuota data, dan bebas masalah hak cipta.
  - **Dengungan AC & Room Tone Ruang Kerja**: Frekuensi *pink/brown noise* lembut yang menenangkan layaknya suasana kantor ber-AC.
  - **Suara Ketikan Keyboard Mekanikal/Laptop**: Tuts keyboard mengetik secara berkala dan acak (*burst typing*) mensimulasikan karyawan sedang coding/mengetik dokumen.
  - **Suara Klik Mouse**: Klik tunggal dan *double click* alami saat karyawan bekerja di meja.
  - **Bisik Diskusi Kejauhan (*Office Murmur*)**: Resonansi vokal halus di kejauhan memberi kesan kantor hidup dan produktif.
* **Kontrol Header Fleksibel**:
  - Ditambahkan tombol toggle audio **Suara (🔊/🔇)** di baris atas header web.
  - Pengguna bebas menyalakan atau mematikan suara latar kapan saja dengan sekali sentuh/klik.

## 📅 Tahap 18: Perbaikan Toggle Top-Down 2-Arah & Pengelompokan UI Terstruktur
* **Penyelesaian Masalah Tombol Top-Down**:
  - **Penyebab**: Sudut kamera sebelumnya hanya diset satu arah (`phi = 1.45`), sehingga setelah diklik sekali tidak ada logika untuk kembali ke sudut normal.
  - **Solusi**: Dibuat fungsi `toggleCameraTopDown` 2-arah dengan state reaktif `isTopDownView`:
    1. Klik ke-1: Beralih ke **Top-Down (Denah Atas)**.
    2. Klik ke-2: Otomatis kembali ke **Normal 3D Isometrik**.
    3. Dilengkapi indikator visual aktif menyala (cyan highlight) dan notifikasi sistem interaktif.
    4. Tersedia baik di bar kontrol header (desktop & tablet) maupun quick button mobile.
* **Pengelompokan Tombol UI (Categorized Segmented Groups)**:
  - Header atas ditata rapi dalam 4 sub-kelompok berbingkai semi-transparan:
    1. **Tampilan & Presensi**: Toggle Sembunyikan UI (Clean Mode) & Masuk/Keluar Kantor.
    2. **Kamera & View**: Toggle Top-Down/3D, Putar ↺ ↻ 45°, Jarak Pandang (Zoom), dan Fullscreen.
    3. **Suasana & Audio**: Mode Siang/Malam (Sun/Moon) & Suara Latar Kantor (Office Ambience).
    4. **Anggota & Bantuan**: Panel Daftar Anggota & Modal Panduan.
  - Dock kontrol bawah dikelompokkan ke dalam 3 sub-grup elegan:
    1. **Sub-grup A (Audio/Video/Share)**: Mikrofon, Kamera, dan Berbagi Layar proyektor.
    2. **Sub-grup B (5 Emote Interaktif)**: 👋 Halo, 🎉 Tepuk, 💃 Joget Disco, 🌀 Spin 360, ☕ Kopi.
    3. **Sub-grup C (Profil & Komunikasi)**: Kustomisasi Avatar (Baju & Status) dan Obrolan Kantor (Chat Drawer).

---

*Log ini diperbarui secara berkala pada repositori GitHub: [avoliofun-dev/ekalaya-office](https://github.com/avoliofun-dev/ekalaya-office)*


