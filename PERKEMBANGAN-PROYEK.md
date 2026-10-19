# 📜 Log Catatan Perkembangan Proyek Virtual Office 3D

Dokumen ini mencatat setiap tahap perkembangan dan evolusi aplikasi web **Virtual Office 3D (Ekalaya)** sejak inisialisasi awal hingga fitur-fitur mutakhir.

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

---

*Log ini diperbarui secara berkala pada repositori GitHub: [avoliofun-dev/ekalaya-office](https://github.com/avoliofun-dev/ekalaya-office)*
