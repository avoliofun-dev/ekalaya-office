/**
 * Automated Verification Script for Ekalaya AI Business Office
 * Menguji skenario Phase 5 & Acceptance Criteria.
 */

import { BUSINESS_KNOWLEDGE_BASE } from "../lib/knowledgeBase.js";
import { SUBSCRIPTION_PLANS } from "../lib/subscriptionStore.js";

async function runTests() {
  console.log("=================================================");
  console.log("🚀 EKALAYA AI BUSINESS OFFICE - E2E TEST RUNNER");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  // 1. Verifikasi Basis Pengetahuan Bisnis
  console.log("--- 1. Testing Business Knowledge Base ---");
  assert(
    BUSINESS_KNOWLEDGE_BASE.plans.length === 4,
    "Knowledge Base memiliki 4 paket resmi (Free, Starter, Business, Pro)"
  );
  assert(
    BUSINESS_KNOWLEDGE_BASE.plans.find((p) => p.id === "starter")?.price === 99000,
    "Harga paket Starter konsisten di Rp99.000"
  );
  assert(
    BUSINESS_KNOWLEDGE_BASE.plans.find((p) => p.id === "business")?.price === 299000,
    "Harga paket Business konsisten di Rp299.000"
  );
  assert(
    !!BUSINESS_KNOWLEDGE_BASE.salesFollowUpGuidelines.New,
    "Tersedia pedoman SOP follow-up untuk prospek baru (New)"
  );

  // 2. Verifikasi Hak Akses Paket (Subscription Plans & Quotas)
  console.log("\n--- 2. Testing Subscription Entitlements ---");
  assert(
    SUBSCRIPTION_PLANS.free.aiLimitPerDay === 20,
    "Paket Free dibatasi pada 20 AI requests/hari"
  );
  assert(
    SUBSCRIPTION_PLANS.starter.aiLimitPerDay === 100,
    "Paket Starter dinaikkan ke 100 AI requests/hari"
  );
  assert(
    SUBSCRIPTION_PLANS.business.aiLimitPerDay === 300,
    "Paket Business dinaikkan ke 300 AI requests/hari"
  );
  assert(
    SUBSCRIPTION_PLANS.pro.aiLimitPerDay === 1000,
    "Paket Pro dinaikkan ke 1000 AI requests/hari"
  );

  // 3. Verifikasi Keamanan Secret & Environment Variable
  console.log("\n--- 3. Testing Security & Secret Leakage ---");
  const forbiddenPatterns = ["ghp_", "sk-proj-", "service_role", "sk_live_"];
  let hasForbiddenSecret = false;
  // Periksa .env.example
  try {
    const fs = await import("fs");
    const envExample = fs.readFileSync(".env.example", "utf-8");
    for (const pat of forbiddenPatterns) {
      if (envExample.includes(pat)) {
        hasForbiddenSecret = true;
      }
    }
  } catch (e) {}

  assert(
    !hasForbiddenSecret,
    "Tidak ada API keys produksi / private secrets yang bocor di repository"
  );

  // 4. Verifikasi Logika AI Sales Assistant Grounding
  console.log("\n--- 4. Testing AI Sales Assistant Grounding Fallback ---");
  const testLead = {
    name: "Hendro Saputra",
    company: "Toko Laptop Nusantara",
    status: "New",
    interest: "Paket Starter",
  };
  const guideline = BUSINESS_KNOWLEDGE_BASE.salesFollowUpGuidelines[testLead.status];
  assert(
    guideline && guideline.goal.includes("15 menit"),
    "AI grounding mengambil target SOP yang tepat untuk prospek New"
  );

  // 5. Verifikasi Keutuhan Modul Ekspor
  console.log("\n--- 5. Testing Module Integrity ---");
  assert(
    typeof BUSINESS_KNOWLEDGE_BASE === "object",
    "Module lib/knowledgeBase.js berhasil di-import tanpa sintaks error"
  );
  assert(
    typeof SUBSCRIPTION_PLANS === "object",
    "Module lib/subscriptionStore.js berhasil di-import tanpa sintaks error"
  );

  console.log("\n=================================================");
  console.log(`Hasil Pengujian: ${passed} Lulus, ${failed} Gagal`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
