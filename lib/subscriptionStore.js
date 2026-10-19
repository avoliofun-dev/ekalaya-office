/**
 * Subscription Store & Entitlements Management
 * Mengelola status paket langganan pengguna, riwayat transaksi, dan kuota hak akses.
 */

const STORAGE_KEY_SUB = "ekalaya_user_subscription";
const STORAGE_KEY_TX = "ekalaya_payment_transactions";

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free Trial",
    badge: "Free",
    price: 0,
    priceFormatted: "Gratis (Trial 14 Hari)",
    aiLimitPerDay: 20,
    maxTeamMembers: 1,
    features: [
      "Akses Kantor Virtual 3D",
      "CRM Dasar (10 kontak)",
      "20 AI requests/hari",
      "1 Akun Pengguna",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    badge: "Starter",
    price: 99000,
    priceFormatted: "Rp99.000 / bulan",
    aiLimitPerDay: 100,
    maxTeamMembers: 3,
    features: [
      "Semua fitur Free",
      "100 AI requests/hari",
      "CRM Prospek hingga 100 kontak",
      "Draf WhatsApp Follow-up Otomatis",
      "3 Kursi Anggota Tim",
    ],
  },
  business: {
    id: "business",
    name: "Business (Populer)",
    badge: "Business",
    price: 299000,
    priceFormatted: "Rp299.000 / bulan",
    aiLimitPerDay: 300,
    maxTeamMembers: 10,
    features: [
      "Semua fitur Starter",
      "300 AI requests/hari",
      "CRM Prospek Tanpa Batas",
      "AI Customer Service Assistant",
      "Basis Pengetahuan Tim Terpadu",
      "10 Kursi Anggota Tim",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Enterprise",
    badge: "Pro",
    price: 699000,
    priceFormatted: "Rp699.000 / bulan",
    aiLimitPerDay: 1000,
    maxTeamMembers: 999,
    features: [
      "Semua fitur Business",
      "1.000 AI requests/hari",
      "Kursi Tim Tak Terbatas",
      "Kustomisasi Ruang Kantor 3D",
      "Integrasi WhatsApp Business Platform",
      "Dukungan Prioritas 24/7",
    ],
  },
};

const DEFAULT_SUBSCRIPTION = {
  planId: "free",
  status: "active", // "active" | "pending" | "expired"
  startedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 hari trial
  isTrial: true,
};

export function getStoredSubscription() {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIPTION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUB);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(DEFAULT_SUBSCRIPTION));
      return DEFAULT_SUBSCRIPTION;
    }
    const parsed = JSON.parse(raw);
    return parsed.planId ? parsed : DEFAULT_SUBSCRIPTION;
  } catch (err) {
    console.error("Gagal membaca langganan:", err);
    return DEFAULT_SUBSCRIPTION;
  }
}

export function activateSubscription(orderId, planId, paymentDetails = {}) {
  if (typeof window === "undefined") return;
  try {
    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 hari aktif

    const newSub = {
      planId,
      status: "active",
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      isTrial: false,
      lastOrderId: orderId,
      planName: plan.name,
      aiLimitPerDay: plan.aiLimitPerDay,
    };

    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(newSub));

    // Catat transaksi pembayaran
    const txList = getStoredTransactions();
    const newTx = {
      orderId,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: "IDR",
      paymentMethod: paymentDetails.paymentMethod || "QRIS / VA Sandbox",
      status: "settlement",
      timestamp: now.toISOString(),
      isSandbox: true,
    };
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([newTx, ...txList]));

    return newSub;
  } catch (err) {
    console.error("Gagal mengaktifkan paket:", err);
  }
}

export function getStoredTransactions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
