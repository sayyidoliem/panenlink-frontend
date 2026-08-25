"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  Boxes,
  ChartNoAxesCombined,
  MessageCircle,
  Package,
  Plus,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { RouteMap } from "@/components/maps/RouteMap";
import { useApp } from "@/shared/app/AppProvider";
import { useUiTranslation } from "@/shared/app/useUiTranslation";
import { createClient } from "@/shared/lib/supabase/client";

type ShipmentStatus =
  | "picked_up"
  | "in_transit"
  | "nearby"
  | "delivered"
  | "cancelled";

type DashboardLoadRow = {
  id: unknown;
  public_code: unknown;
  commodity: unknown;
  weight_kg: unknown;
  origin: unknown;
  destination: unknown;
  vehicle_type: unknown;
  budget: unknown;
  status: unknown;
  created_at: unknown;
};

type DashboardShipmentRow = {
  id: unknown;
  driver_name: unknown;
  vehicle_plate: unknown;
  vehicle_type: unknown;
  status: unknown;
  progress_percent: unknown;
  eta_minutes: unknown;
  payment_status: unknown;
  delivered_at: unknown;
  created_at: unknown;
  loads: DashboardLoadRow | DashboardLoadRow[] | null;
};

type DashboardNoteRow = {
  id: string;
  content: string;
  is_done: boolean;
  created_at: string;
};

type DashboardData = {
  totalDeliveredKg: number;
  activeShipmentCount: number;
  totalShippingValue: number;
  activeShipment: DashboardShipmentRow | null;
  shipments: DashboardShipmentRow[];
  notes: DashboardNoteRow[];
};

const EMPTY_DASHBOARD: DashboardData = {
  totalDeliveredKg: 0,
  activeShipmentCount: 0,
  totalShippingValue: 0,
  activeShipment: null,
  shipments: [],
  notes: [],
};

function textFallback(value: unknown, fallback = "-") {
  if (typeof value !== "string") return fallback;
  const result = value.trim();
  return result || fallback;
}

function numberFallback(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function getRelatedLoad(value: DashboardLoadRow | DashboardLoadRow[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function normalizeShipmentStatus(value: unknown): ShipmentStatus {
  if (
    value === "picked_up" ||
    value === "in_transit" ||
    value === "nearby" ||
    value === "delivered" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "picked_up";
}

function shipmentStatusLabel(status: ShipmentStatus) {
  switch (status) {
    case "picked_up":
      return "Menunggu Muat";
    case "in_transit":
      return "Dalam Perjalanan";
    case "nearby":
      return "Dekat Lokasi";
    case "delivered":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
  }
}

function formatDashboardDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatWeightKilograms(weightKg: number) {
  const tons = weightKg / 1000;
  return `${tons.toLocaleString("id-ID", {
    minimumFractionDigits: tons % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })} Ton`;
}

function formatMoney(value: number) {
  return `Rp ${Math.max(0, value).toLocaleString("id-ID")}`;
}

function formatEta(minutes: number) {
  if (minutes <= 0) return "-";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours <= 0) return `${remainingMinutes}m`;
  return `${hours}j ${remainingMinutes}m`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
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

function PanenLinkGlyph() {
  return (
    <div className="panenlink-glyph" aria-hidden="true">
      <svg className="panenlink-mascot" viewBox="0 0 240 240">
        <defs>
          <radialGradient id="panenlinkMascotAura" cx="48%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#fff8c8" />
            <stop offset="60%" stopColor="#dff4d3" />
            <stop offset="100%" stopColor="#dff4d300" />
          </radialGradient>
          <radialGradient id="panenlinkMascotBody" cx="36%" cy="24%" r="84%">
            <stop offset="0%" stopColor="#fff0a2" />
            <stop offset="48%" stopColor="#bdd76a" />
            <stop offset="78%" stopColor="#79ad59" />
            <stop offset="100%" stopColor="#477b37" />
          </radialGradient>
          <linearGradient id="panenlinkMascotLeaf" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbffe8" />
            <stop offset="52%" stopColor="#a7d784" />
            <stop offset="100%" stopColor="#467c36" />
          </linearGradient>
          <linearGradient id="panenlinkMascotCrate" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd08c" />
            <stop offset="58%" stopColor="#c87a54" />
            <stop offset="100%" stopColor="#8f4c2a" />
          </linearGradient>
          <linearGradient id="panenlinkMascotScarf" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f6c979" />
            <stop offset="100%" stopColor="#c87a54" />
          </linearGradient>
        </defs>
        <circle className="panenlink-mascot-aura" cx="120" cy="122" r="104" />
        <path
          className="panenlink-mascot-route"
          d="M24 160 C58 122 82 151 107 119 C134 84 158 110 206 58"
        />
        <circle
          className="panenlink-mascot-route-dot one"
          cx="30"
          cy="154"
          r="6"
        />
        <circle
          className="panenlink-mascot-route-dot two"
          cx="206"
          cy="58"
          r="6"
        />
        <g className="panenlink-mascot-sparkle one">
          <path d="M52 52 L58 66 L72 72 L58 78 L52 92 L46 78 L32 72 L46 66 Z" />
        </g>
        <g className="panenlink-mascot-sparkle two">
          <path d="M193 114 L197 123 L206 127 L197 131 L193 140 L189 131 L180 127 L189 123 Z" />
        </g>
        <g className="panenlink-mascot-sparkle three">
          <circle cx="45" cy="130" r="4" />
          <circle cx="197" cy="88" r="3" />
        </g>
        <g className="panenlink-mascot-truck">
          <rect x="171" y="159" width="36" height="21" rx="7" />
          <path d="M197 165 H210 L216 174 V180 H197 Z" />
          <circle cx="181" cy="182" r="5" />
          <circle cx="207" cy="182" r="5" />
        </g>
        <ellipse
          className="panenlink-mascot-shadow"
          cx="112"
          cy="202"
          rx="64"
          ry="12"
        />
        <path
          className="panenlink-mascot-tail"
          d="M153 111 C184 100 204 117 200 142 C181 130 166 137 154 156 Z"
        />
        <g className="panenlink-mascot-body">
          <path
            className="panenlink-mascot-leg left"
            d="M76 177 C66 184 67 197 82 198 C95 198 100 189 96 180 Z"
          />
          <path
            className="panenlink-mascot-leg right"
            d="M130 180 C126 190 132 199 145 198 C160 196 161 184 150 177 Z"
          />
          <path
            className="panenlink-mascot-shape"
            d="M111 37 C146 34 177 55 187 89 C200 133 180 179 145 194 C112 209 67 198 49 167 C31 136 39 86 61 59 C74 43 91 38 111 37 Z"
          />
          <path
            className="panenlink-mascot-belly"
            d="M70 124 C70 96 88 79 113 79 C139 80 157 99 157 127 C157 161 139 181 113 181 C88 181 70 160 70 124 Z"
          />
          <path
            className="panenlink-mascot-scarf"
            d="M72 116 C93 128 127 130 155 117 C149 128 141 136 129 141 C119 135 102 134 91 141 C81 136 75 128 72 116 Z"
          />
          <path
            className="panenlink-mascot-scarf-tail"
            d="M139 134 C153 139 163 150 166 163 C151 163 138 153 129 141 Z"
          />
          <path
            className="panenlink-mascot-arm left"
            d="M59 118 C41 122 35 139 47 149 C61 143 67 130 68 120 Z"
          />
          <path
            className="panenlink-mascot-arm right"
            d="M163 114 C181 120 186 137 174 148 C159 143 153 128 153 119 Z"
          />
          <g className="panenlink-mascot-crate">
            <rect x="82" y="139" width="57" height="39" rx="11" />
            <path d="M84 151 H138" />
            <path d="M101 140 V177" />
            <path d="M121 140 V177" />
            <circle cx="95" cy="134" r="7" />
            <circle cx="111" cy="131" r="8" />
            <circle cx="128" cy="135" r="6" />
            <path d="M111 123 C105 115 94 116 90 124 C99 128 106 128 111 123 Z" />
          </g>
          <path
            className="panenlink-mascot-leaf top"
            d="M110 39 C98 17 70 18 62 40 C82 52 101 52 110 39 Z"
          />
          <path
            className="panenlink-mascot-leaf side"
            d="M120 38 C132 16 160 20 166 42 C144 54 128 51 120 38 Z"
          />
          <circle className="panenlink-mascot-eye left" cx="91" cy="89" r="8" />
          <circle
            className="panenlink-mascot-eye right"
            cx="130"
            cy="89"
            r="8"
          />
          <circle
            className="panenlink-mascot-eye-light left"
            cx="88"
            cy="86"
            r="2.5"
          />
          <circle
            className="panenlink-mascot-eye-light right"
            cx="127"
            cy="86"
            r="2.5"
          />
          <circle
            className="panenlink-mascot-cheek left"
            cx="75"
            cy="108"
            r="8"
          />
          <circle
            className="panenlink-mascot-cheek right"
            cx="147"
            cy="108"
            r="8"
          />
          <path
            className="panenlink-mascot-smile"
            d="M94 106 C102 119 122 119 131 106"
          />
          <path
            className="panenlink-mascot-mouth-glow"
            d="M101 116 C108 121 118 121 125 116"
          />
          <path
            className="panenlink-mascot-highlight"
            d="M76 58 C91 48 112 44 132 51"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Page() {
  const supabase = useMemo(() => createClient(), []);
  const { account, alerts, pushAlert } = useApp();
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const t = useUiTranslation([
    "Pantau panen, armada, notifikasi, dan tren distribusi dari satu dashboard.",
    "Operasi PanenLink Hari Ini",
    "Distribusi Anda sedang bergerak dengan ritme yang bagus.",
    "Dua armada aktif sedang berjalan, satu pengiriman siap muat, dan pusat notifikasi sudah sinkron dengan aktivitas dashboard.",
    "Lihat Peluang Muatan",
    "Atur Preferensi",
    "Total Terkirim",
    "Muatan Aktif",
    "Total Hemat Ongkir",
    "Cari Armada Balik",
    "Temukan armada kosong terdekat untuk menekan ongkir.",
    "AI Ringkas Operasi",
    "Minta rekomendasi rute, harga, dan dokumen lebih cepat.",
    "Rute Aktif",
    "Peta dibuat lebih premium dengan efek pseudo-3D dan overlay status.",
    "Riwayat & Status Muatan",
    "Ringkasan muatan aktif, antrean muat, dan pengiriman selesai.",
    "Rute utama yang sedang menghasilkan pemasukan hari ini.",
    "Pusat Notifikasi",
    "Notifikasi ini live dari aktivitas dashboard dan pengaturan aplikasi.",
    "Catatan Pemilik",
    "Checklist cepat untuk hal penting sebelum armada berangkat.",
    "Insight Harian",
    "Rekomendasi cepat yang bisa langsung dipakai di operasi lapangan.",
  ]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setDashboard(EMPTY_DASHBOARD);
        return;
      }

      const { data: ownedLoadRows, error: loadsError } = await supabase
        .from("loads")
        .select("id")
        .eq("owner_id", user.id);

      if (loadsError) throw loadsError;

      const ownedLoadIds = (ownedLoadRows ?? []).map(
        (row: { id: string | number }) => String(row.id),
      );
      let shipmentRows: DashboardShipmentRow[] = [];

      if (ownedLoadIds.length > 0) {
        const { data, error } = await supabase
          .from("shipments")
          .select(
            `
            id,
            driver_name,
            vehicle_plate,
            vehicle_type,
            status,
            progress_percent,
            eta_minutes,
            payment_status,
            delivered_at,
            created_at,
            loads (
              id,
              public_code,
              commodity,
              weight_kg,
              origin,
              destination,
              vehicle_type,
              budget,
              status,
              created_at
            )
          `,
          )
          .in("load_id", ownedLoadIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        shipmentRows = (data ?? []) as unknown as DashboardShipmentRow[];
      }

      const { data: noteRows, error: notesError } = await supabase
        .from("dashboard_notes")
        .select("id,content,is_done,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;

      const completedShipments = shipmentRows.filter(
        (shipment) => normalizeShipmentStatus(shipment.status) === "delivered",
      );
      const activeShipments = shipmentRows.filter((shipment) => {
        const status = normalizeShipmentStatus(shipment.status);
        return status !== "delivered" && status !== "cancelled";
      });

      const totalDeliveredKg = completedShipments.reduce((total, shipment) => {
        const load = getRelatedLoad(shipment.loads);
        return total + numberFallback(load?.weight_kg);
      }, 0);

      const totalShippingValue = completedShipments
        .filter((shipment) => shipment.payment_status === "paid")
        .reduce((total, shipment) => {
          const load = getRelatedLoad(shipment.loads);
          return total + numberFallback(load?.budget);
        }, 0);

      setDashboard({
        totalDeliveredKg,
        activeShipmentCount: activeShipments.length,
        totalShippingValue,
        activeShipment: activeShipments[0] ?? null,
        shipments: shipmentRows,
        notes: (noteRows ?? []) as DashboardNoteRow[],
      });
    } catch (error) {
      console.error("Dashboard gagal dimuat:", error);
      setDashboard(EMPTY_DASHBOARD);
      window.alert(`Dashboard gagal dimuat. ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-live-data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loads" },
        () => {
          void loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments" },
        () => {
          void loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dashboard_notes" },
        () => {
          void loadDashboard();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard, supabase]);

  const quickActions = [
    {
      href: "/post-load",
      icon: Plus,
      title: "Publish Harvest",
      body: "Tambahkan muatan baru lengkap dengan jadwal dan armada.",
    },
    {
      href: "/loads",
      icon: Truck,
      title: t("Cari Armada Balik"),
      body: t("Temukan armada kosong terdekat untuk menekan ongkir."),
    },
    {
      href: "/ai",
      icon: Sparkles,
      title: t("AI Ringkas Operasi"),
      body: t("Minta rekomendasi rute, harga, dan dokumen lebih cepat."),
    },
  ];

  const insights = [
    "Biaya logistik minggu ini turun 12% dibanding minggu lalu.",
    "Jam muat paling efisien ada di pukul 08.00 - 10.00.",
    "Rute Garut - Jakarta paling stabil untuk komoditas cabai.",
  ];

  const activeShipment = dashboard.activeShipment;
  const activeLoad = activeShipment
    ? getRelatedLoad(activeShipment.loads)
    : null;

  const displayedShipments = dashboard.shipments.slice(0, 3).map((shipment) => {
    const load = getRelatedLoad(shipment.loads);
    const status = normalizeShipmentStatus(shipment.status);
    return {
      id: String(shipment.id),
      date: formatDashboardDate(shipment.delivered_at ?? shipment.created_at),
      commodity: textFallback(load?.commodity),
      partner: textFallback(shipment.driver_name, "Belum ada driver"),
      status: shipmentStatusLabel(status),
      progress:
        status === "delivered"
          ? "100%"
          : `${Math.min(100, Math.max(0, numberFallback(shipment.progress_percent)))}%`,
      vehicle: textFallback(shipment.vehicle_type ?? load?.vehicle_type),
    };
  });

  const totalDeliveredLabel = formatWeightKilograms(dashboard.totalDeliveredKg);
  const activeLoadLabel = loading
    ? "Memuat..."
    : `${dashboard.activeShipmentCount} Truk Jalan`;
  const shippingValueLabel = formatMoney(dashboard.totalShippingValue);

  const normalizedPhone = account.phone.replace(/\D/g, "");
  const whatsappPhone = normalizedPhone.startsWith("0")
    ? `62${normalizedPhone.slice(1)}`
    : normalizedPhone;
  const wa =
    activeLoad && whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
          `Halo, terkait muatan aktif ${textFallback(activeLoad.origin)}-${textFallback(
            activeLoad.destination,
            "Tujuan belum ditentukan",
          )}`,
        )}`
      : "#";

  const addNote = async () => {
    if (savingNote) return;
    const content = window.prompt("Catatan baru")?.trim();
    if (!content) return;

    setSavingNote(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Sesi pengguna tidak ditemukan.");

      const { error } = await supabase.from("dashboard_notes").insert({
        user_id: user.id,
        content,
        is_done: false,
      });
      if (error) throw error;

      pushAlert({
        title: "Catatan dashboard ditambahkan",
        body: `"${content}" masuk ke daftar prioritas pemilik.`,
        tone: "success",
      });
      await loadDashboard();
    } catch (error) {
      console.error("Catatan gagal ditambahkan:", error);
      window.alert(`Catatan gagal ditambahkan. ${getErrorMessage(error)}`);
    } finally {
      setSavingNote(false);
    }
  };

  const toggleNote = async (note: DashboardNoteRow) => {
    const nextDone = !note.is_done;
    setDashboard((current) => ({
      ...current,
      notes: current.notes.map((item) =>
        item.id === note.id ? { ...item, is_done: nextDone } : item,
      ),
    }));

    const { error } = await supabase
      .from("dashboard_notes")
      .update({ is_done: nextDone })
      .eq("id", note.id);

    if (error) {
      console.error("Catatan gagal diperbarui:", error);
      await loadDashboard();
    }
  };

  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title={`Halo, ${account.name}`}
          description={t(
            "Pantau panen, armada, notifikasi, dan tren distribusi dari satu dashboard.",
          )}
          action={
            <Link className="button secondary" href="/post-load">
              <Plus />
              Publish Harvest
            </Link>
          }
        />

        <section className="card dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="dashboard-badge">
              <Sparkles />
              {t("Operasi PanenLink Hari Ini")}
            </span>
            <h2>
              {t("Distribusi Anda sedang bergerak dengan ritme yang bagus.")}
            </h2>
            <p>
              {t(
                "Dua armada aktif sedang berjalan, satu pengiriman siap muat, dan pusat notifikasi sudah sinkron dengan aktivitas dashboard.",
              )}
            </p>
            <div className="dashboard-hero-actions">
              <Link className="button primary" href="/loads">
                {t("Lihat Peluang Muatan")}
              </Link>
              <Link className="button outline" href="/settings">
                {t("Atur Preferensi")}
              </Link>
            </div>
          </div>
          <div className="dashboard-brand-card">
            <PanenLinkGlyph />
          </div>
        </section>

        <div className="kpi-grid">
          <Kpi
            icon={Package}
            label={t("Total Terkirim")}
            value={totalDeliveredLabel}
          />
          <Kpi
            icon={Truck}
            label={t("Muatan Aktif")}
            value={activeLoadLabel}
            tone="orange"
          />
          <Kpi
            icon={Wallet}
            label={t("Total Hemat Ongkir")}
            value={shippingValueLabel}
          />
        </div>

        <section className="dashboard-secondary-grid">
          {quickActions.map(({ href, icon: Icon, title, body }) => (
            <Link key={title} href={href} className="dashboard-action-card">
              <span>
                <Icon />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </section>

        <div className="dashboard-grid">
          <div>
            <section className="card">
              <div className="section-head">
                <div>
                  <h2>{t("Rute Aktif")}</h2>
                  <p>
                    {t(
                      "Peta dibuat lebih premium dengan efek pseudo-3D dan overlay status.",
                    )}
                  </p>
                </div>
                <span className="pill">Live Ops</span>
              </div>
              <RouteMap
                key={textFallback(activeLoad?.origin)}
                initial={textFallback(activeLoad?.origin, "Garut")}
              />
            </section>

            <section className="card">
              <div className="section-head">
                <div>
                  <h2>{t("Riwayat & Status Muatan")}</h2>
                  <p>
                    {t(
                      "Ringkasan muatan aktif, antrean muat, dan pengiriman selesai.",
                    )}
                  </p>
                </div>
                <span className="pill muted">
                  {displayedShipments.length} Load
                </span>
              </div>
              <table>
                <tbody>
                  {displayedShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td>{shipment.date}</td>
                      <td>
                        <strong>{shipment.commodity}</strong>
                        <small>{shipment.vehicle}</small>
                      </td>
                      <td>{shipment.partner}</td>
                      <td>{shipment.progress}</td>
                      <td>
                        <i
                          className={`status ${shipment.status === "Selesai" ? "green" : "blue"}`}
                        >
                          {shipment.status}
                        </i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <aside>
            <section className="card active-load premium">
              <div className="section-head">
                <div>
                  <h2>{t("Muatan Aktif")}</h2>
                  <p>
                    {t(
                      "Rute utama yang sedang menghasilkan pemasukan hari ini.",
                    )}
                  </p>
                </div>
                <ChartNoAxesCombined />
              </div>
              <b>
                {activeLoad
                  ? `${textFallback(activeLoad.commodity)} (${formatWeightKilograms(
                      numberFallback(activeLoad.weight_kg),
                    )})`
                  : "Belum ada muatan aktif"}
              </b>
              <p>
                {activeLoad
                  ? `${textFallback(activeLoad.origin)} → ${textFallback(
                      activeLoad.destination,
                      "Tujuan belum ditentukan",
                    )}`
                  : "-"}
              </p>
              <div className="progress">
                <i
                  style={{
                    width: `${
                      activeShipment
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              numberFallback(activeShipment.progress_percent),
                            ),
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="active-load-metrics">
                <span>
                  <small>ETA</small>
                  <strong>
                    {activeShipment
                      ? formatEta(numberFallback(activeShipment.eta_minutes))
                      : "-"}
                  </strong>
                </span>
                <span>
                  <small>Driver</small>
                  <strong>
                    {activeShipment
                      ? textFallback(
                          activeShipment.driver_name,
                          "Belum ada driver",
                        )
                      : "-"}
                  </strong>
                </span>
              </div>
              <a
                className="button outline full"
                target="_blank"
                rel="noreferrer"
                href={wa}
                onClick={(event) => {
                  if (!activeShipment || wa === "#") {
                    event.preventDefault();
                    window.alert("Kontak WhatsApp belum tersedia.");
                  }
                }}
              >
                <MessageCircle />
                Chat Driver WA
              </a>
            </section>

            <section className="card dashboard-notification-card">
              <div className="section-head">
                <div>
                  <h2>{t("Pusat Notifikasi")}</h2>
                  <p>
                    {t(
                      "Notifikasi ini live dari aktivitas dashboard dan pengaturan aplikasi.",
                    )}
                  </p>
                </div>
                <BellRing />
              </div>
              <div className="dashboard-alert-stack">
                {alerts.slice(0, 3).map((alert) => (
                  <article key={alert.id} className="dashboard-alert-item">
                    <span className={`dashboard-alert-pill ${alert.tone}`} />
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="section-head">
                <div>
                  <h2>{t("Catatan Pemilik")}</h2>
                  <p>
                    {t(
                      "Checklist cepat untuk hal penting sebelum armada berangkat.",
                    )}
                  </p>
                </div>
                <Boxes />
              </div>
              {dashboard.notes.map((note) => (
                <label className="check" key={note.id}>
                  <input
                    type="checkbox"
                    checked={note.is_done}
                    onChange={() => void toggleNote(note)}
                  />
                  <span>{note.content}</span>
                </label>
              ))}
              <button
                className="button ghost"
                onClick={() => void addNote()}
                disabled={savingNote}
              >
                + Tambah
              </button>
            </section>

            <section className="card dashboard-insight-card">
              <div className="section-head">
                <div>
                  <h2>{t("Insight Harian")}</h2>
                  <p>
                    {t(
                      "Rekomendasi cepat yang bisa langsung dipakai di operasi lapangan.",
                    )}
                  </p>
                </div>
                <Sparkles />
              </div>
              <div className="insight-list">
                {insights.map((insight) => (
                  <p key={insight}>{insight}</p>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
