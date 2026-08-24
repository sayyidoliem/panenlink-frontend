"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { RouteMap } from "@/components/maps/RouteMap";
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
import { useApp } from "@/shared/app/AppProvider";
import { useUiTranslation } from "@/shared/app/useUiTranslation";
import { useState } from "react";

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
        <circle className="panenlink-mascot-route-dot one" cx="30" cy="154" r="6" />
        <circle className="panenlink-mascot-route-dot two" cx="206" cy="58" r="6" />
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
        <ellipse className="panenlink-mascot-shadow" cx="112" cy="202" rx="64" ry="12" />
        <path className="panenlink-mascot-tail" d="M153 111 C184 100 204 117 200 142 C181 130 166 137 154 156 Z" />
        <g className="panenlink-mascot-body">
          <path className="panenlink-mascot-leg left" d="M76 177 C66 184 67 197 82 198 C95 198 100 189 96 180 Z" />
          <path className="panenlink-mascot-leg right" d="M130 180 C126 190 132 199 145 198 C160 196 161 184 150 177 Z" />
          <path
            className="panenlink-mascot-shape"
            d="M111 37 C146 34 177 55 187 89 C200 133 180 179 145 194 C112 209 67 198 49 167 C31 136 39 86 61 59 C74 43 91 38 111 37 Z"
          />
          <path
            className="panenlink-mascot-belly"
            d="M70 124 C70 96 88 79 113 79 C139 80 157 99 157 127 C157 161 139 181 113 181 C88 181 70 160 70 124 Z"
          />
          <path className="panenlink-mascot-scarf" d="M72 116 C93 128 127 130 155 117 C149 128 141 136 129 141 C119 135 102 134 91 141 C81 136 75 128 72 116 Z" />
          <path className="panenlink-mascot-scarf-tail" d="M139 134 C153 139 163 150 166 163 C151 163 138 153 129 141 Z" />
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
          <circle className="panenlink-mascot-eye right" cx="130" cy="89" r="8" />
          <circle className="panenlink-mascot-eye-light left" cx="88" cy="86" r="2.5" />
          <circle className="panenlink-mascot-eye-light right" cx="127" cy="86" r="2.5" />
          <circle className="panenlink-mascot-cheek left" cx="75" cy="108" r="8" />
          <circle className="panenlink-mascot-cheek right" cx="147" cy="108" r="8" />
          <path className="panenlink-mascot-smile" d="M94 106 C102 119 122 119 131 106" />
          <path className="panenlink-mascot-mouth-glow" d="M101 116 C108 121 118 121 125 116" />
          <path className="panenlink-mascot-highlight" d="M76 58 C91 48 112 44 132 51" />
        </g>
      </svg>
    </div>
  );
}

export default function Page() {
  const { account, alerts, pushAlert } = useApp(),
    [notes, setNotes] = useState([
      "Siapkan dokumen DO",
      "Telepon supplier pupuk",
      "Cek kualitas bawang",
    ]);
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
  const shipments = [
    {
      date: "18 Ags 2026",
      commodity: "Cabai Merah",
      partner: "Pak Agus",
      status: "Dalam Perjalanan",
      progress: "65%",
      vehicle: "CDD Box Pendingin",
    },
    {
      date: "17 Ags 2026",
      commodity: "Jagung Manis",
      partner: "CV Subur Tani",
      status: "Menunggu Muat",
      progress: "Persiapan",
      vehicle: "Pickup Gran Max",
    },
    {
      date: "15 Ags 2026",
      commodity: "Bawang Merah",
      partner: "Suryono",
      status: "Selesai",
      progress: "100%",
      vehicle: "Tronton",
    },
  ];
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
  const wa = `https://wa.me/${account.phone}?text=${encodeURIComponent("Halo, terkait muatan aktif Garut-Jakarta")}`;
  const addNote = () => {
    const x = prompt("Catatan baru");
    if (!x) return;
    setNotes((current) => [x, ...current]);
    pushAlert({
      title: "Catatan dashboard ditambahkan",
      body: `"${x}" masuk ke daftar prioritas pemilik.`,
      tone: "success",
    });
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
            <h2>{t("Distribusi Anda sedang bergerak dengan ritme yang bagus.")}</h2>
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
          <Kpi icon={Package} label={t("Total Terkirim")} value="18.5 Ton" />
          <Kpi
            icon={Truck}
            label={t("Muatan Aktif")}
            value="2 Truk Jalan"
            tone="orange"
          />
          <Kpi
            icon={Wallet}
            label={t("Total Hemat Ongkir")}
            value="Rp 4.250.000"
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
              <RouteMap initial="Garut" />
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
                <span className="pill muted">3 Load</span>
              </div>
              <table>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={`${shipment.date}-${shipment.commodity}`}>
                      <td>{shipment.date}</td>
                      <td>
                        <strong>{shipment.commodity}</strong>
                        <small>{shipment.vehicle}</small>
                      </td>
                      <td>{shipment.partner}</td>
                      <td>{shipment.progress}</td>
                      <td>
                        <i
                          className={`status ${
                            shipment.status === "Selesai" ? "green" : "blue"
                          }`}
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
                  <p>{t("Rute utama yang sedang menghasilkan pemasukan hari ini.")}</p>
                </div>
                <ChartNoAxesCombined />
              </div>
              <b>Cabai Merah (5 Ton)</b>
              <p>Garut → Jakarta</p>
              <div className="progress">
                <i />
              </div>
              <div className="active-load-metrics">
                <span>
                  <small>ETA</small>
                  <strong>2j 15m</strong>
                </span>
                <span>
                  <small>Driver</small>
                  <strong>Pak Agus</strong>
                </span>
              </div>
              <a className="button outline full" target="_blank" href={wa}>
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
              {notes.map((x) => (
                <label className="check" key={x}>
                  <input type="checkbox" />
                  <span>{x}</span>
                </label>
              ))}
              <button className="button ghost" onClick={addNote}>
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
