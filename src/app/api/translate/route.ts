import { NextRequest, NextResponse } from "next/server";

type Body = {
  texts?: string[];
  source?: string;
  target?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const texts = Array.isArray(body.texts) ? body.texts : [];
  const source = body.source || "id";
  const target = body.target || "en";

  if (!texts.length) {
    return NextResponse.json({ error: "texts required" }, { status: 400 });
  }

  try {
    const translations = Object.fromEntries(
      await Promise.all(
        texts.map(async (text) => {
          const params = new URLSearchParams({
            q: text,
            langpair: `${source}|${target}`,
          });
          const res = await fetch(
            `https://api.mymemory.translated.net/get?${params.toString()}`,
            {
              headers: { Accept: "application/json" },
              next: { revalidate: 60 * 60 * 24 },
            },
          );
          if (!res.ok) throw new Error("upstream translation failed");
          const data = (await res.json()) as {
            responseData?: { translatedText?: string };
          };
          return [text, data.responseData?.translatedText || text];
        }),
      ),
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json(
      { error: "translation service unavailable" },
      { status: 503 },
    );
  }
}
