"use client";
import { AppShell } from "@/components/layout/AppShell";
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  FileText,
  MessageSquare,
  Mic,
  Truck,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  extractPanenMessage,
  type FarmerExtraction,
  UNIT_TO_KG,
} from "@/shared/lib/aiExtractor";

type Message = { from: "user" | "bot"; text: string };

const PRESETS = [
  {
    title: "1. WhatsApp Petani",
    icon: <MessageSquare size={14} />,
    text: "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya.",
  },
  {
    title: "2. Voice Note / Chat Dialek",
    icon: <Mic size={14} />,
    text: "lapor min panen bamer ada 15 karung siap angkut lusa siang dr Tarogong Garut, butuh pickup cepat",
  },
  {
    title: "3. Manifest / Surat Jalan PDF",
    icon: <FileText size={14} />,
    text: `KOPERASI TANI MAKMUR JAYA
SURAT JALAN / MANIFEST PANEN
No: 042/SJ/VIII/2026
Komoditas: Kentang Granola Super
Jumlah: 2.5 Ton (50 Karung @ 50kg)
Lokasi Penjemputan: Gudang Desa Margamukti, Kec. Pangalengan
Jadwal Muat: 25 Agustus 2026 Pukul 08:00 WIB
Catatan: Memerlukan truk tertutup / terpal anti-hujan`,
  },
];

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"extract" | "chat">("extract");

  // --- Extraction State ---
  const [inputText, setInputText] = useState(
    "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya."
  );
  const [extractedData, setExtractedData] = useState<FarmerExtraction | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Chat State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Halo! Saya Asisten AI PanenLink. Saya dapat membantu mengekstrak data muatan pertanian atau menjawab pertanyaan seputar logistik dan operasional PanenLink.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pl_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "chat") {
      localStorage.setItem("pl_chat", JSON.stringify(messages));
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Run initial extraction on mount
  useEffect(() => {
    handleExtract();
  }, []);

  const handleExtract = async (customText?: string) => {
    const textToProcess = customText ?? inputText;
    if (!textToProcess.trim() || extracting) return;
    setExtracting(true);
    try {
      const data = await extractPanenMessage(textToProcess);
      setExtractedData(data);
    } catch {
      // handled inside helper
    } finally {
      setExtracting(false);
    }
  };

  const handleCopyJson = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToPostLoad = () => {
    if (!extractedData) return;
    const serialized = encodeURIComponent(JSON.stringify(extractedData));
    router.push(`/post-load?preload=${serialized}`);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Maaf, layanan AI sedang tidak dapat dihubungi. Silakan coba lagi.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Header Title */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--primary)",
                margin: "0 0 0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Bot size={28} /> AI Logistics &amp; Extraction Assistant
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.95rem" }}>
              Analisis pesan pertanian tidak terstruktur (WhatsApp, Suara, Manifest PDF) menjadi format standar untuk optimasi VRPTW.
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              background: "var(--high)",
              padding: "4px",
              borderRadius: "12px",
              gap: "4px",
            }}
          >
            <button
              className={`button ${activeTab === "extract" ? "primary" : "ghost"}`}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                borderRadius: "8px",
              }}
              onClick={() => setActiveTab("extract")}
            >
              <Sparkles size={16} /> Ekstraksi Data (VRPTW)
            </button>
            <button
              className={`button ${activeTab === "chat" ? "primary" : "ghost"}`}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                borderRadius: "8px",
              }}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare size={16} /> Tanya Jawab Chatbot
            </button>
          </div>
        </div>

        {/* ================= TAB 1: EXTRACTION MODE ================= */}
        {activeTab === "extract" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Left Column: Input Box & Presets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="card" style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>
                    1. Input Pesan / Dokumen
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Bahasa Indonesia / Dialek
                  </span>
                </div>

                {/* Preset Chips */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="button outline"
                      style={{ fontSize: "0.75rem", padding: "6px 10px", gap: "6px" }}
                      onClick={() => {
                        setInputText(p.text);
                        handleExtract(p.text);
                      }}
                    >
                      {p.icon}
                      {p.title}
                    </button>
                  ))}
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tempel pesan WhatsApp dari petani, transkrip rekaman suara, atau isi teks surat jalan PDF..."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    className="button outline"
                    style={{ fontSize: "0.85rem" }}
                    onClick={() => {
                      setInputText("");
                      setExtractedData(null);
                    }}
                  >
                    Kosongkan
                  </button>

                  <button
                    type="button"
                    className="button secondary"
                    disabled={extracting || !inputText.trim()}
                    onClick={() => handleExtract()}
                  >
                    <Sparkles size={16} />
                    {extracting ? "Mengekstrak..." : "Jalankan Ekstraksi AI"}
                  </button>
                </div>
              </div>

              {/* Extraction Guidelines Hint Card */}
              <div
                className="card"
                style={{
                  background: "var(--low)",
                  border: "1px dashed var(--line)",
                  padding: "1rem 1.25rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 700 }}>
                  💡 Panduan Ekstraksi AI:
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    fontSize: "0.825rem",
                    lineHeight: "1.6",
                    color: "var(--muted)",
                  }}
                >
                  <li>
                    <b>Normalisasi Komoditas:</b> "cabe rawit/lombok" → "cabai rawit", "bamer" → "bawang merah", dsb.
                  </li>
                  <li>
                    <b>Kuantitas &amp; Satuan:</b> Mengekstrak angka dan satuan asli (kg, kuintal, ton, karung, peti, ikat).
                  </li>
                  <li>
                    <b>Waktu Siap:</b> Menjaga frasa waktu penjemputan untuk penjadwalan time window armada.
                  </li>
                  <li>
                    <b>Lokasi:</b> Mendeteksi desa, kecamatan, atau kota asal muatan.
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Structured Output & JSON */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Structured Summary Card */}
              <div className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>
                    2. Hasil Ekstraksi Terstruktur
                  </h2>
                  {extractedData && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        background: "#dcfce7",
                        color: "#166534",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Valid VRPTW Schema
                    </span>
                  )}
                </div>

                {extractedData ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface)",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Layers size={13} /> Komoditas (Ternormalisasi)
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginTop: "4px", textTransform: "capitalize", color: "var(--primary)" }}>
                        {extractedData.commodity}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface)",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Truck size={13} /> Jumlah &amp; Satuan
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginTop: "4px", color: "var(--secondary)" }}>
                        {extractedData.quantity_value} {extractedData.quantity_unit}
                        <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--muted)", marginLeft: "6px" }}>
                          (≈ {Math.round(extractedData.quantity_value * (UNIT_TO_KG[extractedData.quantity_unit.toLowerCase()] ?? 1))} kg)
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface)",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> Jendela Waktu (Time Window)
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "4px" }}>
                        {extractedData.ready_time_phrase}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        background: "var(--surface)",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> Lokasi Penjemputan
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "4px" }}>
                        {extractedData.location_name ?? <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Tidak terdeteksi</span>}
                      </div>
                    </div>

                    {extractedData.notes && (
                      <div
                        style={{
                          gridColumn: "span 2",
                          padding: "12px",
                          background: "var(--surface)",
                          borderRadius: "10px",
                          border: "1px solid var(--line)",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          Catatan / Persyaratan Khusus:
                        </div>
                        <div style={{ fontSize: "0.875rem", marginTop: "4px", color: "var(--text)" }}>
                          {extractedData.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--muted)",
                      background: "var(--surface)",
                      borderRadius: "10px",
                    }}
                  >
                    Masukkan pesan dan klik tombol "Jalankan Ekstraksi AI"
                  </div>
                )}

                {/* Actions */}
                {extractedData && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "1.25rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      className="button outline"
                      style={{ fontSize: "0.85rem" }}
                      onClick={handleCopyJson}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Tersalin!" : "Salin JSON"}
                    </button>

                    <button
                      type="button"
                      className="button primary"
                      style={{ fontSize: "0.85rem" }}
                      onClick={handleSendToPostLoad}
                    >
                      Pasang Muatan dengan Data Ini <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Strict JSON Output Code Block */}
              <div className="card" style={{ padding: 0, overflow: "hidden", background: "#1e1e1e", color: "#f8f8f2" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    background: "#2d2d2d",
                    borderBottom: "1px solid #3d3d3d",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#9ca3af" }}>
                    Standard JSON Output (Downstream VRPTW)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "16px",
                    fontSize: "0.85rem",
                    fontFamily: "monospace",
                    overflowX: "auto",
                    color: "#a6e22e",
                  }}
                >
                  {extractedData
                    ? JSON.stringify(extractedData, null, 2)
                    : "// Menunggu ekstraksi data..."}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CHATBOT ASSISTANT MODE ================= */}
        {activeTab === "chat" && (
          <div
            className="chat-page card"
            style={{
              height: "650px",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                background: "var(--low)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                    Asisten PanenLink
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    Konsultasi operasional, rute, armada &amp; panen
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="button outline"
                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                onClick={() => setMessages([])}
                title="Hapus riwayat chat"
              >
                <Trash2 size={14} /> Hapus Chat
              </button>
            </header>

            <main
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((x, i) => (
                <div
                  key={i}
                  className={`bubble ${x.from}`}
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    alignSelf: x.from === "user" ? "flex-end" : "flex-start",
                    background: x.from === "user" ? "var(--primary)" : "var(--low)",
                    color: x.from === "user" ? "#fff" : "var(--text)",
                    borderBottomRightRadius: x.from === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: x.from === "bot" ? "4px" : "16px",
                  }}
                >
                  {x.text}
                </div>
              ))}
              {chatLoading && (
                <div
                  className="bubble bot"
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--low)",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    borderBottomLeftRadius: "4px",
                  }}
                >
                  <span className="typing-indicator">Mengetik balasan…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </main>

            <footer
              style={{
                display: "flex",
                gap: "10px",
                padding: "16px",
                borderTop: "1px solid var(--line)",
                background: "var(--surface)",
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Tanyakan seputar pasang muatan, rute VRPTW, verifikasi dokumen..."
                disabled={chatLoading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  background: "#fff",
                  fontSize: "0.95rem",
                }}
              />
              <button
                type="button"
                className="button secondary"
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{ padding: "0 20px" }}
              >
                <Send size={18} />
              </button>
            </footer>
          </div>
        )}
      </div>
    </AppShell>
  );
}
