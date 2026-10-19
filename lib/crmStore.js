/**
 * CRM Store & Data Persistence Layer
 * Mengelola data prospek (Leads), status pipeline penjualan, dan pelacakan kuota AI.
 */

const STORAGE_KEY_LEADS = "ekalaya_crm_leads";
const STORAGE_KEY_QUOTA = "ekalaya_ai_daily_quota";
export const DAILY_AI_LIMIT = 20;

export const LEAD_STATUSES = [
  { id: "New", label: "Prospek Baru", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "Contacted", label: "Sudah Dikontak", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "Interested", label: "Tertarik", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { id: "Negotiation", label: "Negosiasi", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  { id: "Won", label: "Menang (Won)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "Lost", label: "Batal (Lost)", color: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
];

const INITIAL_DEFAULT_LEADS = [
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

export function getStoredLeads() {
  if (typeof window === "undefined") return INITIAL_DEFAULT_LEADS;
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
  if (typeof window === "undefined") return;
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
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
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

export function getLeadStats(leads) {
  const total = leads.length;
  const won = leads.filter((l) => l.status === "Won").length;
  const active = leads.filter((l) => l.status !== "Won" && l.status !== "Lost").length;
  const potentialRevenue = leads
    .filter((l) => l.status !== "Lost")
    .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

  return { total, won, active, potentialRevenue };
}

// Pelacakan Kuota AI Harian Dinamis Berdasarkan Paket Langganan
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
      // Reset harian
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
