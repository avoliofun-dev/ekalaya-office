import { NextResponse } from "next/server";

export async function GET() {
  const webhookUrl = process.env.N8N_LUNA_WEBHOOK_URL || "http://127.0.0.1:5678/webhook/ekalaya-ai";
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET || "",
      },
      body: JSON.stringify({ ping: true, checkTime: new Date().toISOString() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      online: res.ok,
      status: res.status,
      latencyMs,
      webhookUrl: webhookUrl.replace(/\/\/[^:]+:[^@]+@/, "//***@"),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      online: false,
      error: err.name === "AbortError" ? "Timeout" : err.message,
      webhookUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
