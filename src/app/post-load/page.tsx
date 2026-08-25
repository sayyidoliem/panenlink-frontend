"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { Sparkles, Truck } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

const vehicles = ["Pickup", "CDE", "CDD Box", "Fuso", "Tronton"];

/** Shape returned by /api/llm/extract (mirrors FarmerExtraction in local_llm_service.py) */
interface FarmerExtraction {
  commodity: string;
  quantity_value: number;
  quantity_unit: string;
  ready_time_phrase: string;
  location_name: string | null;
  notes: string | null;
}

export default function Page() {
  const r = useRouter(),
    [location, setLocation] = useState("Garut"),
    [saved, setSaved] = useState(false);

  // AI autofill state
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form refs for programmatic prefill
  const formRef = useRef<HTMLFormElement>(null);

  const handleAutofill = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/llm/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiText }),
      });
      if (!res.ok) throw new Error("LLM service tidak tersedia");
      const data: FarmerExtraction = await res.json();

      // Prefill form fields via refs
      const form = formRef.current;
      if (!form) return;

      // Commodity — find closest option or leave
      const select = form.elements.namedItem("commodity") as HTMLSelectElement;
      if (select) {
        const normalized = data.commodity.toLowerCase();
        for (const opt of Array.from(select.options)) {
          if (normalized.includes(opt.value.toLowerCase()) || opt.value.toLowerCase().includes(normalized.split(" ")[0])) {
            select.value = opt.value;
            break;
          }
        }
      }

      // Weight — convert to kg
      const weightInput = form.elements.namedItem("weight") as HTMLInputElement;
      if (weightInput) {
        let kg = data.quantity_value;
        if (data.quantity_unit === "kuintal" || data.quantity_unit === "kwintal") kg *= 100;
        else if (data.quantity_unit === "ton") kg *= 1000;
        weightInput.value = String(kg);
      }

      // Notes
      const notesTA = form.elements.namedItem("notes") as HTMLTextAreaElement;
      if (notesTA && data.notes) notesTA.value = data.notes;

      // Location
      if (data.location_name) setLocation(data.location_name);

    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Gagal mengambil data dari AI");
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
           Kembali
        </Link>
        <PageHeader
          title="Pasang Muatan Baru"
          description="Isi detail panen dan pilih lokasi pengambilan."
        />

        {/* ── AI Autofill Panel ─────────────────────────────── */}
        <section className="card form-section ai-autofill-panel">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} /> Autofill via AI
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted, #888)", marginBottom: "0.75rem" }}>
            Tempel pesan WhatsApp, transkripsi suara, atau teks manifest PDF — AI akan mengisi form secara otomatis.
          </p>
          <textarea
            rows={3}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder='Contoh: "cabe rawit 3 kuintal siap panen besok subuh di Ciwidey"'
            style={{ width: "100%", marginBottom: "0.5rem" }}
            disabled={aiLoading}
          />
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className="button secondary"
              onClick={handleAutofill}
              disabled={aiLoading || !aiText.trim()}
            >
              {aiLoading ? "Menganalisis..." : "✨ Autofill Form"}
            </button>
            {aiError && <span style={{ color: "var(--error, #e55)", fontSize: "0.8rem" }}>{aiError}</span>}
          </div>
        </section>

        <form className="post-grid" onSubmit={submit} ref={formRef}>
          <div>
            <section className="card form-section">
              <h2>Detail Hasil Panen</h2>
              <div className="form-grid">
                <label>
                  Komoditas
                  <select name="commodity" required>
                    <option value="">Pilih</option>
                    <option>Cabai</option>
                    <option>Bawang Merah</option>
                    <option>Tomat</option>
                  </select>
                </label>
                <label>
                  Berat (kg)
                  <input name="weight" type="number" min="1" required />
                </label>
                <label>
                  Tanggal
                  <input name="date" type="date" required />
                </label>
                <label>
                  Waktu
                  <input name="time" type="time" required />
                </label>
              </div>
            </section>
            <section className="card form-section">
              <h2>Armada</h2>
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
                      <input name="special" value={x} type="checkbox" />
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
              <label>
                Anggaran
                <input name="budget" type="number" placeholder="Rp 0" />
              </label>
              <label>
                Catatan
                <textarea name="notes" rows={4} />
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
              <button className="button secondary">Terbitkan</button>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}

const vehicles = ["Pickup", "CDE", "CDD Box", "Fuso", "Tronton"];
export default function Page() {
  const r = useRouter(),
    [location, setLocation] = useState("Garut"),
    [saved, setSaved] = useState(false);
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
           Kembali
        </Link>
        <PageHeader
          title="Pasang Muatan Baru"
          description="Isi detail panen dan pilih lokasi pengambilan."
        />
        <form className="post-grid" onSubmit={submit}>
          <div>
            <section className="card form-section">
              <h2>Detail Hasil Panen</h2>
              <div className="form-grid">
                <label>
                  Komoditas
                  <select name="commodity" required>
                    <option value="">Pilih</option>
                    <option>Cabai</option>
                    <option>Bawang Merah</option>
                    <option>Tomat</option>
                  </select>
                </label>
                <label>
                  Berat (kg)
                  <input name="weight" type="number" min="1" required />
                </label>
                <label>
                  Tanggal
                  <input name="date" type="date" required />
                </label>
                <label>
                  Waktu
                  <input name="time" type="time" required />
                </label>
              </div>
            </section>
            <section className="card form-section">
              <h2>Armada</h2>
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
                      <input name="special" value={x} type="checkbox" />
                      {x}
                    </label>
                  ),
                )}
              </div>
            </section>
          </div>
          <aside>
            <section className="card form-section">
              <h2>Lokasi & Penawaran</h2>
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
              <label>
                Anggaran
                <input name="budget" type="number" placeholder="Rp 0" />
              </label>
              <label>
                Catatan
                <textarea name="notes" rows={4} />
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
              <button className="button secondary">Terbitkan</button>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}
