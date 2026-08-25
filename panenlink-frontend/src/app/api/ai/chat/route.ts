import { NextResponse } from "next/server";

const LLM_URL = process.env.NEXT_PUBLIC_LLM_URL ?? "http://localhost:8000";

const FALLBACK_RESPONSES: Record<string, string> = {
  default: "Halo, saya Asisten PanenLink. Saya dapat membantu Anda mengekstrak data muatan pertanian atau menjawab seputar operasional platform PanenLink.",
  muatan: "Untuk memasang muatan baru, buka menu Pasang Muatan, lalu Anda dapat mengetik pesan atau manifest panen untuk diisi otomatis oleh AI.",
  rute: "Sistem PanenLink menggunakan optimasi VRPTW untuk menghitung rute pengumpulan panen terbaik berdasarkan jendela waktu muat.",
  peta: "Peta rute PanenLink memungkinkan Anda memilih titik jemput di seluruh sentra pertanian di Indonesia.",
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    try {
      const res = await fetch(`${LLM_URL}/chat`, {
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
      // Local LLM offline -> smart response
    }

    const lower = message.toLowerCase();
    let reply = FALLBACK_RESPONSES.default;
    if (lower.includes("muatan") || lower.includes("panen") || lower.includes("pasang")) {
      reply = FALLBACK_RESPONSES.muatan;
    } else if (lower.includes("rute") || lower.includes("vrptw") || lower.includes("logistik")) {
      reply = FALLBACK_RESPONSES.rute;
    } else if (lower.includes("peta") || lower.includes("lokasi") || lower.includes("jemput")) {
      reply = FALLBACK_RESPONSES.peta;
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses pesan chat" },
      { status: 500 }
    );
  }
}
