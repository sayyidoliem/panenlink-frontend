/**
 * aiExtractor.ts
 * AI Data Extraction and Logistics Assistant utilities for the PanenLink platform.
 * Supports normalization, heuristic extraction, and API communication with the local LLM service.
 */

export interface FarmerExtraction {
  commodity: string;
  quantity_value: number;
  quantity_unit: string;
  ready_time_phrase: string;
  location_name: string | null;
  notes: string | null;
}

export const COMMODITY_OPTIONS = [
  "Cabai Rawit Merah",
  "Cabai Rawit",
  "Cabai Merah Keriting",
  "Cabai Merah",
  "Bawang Merah",
  "Bawang Putih",
  "Daun Bawang",
  "Tomat",
  "Kentang Granola",
  "Kentang",
  "Jagung Manis",
  "Jagung",
  "Singkong",
  "Wortel",
  "Kubis",
  "Buncis",
  "Sawi",
  "Terong",
];

// Unit → kg conversion factors for VRPTW load capacity calculations
export const UNIT_TO_KG: Record<string, number> = {
  kg: 1,
  kilo: 1,
  kilogram: 1,
  kuintal: 100,
  kwintal: 100,
  ton: 1000,
  karung: 50, // ~50 kg per sack (approximation)
  peti: 20, // ~20 kg per crate (approximation)
  ikat: 5, // ~5 kg per bundle
  box: 15,
  sak: 50,
};

/**
 * Normalizes Indonesian commodity terms according to PanenLink guidelines.
 */
export function normalizeCommodity(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (/cabe\s+rawit\s+merah|cabai\s+rawit\s+merah/.test(s)) return "cabai rawit merah";
  if (/cabe\s+rawit|cabai\s+rawit|lombok/.test(s)) return "cabai rawit";
  if (/cabe\s+(?:merah\s+)?keriting|cabai\s+(?:merah\s+)?keriting/.test(s)) return "cabai merah keriting";
  if (/cabe\s+merah|cabai\s+merah/.test(s)) return "cabai merah";
  if (/cabe|cabai/.test(s)) return "cabai";
  if (/bamer|bawang\s+merah/.test(s)) return "bawang merah";
  if (/baput|bawang\s+putih/.test(s)) return "bawang putih";
  if (/bawang\s+daun|daun\s+bawang/.test(s)) return "daun bawang";
  if (/tomat\s+sayur|tomat\s+ceri|tomat/.test(s)) return "tomat";
  if (/kentang\s+granola/.test(s)) return "kentang granola";
  if (/kentang/.test(s)) return "kentang";
  if (/jagung\s+manis|jagung/.test(s)) return "jagung";
  if (/singkong|ubi/.test(s)) return "singkong";
  if (/wortel/.test(s)) return "wortel";
  if (/kubis|kol/.test(s)) return "kubis";
  if (/buncis/.test(s)) return "buncis";
  if (/sawi|caisim/.test(s)) return "sawi";
  if (/terong/.test(s)) return "terong";
  return raw.trim().toLowerCase();
}

/**
 * Maps any normalized commodity name to matching select option value
 */
export function matchSelectCommodity(raw: string): string {
  const norm = normalizeCommodity(raw);
  const found = COMMODITY_OPTIONS.find(
    (opt) => opt.toLowerCase() === norm || norm.includes(opt.toLowerCase()) || opt.toLowerCase().includes(norm)
  );
  if (found) return found;

  // Partial match heuristics
  if (norm.includes("cabai") || norm.includes("cabe")) return "Cabai Rawit";
  if (norm.includes("bawang")) return "Bawang Merah";
  if (norm.includes("tomat")) return "Tomat";
  if (norm.includes("kentang")) return "Kentang Granola";
  if (norm.includes("jagung")) return "Jagung";

  return COMMODITY_OPTIONS[0];
}

/**
 * Parses time phrase into { date, time } format (YYYY-MM-DD, HH:mm).
 */
export function parseTimephrase(phrase: string): { date: string; time: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const p = phrase.toLowerCase();
  let base = today;
  if (p.includes("lusa")) {
    base = dayAfterTomorrow;
  } else if (p.includes("besok")) {
    base = tomorrow;
  }

  // Check explicit date like "25 Agustus 2026"
  const dateMatch = phrase.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const monthNames: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
    };
    const month = monthNames[dateMatch[2].toLowerCase()] ?? today.getMonth();
    const year = parseInt(dateMatch[3]);
    base = new Date(year, month, day);
  }

  // Extract hour (e.g. "jam 5", "subuh jam 5", "pukul 08:00 WIB")
  let hour = 6;
  let minute = 0;
  const clockMatch = phrase.match(/(?:pukul|jam)\s*(\d{1,2})(?::(\d{2}))?/i);
  if (clockMatch) {
    hour = parseInt(clockMatch[1]);
    minute = clockMatch[2] ? parseInt(clockMatch[2]) : 0;
    // Afternoon adjustment if specified e.g. "siang jam 2" -> 14
    if ((p.includes("siang") || p.includes("sore")) && hour < 12) {
      hour += 12;
    }
  } else if (p.includes("subuh")) {
    hour = 5;
  } else if (p.includes("pagi")) {
    hour = 8;
  } else if (p.includes("siang")) {
    hour = 13;
  } else if (p.includes("sore")) {
    hour = 16;
  } else if (p.includes("malam")) {
    hour = 19;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
  const time = `${pad(hour)}:${pad(minute)}`;
  return { date, time };
}

/**
 * Heuristic client-side fallback extractor for agricultural messages & documents.
 */
export function extractHeuristics(text: string): FarmerExtraction {
  const commodity = normalizeCommodity(text);

  // Quantity and Unit
  let qty = 1.0;
  let unit = "kg";
  const qtyMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilogram|kuintal|kwintal|ton|karung|peti|ikat|box|sak)/i);
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1].replace(",", "."));
    const rawUnit = qtyMatch[2].toLowerCase();
    if (rawUnit === "kilo" || rawUnit === "kilogram") unit = "kg";
    else if (rawUnit === "kwintal") unit = "kuintal";
    else if (rawUnit === "sak") unit = "karung";
    else unit = rawUnit;
  }

  // Ready Time Phrase
  let readyTimePhrase = "segera";
  const schedMatch = text.match(/jadwal\s*(?:muat|kirim|angkut)?\s*:\s*([^\n\r,]+)/i);
  if (schedMatch) {
    readyTimePhrase = schedMatch[1].trim();
  } else {
    const timeMatch = text.match(
      /((?:besok|lusa|nanti|hari\s+ini)\s+(?:subuh|pagi|siang|sore|malam)(?:\s+jam\s*\d+)?|\d{1,2}\s+[A-Za-z]+\s+\d{4}(?:\s+pukul\s*[\d:.]+\s*WIB)?|jam\s*\d{1,2}(?::\d{2})?(?:\s*wib)?)/i
    );
    if (timeMatch) {
      readyTimePhrase = timeMatch[1].trim();
    }
  }

  // Location Extraction
  let locationName: string | null = null;
  const locManifest = text.match(/lokasi\s*(?:penjemputan|muat|asal|ambil)?\s*:\s*([^\n\r]+)/i);
  if (locManifest) {
    locationName = locManifest[1].trim().replace(/^Gudang\s+/i, "");
  } else {
    const locChat = text.match(/(?:di|dr|dari|lokasi)\s+([A-Z][a-zA-Z0-9\s.,-]+?)(?:,|\.|\s+ya|\s+butuh|\s+siap|\s+tolong|$)/);
    if (locChat) {
      const candidate = locChat[1].trim();
      if (candidate.length > 2 && !/^(besok|lusa|pagi|siang|sore)/i.test(candidate)) {
        locationName = candidate;
      }
    }
  }

  // Notes Extraction
  const notesList: string[] = [];
  const coopMatch = text.match(/(koperasi\s+[^\n\r]+|kelompok\s+tani\s+[^\n\r]+|pt\s+[^\n\r]+)/i);
  if (coopMatch) {
    notesList.push(coopMatch[1].trim());
  }
  const catMatch = text.match(/catatan\s*:\s*([^\n\r]+)/i);
  if (catMatch) {
    notesList.push(catMatch[1].trim());
  }
  const reqMatch = text.match(/\b(butuh\s+[^\n\r,.]+|perlu\s+[^\n\r,.]+|terpal\s+[^\n\r,.]+|truk\s+[^\n\r,.]+)/i);
  if (reqMatch && !catMatch) {
    notesList.push(reqMatch[1].trim());
  }

  const notes = notesList.length > 0 ? notesList.join(", ") : null;

  return {
    commodity,
    quantity_value: qty,
    quantity_unit: unit,
    ready_time_phrase: readyTimePhrase,
    location_name: locationName,
    notes,
  };
}

/**
 * Calls the PanenLink AI Extraction service with client-side fallback.
 */
export async function extractPanenMessage(message: string): Promise<FarmerExtraction> {
  const LLM_URL = process.env.NEXT_PUBLIC_LLM_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${LLM_URL}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      const data: FarmerExtraction = await res.json();
      return {
        ...data,
        commodity: normalizeCommodity(data.commodity),
      };
    }
  } catch {
    // LLM service offline or unreachable, use robust local heuristic extractor
  }

  // Try Next.js internal API route as proxy
  try {
    const res = await fetch("/api/ai/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return extractHeuristics(message);
}
