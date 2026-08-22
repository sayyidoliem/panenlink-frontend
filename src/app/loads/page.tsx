"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RouteMap } from "@/components/maps/RouteMap";
import { Search, Scale, MapPin, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
const all = [
  {
    id: "LOAD-2026-0821",
    name: "Cabai Merah Keriting",
    kg: 5000,
    origin: "Garut",
    destination: "Jakarta",
    price: 4500000,
    urgent: true,
  },
  {
    id: "LOAD-2026-0805",
    name: "Bawang Merah",
    kg: 3200,
    origin: "Brebes",
    destination: "Bandung",
    price: 2100000,
  },
  {
    id: "LOAD-2026-0801",
    name: "Tomat Apel",
    kg: 2800,
    origin: "Sukabumi",
    destination: "Tangerang",
    price: 1850000,
  },
];
export default function Page() {
  const [q, setQ] = useState(""),
    [commodity, setCommodity] = useState("all"),
    [max, setMax] = useState(10000),
    [selected, setSelected] = useState(all[0]);
  const rows = useMemo(
    () =>
      all.filter(
        (x) =>
          (commodity === "all" || x.name.toLowerCase().includes(commodity)) &&
          x.kg <= max &&
          `${x.name} ${x.origin} ${x.destination} ${x.id}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [q, commodity, max],
  );
  return (
    <AppShell flush>
      <div className="filterbar">
        <label>
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari lokasi, komoditas, ID..."
          />
        </label>
        <select
          value={commodity}
          onChange={(e) => setCommodity(e.target.value)}
        >
          <option value="all">Semua Komoditas</option>
          <option value="cabai">Cabai</option>
          <option value="bawang">Bawang</option>
          <option value="tomat">Tomat</option>
        </select>
        <label className="range">
          <SlidersHorizontal /> Maks {max / 1000} ton
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={max}
            onChange={(e) => setMax(+e.target.value)}
          />
        </label>
        <span>{rows.length} Muatan</span>
      </div>
      <div className="split">
        <section className="load-list">
          <h3>Muatan tersedia</h3>
          {rows.map((x) => (
            <article
              onClick={() => setSelected(x)}
              className={
                selected.id === x.id ? "load-card selected" : "load-card"
              }
              key={x.id}
            >
              <header>
                <span>
                  <b>{x.name}</b>
                  <small>
                    <Scale />
                    {x.kg / 1000} Ton
                  </small>
                </span>
                {x.urgent && <i>Urgent</i>}
              </header>
              <div className="route">
                <MapPin />
                <b>
                  {x.origin} → {x.destination}
                </b>
              </div>
              <footer>
                <strong>Rp {x.price.toLocaleString("id-ID")}</strong>
                <Link href={`/loads/${x.id}`}>Lihat Detail</Link>
              </footer>
            </article>
          ))}
          {!rows.length && (
            <div className="empty-load">
              <h2>Tidak ada muatan</h2>
              <button
                className="button primary"
                onClick={() => {
                  setQ("");
                  setCommodity("all");
                  setMax(10000);
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>
        <section className="map">
          <RouteMap initial={selected.origin} />
          <div className="map-tip">
            <b>{selected.name}</b>
            <small>
              {selected.origin} → {selected.destination}
            </small>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
