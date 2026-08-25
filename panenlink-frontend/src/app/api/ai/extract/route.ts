import { NextResponse } from "next/server";
import { extractHeuristics } from "@/shared/lib/aiExtractor";

const LLM_URL = process.env.NEXT_PUBLIC_LLM_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Attempt calling local Python FastAPI LLM service if available
    try {
      const res = await fetch(`${LLM_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Local LLM service not running or timeout -> proceed to heuristic extractor
    }

    // Heuristic fallback matching the PanenLink extraction guidelines
    const extracted = extractHeuristics(message);
    return NextResponse.json(extracted);
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses ekstraksi pesan" },
      { status: 500 }
    );
  }
}
