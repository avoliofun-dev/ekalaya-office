import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Server-Side Idempotent Webhook Notification Handler
 * Memverifikasi notifikasi pembayaran dari Midtrans / Sandbox Gateway.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Verifikasi Signature jika Midtrans Key disetel
    if (midtransServerKey && signature_key) {
      const rawString = `${order_id}${status_code}${gross_amount}${midtransServerKey}`;
      const expectedSignature = crypto.createHash("sha512").update(rawString).digest("hex");

      if (signature_key !== expectedSignature) {
        return NextResponse.json(
          { success: false, error: "Invalid signature key." },
          { status: 403 }
        );
      }
    }

    let isSuccess = false;
    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      isSuccess = true;
    }

    return NextResponse.json({
      status: "ok",
      processed: true,
      orderId: order_id,
      transactionStatus: transaction_status || "settlement",
      isEntitlementActivated: isSuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses webhook pembayaran." },
      { status: 500 }
    );
  }
}
