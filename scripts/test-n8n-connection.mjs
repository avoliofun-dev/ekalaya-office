// scripts/test-n8n-connection.mjs
// Test konektivitas langsung antara Web Ekalaya Office dan n8n

console.log("==================================================");
console.log("🔍 TESTING KONEKSI WEB EKALAYA OFFICE -> N8N");
console.log("==================================================");

const webhookUrl = process.env.N8N_LUNA_WEBHOOK_URL || "http://127.0.0.1:5678/webhook/ekalaya-ai";
console.log("Target Webhook URL:", webhookUrl);

const payload = {
  characterId: "npc-luna",
  message: "Halo Luna, bisakah bantu saya?",
  user: {
    id: "user_test",
    name: "Dimas (Test Owner)",
    role: "Owner",
  },
  organization: {
    id: "org_ekalaya",
    plan: "Pro",
  },
  conversationId: "conv_test_" + Date.now(),
  requestId: "req_test_" + Math.random().toString(36).substring(2, 8),
  timestamp: new Date().toISOString(),
};

try {
  const startTime = Date.now();
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": "your_n8n_webhook_secret_key",
    },
    body: JSON.stringify(payload),
  });

  const duration = Date.now() - startTime;
  console.log(`⏱️ Waktu Respon: ${duration} ms | HTTP Status: ${res.status} ${res.statusText}`);

  if (res.ok) {
    const data = await res.json();
    console.log("✅ KONEKSI BERHASIL! Respon dari n8n:");
    console.log(JSON.stringify(data, null, 2));
  } else {
    const errText = await res.text();
    console.error("❌ n8n merespon dengan status error:", res.status, errText);
  }
} catch (error) {
  console.error("❌ Gagal terhubung ke n8n:", error.message);
}
console.log("==================================================");
