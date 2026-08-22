"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { Clock, Phone, FileText, Download, Package } from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
import { useState } from "react";
export default function Page() {
  const { account } = useApp(),
    [tab, setTab] = useState("running"),
    [step, setStep] = useState(1);
  const wa = `https://wa.me/${account.phone}?text=${encodeURIComponent("Halo, saya ingin membahas muatan #LOAD-2026-0821")}`;
  const download = (name: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([`${name} PanenLink\nLOAD-2026-0821\nGarut - Jakarta`], {
        type: "text/plain",
      }),
    );
    a.download = `${name}.txt`;
    a.click();
  };
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Riwayat & Pelacakan Muatan"
          description="Pantau armada dan dokumen pengiriman."
        />
        <div className="tabs order-tabs">
          {[
            ["running", "Berjalan"],
            ["done", "Selesai"],
            ["cancel", "Dibatalkan"],
          ].map(([v, l]) => (
            <button
              className={tab === v ? "active" : ""}
              onClick={() => setTab(v)}
              key={v}
            >
              {l}
            </button>
          ))}
        </div>
        {tab === "running" ? (
          <section className="card tracking">
            <div>
              <header>
                <span>
                  <h2>Cabai Merah Keriting 5.0 Ton</h2>
                  <p>#LOAD-2026-0821</p>
                </span>
                <i>
                  <Clock />
                  ETA: 2h 15m
                </i>
              </header>
              <ol>
                {[
                  "Muatan Diambil",
                  "Dalam Perjalanan",
                  "Dekat Lokasi",
                  "Terkirim",
                ].map((x, i) => (
                  <li
                    key={x}
                    className={i < step ? "done" : i === step ? "active" : ""}
                  >
                    {x}
                  </li>
                ))}
              </ol>
              <footer>
                <span className="avatar lg">PA</span>
                <div>
                  <b>Pak Agus</b>
                  <small>B 9284 FCO</small>
                </div>
                <a className="button outline" target="_blank" href={wa}>
                  <Phone />
                  WA
                </a>
                <button
                  className="button primary"
                  onClick={() => download("Surat-Jalan")}
                >
                  <FileText />
                  Surat Jalan
                </button>
                <button
                  className="button secondary"
                  onClick={() => setStep(Math.min(3, step + 1))}
                >
                  Perbarui Status
                </button>
              </footer>
            </div>
            <RouteMap initial="Garut" />
          </section>
        ) : (
          <div className="empty-load">
            <h2>
              {tab === "done" ? "Pengiriman selesai" : "Tidak ada pembatalan"}
            </h2>
          </div>
        )}
        <h2>Riwayat Pengiriman</h2>
        {["Tomat Sayur 2.5 Ton", "Kentang Granola 4.0 Ton"].map((x) => (
          <article className="history" key={x}>
            <Package />
            <div>
              <b>{x}</b>
              <small>Bandung → Bekasi</small>
            </div>
            <i>Selesai/Lunas</i>
            <button onClick={() => download(`POD-${x}`)}>
              <Download />
              POD
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
