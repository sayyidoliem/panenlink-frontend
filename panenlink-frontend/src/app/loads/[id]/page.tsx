"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Route, Clock, Truck, Info, Lock, MessageCircle } from "lucide-react";

// In production, load these from your backend using the [id] param.
const LOAD = {
  id: "LOAD-2026-0821",
  commodity: "Cabai Merah Keriting",
  weight: "5.0 Ton",
  shipperName: "Pak Mulyana",
  shipperPhone: "6281298765432", // format: 62XXXXXXXXXXX
};

export default function Page() {
  // Pre-filled WA message to the shipper/farmer
  const waShipper = `https://wa.me/${LOAD.shipperPhone}?text=${encodeURIComponent(
    `Halo ${LOAD.shipperName}, saya driver tertarik dengan muatan #${LOAD.id} (${LOAD.commodity} ${LOAD.weight}). Apakah masih tersedia?`,
  )}`;

  return (
    <AppShell>
      <div className="page">
        <Link href="/loads" className="back">
          ← Kembali ke Cari Muatan
        </Link>
        <div className="page-header">
          <div>
            <h1>
              Cabai Merah Keriting (5.0 Ton){" "}
              <i className="urgent">Urgent Pick-up</i>
            </h1>
            <p>ID #LOAD-2026-0821</p>
          </div>
        </div>
        <div className="detail-grid">
          <div>
            <section className="card">
              <h2>Detail Rute & Waktu</h2>
              <div className="timeline">
                <article>
                  <small>PENGAMBILAN</small>
                  <h3>Garut Cikajang</h3>
                  <p>Petani: Pak Mulyana</p>
                  <b>21 Ags • 14:00 WIB</b>
                </article>
                <article>
                  <small>PENGIRIMAN</small>
                  <h3>Jakarta Kramat Jati</h3>
                  <p>Penerima: Koh Steven</p>
                  <b>22 Ags • 06:00 WIB</b>
                </article>
              </div>
              <div className="metrics">
                <span>
                  <Route />
                  210 km
                </span>
                <span>
                  <Clock />
                  6j 30m
                </span>
                <span>
                  <Truck />
                  Engkel Box
                </span>
              </div>
            </section>
            <section className="card cargo">
              <h2>Detail Muatan</h2>
              <div>
                <span>
                  <small>Jenis Komoditas</small>Red Chili Grade A
                </span>
                <span>
                  <small>Total Berat</small>5.0 Tons
                </span>
                <span>
                  <small>Kemasan</small>250 plastic baskets
                </span>
                <span>
                  <small>Dimensi</small>12 CBM
                </span>
              </div>
              <p>
                <Info />
                Double tarp / cooling required. Pastikan sirkulasi udara baik.
              </p>
            </section>
          </div>
          <aside className="card earnings">
            <h2>Ringkasan Pendapatan</h2>
            <strong>Rp 4.500.000</strong>
            <p>
              Tarif Dasar <b>Rp 4.100.000</b>
            </p>
            <p>
              Bonus Urgent <b>+ Rp 400.000</b>
            </p>
            <button className="button secondary full">AMBIL MUATAN INI</button>
            <a
              href={waShipper}
              target="_blank"
              rel="noreferrer"
              className="button outline full"
            >
              <MessageCircle />
              Chat Pengirim WA
            </a>
            <small>
              <Lock />
              Pembayaran dijamin aman oleh Escrow
            </small>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
