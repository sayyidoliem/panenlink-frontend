"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
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
