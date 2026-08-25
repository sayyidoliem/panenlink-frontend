"use client";

import Link from "next/link";
import { MapPin, Scale, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteMap } from "@/components/maps/RouteMap";
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

// Backend belum menyediakan nama lokasi dari node_id.
// Karena itu, UI menampilkan node yang benar-benar diberikan backend.
function toLoadRow(match: MatchResult): LoadRow {
  return {
    id: match.harvest_id,
    name: match.commodity,
    kg: match.volume_kg,
    origin: `Node ${match.node_id}`,
    destination: match.truck_id
      ? `Truck ${match.truck_id}`
      : "Belum ditugaskan",
    price: match.estimated_revenue_idr ?? 0,
    urgent: match.status === "UNMATCHED",
  };
}

export default function Page() {
  const [rowsFromApi, setRowsFromApi] = useState<LoadRow[] | null>(null);
  const [selected, setSelected] = useState<LoadRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [commodity, setCommodity] = useState("all");
  const [max, setMax] = useState(10000);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const data = await panenlinkApi.getLoads();

        if (cancelled) {
          return;
        }

        const mappedRows = data.map(toLoadRow);

        setRowsFromApi(mappedRows);
        setSelected((current) => current ?? mappedRows[0] ?? null);
      } catch (error) {
        console.error("Gagal mengambil data muatan:", error);

        if (!cancelled) {
          setRowsFromApi([]);
          setSelected(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const all = rowsFromApi ?? [];

  const rows = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase();

    return all.filter((load) => {
      const matchesCommodity =
        commodity === "all" ||
        load.name.toLowerCase().includes(commodity.toLowerCase());

      const matchesWeight = load.kg <= max;

      const searchableText =
        `${load.name} ${load.origin} ${load.destination} ${load.id}`.toLowerCase();

      const matchesSearch = searchableText.includes(normalizedQuery);

      return matchesCommodity && matchesWeight && matchesSearch;
    });
  }, [all, q, commodity, max]);

  function resetFilters() {
    setQ("");
    setCommodity("all");
    setMax(10000);
  }

  return (
    <AppShell flush>
      <div className="filterbar">
        <label>
          <Search />

          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Cari lokasi, komoditas, ID..."
          />
        </label>

        <select
          value={commodity}
          onChange={(event) => setCommodity(event.target.value)}
        >
          <option value="all">Semua Komoditas</option>
          <option value="cabai">Cabai</option>
          <option value="bawang">Bawang</option>
          <option value="tomat">Tomat</option>
        </select>

        <label className="range">
          <SlidersHorizontal />

          <span>Maks {max / 1000} ton</span>

          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={max}
            onChange={(event) => setMax(Number(event.target.value))}
          />
        </label>

        <span>{loading ? "Memuat..." : `${rows.length} Muatan`}</span>
      </div>

      <div className="split">
        <section className="load-list">
          <h3>Muatan tersedia</h3>

          {loading && <p>Memuat...</p>}

          {!loading && rows.length === 0 && (
            <div className="empty-load">
              <h2>Tidak ada muatan</h2>

              <button
                type="button"
                className="button primary"
                onClick={resetFilters}
              >
                Reset Filter
              </button>
            </div>
          )}

          {rows.map((load) => (
            <article
              key={load.id}
              onClick={() => setSelected(load)}
              className={
                selected?.id === load.id ? "load-card selected" : "load-card"
              }
            >
              <header>
                <span>
                  <b>{load.name}</b>

                  <small>
                    <Scale />
                    {load.kg / 1000} Ton
                  </small>
                </span>

                {load.urgent && <i>Urgent</i>}
              </header>

              <div className="route">
                <MapPin />

                <b>
                  {load.origin} → {load.destination}
                </b>
              </div>

              <footer>
                <strong>
                  {load.price > 0
                    ? `Rp ${load.price.toLocaleString("id-ID")}`
                    : "Anggaran terbuka"}
                </strong>

                <Link href={`/loads/${load.id}`} className="button link">
                  Lihat Detail
                </Link>
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
