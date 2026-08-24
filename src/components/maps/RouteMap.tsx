"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  MapPin,
  Navigation,
  Route,
  Search,
  Timer,
} from "lucide-react";
import type {
  LatLngExpression,
  LatLngTuple,
  Map as LeafletMap,
  Marker,
  Polyline,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUiTranslation } from "@/shared/app/useUiTranslation";

type Place = { label: string; lat: number; lon: number };
type FocusField = "origin" | "destination";
type RouteInfo = {
  distanceKm: number;
  durationMin: number;
  coordinates: LatLngTuple[];
};

const DEFAULT_ORIGIN: Place = {
  label: "Garut, Jawa Barat",
  lat: -7.2279,
  lon: 107.9087,
};

const DEFAULT_DESTINATION: Place = {
  label: "Jakarta",
  lat: -6.2088,
  lon: 106.8456,
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours <= 0) return `${mins}m`;
  return `${hours}j ${mins}m`;
}

function straightLine(from: Place, to: Place): LatLngTuple[] {
  return [
    [from.lat, from.lon],
    [to.lat, to.lon],
  ];
}

export function RouteMap({
  initial = "Garut",
  onPick,
}: {
  initial?: string;
  onPick?: (p: Place) => void;
}) {
  const t = useUiTranslation([
    "Asal",
    "Tujuan",
    "Cari lokasi",
    "Cari",
    "Tukar",
    "Rute dihitung",
    "Estimasi tiba",
    "Jarak",
    "Durasi",
    "Pilih asal",
    "Pilih tujuan",
    "Lokasi saya",
    "Armada aktif",
    "Jalur live",
  ]);

  const [origin, setOrigin] = useState<Place>({
    ...DEFAULT_ORIGIN,
    label: initial || DEFAULT_ORIGIN.label,
  });
  const [destination, setDestination] = useState<Place>(DEFAULT_DESTINATION);
  const [focus, setFocus] = useState<FocusField>("destination");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [routing, setRouting] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const destMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      if (!mapEl.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current) return;

      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
      }).setView([origin.lat, origin.lon], 7);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 18,
          subdomains: "abcd",
        },
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution("© OpenStreetMap · © CARTO")
        .addTo(map);

      const pinIcon = (kind: "source" | "destination") =>
        L.divIcon({
          className: `map-pin-marker ${kind}`,
          html: `<span class="map-pin-dot"></span><span class="map-pin-pulse"></span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

      originMarkerRef.current = L.marker([origin.lat, origin.lon], {
        icon: pinIcon("source"),
        interactive: false,
        keyboard: false,
      }).addTo(map);

      destMarkerRef.current = L.marker([destination.lat, destination.lon], {
        icon: pinIcon("destination"),
        interactive: false,
        keyboard: false,
      }).addTo(map);

      routeLineRef.current = L.polyline([], {
        className: "map-live-route",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        color: "#c87a54",
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      requestAnimationFrame(() => map.invalidateSize());

      const resize = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resize.observe(mapEl.current);
      cleanupResize = () => resize.disconnect();
    };

    let cleanupResize = () => {};
    void setup();

    return () => {
      cancelled = true;
      cleanupResize();
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      routeLineRef.current = null;
      originMarkerRef.current = null;
      destMarkerRef.current = null;
    };
    // Map instance is created once; markers/route update in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const line = routeLineRef.current;
    if (!map || !line || !mapReady) return;

    originMarkerRef.current?.setLatLng([origin.lat, origin.lon]);
    destMarkerRef.current?.setLatLng([destination.lat, destination.lon]);

    const coords = routeInfo?.coordinates?.length
      ? routeInfo.coordinates
      : straightLine(origin, destination);

    line.setLatLngs(coords as LatLngExpression[]);

    const bounds = line.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 12,
        animate: true,
      });
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [origin, destination, routeInfo, mapReady]);

  useEffect(() => {
    let active = true;
    const loadRoute = async () => {
      setRouting(true);
      try {
        const from = `${origin.lon},${origin.lat}`;
        const to = `${destination.lon},${destination.lat}`;
        const res = await fetch(
          `/api/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        );
        if (!res.ok) throw new Error("route failed");
        const data = await res.json();
        const route = data?.routes?.[0];
        const geometry = (route?.geometry?.coordinates || []) as [
          number,
          number,
        ][];
        if (!active || !route) return;

        const coordinates: LatLngTuple[] = geometry.map(([lon, lat]) => [
          lat,
          lon,
        ]);

        setRouteInfo({
          distanceKm: route.distance / 1000,
          durationMin: route.duration / 60,
          coordinates:
            coordinates.length > 1
              ? coordinates
              : straightLine(origin, destination),
        });
      } catch {
        if (active) {
          setRouteInfo({
            distanceKm: Math.hypot(
              (origin.lat - destination.lat) * 111,
              (origin.lon - destination.lon) * 111,
            ),
            durationMin: 135,
            coordinates: straightLine(origin, destination),
          });
        }
      } finally {
        if (active) setRouting(false);
      }
    };
    void loadRoute();
    return () => {
      active = false;
    };
  }, [origin, destination]);

  const search = async () => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      setItems(await r.json());
    } finally {
      setBusy(false);
    }
  };

  const choose = (place: Place) => {
    if (focus === "origin") setOrigin(place);
    else setDestination(place);
    setQ(place.label);
    setItems([]);
    onPick?.(place);
  };

  const live = () =>
    navigator.geolocation?.getCurrentPosition(
      (x) =>
        choose({
          label: t("Lokasi saya"),
          lat: x.coords.latitude,
          lon: x.coords.longitude,
        }),
      () => alert("Izin lokasi ditolak"),
    );

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    setFocus((current) => (current === "origin" ? "destination" : "origin"));
  };

  return (
    <div className="route-map-widget">
      <div className="map-route-tools">
        <button
          type="button"
          className={focus === "origin" ? "active" : ""}
          onClick={() => setFocus("origin")}
        >
          <MapPin />
          {t("Asal")}
        </button>
        <button type="button" className="map-swap" onClick={swap}>
          <ArrowLeftRight />
          {t("Tukar")}
        </button>
        <button
          type="button"
          className={focus === "destination" ? "active" : ""}
          onClick={() => setFocus("destination")}
        >
          <Navigation />
          {t("Tujuan")}
        </button>
      </div>

      <div className="map-endpoints">
        <button
          type="button"
          className={`map-endpoint ${focus === "origin" ? "active" : ""}`}
          onClick={() => setFocus("origin")}
        >
          <small>{t("Asal")}</small>
          <strong>{origin.label}</strong>
        </button>
        <button
          type="button"
          className={`map-endpoint ${focus === "destination" ? "active" : ""}`}
          onClick={() => setFocus("destination")}
        >
          <small>{t("Tujuan")}</small>
          <strong>{destination.label}</strong>
        </button>
      </div>

      <div className="map-search">
        <Search />
        <input
          value={q}
          placeholder={focus === "origin" ? t("Pilih asal") : t("Pilih tujuan")}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), void search())
          }
        />
        <button type="button" onClick={search}>
          {busy ? "..." : t("Cari")}
        </button>
        <button type="button" onClick={live} aria-label={t("Lokasi saya")}>
          <Navigation />
        </button>
      </div>

      {items.length > 0 && (
        <div className="map-results">
          {items.map((x, i) => (
            <button
              type="button"
              key={`${x.label}-${i}`}
              onClick={() => choose(x)}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}

      <div className="map-stats">
        <span>
          <Route />
          <small>{t("Jarak")}</small>
          <strong>
            {routeInfo ? `${routeInfo.distanceKm.toFixed(1)} km` : "..."}
          </strong>
        </span>
        <span>
          <Timer />
          <small>{t("Durasi")}</small>
          <strong>
            {routeInfo ? formatDuration(routeInfo.durationMin) : "..."}
          </strong>
        </span>
        <span>
          <Navigation />
          <small>{t("Estimasi tiba")}</small>
          <strong>
            {routing
              ? "..."
              : routeInfo
                ? formatDuration(routeInfo.durationMin)
                : "-"}
          </strong>
        </span>
      </div>

      <div className="map-stage">
        <div className="map-stage-overlay">
          <div className="map-floating-card top">
            <strong>{t("Jalur live")}</strong>
            <span>
              {origin.label.split(",")[0]} • {destination.label.split(",")[0]}
            </span>
          </div>
          <div className="map-floating-card bottom">
            <strong>
              {t("Estimasi tiba")}{" "}
              {routeInfo ? formatDuration(routeInfo.durationMin) : "..."}
            </strong>
            <span>{routing ? t("Rute dihitung") : t("Armada aktif")}</span>
          </div>
        </div>
        <div ref={mapEl} className="map-canvas" role="presentation" />
      </div>
      <small>
        <MapPin /> {origin.label} → {destination.label} · © OpenStreetMap
      </small>
    </div>
  );
}
