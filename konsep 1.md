# Virtual Office 3D — Dokumen Konsep Produk

> Kantor virtual 3D di browser: pekerja sungguhan hadir sebagai avatar kecil bergaya blocky (ala Roblox), berjalan bebas, dan berinteraksi secara real-time.

**Versi:** 1.0 (Draft Konsep) | **Tanggal:** 19 Oktober 2026

---

## 1. Ringkasan Eksekutif

Virtual Office 3D adalah aplikasi web tempat tim remote/hybrid "berkantor" bersama di ruang 3D. Setiap anggota tim login dan mengendalikan avatar mereka sendiri (bukan NPC). Avatar berjalan, duduk, melambai, mendekati rekan untuk mengobrol, dan masuk ruang meeting. Tidak perlu instalasi: cukup buka browser.

**Nilai utama:** menghadirkan rasa "hadir bersama" yang hilang di video call biasa, dengan biaya jauh lebih rendah dari kantor fisik.

## 2. Masalah & Peluang

| Masalah | Dampak |
|---|---|
| Tim remote merasa terisolasi | Kolaborasi spontan hilang, budaya tim melemah |
| Video call melelahkan (zoom fatigue) | Produktivitas menurun |
| Tidak tahu siapa sedang sibuk/senggang | Interupsi tidak tepat waktu |
| Kantor fisik mahal | Biaya sewa, listrik, dan operasional tinggi |

**Peluang:** pasar kerja remote/hybrid terus tumbuh; pesaing utama (Gather, Spatial) masih berfokus 2D atau berbiaya tinggi. Pendekatan 3D ringan berbasis browser dengan gaya blocky yang ramah menjadi pembeda.

## 3. Target Pengguna

- **Startup & tim remote kecil (5–50 orang)** — segmen utama.
- **Komunitas & kelas online** — sekolah, kursus, komunitas developer.
- **Agensi & freelancer kolektif** — butuh ruang bertemu klien.
- **Event virtual kecil** — workshop, gathering.

## 4. Fitur

### 4.1 MVP (Fase 1)
1. Login/registrasi sederhana (email atau Google).
2. Satu ruangan kantor 3D.
3. Avatar blocky dengan kontrol WASD + kamera orbit/third-person.
4. Multiplayer real-time (melihat avatar lain bergerak halus).
5. Nama di atas kepala + status (Available / Busy / Away).
6. Chat teks global.
7. **Peran Owner**: pembuat workspace otomatis menjadi Owner, ikut masuk sebagai avatar seperti anggota lain, dan membagikan link undangan; orang yang diundang masuk sebagai Member.
8. Satu area santai sederhana (sofa/pantry) untuk jeda.

### 4.2 Fase 2 — Kolaborasi
1. **Voice/video berbasis jarak** (makin dekat, makin keras; jauh = tidak terdengar).
2. Ruang meeting privat (masuk area = masuk percakapan).
3. Emote & animasi (lambai, duduk, tepuk tangan).
4. Kustomisasi avatar (warna, pakaian, aksesori).
5. Layar bersama (screen share) di ruang meeting.
6. Papan tulis/whiteboard & papan pengumuman.
7. **Area istirahat**: pantry, sofa lounge, taman/rooftop kecil, dan ruang game untuk ngobrol santai.
8. Emote istirahat: duduk di sofa, stretching, minum kopi, tidur.
9. **Auto-away**: jika tidak aktif beberapa menit, avatar otomatis berstatus Away dan duduk sendiri.
10. Pengingat istirahat opsional setelah beberapa jam kerja.

### 4.3 Fase 3 — Skala & Monetisasi
1. Multi-ruangan / multi-lantai, peta kantor.
2. Editor denah kantor (admin bisa menata furnitur).
3. Workspace/organisasi dengan peran (Owner, Admin, Member, Guest). Owner: mengundang/mengeluarkan anggota, mengatur peran, menata denah, mengatur akses ruang privat, dan mengelola paket/pembayaran.
3a. Papan tugas dan whiteboard di meja, agar pekerjaan bisa dikelola langsung di dalam kantor virtual.
4. Integrasi Google Calendar, Slack, Zoom.
5. Analitik kehadiran dan penggunaan ruang.
6. Mobile view (kontrol sentuh).

## 5. Pengalaman Pengguna (UX)

**Alur utama:**
1. Pengguna membuka link workspace → login.
2. Memilih/menyesuaikan avatar → masuk lobi kantor.
3. Berjalan ke meja, ruang meeting, atau pantry.
4. Mendekati rekan → muncul bubble suara/video otomatis.
5. Masuk ruang meeting → percakapan privat dimulai.

**Avatar dan pekerjaan:** avatar bukan NPC dan tidak bekerja sendiri; avatar adalah representasi orang asli. Pekerjaan sungguhan dikerjakan orangnya di komputernya, sedangkan avatar menunjukkan kondisinya:
- Sedang kerja: avatar duduk di meja dengan status Busy/Available.
- Butuh jeda: avatar berjalan ke pantry/sofa atau status diganti ke Away.
- Perlu kolaborasi: avatar mendekati rekan atau masuk ruang meeting.

**Prinsip desain:**
- Gaya visual blocky, warna cerah, low-poly agar ringan dan ramah.
- Kontrol sesederhana game: WASD/panah + mouse.
- Selalu ada tombol cepat: mute, kamera, status, emote.
- Aksesibilitas: opsi teks-saja, kontrol keyboard penuh, mode performa rendah.

## 6. Arsitektur Teknis

```
┌─────────────┐   WebSocket    ┌──────────────────┐
│  Klien Web  │◄──────────────►│  Game Server     │
│ (React +    │                │ (Node.js +       │
│  Three.js)  │                │  Colyseus)       │
└──────┬──────┘                └────────┬─────────┘
       │ WebRTC                         │
       ▼                                ▼
┌─────────────┐                ┌──────────────────┐
│  LiveKit    │                │ Database         │
│ (suara/video)│               │ (PostgreSQL)     │
└─────────────┘                └──────────────────┘
```

### 6.1 Tech Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | React + **React Three Fiber** (Three.js) | Ekosistem besar, deklaratif |
| Fisika/tabrakan | **Rapier** (WASM) | Ringan dan akurat |
| Realtime state | **Colyseus** (Node.js) | Room-based, sinkronisasi state bawaan |
| Suara/video | **LiveKit** (WebRTC) | Open source, ada spatial audio |
| Database | PostgreSQL (atau SQLite untuk MVP) | Akun, workspace, avatar |
| Auth | Auth.js / Supabase Auth | Cepat diintegrasikan |
| Hosting | Vercel (frontend) + VPS/Fly.io (game server) | Biaya awal rendah |
| Aset 3D | Model blocky buatan sendiri / Blender, format glTF | Ringan, mudah dimuat |

### 6.2 Strategi Sinkronisasi Multiplayer
- Server **authoritative**: server menyimpan posisi sah, klien mengirim input.
- Klien mengirim input ±20 kali/detik; server broadcast state ±10–20 Hz.
- **Interpolasi** di klien agar gerakan avatar lain tampak halus.
- **Client-side prediction** untuk avatar sendiri agar kontrol terasa responsif.
- **Interest management**: hanya kirim data avatar yang berada di sekitar pemain (skala ke banyak pengguna).

### 6.3 Audio Spasial
- Posisi avatar dikirim ke LiveKit; volume dihitung berdasarkan jarak.
- Radius dengar default 5–8 meter; ruang meeting memutus suara dari luar.

### 6.4 Performa
- Target 60 FPS di laptop standar, 30 FPS di perangkat rendah.
- Model low-poly, instancing untuk objek berulang, kompresi tekstur (KTX2) dan geometri (Draco).
- Batas ±50 avatar per ruangan pada tahap awal.

## 7. Model Data (Ringkas)

- **User**: id, nama, email, avatarConfig, createdAt
- **Workspace**: id, nama, ownerId, plan
- **Membership**: userId, workspaceId, role
- **Room**: id, workspaceId, layout (JSON), kapasitas
- **Message**: id, roomId, userId, isi, waktu

## 8. Keamanan & Privasi

- Autentikasi aman, token berumur pendek, HTTPS/WSS wajib.
- Validasi semua input di server (anti-cheat posisi, rate limiting).
- Ruang privat dengan kontrol akses; peran dan izin per workspace.
- Suara/video tidak direkam secara default.
- Kepatuhan UU Pelindungan Data Pribadi (UU PDP) Indonesia; persetujuan eksplisit jika ada fitur rekam.
- Moderasi: blokir/laporkan pengguna, admin dapat mengeluarkan peserta.

## 9. Model Bisnis

| Paket | Harga (indikatif) | Isi |
|---|---|---|
| **Free** | Rp0 | hingga 10 pengguna, 1 ruangan, fitur dasar |
| **Team** | ± Rp25.000/user/bulan | hingga 100 pengguna, banyak ruangan, screen share |
| **Business** | Kustom | SSO, editor denah, analitik, dukungan prioritas |

Alternatif pendapatan: penjualan item kustomisasi avatar, sewa ruang event, white-label untuk perusahaan.

## 10. Rencana Pengembangan (Roadmap)

| Fase | Durasi | Hasil |
|---|---|---|
| **0. Riset & desain** | 1–2 minggu | Wireframe, gaya visual, pilihan stack |
| **1. MVP** | 4–6 minggu | 1 ruangan, avatar, multiplayer, chat |
| **2. Kolaborasi** | 6–8 minggu | Suara/video spasial, ruang meeting, emote |
| **3. Beta publik** | 4 minggu | Workspace, kustomisasi avatar, uji beban |
| **4. Peluncuran & monetisasi** | berkelanjutan | Paket berbayar, integrasi, editor denah |

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Performa buruk di perangkat lemah | Mode grafis rendah, aset low-poly, batas jumlah avatar |
| Latensi tinggi | Server dekat pengguna (region Asia), interpolasi |
| Biaya server/WebRTC membengkak | Batasi paket gratis, skala bertahap, LiveKit self-host |
| Pengguna lebih nyaman dengan Zoom | Fokus pada nilai unik: kehadiran spontan dan ngobrol informal |
| Pesaing besar | Niche: ringan, murah, ramah pasar Asia Tenggara |

## 12. Indikator Keberhasilan (KPI)

- Pengguna aktif harian/mingguan (DAU/WAU) dan retensi 7/30 hari.
- Rata-rata durasi sesi per pengguna.
- Jumlah interaksi (percakapan jarak dekat, meeting) per hari.
- Konversi dari Free ke Team.
- Latensi rata-rata dan FPS median.

## 13. Langkah Berikutnya

1. Finalisasi konsep ini (revisi sesuai masukan).
2. Tentukan gaya visual dan denah kantor MVP.
3. Setup proyek: React Three Fiber + server Colyseus.
4. Bangun prototipe: avatar kotak berjalan + 2 pengguna saling melihat.
5. Iterasi ke fitur Fase 1 lengkap.

---

*Dokumen ini adalah konsep awal dan akan diperbarui seiring perkembangan proyek.*
