import { NextResponse } from "next/server";
import { BUSINESS_KNOWLEDGE_BASE } from "@/lib/knowledgeBase";

/**
 * Server-Side AI Sales Assistant Endpoint
 * Mendukung integrasi LLM eksternal (Gemini/OpenAI) serta fallback berbasis basis pengetahuan resmi terverifikasi.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { taskType = "followup_draft", lead = null, userQuery = "" } = body;

    const geminiKey = process.env.GEMINI_API_KEY || "";
    const openAiKey = process.env.OPENAI_API_KEY || "";

    // JIKA TERSEDIA GEMINI API KEY DI SERVER
    if (geminiKey) {
      try {
        const systemPrompt = `Anda adalah Ekalaya AI Sales Assistant resmi untuk PT Ekalaya Inovasi Digital.
Gunakan HANYA informasi terverifikasi dari Basis Pengetahuan berikut:
${JSON.stringify(BUSINESS_KNOWLEDGE_BASE, null, 2)}

Aturan Penting:
1. Jangan pernah mengarang harga, paket, diskon, atau spesifikasi yang tidak ada di basis pengetahuan.
2. Gaya bahasa profesional, ramah, persuasif khas bisnis Indonesia.
3. Selalu format pesan agar siap dikirim via WhatsApp (dengan sapaan, poin jelas, dan panggilan tindakan).`;

        let userPrompt = "";
        if (taskType === "followup_draft" && lead) {
          userPrompt = `Buatkan draf pesan WhatsApp follow-up untuk prospek berikut:
Nama: ${lead.name}
Perusahaan: ${lead.company || "-"}
Status: ${lead.status}
Ketertarikan: ${lead.interest || "-"}
Catatan Terakhir: ${lead.notes || "-"}`;
        } else if (taskType === "next_step_recommendation" && lead) {
          userPrompt = `Berdasarkan status prospek "${lead.status}" untuk ${lead.name} (${lead.company}), apa rekomendasi langkah penjualan berikutnya yang paling strategis?`;
        } else {
          userPrompt = userQuery || "Jelaskan paket langganan Ekalaya AI Office.";
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nPermintaan:\n${userPrompt}` }],
                },
              ],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              success: true,
              result: generatedText,
              provider: "Gemini 1.5 Flash (Live Cloud)",
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Gagal memanggil Gemini API:", err);
      }
    }

    // JIKA TERSEDIA OPENAI API KEY DI SERVER
    if (openAiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `Anda adalah Ekalaya AI Sales Assistant resmi untuk PT Ekalaya Inovasi Digital. Gunakan HANYA basis pengetahuan ini: ${JSON.stringify(BUSINESS_KNOWLEDGE_BASE)}`,
              },
              {
                role: "user",
                content: taskType === "followup_draft" ? `Buat draf follow-up WhatsApp untuk ${lead?.name} (${lead?.status})` : userQuery,
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({
              success: true,
              result: text,
              provider: "OpenAI GPT-4o-mini (Live Cloud)",
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Gagal memanggil OpenAI API:", err);
      }
    }

    // MODE GROUNDED KNOWLEDGE BASE SERVER (Saat Kredensial API Eksternal Belum Disetel)
    // Menghasilkan draf yang akurat, terstruktur, dan tidak mengarang bebas sesuai pedoman SOP
    let fallbackText = "";
    const status = lead?.status || "New";
    const leadName = lead?.name || "Bapak/Ibu";
    const leadCompany = lead?.company ? ` (${lead.company})` : "";
    const interest = lead?.interest || "Kantor Virtual 3D & AI Ekalaya";

    if (taskType === "followup_draft") {
      switch (status) {
        case "New":
          fallbackText = `Halo ${leadName}${leadCompany}, salam kenal dari tim Ekalaya AI Business Office! 👋\n\nTerima kasih telah menunjukkan ketertarikan pada ${interest}. Kami ingin mengonfirmasi apakah ada waktu santai 5-10 menit untuk kami demokan bagaimana kantor virtual 3D dan asisten AI kami bisa membantu menghemat waktu tim Anda?\n\nSalam hangat,\nTim Penjualan Ekalaya`;
          break;
        case "Contacted":
          fallbackText = `Selamat siang ${leadName}${leadCompany}, melanjutkan obrolan singkat kita sebelumnya mengenai ${interest}. 😊\n\nUntuk kebutuhan tim saat ini, paket kami yang paling diminati adalah:\n• Starter (Rp99.000/bln) – untuk perorangan/toko\n• Business (Rp299.000/bln) – untuk tim aktif dengan asisten AI terpadu\n\nKira-kira paket mana yang paling pas untuk target bisnis Anda bulan ini?`;
          break;
        case "Interested":
          fallbackText = `Halo ${leadName}${leadCompany}! Semoga hari Anda menyenangkan. ✨\n\nMenindaklanjuti ketertarikan Anda pada ${interest}, kami sudah menyiapkan demo live kantor 3D yang bisa langsung dicoba bersama rekan kerja.\n\nApakah besok pukul 10:00 atau 14:00 WIB cocok untuk kita adakan sesi walkthrough singkat?`;
          break;
        case "Negotiation":
          fallbackText = `Halo ${leadName}${leadCompany}, salam hangat dari tim Ekalaya.\n\nMengenai diskusi paket langganan kemarin, khusus untuk aktivasi tahunan bulan ini, kami menyediakan benefit 2 Bulan Gratis langganan serta pendampingan setup kustom avatar kantor 3D.\n\nApakah kami bisa bantu siapkan tagihan aktivasi dan aksesnya hari ini?`;
          break;
        case "Won":
          fallbackText = `Selamat bergabung di keluarga Ekalaya AI Office, ${leadName}! 🎉🏢\n\nKantor virtual 3D dan akun tim Anda sudah aktif dan siap digunakan. Silakan akses link workspace kantor Anda dan tim support kami siap mendampingi sesi orientasi pertama.\n\nSukses selalu untuk kemajuan bisnis Anda!`;
          break;
        case "Lost":
          fallbackText = `Halo ${leadName}${leadCompany}, terima kasih banyak atas waktu dan diskusi yang telah kita luangkan sebelumnya.\n\nKami sangat memahami jika saat ini belum menjadi prioritas. Kami akan tetap menjaga kontak dan siap membantu kapan pun tim Anda membutuhkan otomasi kantor virtual di masa mendatang. 🙏`;
          break;
        default:
          fallbackText = `Halo ${leadName}${leadCompany}, ada yang bisa kami bantu terkait layanan kantor virtual Ekalaya AI?`;
      }
    } else if (taskType === "next_step_recommendation") {
      const guideline = BUSINESS_KNOWLEDGE_BASE.salesFollowUpGuidelines[status] || BUSINESS_KNOWLEDGE_BASE.salesFollowUpGuidelines.New;
      fallbackText = `📌 Rekomendasi Tindakan untuk [${leadName} - ${status}]:\n\n1. Target Utama: ${guideline.goal}\n2. Nada Pendekatan: ${guideline.suggestedTone}\n3. Aksi Cepat: Salin draf pesan WhatsApp yang telah disiapkan di atas, kirimkan via nomor ${lead?.phone || "resmi"}, dan jadwalkan follow-up berikutnya dalam 24-48 jam.`;
    } else {
      // Pertanyaan umum produk / query
      const starterPlan = BUSINESS_KNOWLEDGE_BASE.plans.find((p) => p.id === "starter");
      const businessPlan = BUSINESS_KNOWLEDGE_BASE.plans.find((p) => p.id === "business");
      fallbackText = `📚 Informasi Resmi Ekalaya AI Business Office:\n\n• Paket Starter: ${starterPlan.priceFormatted} (CRM prospek, 100 AI/hari, 3 user)\n• Paket Business: ${businessPlan.priceFormatted} (CRM tanpa batas, 300 AI/hari, 10 user)\n• Metode Pembayaran: QRIS, Virtual Account BCA/Mandiri/BNI/BRI, Kartu Kredit\n• Garansi: 7 hari uang kembali tanpa syarat.\n\n(Dihasilkan dari Basis Pengetahuan Terverifikasi)`;
    }

    return NextResponse.json({
      success: true,
      result: fallbackText,
      provider: "Ekalaya Knowledge-Base Grounding Engine (Server)",
      note: "API Key LLM eksternal (GEMINI_API_KEY / OPENAI_API_KEY) belum disetel di .env; respons didasarkan pada Basis Pengetahuan Resmi PT Ekalaya Inovasi Digital.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI API route error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses permintaan asisten AI." },
      { status: 500 }
    );
  }
}
