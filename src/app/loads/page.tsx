"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RouteMap } from "@/components/maps/RouteMap";
import { Search, Scale, MapPin, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { panenlinkApi, type MatchResult } from "@/shared/lib/panenLinkApi";

type LoadRow = {
  id: string;
  name: string;
  kg: number;
  origin: string;
  destination: string;
  price: number;
  urgent?: boolean;
};

// Backend doesn't resolve node_id -> place name yet, so we can only
// show what it actually gives us. Keep this obvious in the UI rather
// than inventing city names.
function toLoadRow(m: MatchResult): LoadRow {
  return {
    id: m.harvest_id,
    name: m.commodity,
    kg: m.volume_kg,
    origin: `Node ${m.node_id}`,
    destination: m.truck_id ? `Truck ${m.truck_id}` : "Belum ditugaskan",
    price: m.estimated_revenue_idr ?? 0,
    urgent: m.status === "UNMATCHED",
  };
}

export default function Page() {
  const [rowsFromApi, setRowsFromApi] = useState<LoadRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""),
    [commodity, setCommodity] = useState("all"),
    [max, setMax] = useState(10000);

  useEffect(() => {
    panenlinkApi
      .getLoads()
      .then((data) => setRowsFromApi(data.map(toLoadRow)))
      .catch((err) => {
        console.error(err);
        setRowsFromApi([]); // fail closed to empty, not fake data
      })
      .finally(() => setLoading(false));
  }, []);

  const all = rowsFromApi ?? [];
  const [selected, setSelected] = useState<LoadRow | null>(null);
  useEffect(() => {
    if (!selected && all.length) setSelected(all[0]);
  }, [all, selected]);

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
    [all, q, commodity, max],
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
        <select value={commodity} onChange={(e) => setCommodity(e.target.value)}>
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
          {loading && <p>Memuat...</p>}
          {!loading && !rows.length && (
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
          {rows.map((x) => (
            <article
              onClick={() => setSelected(x)}
              className={selected?.id === x.id ? "load-card selected" : "load-card"}
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
        </section>
        <section className="map">
          {selected && <RouteMap initial={selected.origin} />}
          {selected && (
            <div className="map-tip">
              <b>{selected.name}</b>
              <small>
                {selected.origin} → {selected.destination}
              </small>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}