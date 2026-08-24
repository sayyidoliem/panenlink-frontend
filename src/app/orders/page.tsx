"use client";

import { useState } from "react";
import { Clock, Download, FileText, Package, Phone } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { useApp } from "@/shared/app/AppProvider";
import {
  downloadPodPdf,
  downloadSuratJalanPdf,
} from "@/shared/lib/pdfDocuments";

const shipmentHistory = [
  {
    loadId: "LOAD-2026-0715",
    commodity: "Tomat Sayur",
    weight: "2.5 Ton",
    origin: "Bandung",
    destination: "Bekasi",
    driverName: "Suryono",
    vehiclePlate: "D 8124 AE",
    vehicleType: "CDD Box",
    status: "Terkirim",
    date: "15 Juli 2026",
  },
  {
    loadId: "LOAD-2026-0708",
    commodity: "Kentang Granola",
    weight: "4.0 Ton",
    origin: "Bandung",
    destination: "Bekasi",
    driverName: "Pak Agus",
    vehiclePlate: "B 9284 FCO",
    vehicleType: "CDD Box",
    status: "Terkirim",
    date: "8 Juli 2026",
  },
];

export default function Page() {
  const { account } = useApp();

  const [tab, setTab] = useState("running");
  const [step, setStep] = useState(1);

  const wa = `https://wa.me/${account.phone}?text=${encodeURIComponent(
    "Halo, saya ingin membahas muatan #LOAD-2026-0821",
  )}`;

  const activeShipment = {
    loadId: "LOAD-2026-0821",
    commodity: "Cabai Merah Keriting",
    weight: "5.0 Ton",
    origin: "Garut",
    destination: "Jakarta",
    driverName: "Pak Agus",
    vehiclePlate: "B 9284 FCO",
    vehicleType: "CDD Box",
    status:
      step >= 3
        ? "Terkirim"
        : step >= 1
          ? "Dalam Perjalanan"
          : "Muatan Diambil",
    date: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
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
          ].map(([value, label]) => (
            <button
              type="button"
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value)}
              key={value}
            >
              {label}
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
                ].map((status, index) => (
                  <li
                    key={status}
                    className={
                      index < step ? "done" : index === step ? "active" : ""
                    }
                  >
                    {status}
                  </li>
                ))}
              </ol>

              <footer>
                <span className="avatar lg">PA</span>

                <div>
                  <b>Pak Agus</b>
                  <small>B 9284 FCO</small>
                </div>

                <a href={wa} target="_blank" rel="noreferrer">
                  <Phone />
                  WA
                </a>

                <button
                  type="button"
                  className="button primary"
                  onClick={() => downloadSuratJalanPdf(activeShipment)}
                >
                  <FileText />
                  Surat Jalan
                </button>

                <button
                  type="button"
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

        {shipmentHistory.map((shipment) => (
          <article className="history" key={shipment.loadId}>
            <Package />

            <div>
              <b>
                {shipment.commodity} {shipment.weight}
              </b>

              <small>
                {shipment.origin} → {shipment.destination}
              </small>
            </div>

            <i>Selesai/Lunas</i>

            <button type="button" onClick={() => downloadPodPdf(shipment)}>
              <Download />
              POD
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
