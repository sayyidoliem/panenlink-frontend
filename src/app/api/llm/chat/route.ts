import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/llm/chat
 * Proxies to the local FastAPI LLM service (local_llm_service.py) running on port 8000.
 * Falls back gracefully if the service is unavailable.
 */
const LLM_BASE = process.env.LLM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(`${LLM_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body.message }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`LLM service error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/llm/chat] LLM service unavailable:", err);
    return NextResponse.json(
      { reply: null, error: "LLM service tidak tersedia. Pastikan local_llm_service.py berjalan di port 8000." },
      { status: 503 }
    );
  }
}
