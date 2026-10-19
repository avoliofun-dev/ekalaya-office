# Konsep: Virtual Office 3D berbasis AI ("kantor dengan karyawan AI")

Aku asumsikan "karyawan" di sini adalah **agen AI** yang bekerja di kantor 3D milik tiap owner. Owner memberi tugas, agen mengerjakannya (lewat n8n dan LLM), dan hasilnya terlihat di dunia 3D. Kalau maksudmu karyawan manusia juga, arsitekturnya tetap bisa mendukung, nanti kita tambah.

## 1. Gambaran produk

- Setiap owner punya **kantor pribadi** (workspace) berupa ruangan 3D yang bisa dikustomisasi.
- Owner bisa "merekrut" karyawan AI dengan peran berbeda: riset, admin, content writer, customer support, analis data, dll.
- Owner memberi tugas lewat chat, papan tugas (kanban), atau klik langsung karyawan di ruangan.
- Karyawan **bergerak dan beraktivitas secara visual** sesuai status: mengetik di meja, rapat, mengambil dokumen, istirahat. Statusnya mengikuti progres tugas asli, jadi bukan animasi kosong.
- Hasil kerja berupa laporan, draf, spreadsheet, atau aksi ke tool eksternal (email, Slack, Google Sheets).

## 2. Arsitektur

```
Browser (Three.js / React Three Fiber)
        │  REST + WebSocket
        ▼
API Gateway / Backend (NestJS atau Node + Fastify)
 ├── Auth & Tenant (workspace, role)
 ├── Billing (Stripe / Midtrans / Xendit)
 ├── Task Service (antrian tugas, status, riwayat)
 ├── Agent Orchestrator (memilih agen, memori, prompt)
 ├── Realtime Service (WebSocket: posisi & status karyawan)
 └── Postgres + Redis + Object Storage (S3/R2)
        │
        ▼
n8n (workflow engine) + LLM API (Claude, dll.)
 └── Tool: web search, email, Sheets, CRM, scraping, dll.
```

**Alur satu tugas:**
1. Owner membuat tugas → disimpan di Postgres, masuk antrian (BullMQ/Redis).
2. Orchestrator memilih karyawan yang cocok, lalu memanggil **webhook n8n** milik workflow karyawan itu.
3. n8n menjalankan langkah-langkahnya: panggil LLM, cari informasi, olah data, panggil tool.
4. n8n mengirim callback ke backend dengan progres dan hasil.
5. Backend memancarkan event via WebSocket, lalu karyawan 3D berubah animasi (jalan → duduk → mengetik → selesai).
6. Owner menerima notifikasi dan bisa meminta revisi.

## 3. Stack yang kusarankan

| Lapisan | Pilihan |
|---|---|
| Frontend | Next.js + React Three Fiber + drei, Zustand, Tailwind untuk UI 2D |
| 3D | Model glTF/GLB (Blender / Mixamo untuk animasi), aset low-poly agar ringan |
| Backend | NestJS (TypeScript), Postgres (Prisma), Redis, BullMQ |
| Realtime | Socket.IO atau WebSocket native |
| Otomasi | n8n self-hosted (mode queue), tiap tenant dipisah lewat credential dan tag |
| AI | Claude API (atau multi-provider), pgvector untuk memori per karyawan |
| Infra | Docker, VPS/Kubernetes, Cloudflare (CDN + R2) |
| Billing | Midtrans/Xendit (lokal) + Stripe (global) |

## 4. Multi-tenant

- Setiap tabel punya `workspace_id`, dengan row-level security di Postgres.
- Memori dan dokumen tiap karyawan terpisah per workspace (namespace di vector DB).
- n8n **jangan diekspos langsung ke user**. Backend-mu yang jadi perantara, dengan workflow template yang di-clone atau diparameterisasi per karyawan. Jangan buat satu instance n8n per user di awal, terlalu mahal.
- Kredensial pihak ketiga milik user (Gmail, dll.) dienkripsi dan diambil lewat OAuth.

## 5. Model bisnis (langganan)

- **Free/Trial**: 1 karyawan, kantor kecil, kuota tugas terbatas.
- **Pro**: 3-5 karyawan, lebih banyak tugas, integrasi dasar.
- **Business**: karyawan banyak, workflow custom, kantor lebih besar, multi-user.
- **Add-on**: slot karyawan ekstra, skin kantor/avatar (cosmetic), template peran premium, marketplace workflow.

Biaya terbesarmu adalah **token LLM**, jadi pasang batas kuota per paket, pilih model yang sesuai (murah untuk tugas ringan, kuat untuk tugas berat), dan catat penggunaan per workspace sejak hari pertama.

## 6. Hal yang membedakan dari kompetitor

- Aktivitas 3D **benar-benar mencerminkan pekerjaan nyata**, jadi bukan sekadar dekorasi.
- Karyawan punya **memori dan kepribadian** (ingat preferensi owner, gaya laporan).
- **Marketplace "karyawan siap pakai"**: komunitas bisa menjual template peran dan workflow n8n, kamu ambil komisi.

## 7. Tantangan yang perlu diantisipasi

- **Performa 3D di perangkat low-end**: pakai LOD, baked lighting, batasi poligon, dan sediakan mode 2D fallback.
- **Biaya AI**: kuota ketat dan caching.
- **Keamanan**: prompt injection dari data eksternal, isolasi tenant, audit log aksi karyawan. Aksi berisiko (kirim email, hapus data) sebaiknya butuh persetujuan owner.
- **Keandalan agen**: beri timeout, retry, dan status gagal yang jelas di UI.

## 8. Roadmap MVP (sekitar 2-3 bulan solo)

1. **Minggu 1-2**: auth, workspace, billing dasar, satu ruangan 3D statis.
2. **Minggu 3-4**: 1 karyawan 3D dengan animasi idle/jalan/ngetik + WebSocket.
3. **Minggu 5-6**: sistem tugas + integrasi n8n (webhook & callback) + 1 peran (misal "peneliti").
4. **Minggu 7-8**: memori, riwayat tugas, notifikasi, kuota paket.
5. **Minggu 9-12**: beta tertutup, perbaiki performa, tambah peran dan dekorasi.

Validasi dulu dengan satu niche (misal UMKM atau content creator) sebelum melebar.

Mau lanjut ke bagian mana? Aku bisa mulai dari skema database dan struktur folder, prototipe ruangan 3D dengan React Three Fiber, atau desain alur webhook n8n.