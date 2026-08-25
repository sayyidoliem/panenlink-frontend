"use client";

import Link from "next/link";
import { Search, Scale, MapPin, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteMap } from "@/components/maps/RouteMap";
import { createClient } from "@/shared/lib/supabase/client";

type LoadItem = {
  id: string;
  publicCode: string;
  name: string;
  kg: number;
  origin: string;
  destination: string;
  price: number;
  urgent: boolean;
};

type LoadRow = {
  id: unknown;
  public_code: unknown;
  commodity: unknown;
  weight_kg: unknown;
  origin: unknown;
  destination: unknown;
  budget: unknown;
  is_urgent: unknown;
};

function textFallback(value: unknown, fallback = "-") {
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

function rowToLoad(row: LoadRow): LoadItem {
  return {
    id: String(row.id),
    publicCode: textFallback(row.public_code),
    name: textFallback(row.commodity),
    kg: numberFallback(row.weight_kg),
    origin: textFallback(row.origin),
    destination: textFallback(row.destination, "Tujuan belum ditentukan"),
    price: numberFallback(row.budget),
    urgent: Boolean(row.is_urgent),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

export default function Page() {
  const supabase = createClient();

  const [all, setAll] = useState<LoadItem[]>([]);

  const [q, setQ] = useState("");

  const [commodity, setCommodity] = useState("all");

  const [max, setMax] = useState(10000);

  const [selected, setSelected] = useState<LoadItem | null>(null);

  const [loading, setLoading] = useState(true);

  const loadAvailableLoads = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("loads")
        .select(
          [
            "id",
            "public_code",
            "commodity",
            "weight_kg",
            "origin",
            "destination",
            "budget",
            "is_urgent",
          ].join(","),
        )
        .eq("status", "open")
        .order("is_urgent", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const loads = ((data as LoadRow[] | null) ?? []).map(rowToLoad);

      setAll(loads);

      setSelected((currentSelected) => {
        if (!loads.length) {
          return null;
        }

        if (!currentSelected) {
          return loads[0];
        }

        return loads.find((load) => load.id === currentSelected.id) ?? loads[0];
      });
    } catch (error) {
      console.error("Muatan gagal dimuat dari Supabase:", error);

      window.alert(`Muatan gagal dimuat. ${getErrorMessage(error)}`);

      setAll([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadAvailableLoads();
  }, [loadAvailableLoads]);

  useEffect(() => {
    const channel = supabase
      .channel("open-loads-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loads",
        },
        () => {
          void loadAvailableLoads();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAvailableLoads, supabase]);

  const rows = useMemo(
    () =>
      all.filter((load) => {
        const normalizedCommodity = commodity.toLowerCase();

        const matchesCommodity =
          normalizedCommodity === "all" ||
          load.name.toLowerCase().includes(normalizedCommodity);

        const matchesWeight = load.kg <= max;

        const searchableText = [
          load.name,
          load.origin,
          load.destination,
          load.publicCode,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(q.trim().toLowerCase());

        return matchesCommodity && matchesWeight && matchesSearch;
      }),
    [all, commodity, max, q],
  );

  useEffect(() => {
    if (!rows.length) {
      return;
    }

    const selectedStillVisible =
      selected && rows.some((load) => load.id === selected.id);

    if (!selectedStillVisible) {
      setSelected(rows[0]);
    }
  }, [rows, selected]);

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
          Maks {max / 1000} ton
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

          {rows.map((load) => (
            <article
              onClick={() => setSelected(load)}
              className={
                selected?.id === load.id ? "load-card selected" : "load-card"
              }
              key={load.id}
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

                <Link href={`/loads/${encodeURIComponent(load.publicCode)}`}>
                  Lihat Detail
                </Link>
              </footer>
            </article>
          ))}

          {!loading && rows.length === 0 && (
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
          {selected ? (
            <>
              <RouteMap key={selected.id} initial={selected.origin} />

              <div className="map-tip">
                <b>{selected.name}</b>

                <small>
                  {selected.origin} → {selected.destination}
                </small>
              </div>
            </>
          ) : (
            <div className="empty-load">
              <h2>Belum ada muatan aktif</h2>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
