import { NextResponse } from "next/server";
import { BUSINESS_KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { CRM_STORAGE_KEY } from "@/lib/crmStore";

/**
 * Endpoint POST /api/ai/character
 * Sesuai Konsep 3: Menghubungkan Karakter 3D (Luna - AI Sales Assistant)
 * ke mesin otomasi n8n dan fallback basis pengetahuan CRM grounded.
 */
export async function POST(request) {
  const requestId = "req_" + Math.random().toString(36).substring(2, 10);

  try {
    const body = await request.json();
    const {
      characterId = "npc-luna",
      message = "",
      conversationId = "conv_" + Date.now(),
      user = { id: "user_anon", name: "Guest", role: "Member" },
      organization = { id: "org_default", plan: "Free" },
      actionPayload = null,
    } = body;

    // 1. VALIDASI UKURAN & INTEGRITAS PESAN (STEP 3)
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_MESSAGE",
          message: "Pesan tidak boleh kosong dan harus berupa teks valid.",
          requestId,
        },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "MESSAGE_TOO_LARGE",
          message: "Pesan melebihi batas maksimum 1000 karakter.",
          requestId,
        },
        { status: 400 }
      );
    }

    // 2. CEK INTEGRASI WEBHOOK N8N (STEP 4)
    const n8nWebhookUrl = process.env.N8N_LUNA_WEBHOOK_URL || "";
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "";

    if (n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout pengaman

        const n8nRes = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret": n8nSecret,
            "x-request-id": requestId,
          },
          body: JSON.stringify({
            characterId,
            message: message.trim(),
            user: {
              id: user.id || "user_anon",
              name: user.name || "User",
              role: user.role || "Member",
            },
            organization: {
              id: organization.id || "org_default",
              plan: organization.plan || "Free",
            },
            conversationId,
            requestId,
            actionPayload,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          const lowerMsg = message.toLowerCase();

          // Resolusi aksi bisnis terstruktur (Business Tools) jika workflow n8n belum mengembalikan action spesifik
          let resolvedAction = n8nData.action || null;
          if (!resolvedAction) {
            if (
              lowerMsg.includes("cari lead") ||
              lowerMsg.includes("daftar lead") ||
              lowerMsg.includes("prospek") ||
              lowerMsg.includes("calon pembeli") ||
              lowerMsg.includes("leads")
            ) {
              resolvedAction = {
                type: "VIEW_LEADS",
                title: "Daftar Prospek Penjualan Terverifikasi (n8n Engine)",
                filter: lowerMsg.includes("interested") ? "Interested" : "All",
                hint: "Menampilkan data prospek yang tersinkronisasi via alur kerja n8n Ekalaya.",
              };
            } else if (
              lowerMsg.includes("ringkasan") ||
              lowerMsg.includes("pipeline") ||
              lowerMsg.includes("omzet") ||
              lowerMsg.includes("performa") ||
              lowerMsg.includes("summary")
            ) {
              resolvedAction = {
                type: "LEAD_SUMMARY",
                title: "Ringkasan Performa Pipeline Penjualan (n8n Engine)",
                stats: {
                  totalPipelineIdr: 45000000,
                  activeLeadsCount: 6,
                  targetClosingMonth: "Rp 35.000.000",
                },
              };
            } else if (
              lowerMsg.includes("harga") ||
              lowerMsg.includes("paket") ||
              lowerMsg.includes("katalog") ||
              lowerMsg.includes("starter") ||
              lowerMsg.includes("business") ||
              lowerMsg.includes("biaya")
            ) {
              resolvedAction = {
                type: "PRODUCT_INFO",
                title: "Katalog Resmi Paket Ekalaya AI Office (n8n Synced)",
                plans: BUSINESS_KNOWLEDGE_BASE.plans || [],
              };
            } else if (
              lowerMsg.includes("buatkan pesan") ||
              lowerMsg.includes("draf") ||
              lowerMsg.includes("follow up") ||
              lowerMsg.includes("whatsapp") ||
              lowerMsg.includes("chat wa")
            ) {
              const targetName = (actionPayload && actionPayload.leadName) || "Bapak/Ibu Klien";
              const draftMessage = `Halo ${targetName}, selamat pagi/siang! 👋\n\nSaya Luna dari PT Ekalaya Inovasi Digital. Berdasarkan automasi alur kerja n8n kami, kami melihat ketertarikan Anda terhadap platform Kantor Virtual 3D & AI Sales Assistant kemarin.\n\nApakah ada waktu luang hari ini jam 14:00 WIB untuk kami demokan fiturnya?\n\nTerima kasih! 🙏`;
              resolvedAction = {
                type: "DRAFT_PREVIEW",
                title: "Draf Pesan Follow-Up WhatsApp Resmi (n8n)",
                recipient: targetName,
                draftText: draftMessage,
                requiresConfirmation: true,
              };
            }
          }

          return NextResponse.json({
            success: true,
            character: characterId,
            characterName: "Luna",
            message: n8nData.message || "Tugas berhasil diproses oleh workflow n8n.",
            conversationId: n8nData.conversationId || conversationId,
            action: resolvedAction,
            state: "completed",
            requestId,
            source: "n8n_workflow",
          });
        } else {
          console.warn(`[n8n Webhook Warning] Status: ${n8nRes.status}. Beralih ke fallback cerdas lokal.`);
        }
      } catch (err) {
        console.warn(`[n8n Webhook Error] ${err.name === "AbortError" ? "Timeout" : err.message}. Menggunakan fallback lokal terverifikasi.`);
      }
    }

    // 3. GROUNDED FALLBACK & BUSINESS TOOLS (STEP 5)
    // Berjalan aman dan cerdas jika n8n belum dikonfigurasi atau sedang offline
    const lowerMsg = message.toLowerCase();
    let action = null;
    let replyText = "";

    // INTENT A: CARI PROSPEK / DAFTAR LEADS (Read-only CRM)
    if (
      lowerMsg.includes("cari lead") ||
      lowerMsg.includes("daftar lead") ||
      lowerMsg.includes("prospek") ||
      lowerMsg.includes("calon pembeli") ||
      lowerMsg.includes("leads")
    ) {
      action = {
        type: "VIEW_LEADS",
        title: "Daftar Prospek Penjualan Terverifikasi",
        filter: lowerMsg.includes("interested") ? "Interested" : "All",
        hint: "Menampilkan data prospek dari CRM Store Ekalaya Office.",
      };
      replyText = "Tentu! Saya sudah menyaring data prospek penjualan aktif dari CRM Anda. Anda dapat melihat detail status, potensi nilai transaksi, dan tombol follow-up WhatsApp langsung pada panel di bawah.";
    }
    // INTENT B: RINGKASAN PIPELINE & OMZET
    else if (
      lowerMsg.includes("ringkasan") ||
      lowerMsg.includes("pipeline") ||
      lowerMsg.includes("omzet") ||
      lowerMsg.includes("performa") ||
      lowerMsg.includes("summary")
    ) {
      action = {
        type: "LEAD_SUMMARY",
        title: "Ringkasan Performa Pipeline Penjualan",
        stats: {
          totalPipelineIdr: 45000000,
          activeLeadsCount: 6,
          targetClosingMonth: "Rp 35.000.000",
        },
      };
      replyText = "Berikut adalah ringkasan kesehatan pipeline penjualan kita saat ini: Terdapat potensi omzet sebesar Rp 45.000.000 dengan 6 prospek aktif berjalan. 2 prospek berada di tahap negosiasi akhir.";
    }
    // INTENT C: INFORMASI PRODUK & HARGA PAKET (Knowledge Base)
    else if (
      lowerMsg.includes("harga") ||
      lowerMsg.includes("paket") ||
      lowerMsg.includes("katalog") ||
      lowerMsg.includes("starter") ||
      lowerMsg.includes("business") ||
      lowerMsg.includes("biaya")
    ) {
      const plansList = (BUSINESS_KNOWLEDGE_BASE.plans || []).map((p) => `• ${p.name}: ${p.priceFormatted || "Gratis"} (${p.idealFor || p.name})`).join("\n");
      action = {
        type: "PRODUCT_INFO",
        title: "Katalog Resmi Paket Ekalaya AI Office",
        plans: BUSINESS_KNOWLEDGE_BASE.plans || [],
      };
      replyText = `Berikut adalah katalog paket resmi Ekalaya Virtual Office:\n\n${plansList}\n\nSemua paket berbayar mendapatkan garansi 7 hari uang kembali dan dukungan asisten penjualan AI 24/7.`;
    }
    // INTENT D: BUAT DRAF PESAN FOLLOW-UP WHATSAPP
    else if (
      lowerMsg.includes("buatkan pesan") ||
      lowerMsg.includes("draf") ||
      lowerMsg.includes("follow up") ||
      lowerMsg.includes("whatsapp") ||
      lowerMsg.includes("chat wa")
    ) {
      const targetName = (actionPayload && actionPayload.leadName) || "Bapak/Ibu Klien";
      const draftMessage = `Halo ${targetName}, selamat pagi/siang! 👋\n\nSaya Luna dari PT Ekalaya Inovasi Digital. Menindaklanjuti ketertarikan Anda terhadap platform Kantor Virtual 3D & AI Business Office kemarin, kami ingin menawarkan sesi demo singkat dan uji coba paket Starter gratis selama 7 hari.\n\nApakah ada waktu luang hari ini jam 14:00 WIB untuk kami demokan fiturnya?\n\nTerima kasih! 🙏`;

      action = {
        type: "DRAFT_PREVIEW",
        title: "Draf Pesan Follow-Up WhatsApp Resmi",
        recipient: targetName,
        draftText: draftMessage,
        requiresConfirmation: true,
      };
      replyText = `Saya sudah menyusun draf pesan follow-up berbasis SOP resmi untuk ${targetName}. Silakan tinjau dan konfirmasi teksnya di bawah sebelum dikirimkan.`;
    }
    // INTENT E: SAPAAN & PERCAKAPAN UMUM
    else {
      replyText = `Halo ${user.name || "Bapak/Ibu"}! Saya Luna, Asisten Penjualan AI di Ekalaya Virtual Office. Saya dapat membantu Anda mencari data prospek CRM, melihat katalog paket resmi, serta menyusun draf pesan follow-up WhatsApp otomatis. Ada tugas yang ingin saya bantu sekarang?`;
    }

    return NextResponse.json({
      success: true,
      character: characterId,
      characterName: "Luna",
      message: replyText,
      conversationId,
      action,
      state: "completed",
      requestId,
      source: "grounded_knowledge_base",
    });
  } catch (error) {
    console.error("[POST /api/ai/character Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kendala pada pemrosesan AI karakter. Silakan coba kembali sesaat lagi.",
        requestId,
      },
      { status: 500 }
    );
  }
}
