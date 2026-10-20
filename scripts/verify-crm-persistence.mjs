import {
  mapDbLeadToFrontend,
  mapFrontendLeadToDb,
  getLeadStats,
  addLead,
  updateLead,
  deleteLead,
  getStoredLeads,
} from "../lib/crmStore.js";
import { SUBSCRIPTION_PLANS, activateSubscription } from "../lib/subscriptionStore.js";
import { BUSINESS_KNOWLEDGE_BASE } from "../lib/knowledgeBase.js";

async function runCrmTests() {
  console.log("==================================================");
  console.log("EKALAYA AI OFFICE — TAHAP 2 VERIFIKASI CRM & PERSISTENSI");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. UJI: CRM dapat menambah, mengubah, dan membaca data
  const testLeadInput = {
    name: "PT Cahaya Digital",
    company: "Cahaya Tech",
    phone: "081299988877",
    source: "Website Landing",
    interest: "Paket Business (Rp299.000)",
    estimatedValue: 299000,
    status: "New",
    notes: "Minat integrasi 10 karyawan",
  };

  const addedLeads = addLead(testLeadInput);
  const foundAdded = addedLeads.find((l) => l.name === "PT Cahaya Digital");
  assert(Boolean(foundAdded && foundAdded.id), "1a. CRM berhasil menambah prospek baru dengan ID valid");

  const updatedLeads = updateLead(foundAdded.id, { status: "Negotiation", notes: "Sudah kirim proposal" });
  const foundUpdated = updatedLeads.find((l) => l.id === foundAdded.id);
  assert(foundUpdated.status === "Negotiation" && foundUpdated.notes === "Sudah kirim proposal", "1b. CRM berhasil mengubah data prospek");

  const readLeads = getStoredLeads();
  assert(readLeads.some((l) => l.id === foundAdded.id), "1c. CRM berhasil membaca data prospek dari persistence store");

  // Bersihkan data tes
  deleteLead(foundAdded.id);

  // 2. UJI: Data tetap tersedia dan potensi omzet dihitung akurat dari database
  const sampleLeads = [
    { id: "lead_a", name: "Client A", estimatedValue: 100000, status: "Interested" },
    { id: "lead_b", name: "Client B", estimatedValue: 300000, status: "Won" },
    { id: "lead_c", name: "Client C", estimatedValue: 500000, status: "Lost" }, // Lost tidak dihitung dalam potensi
  ];
  const stats = getLeadStats(sampleLeads);
  assert(stats.total === 3, "2a. Perhitungan Total Prospek akurat");
  assert(stats.won === 1, "2b. Perhitungan Deals Menang (Won) akurat");
  assert(stats.active === 1, "2c. Perhitungan Pipeline Aktif akurat");
  assert(stats.potentialRevenue === 400000, "2d. Perhitungan Potensi Omzet (tanpa Lost) akurat (100k + 300k = 400k)");

  // 3. UJI: Pemetaan Skema Database Supabase <-> Frontend
  const mockDbRow = {
    id: "7b4c6e91-8a9d-42bc-9d3e-1f2a3b4c5d6e",
    user_id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    name: "Suryanto",
    company: "Suryanto Motor",
    phone: "0811223344",
    source: "WhatsApp",
    interest: "Paket Starter (Rp99.000)",
    estimated_value: "99000",
    status: "Interested",
    notes: "Tanya promo akhir bulan",
    assigned_to: "Rina",
    created_at: "2026-10-20T10:00:00Z",
    updated_at: "2026-10-20T10:00:00Z",
  };
  const frontendLead = mapDbLeadToFrontend(mockDbRow);
  assert(frontendLead.estimatedValue === 99000 && typeof frontendLead.estimatedValue === "number", "3a. mapDbLeadToFrontend mengonversi estimated_value ke number");
  assert(frontendLead.userId === mockDbRow.user_id, "3b. mapDbLeadToFrontend mempertahankan user_id kepemilikan");

  const dbPayload = mapFrontendLeadToDb(frontendLead, mockDbRow.user_id);
  assert(dbPayload.user_id === mockDbRow.user_id, "3c. mapFrontendLeadToDb mengikat kepemilikan ke user_id autentik");
  assert(dbPayload.estimated_value === 99000, "3d. mapFrontendLeadToDb memetakan ke nama kolom database snake_case");

  // 4. UJI: Validasi Paket Langganan Resmi & Pencegahan Manipulasi Frontend
  assert(SUBSCRIPTION_PLANS.free.price === 0, "4a. Paket Free konsisten gratis");
  assert(SUBSCRIPTION_PLANS.starter.price === 99000, "4b. Paket Starter konsisten Rp99.000");
  assert(SUBSCRIPTION_PLANS.business.price === 299000, "4c. Paket Business konsisten Rp299.000");
  assert(SUBSCRIPTION_PLANS.pro.price === 699000, "4d. Paket Pro konsisten Rp699.000");

  const activatedTrial = activateSubscription("ORDER_TEST_01", "starter");
  assert(activatedTrial.planId === "starter", "4e. Paket Starter diaktifkan sesuai katalog resmi");
  assert(activatedTrial.aiLimitPerDay === 100, "4f. Kuota paket Starter terverifikasi 100/hari di server");

  // 5. UJI: Integritas Basis Pengetahuan Grounded
  assert(BUSINESS_KNOWLEDGE_BASE.company.name === "PT Ekalaya Inovasi Digital", "5a. Identitas perusahaan di knowledge base konsisten");
  assert(BUSINESS_KNOWLEDGE_BASE.plans.length === 4, "5b. Jumlah paket di knowledge base konsisten");

  console.log("==================================================");
  console.log(`HASIL TEST: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runCrmTests();
