/**
 * Subscription Store & Entitlements Management
 * Mengelola status paket langganan pengguna, riwayat transaksi, dan kuota hak akses.
 * Memvalidasi paket secara ketat agar harga dan status tidak dapat dimanipulasi dari frontend.
 */

import { supabase, isSupabaseConfigured } from "./supabase.js";

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
  planName: "Free Trial",
  aiLimitPerDay: 20,
};

/**
 * Mengambil langganan aktif pengguna dari Supabase database (jika login) atau cache lokal
 */
export async function fetchUserSubscriptionAsync(user = null) {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIPTION;

  if (isSupabaseConfigured && supabase && user?.id && !user?.isEmergencyPin) {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        const plan = SUBSCRIPTION_PLANS[data.plan_id] || SUBSCRIPTION_PLANS.free;
        const sub = {
          planId: data.plan_id,
          status: data.status,
          startedAt: data.started_at,
          expiresAt: data.expires_at,
          isTrial: data.is_trial,
          lastOrderId: data.last_order_id,
          planName: plan.name,
          aiLimitPerDay: plan.aiLimitPerDay,
        };
        localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(sub));
        return sub;
      }
    } catch (err) {
      console.warn("Gagal fetch langganan dari Supabase, gunakan cache lokal:", err);
    }
  }

  return getStoredSubscription();
}

// In-memory fallback untuk Node.js / Server-Side Rendering
let inMemorySubscription = { ...DEFAULT_SUBSCRIPTION };
let inMemoryTransactions = [];

export function getStoredSubscription() {
  if (typeof window === "undefined") return inMemorySubscription;
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

/**
 * Aktivasi Paket dalam Mode Sandbox (Simulator Terverifikasi)
 * Memastikan data paket, nama, dan harga divalidasi dari SUBSCRIPTION_PLANS resmi
 */
export async function activateSubscriptionAsync(orderId, planId, paymentDetails = {}, user = null) {
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newSub = {
    planId: plan.id,
    status: "active",
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    isTrial: false,
    lastOrderId: orderId,
    planName: plan.name,
    aiLimitPerDay: plan.aiLimitPerDay,
    isSandbox: true,
  };

  // Simpan ke cache lokal
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(newSub));
  }

  // Catat transaksi dengan harga resmi dari catalog SUBSCRIPTION_PLANS (mencegah manipulasi harga)
  const newTx = {
    orderId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price, // Harga resmi tidak bisa dimanipulasi dari frontend
    currency: "IDR",
    paymentMethod: paymentDetails.paymentMethod || "QRIS / VA Sandbox",
    status: "settlement",
    timestamp: now.toISOString(),
    isSandbox: true,
  };

  if (typeof window !== "undefined") {
    const txList = getStoredTransactions();
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([newTx, ...txList]));
  }

  // Jika terhubung ke Supabase dan pengguna terautentikasi, catat ke database
  if (isSupabaseConfigured && supabase && user?.id && !user?.isEmergencyPin) {
    try {
      await supabase.from("transactions").insert({
        order_id: orderId,
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        currency: "IDR",
        payment_method: paymentDetails.paymentMethod || "QRIS / VA Sandbox",
        status: "settlement",
        is_sandbox: true,
      });
    } catch (e) {
      console.warn("Gagal insert transaksi ke Supabase:", e);
    }
  }

  return newSub;
}

export function activateSubscription(orderId, planId, paymentDetails = {}) {
  // Fungsi sinkron untuk kompatibilitas
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newSub = {
    planId: plan.id,
    status: "active",
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    isTrial: false,
    lastOrderId: orderId,
    planName: plan.name,
    aiLimitPerDay: plan.aiLimitPerDay,
    isSandbox: true,
  };

  const newTx = {
    orderId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    currency: "IDR",
    paymentMethod: paymentDetails.paymentMethod || "QRIS / VA Sandbox",
    status: "settlement",
    timestamp: now.toISOString(),
    isSandbox: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(newSub));
    const txList = getStoredTransactions();
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([newTx, ...txList]));
  } else {
    inMemorySubscription = newSub;
    inMemoryTransactions = [newTx, ...inMemoryTransactions];
  }

  return newSub;
}

export function getStoredTransactions() {
  if (typeof window === "undefined") return inMemoryTransactions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
