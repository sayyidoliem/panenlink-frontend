"use client";
import { useEffect, useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
type Place = { label: string; lat: number; lon: number };
export function RouteMap({
  initial = "Garut",
  onPick,
}: {
  initial?: string;
  onPick?: (p: Place) => void;
}) {
  const [q, setQ] = useState(""),
    [items, setItems] = useState<Place[]>([]),
    [place, setPlace] = useState<Place>({
      label: initial,
      lat: -7.2279,
      lon: 107.9087,
    }),
    [busy, setBusy] = useState(false);
  const search = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      setItems(await r.json());
    } finally {
      setBusy(false);
    }
  };
  // useEffect(() => {
  //   void search();
  // }, []);
  const choose = (p: Place) => {
    setPlace(p);
    setQ(p.label);
    setItems([]);
    onPick?.(p);
  };
  const live = () =>
    navigator.geolocation?.getCurrentPosition(
      (x) =>
        choose({
          label: "Lokasi saya",
          lat: x.coords.latitude,
          lon: x.coords.longitude,
        }),
      () => alert("Izin lokasi ditolak"),
    );
  const bbox = `${place.lon - 0.08},${place.lat - 0.06},${place.lon + 0.08},${place.lat + 0.06}`;
  return (
    <div className="route-map-widget">
      <div className="map-search">
        <Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), void search())
          }
        />
        <button type="button" onClick={search}>
          {busy ? "..." : "Cari"}
        </button>
        <button type="button" onClick={live}>
          <Navigation />
        </button>
      </div>
      {items.length > 0 && (
        <div className="map-results">
          {items.map((x, i) => (
            <button type="button" key={i} onClick={() => choose(x)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <iframe
        title="Peta OpenStreetMap"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${place.lat},${place.lon}`}
      />
      <small>
        <MapPin /> {place.label} · © OpenStreetMap contributors
      </small>
    </div>
  );
}
