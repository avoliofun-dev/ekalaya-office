/**
 * Official Business Knowledge Base for Ekalaya AI Business Office
 * Sesuai prinsip Phase 2: AI hanya memberikan informasi terverifikasi dari basis pengetahuan ini.
 */

export const BUSINESS_KNOWLEDGE_BASE = {
  company: {
    name: "PT Ekalaya Inovasi Digital",
    product: "Ekalaya AI Business Office",
    tagline: "Your virtual office, powered by AI employees.",
    headquarters: "Jakarta, Indonesia",
    operatingHours: "Senin – Jumat: 08.30 – 17.30 WIB",
    supportEmail: "support@ekalaya.com",
    officialWhatsApp: "+6281234567890",
  },

  plans: [
    {
      id: "free",
      name: "Free Trial",
      price: 0,
      period: "14 hari",
      features: [
        "Akses Kantor Virtual 3D interaktif",
        "CRM Dasar (hingga 10 prospek)",
        "20 permintaan AI Sales Assistant per hari",
        "1 akun pengguna",
      ],
      idealFor: "UMKM atau freelancer yang ingin mencoba simulasi kantor virtual",
    },
    {
      id: "starter",
      name: "Starter",
      price: 99000,
      priceFormatted: "Rp99.000 / bulan",
      period: "per bulan",
      features: [
        "1 Organisasi Kantor 3D lengkap",
        "CRM Prospek & Pelanggan (hingga 100 kontak)",
        "100 permintaan AI Sales Assistant per hari",
        "Draf pesan follow-up otomatis WhatsApp (copy-to-send)",
        "3 kursi anggota tim",
      ],
      idealFor: "Toko laptop, agen properti, studio desain, dan bisnis perorangan",
    },
    {
      id: "business",
      name: "Business (Paling Populer)",
      price: 299000,
      priceFormatted: "Rp299.000 / bulan",
      period: "per bulan",
      features: [
        "Semua fitur Starter",
        "CRM tanpa batas jumlah prospek",
        "300 permintaan AI Assistant per hari",
        "AI Customer Service Assistant & Knowledge Base tim terpadu",
        "10 kursi anggota tim",
        "Laporan pipeline penjualan & riwayat interaksi prospek",
      ],
      idealFor: "UMKM yang sedang berkembang, agensi digital, dan tim penjualan aktif",
    },
    {
      id: "pro",
      name: "Pro Enterprise",
      price: 699000,
      priceFormatted: "Rp699.000 / bulan",
      period: "per bulan",
      features: [
        "Semua fitur Business",
        "Kapasitas AI 1.000 permintaan per hari",
        "Kursi tim tak terbatas",
        "Kustomisasi avatar & denah ruangan kantor 3D",
        "Dukungan prioritas tim teknis Ekalaya",
        "Opsi integrasi resmi WhatsApp Business Platform",
      ],
      idealFor: "Perusahaan skala menengah, startup dengan cabang remote, dan korporasi",
    },
  ],

  paymentMethods: [
    "QRIS (Semua e-wallet: GoPay, OVO, Dana, ShopeePay)",
    "Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata)",
    "Kartu Kredit / Debit Online (Visa / Mastercard)",
    "Transfer Bank Manual dengan verifikasi admin",
  ],

  guaranteesAndPolicies: {
    refundPolicy: "Garansi 7 hari uang kembali tanpa syarat jika tidak puas dengan platform.",
    trialPolicy: "Bisa dicoba gratis 14 hari tanpa perlu memasukkan kartu kredit.",
    dataSecurity: "Data isolasi multi-tenant dengan enkripsi dan hak akses ketat organisasi.",
  },

  salesFollowUpGuidelines: {
    New: {
      goal: "Menyapa ramah dalam waktu < 15 menit, memperkenalkan Ekalaya, dan menanyakan tantangan tim saat ini.",
      suggestedTone: "Ramah, antusias, tidak memaksa, memperkenalkan nilai efisiensi kerja tim.",
    },
    Contacted: {
      goal: "Mengidentifikasi kebutuhan spesifik (apakah butuh CRM, otomatisasi follow-up, atau kantor 3D interaktif).",
      suggestedTone: "Konsultatif, mendengarkan kebutuhan calon klien.",
    },
    Interested: {
      goal: "Mengirimkan rekomendasi paket (Starter atau Business) beserta demonstrasi fitur yang relevan.",
      suggestedTone: "Meyakinkan, memberikan solusi konkret terhadap masalah waktu dan omzet.",
    },
    Negotiation: {
      goal: "Membahas termin langganan (diskon 2 bulan gratis untuk pembayaran tahunan) dan proses aktivasi.",
      suggestedTone: "Solutif, fleksibel, fokus pada kepastian ROI bisnis klien.",
    },
    Won: {
      goal: "Menyambut klien baru, mengirimkan panduan onboarding dan link akses kantor 3D tim.",
      suggestedTone: "Penuh apresiasi, profesional, dan siap membantu onboarding.",
    },
    Lost: {
      goal: "Menanyakan dengan sopan masukan yang bisa diperbaiki dan menjaga relasi baik untuk masa depan.",
      suggestedTone: "Sopan, bersahabat, terbuka.",
    },
  },
};
