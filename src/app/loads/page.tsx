"use client";

import Link from "next/link";
import { MapPin, Scale, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteMap } from "@/components/maps/RouteMap";
import { createClient } from "@/shared/lib/supabase/client";

type DatabaseLoadRow = {
  id: unknown;
  public_code: unknown;
  commodity: unknown;
  weight_kg: unknown;
  origin: unknown;
  destination: unknown;
  budget: unknown;
  is_urgent: unknown;
  status: unknown;
};

type LoadRow = {
  id: string;
  publicCode: string;
  name: string;
  kg: number;
  origin: string;
  destination: string;
  price: number;
  urgent?: boolean;
};

function textFallback(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = value.trim();

  return result || fallback;
}

function numberFallback(value: unknown) {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

function toLoadRow(load: DatabaseLoadRow): LoadRow {
  return {
    id: String(load.id),
    publicCode: textFallback(load.public_code, String(load.id)),
    name: textFallback(load.commodity, "-"),
    kg: numberFallback(load.weight_kg),
    origin: textFallback(load.origin, "Lokasi belum ditentukan"),
    destination: textFallback(load.destination, "Belum ditugaskan"),
    price: numberFallback(load.budget),
    urgent: Boolean(load.is_urgent),
  };
}

export default function Page() {
  const supabase = useMemo(() => createClient(), []);

  const [rowsFromApi, setRowsFromApi] = useState<LoadRow[] | null>(null);
  const [selected, setSelected] = useState<LoadRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [commodity, setCommodity] = useState("all");
  const [max, setMax] = useState(10000);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("loads")
          .select(
            `
              id,
              public_code,
              commodity,
              weight_kg,
              origin,
              destination,
              budget,
              is_urgent,
              status
            `,
          )
          .eq("status", "open")
          .order("pickup_date", {
            ascending: true,
            nullsFirst: false,
          });

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        const mappedRows: LoadRow[] = (data ?? []).map((row: DatabaseLoadRow) =>
          toLoadRow(row as DatabaseLoadRow),
        );

        setRowsFromApi(mappedRows);

        setSelected((current) => {
          if (current && mappedRows.some((load) => load.id === current.id)) {
            return current;
          }

          return mappedRows[0] ?? null;
        });
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
  }, [supabase]);

  const all = rowsFromApi ?? [];

  const rows = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase();

    return all.filter((load) => {
      const matchesCommodity =
        commodity === "all" ||
        load.name.toLowerCase().includes(commodity.toLowerCase());

      const matchesWeight = load.kg <= max;

      const searchableText =
        `${load.name} ${load.origin} ${load.destination} ${load.publicCode}`.toLowerCase();

      const matchesSearch = searchableText.includes(normalizedQuery);

      return matchesCommodity && matchesWeight && matchesSearch;
    });
  }, [all, q, commodity, max]);

  useEffect(() => {
    if (rows.length === 0) {
      setSelected(null);
      return;
    }

    setSelected((current) => {
      if (current && rows.some((row) => row.id === current.id)) {
        return current;
      }

      return rows[0];
    });
  }, [rows]);

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
              </footer>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
