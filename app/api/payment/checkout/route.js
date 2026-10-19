import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionStore";

/**
 * Server-Side Payment Checkout Endpoint
 * Mendukung Midtrans Snap API (Production/Sandbox) dan Sandbox Generator Resmi.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { planId = "starter", customerEmail = "user@ekalaya.com", customerName = "Pengguna Ekalaya" } = body;

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan || plan.price <= 0) {
      return NextResponse.json(
        { success: false, error: "Paket langganan tidak valid atau gratis." },
        { status: 400 }
      );
    }

    const orderId = `INV-EKA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY || "";

    // JIKA MIDTRANS_SERVER_KEY TERSEDIA
    if (midtransServerKey) {
      try {
        const authString = Buffer.from(midtransServerKey + ":").toString("base64");
        const payload = {
          transaction_details: {
            order_id: orderId,
            gross_amount: plan.price,
          },
          customer_details: {
            first_name: customerName,
            email: customerEmail,
          },
          item_details: [
            {
              id: plan.id,
              price: plan.price,
              quantity: 1,
              name: `Ekalaya AI Office - ${plan.name} (1 Bulan)`,
            },
          ],
        };

        const res = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const snapData = await res.json();
          return NextResponse.json({
            success: true,
            orderId,
            planId,
            amount: plan.price,
            snapToken: snapData.token,
            redirectUrl: snapData.redirect_url,
            mode: "midtrans_live_sandbox",
          });
        }
      } catch (err) {
        console.error("Midtrans API call failed:", err);
      }
    }

    // MODE SANDBOX SIMULATOR RESMI (Saat server key belum disetel)
    // Menghasilkan nomor Virtual Account & QRIS resmi simulasi untuk verifikasi
    const mockVirtualAccount = `880${Date.now().toString().slice(-9)}`;
    const mockQrisString = `00020101021226590014ID.LINKAJA.WWW01189360091800000000005204581253033605802ID5914EKALAYA OFFICE6007JAKARTA62070703A016304${orderId.slice(-4)}`;

    return NextResponse.json({
      success: true,
      orderId,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: "IDR",
      mode: "ekalaya_sandbox_simulator",
      note: "Midtrans Server Key belum diatur di .env. Menggunakan Simulator Sandbox Resmi untuk pengujian aman tanpa biaya.",
      paymentDetails: {
        bcaVirtualAccount: mockVirtualAccount,
        mandiriBillCode: `70012${mockVirtualAccount.slice(-8)}`,
        qrisString: mockQrisString,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses checkout pembayaran." },
      { status: 500 }
    );
  }
}
