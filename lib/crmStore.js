/**
 * CRM Store & Data Persistence Layer
 * Mengelola data prospek (Leads), status pipeline penjualan, dan pelacakan kuota AI.
 * Mendukung persistensi Supabase Database (public.leads) dengan fallback offline lokal aman.
 */

import { supabase, isSupabaseConfigured } from "./supabase.js";

export const STORAGE_KEY_LEADS = "ekalaya_crm_leads";
export const CRM_STORAGE_KEY = STORAGE_KEY_LEADS;
export const STORAGE_KEY_QUOTA = "ekalaya_ai_daily_quota";
export const DAILY_AI_LIMIT = 20;

export const LEAD_STATUSES = [
  { id: "New", label: "Prospek Baru", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "Contacted", label: "Sudah Dikontak", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "Interested", label: "Tertarik", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { id: "Negotiation", label: "Negosiasi", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  { id: "Won", label: "Menang (Won)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "Lost", label: "Batal (Lost)", color: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
];

export const INITIAL_DEFAULT_LEADS = [
  {
    id: "lead_1",
    name: "Hendro Saputra",
    company: "Toko Laptop Nusantara",
    phone: "081234567891",
    source: "WhatsApp",
    interest: "Paket Starter (Otomasi Follow-Up Toko)",
    estimatedValue: 99000,
    status: "Interested",
    assignedTo: "Rani (Lead Product)",
    lastContact: "Hari ini, 10:15 WIB",
    nextFollowUp: "2026-10-20",
    notes: "Butuh asisten AI untuk membalas chat calon pembeli laptop bekas di marketplace.",
    createdAt: "2026-10-18T09:00:00Z",
  },
  {
    id: "lead_2",
    name: "Maya Anggraini",
    company: "Studio Desain Pixel Studio",
    phone: "082198765432",
    source: "Website Landing",
    interest: "Paket Business (Kantor 3D Tim Remote)",
    estimatedValue: 299000,
    status: "Negotiation",
    assignedTo: "Dimas (DevOps)",
    lastContact: "Kemarin, 14:30 WIB",
    nextFollowUp: "2026-10-21",
    notes: "Ingin coba demo kantor 3D untuk 6 desainer timnya. Menanyakan opsi pembayaran tahunan.",
    createdAt: "2026-10-17T11:20:00Z",
  },
  {
    id: "lead_3",
    name: "Dr. Budi Santoso",
    company: "Klinik Estetika Glow",
    phone: "085612349876",
    source: "Rujukan Kolega",
    interest: "Paket Business (CS Otomatisasi Janji Temu)",
    estimatedValue: 299000,
    status: "New",
    assignedTo: "Budi (Support)",
    lastContact: "Belum dikontak",
    nextFollowUp: "2026-10-20",
    notes: "Baru mengisi form kontak. Tertarik dengan asisten CS untuk reservasi pasien.",
    createdAt: "2026-10-19T08:15:00Z",
  },
];

/**
 * Transformasi dari skema database Supabase public.leads ke format frontend
 */
export function mapDbLeadToFrontend(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    company: row.company || "",
    phone: row.phone || "",
    source: row.source || "WhatsApp",
    interest: row.interest || "Paket Starter (Rp99.000)",
    estimatedValue: Number(row.estimated_value) || 0,
    status: row.status || "New",
    notes: row.notes || "",
    assignedTo: row.assigned_to || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transformasi dari format frontend ke format payload insert/update database Supabase
 */
export function mapFrontendLeadToDb(lead, userId) {
  const payload = {
    name: lead.name,
    company: lead.company || "",
    phone: lead.phone || "",
    source: lead.source || "WhatsApp",
    interest: lead.interest || "Paket Starter (Rp99.000)",
    estimated_value: Number(lead.estimatedValue) || 0,
    status: lead.status || "New",
    notes: lead.notes || "",
    assigned_to: lead.assignedTo || "",
  };
  if (userId) {
    payload.user_id = userId;
  }
  return payload;
}

// ==============================================================================
// PERSISTENSI SUPABASE DENGAN FALLBACK LOKAL
// ==============================================================================

/**
 * Mendeteksi UUID pengguna Supabase terautentikasi (baik dari prop user maupun dari sesi aktif client)
 */
export async function resolveAuthUserId(user = null) {
  if (user?.id && !user?.isEmergencyPin && user?.id !== "emergency-pin-session" && user?.id !== "local_preview_user") {
    return user.id;
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        return session.user.id;
      }
    } catch {}
  }
  return null;
}

/**
 * Mengambil daftar prospek secara asinkron dari Supabase (jika login) atau cache lokal
 */
export async function fetchLeadsAsync(user = null) {
  if (typeof window === "undefined") return INITIAL_DEFAULT_LEADS;

  const activeUserId = await resolveAuthUserId(user);

  if (isSupabaseConfigured && supabase && activeUserId) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Gagal fetch leads dari Supabase:", error.message);
      } else if (Array.isArray(data)) {
        const mapped = data.map(mapDbLeadToFrontend);
        // Jika data di Supabase ada, jadikan sumber kebenaran (sinkronkan ke lokal)
        if (mapped.length > 0) {
          saveAllLeads(mapped);
          return mapped;
        }
        // Jika Supabase kosong (0 data), kembalikan array kosong agar UI tahu tidak ada prospek di cloud
        return [];
      }
    } catch (err) {
      console.warn("Gagal fetch leads dari Supabase, menggunakan cache lokal:", err);
    }
  }

  return getStoredLeads();
}

/**
 * Menambahkan prospek baru ke Supabase database atau cache lokal
 */
export async function addLeadAsync(newLead, user = null) {
  const activeUserId = await resolveAuthUserId(user);

  if (isSupabaseConfigured && supabase && activeUserId) {
    try {
      const payload = mapFrontendLeadToDb(newLead, activeUserId);
      const { data, error } = await supabase
        .from("leads")
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Gagal simpan lead ke Supabase:", error.message, error.details);
      } else if (data) {
        const created = mapDbLeadToFrontend(data);
        const current = getStoredLeads();
        const updated = [created, ...current.filter((l) => l.id !== created.id)];
        saveAllLeads(updated);
        return { success: true, lead: created, allLeads: updated, source: "supabase" };
      }
    } catch (err) {
      console.warn("Gagal simpan lead ke Supabase, fallback ke lokal:", err);
    }
  }

  // Fallback lokal jika offline / PIN sementara / belum ada sesi Supabase
  const updated = addLead(newLead);
  return { success: true, lead: updated[0], allLeads: updated, source: "local" };
}

/**
 * Memperbarui prospek di Supabase database atau cache lokal
 */
export async function updateLeadAsync(leadId, updates, user = null) {
  const activeUserId = await resolveAuthUserId(user);

  if (isSupabaseConfigured && supabase && activeUserId) {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      if (updates.interest !== undefined) dbUpdates.interest = updates.interest;
      if (updates.estimatedValue !== undefined) dbUpdates.estimated_value = Number(updates.estimatedValue) || 0;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;

      const { data, error } = await supabase
        .from("leads")
        .update(dbUpdates)
        .eq("id", leadId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Gagal update lead di Supabase:", error.message);
      } else if (data) {
        const mapped = mapDbLeadToFrontend(data);
        const current = getStoredLeads();
        const updated = current.map((l) => (l.id === leadId ? mapped : l));
        saveAllLeads(updated);
        return { success: true, lead: mapped, allLeads: updated, source: "supabase" };
      }
    } catch (err) {
      console.warn("Gagal update lead di Supabase, fallback ke lokal:", err);
    }
  }

  // Fallback lokal
  const updated = updateLead(leadId, updates);
  return { success: true, lead: updated.find((l) => l.id === leadId), allLeads: updated, source: "local" };
}

/**
 * Menghapus prospek dari Supabase database atau cache lokal
 */
export async function deleteLeadAsync(leadId, user = null) {
  const activeUserId = await resolveAuthUserId(user);

  if (isSupabaseConfigured && supabase && activeUserId) {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", leadId);
      if (error) {
        console.error("Gagal delete lead di Supabase:", error.message);
      } else {
        const current = getStoredLeads();
        const updated = current.filter((l) => l.id !== leadId);
        saveAllLeads(updated);
        return { success: true, allLeads: updated, source: "supabase" };
      }
    } catch (err) {
      console.warn("Gagal delete lead di Supabase, fallback ke lokal:", err);
    }
  }

  const updated = deleteLead(leadId);
  return { success: true, allLeads: updated, source: "local" };
}

/**
 * Memigrasikan daftar prospek dari localStorage ke Supabase Cloud (Idempoten & Aman)
 */
export async function syncLocalLeadsToSupabaseAsync(user = null) {
  const activeUserId = await resolveAuthUserId(user);
  if (!isSupabaseConfigured || !supabase || !activeUserId) {
    return { success: false, error: "Sesi Supabase belum aktif atau Anda belum login." };
  }

  const localLeads = getStoredLeads();
  if (!localLeads || localLeads.length === 0) {
    return { success: true, count: 0, allLeads: [] };
  }

  try {
    const payloads = localLeads.map((l) => mapFrontendLeadToDb(l, activeUserId));
    const { data, error } = await supabase
      .from("leads")
      .insert(payloads)
      .select();

    if (error) {
      console.error("Gagal migrasi leads ke Supabase:", error.message);
      return { success: false, error: error.message };
    }

    const mapped = (data || []).map(mapDbLeadToFrontend);
    saveAllLeads(mapped);
    return { success: true, count: mapped.length, allLeads: mapped };
  } catch (err) {
    console.error("Kesalahan migrasi leads:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// METODE PERSISTENSI SINKRON UNTUK KOMPATIBILITAS KODE
// ==============================================================================

// In-memory fallback untuk Node.js / Server-Side Rendering
let inMemoryLeads = [...INITIAL_DEFAULT_LEADS];

export function getStoredLeads() {
  if (typeof window === "undefined") return inMemoryLeads;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(INITIAL_DEFAULT_LEADS));
      return INITIAL_DEFAULT_LEADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEFAULT_LEADS;
  } catch (err) {
    console.error("Gagal membaca leads dari storage:", err);
    return INITIAL_DEFAULT_LEADS;
  }
}

export function saveAllLeads(leads) {
  if (typeof window === "undefined") {
    inMemoryLeads = leads;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error("Gagal menyimpan leads:", err);
  }
}

export function addLead(newLead) {
  const leads = getStoredLeads();
  const leadWithId = {
    ...newLead,
    id: newLead.id || `lead_${Date.now()}`,
    createdAt: newLead.createdAt || new Date().toISOString(),
  };
  const updated = [leadWithId, ...leads];
  saveAllLeads(updated);
  return updated;
}

export function updateLead(leadId, updates) {
  const leads = getStoredLeads();
  const updated = leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l));
  saveAllLeads(updated);
  return updated;
}

export function deleteLead(leadId) {
  const leads = getStoredLeads();
  const updated = leads.filter((l) => l.id !== leadId);
  saveAllLeads(updated);
  return updated;
}

/**
 * Menghitung metrik statistik dan total estimasi potensi omzet dari data prospek
 */
export function getLeadStats(leads) {
  if (!Array.isArray(leads)) {
    return { total: 0, won: 0, active: 0, potentialRevenue: 0 };
  }
  const total = leads.length;
  const won = leads.filter((l) => l.status === "Won").length;
  const active = leads.filter((l) => l.status !== "Won" && l.status !== "Lost").length;
  const potentialRevenue = leads
    .filter((l) => l.status !== "Lost")
    .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

  return { total, won, active, potentialRevenue };
}

// ==============================================================================
// PELACAKAN KUOTA AI HARIAN DINAMIS & TERVERIFIKASI
// ==============================================================================

function getActivePlanLimit() {
  if (typeof window === "undefined") return DAILY_AI_LIMIT;
  try {
    const raw = localStorage.getItem("ekalaya_user_subscription");
    if (raw) {
      const sub = JSON.parse(raw);
      if (sub.aiLimitPerDay) return sub.aiLimitPerDay;
      if (sub.planId === "starter") return 100;
      if (sub.planId === "business") return 300;
      if (sub.planId === "pro") return 1000;
    }
    return DAILY_AI_LIMIT;
  } catch {
    return DAILY_AI_LIMIT;
  }
}

export function getDailyQuota() {
  const currentLimit = getActivePlanLimit();
  if (typeof window === "undefined") return { used: 0, remaining: currentLimit, limit: currentLimit };
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(STORAGE_KEY_QUOTA);
    if (!raw) {
      return { used: 0, remaining: currentLimit, limit: currentLimit, date: today };
    }
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) {
      const fresh = { used: 0, remaining: currentLimit, limit: currentLimit, date: today };
      localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(fresh));
      return fresh;
    }
    return {
      used: parsed.used || 0,
      remaining: Math.max(0, currentLimit - (parsed.used || 0)),
      limit: currentLimit,
      date: today,
    };
  } catch {
    return { used: 0, remaining: currentLimit, limit: currentLimit };
  }
}

export function incrementQuotaUsage() {
  if (typeof window === "undefined") return;
  try {
    const quota = getDailyQuota();
    const today = new Date().toISOString().slice(0, 10);
    const updated = {
      used: quota.used + 1,
      remaining: Math.max(0, quota.limit - (quota.used + 1)),
      limit: quota.limit,
      date: today,
    };
    localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Gagal update kuota:", err);
  }
}
