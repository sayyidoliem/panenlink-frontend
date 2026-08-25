"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Bot, FileDown, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { downloadAiConversationPdf } from "@/shared/lib/pdfDocuments";
import { useApp } from "@/shared/app/AppProvider";
import { useUiTranslation } from "@/shared/app/useUiTranslation";

type M = { from: "user" | "bot"; text: string; loading?: boolean };

/** Keyword fallback used only when the LLM service is unavailable */
const fallbackAnswer = (q: string, lang: "id" | "en"): string => {
  const s = q.toLowerCase();
  if (lang === "en") {
    if (s.includes("load") || s.includes("muatan"))
      return "To post a load, open Post Load, then fill commodity, weight, schedule, location, and vehicle.";
    if (s.includes("verif"))
      return "Open Profile and upload KTP, SIM, STNK, or land certificate. New uploads start as pending.";
    if (s.includes("map") || s.includes("location") || s.includes("peta"))
      return "Use map search or the device location button. PanenLink uses Photon/Nominatim and OpenStreetMap.";
    if (s.includes("driver") || s.includes("whatsapp"))
      return "The WhatsApp button on orders opens WhatsApp with an auto-filled load message.";
    if (s.includes("password") || s.includes("pin"))
      return "Open Settings > Account Security to change password, PIN, or 2FA.";
    return "I can help with loads, drivers, maps, verification, payments, accounts, and PanenLink settings.";
  }
  if (s.includes("muatan"))
    return "Untuk memasang muatan, buka menu Post Muatan, isi komoditas, berat, jadwal, lokasi, dan kendaraan.";
  if (s.includes("verifikasi"))
    return "Buka Profil lalu unggah KTP, SIM, STNK, atau sertifikat lahan. Status awal akan menjadi pending.";
  if (s.includes("peta") || s.includes("lokasi"))
    return "Gunakan pencarian peta atau tombol lokasi perangkat. PanenLink memakai Photon/Nominatim dan OpenStreetMap.";
  if (s.includes("driver") || s.includes("whatsapp"))
    return "Tombol WA pada pesanan membuka WhatsApp dengan pesan dan ID muatan otomatis.";
  if (s.includes("password") || s.includes("pin"))
    return "Buka Pengaturan > Keamanan Akun untuk mengganti kata sandi, PIN, atau 2FA.";
  return "Saya dapat membantu tentang muatan, driver, peta, verifikasi, pembayaran, akun, dan pengaturan PanenLink.";
};

/** Call the Next.js proxy → local LLM service /chat endpoint */
async function callLLM(message: string): Promise<string | null> {
  try {
    const res = await fetch("/api/llm/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.reply ?? null;
  } catch {
    return null;
  }
}
export default function Page() {
  const { lang } = useApp();
  const t = useUiTranslation([
    "Asisten AI PanenLink",
    "Ringkas operasional, bantu dokumen, dan buat laporan PDF dari percakapan Anda.",
    "Generate laporan",
    "Unduh ringkasan percakapan AI menjadi PDF operasional.",
    "Bantuan cepat",
    "Topik muatan, driver, dokumen, lokasi, akun, dan pengaturan.",
    "Tanyakan sesuatu...",
    "Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?",
  ]);
  const [m, setM] = useState<M[]>([
      {
        from: "bot",
        text: "Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?",
      },
    ]),
    [q, setQ] = useState(""),
    [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const x = localStorage.getItem("pl_chat");
    if (x) setM(JSON.parse(x));
  }, []);
  useEffect(() => {
    // Don't persist loading bubbles
    const toSave = m.filter((x) => !x.loading);
    localStorage.setItem("pl_chat", JSON.stringify(toSave));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [m]);
  const send = async () => {
    if (!q.trim() || sending) return;
    const text = q;
    setQ("");
    setSending(true);
    // Append user message + loading bubble
    setM((prev) => [
      ...prev,
      { from: "user", text },
      { from: "bot", text: "...", loading: true },
    ]);
    // Call LLM service, fall back to keyword heuristic if unavailable
    const reply = (await callLLM(text)) ?? fallbackAnswer(text, lang);
    // Replace loading bubble with real reply
    setM((prev) => [
      ...prev.filter((x) => !x.loading),
      { from: "bot", text: reply },
    ]);
    setSending(false);
  };

  const generateReport = () => {
    downloadAiConversationPdf(
      "Ringkasan Aktivitas Asisten AI",
      m.length
        ? m
        : [
            {
              from: "bot",
              text: "Belum ada percakapan untuk diringkas.",
            },
          ],
    );
  };
  return (
    <AppShell>
      <div className="chat-page">
        <header>
          <span className="chat-hero-icon">
            <Bot />
          </span>
          <div>
            <h1>{t("Asisten AI PanenLink")}</h1>
            <p>
              {t(
                "Ringkas operasional, bantu dokumen, dan buat laporan PDF dari percakapan Anda.",
              )}
            </p>
          </div>
          <div className="chat-head-actions">
            <button onClick={generateReport} aria-label={t("Generate laporan")}>
              <FileDown />
            </button>
            <button onClick={() => setM([])}>
              <Trash2 />
            </button>
          </div>
        </header>
        <section className="chat-overview">
          <article>
            <Sparkles />
            <div>
              <strong>{t("Generate laporan")}</strong>
              <p>{t("Unduh ringkasan percakapan AI menjadi PDF operasional.")}</p>
            </div>
          </article>
          <article>
            <Bot />
            <div>
              <strong>{t("Bantuan cepat")}</strong>
              <p>
                {t(
                  "Topik muatan, driver, dokumen, lokasi, akun, dan pengaturan.",
                )}
              </p>
            </div>
          </article>
        </section>
        <main>
          {m.map((x, i) => (
            <div key={i} className={`bubble ${x.from}${x.loading ? " loading" : ""}`}>
              {x.loading
                ? <span className="typing-dots"><span /><span /><span /></span>
                : x.from === "bot" &&
                  x.text === "Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?"
                ? t("Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?")
                : x.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </main>
        <footer>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("Tanyakan sesuatu...")}
            disabled={sending}
          />
          <button onClick={send} disabled={sending} aria-label="Kirim pesan">
            <Send />
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
