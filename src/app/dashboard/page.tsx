"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { RouteMap } from "@/components/maps/RouteMap";
import { Package, Truck, PiggyBank, Plus, MessageCircle } from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
import { useState } from "react";
export default function Page() {
  const { account } = useApp(),
    [notes, setNotes] = useState([
      "Siapkan dokumen DO",
      "Telepon supplier pupuk",
      "Cek kualitas bawang",
    ]);
  const wa = `https://wa.me/${account.phone}?text=${encodeURIComponent("Halo, terkait muatan aktif Garut-Jakarta")}`;
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title={`Halo, ${account.name} 👋`}
          description="Aktivitas panen dan status pengiriman Anda."
          action={
            <Link className="button secondary" href="/post-load">
              <Plus />
              Publish Harvest
            </Link>
          }
        />
        <div className="kpi-grid">
          <Kpi icon={Package} label="Total Terkirim" value="18.5 Ton" />
          <Kpi
            icon={Truck}
            label="Muatan Aktif"
            value="2 Truk Jalan"
            tone="orange"
          />
          <Kpi
            icon={PiggyBank}
            label="Total Hemat Ongkir"
            value="Rp 4.250.000"
          />
        </div>
        <div className="dashboard-grid">
          <div>
            <section className="card">
              <h2>Rute Aktif</h2>
              <RouteMap initial="Garut" />
            </section>
            <section className="card">
              <h2>Riwayat & Status Muatan</h2>
              <table>
                <tbody>
                  <tr>
                    <td>18 Ags 2026</td>
                    <td>Cabai Merah</td>
                    <td>Pak Agus</td>
                    <td>
                      <i className="status blue">Dalam Perjalanan</i>
                    </td>
                  </tr>
                  <tr>
                    <td>15 Ags 2026</td>
                    <td>Bawang Merah</td>
                    <td>Suryono</td>
                    <td>
                      <i className="status green">Selesai</i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
          <aside>
            <section className="card active-load">
              <h2>Muatan Aktif</h2>
              <b>Cabai Merah (5 Ton)</b>
              <p>Garut → Jakarta</p>
              <div className="progress">
                <i />
              </div>
              <a className="button outline full" target="_blank" href={wa}>
                <MessageCircle />
                Chat Driver WA
              </a>
            </section>
            <section className="card">
              <h2>Catatan Pemilik</h2>
              {notes.map((x) => (
                <label className="check" key={x}>
                  <input type="checkbox" />
                  {x}
                </label>
              ))}
              <button
                className="button ghost"
                onClick={() => {
                  const x = prompt("Catatan baru");
                  if (x) setNotes([...notes, x]);
                }}
              >
                + Tambah
              </button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
