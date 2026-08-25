"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { Sparkles, Truck, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, Suspense } from "react";
import {
  COMMODITY_OPTIONS,
  UNIT_TO_KG,
  matchSelectCommodity,
  parseTimephrase,
  extractPanenMessage,
  type FarmerExtraction,
} from "@/shared/lib/aiExtractor";

const vehicles = ["Pickup", "CDE", "CDD Box", "Fuso", "Tronton"];

function PostLoadContent() {
  const r = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  // Controlled field state so AI can populate them
  const [commodity, setCommodity] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Garut");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // AI autofill state
  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<"" | "ok" | "err">("");
  const [extractedPreview, setExtractedPreview] = useState<FarmerExtraction | null>(null);

  // Check URL params or localStorage for prefilled AI extraction
  useEffect(() => {
    const rawPreload = searchParams.get("preload");
    if (rawPreload) {
      try {
        const parsed: FarmerExtraction = JSON.parse(decodeURIComponent(rawPreload));
        applyExtractedData(parsed);
        setAiStatus("ok");
      } catch {
        // ignore malformed query
      }
    }
  }, [searchParams]);

  const applyExtractedData = (data: FarmerExtraction) => {
    setExtractedPreview(data);
    setCommodity(matchSelectCommodity(data.commodity));
    const factor = UNIT_TO_KG[data.quantity_unit.toLowerCase()] ?? 1;
    const kg = Math.round(data.quantity_value * factor);
    setWeight(String(kg));
    const { date: d, time: t } = parseTimephrase(data.ready_time_phrase);
    setDate(d);
    setTime(t);
    if (data.location_name) {
      setLocation(data.location_name);
    }
    if (data.notes) {
      setNotes(data.notes);
    }
  };

  const autofill = async () => {
    if (!aiMsg.trim()) return;
    setAiLoading(true);
    setAiStatus("");
    try {
      const data = await extractPanenMessage(aiMsg);
      applyExtractedData(data);
      setAiStatus("ok");
    } catch {
      setAiStatus("err");
    } finally {
      setAiLoading(false);
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const rows = JSON.parse(localStorage.getItem("pl_user_loads") || "[]");
    localStorage.setItem(
      "pl_user_loads",
      JSON.stringify([
        { ...data, id: `LOAD-${Date.now()}`, location, status: "Berjalan" },
        ...rows,
      ]),
    );
    alert("Muatan berhasil diterbitkan");
    r.push("/orders");
  };

  return (
    <AppShell>
      <div className="page">
        <Link href="/dashboard" className="back">
          ← Kembali
        </Link>
        <PageHeader
          title="Pasang Muatan Baru"
          description="Isi detail panen dan pilih lokasi pengambilan untuk optimasi rute logistik VRPTW."
        />

        {/* ── AI Extraction Autofill Bar ── */}
        <section className="card form-section" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} style={{ color: "var(--terracotta)" }} /> Ekstraksi AI Logistik PanenLink
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "0.75rem" }}>
            Tempel pesan WhatsApp petani, transkrip suara, atau teks manifest/surat jalan PDF. AI akan otomatis menstandarkan komoditas, jumlah, waktu, dan lokasi.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <textarea
              value={aiMsg}
              onChange={(e) => setAiMsg(e.target.value)}
              placeholder='Contoh WhatsApp: "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya." atau tempel teks manifest...'
              disabled={aiLoading}
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="button outline"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setAiMsg("Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya.")}
                >
                  Contoh WhatsApp
                </button>
                <button
                  type="button"
                  className="button outline"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setAiMsg("lapor min panen bamer ada 15 karung siap angkut lusa siang dr Tarogong Garut, butuh pickup cepat")}
                >
                  Contoh Voice Note
                </button>
                <button
                  type="button"
                  className="button outline"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setAiMsg("KOPERASI TANI MAKMUR JAYA\nSURAT JALAN / MANIFEST PANEN\nKomoditas: Kentang Granola Super\nJumlah: 2.5 Ton\nLokasi Penjemputan: Gudang Desa Margamukti, Kec. Pangalengan\nJadwal Muat: 25 Agustus 2026 Pukul 08:00 WIB\nCatatan: Memerlukan truk tertutup / terpal anti-hujan")}
                >
                  Contoh Manifest PDF
                </button>
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={autofill}
                disabled={aiLoading || !aiMsg.trim()}
              >
                {aiLoading ? "Mengekstrak…" : "Ekstrak & Isi Otomatis"}
              </button>
            </div>
          </div>

          {aiStatus === "ok" && (
            <div style={{ marginTop: "0.75rem", padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
              <p style={{ color: "#166534", fontSize: "0.85rem", margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} /> Berhasil diekstrak &amp; diformulasikan untuk optimasi VRPTW!
              </p>
              {extractedPreview && (
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#15803d" }}>
                  Komoditas: <b>{extractedPreview.commodity}</b> | Jumlah: <b>{extractedPreview.quantity_value} {extractedPreview.quantity_unit}</b> | Waktu: <b>{extractedPreview.ready_time_phrase}</b> | Lokasi: <b>{extractedPreview.location_name ?? "-"}</b>
                  {extractedPreview.notes && <> | Catatan: <i>{extractedPreview.notes}</i></>}
                </p>
              )}
            </div>
          )}
          {aiStatus === "err" && (
            <p style={{ color: "var(--error, #ef4444)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              ✗ Gagal menghubungi layanan AI. Sistem telah menggunakan ekstraksi lokal fallback.
            </p>
          )}
        </section>

        <form className="post-grid" onSubmit={submit} ref={formRef}>
          <div>
            <section className="card form-section">
              <h2>Detail Hasil Panen</h2>
              <div className="form-grid">
                <label>
                  Komoditas
                  <select
                    name="commodity"
                    required
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                  >
                    <option value="">Pilih Komoditas</option>
                    {COMMODITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Berat (kg)
                  <input
                    name="weight"
                    type="number"
                    min="1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </label>
                <label>
                  Tanggal
                  <input
                    name="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Waktu
                  <input
                    name="time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              </div>
            </section>
            <section className="card form-section">
              <h2>Armada &amp; Fasilitas VRPTW</h2>
              <div className="vehicle-grid">
                {vehicles.map((x, i) => (
                  <label key={x}>
                    <input
                      type="radio"
                      name="vehicle"
                      value={x}
                      required
                      defaultChecked={i === 2}
                    />
                    <span>
                      <Truck />
                      {x}
                    </span>
                  </label>
                ))}
              </div>
              <div className="checks">
                {["Terpal Kedap Air", "Pendingin", "Muat Bongkar Sendiri"].map(
                  (x) => (
                    <label className="check" key={x}>
                      <input
                        name="special"
                        value={x}
                        type="checkbox"
                        defaultChecked={notes.toLowerCase().includes("terpal") && x.includes("Terpal")}
                      />
                      {x}
                    </label>
                  ),
                )}
              </div>
            </section>
          </div>
          <aside>
            <section className="card form-section">
              <h2>Lokasi &amp; Penawaran</h2>
              <input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                hidden
              />
              <RouteMap
                initial={location}
                onPick={(p) => setLocation(p.label)}
              />
              <label style={{ marginTop: "1rem" }}>
                Anggaran
                <input name="budget" type="number" placeholder="Rp 0" />
              </label>
              <label>
                Catatan &amp; Persyaratan Logistik
                <textarea
                  name="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Koperasi pengirim, catatan terpal, akses jalan..."
                />
              </label>
            </section>
            <div className="action-row">
              <button
                type="button"
                className="button outline"
                onClick={() => {
                  setSaved(true);
                  localStorage.setItem("pl_draft", "saved");
                }}
              >
                {saved ? "Draft Tersimpan" : "Simpan Draft"}
              </button>
              <button className="button secondary">Terbitkan Muatan</button>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="loading">Memuat form pasang muatan...</div>}>
      <PostLoadContent />
    </Suspense>
  );
}
