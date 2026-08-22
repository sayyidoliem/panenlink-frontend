import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import {
  Package,
  Truck,
  PiggyBank,
  Plus,
  MapPin,
  MessageCircle,
} from "lucide-react";
export default function Page() {
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Halo, Pak Budi 👋"
          description="Ini kalender aktivitas panen & status pengiriman Anda."
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
          <Kpi icon={PiggyBank} label="Total Hemat Ongkir" value="Rp 4.250.000" />
        </div>
        <div className="dashboard-grid">
          <div>
            <section className="card calendar">
              <header>
                <h2>Agustus 2026</h2>
                <a>+ Jadwal Baru</a>
              </header>
              <div>
                <span>Pick-up Cabai Garut (21 Ags)</span>
                <span>Panen Bawang Lahan B (25 Ags)</span>
              </div>
            </section>
            <section className="card">
              <h2>Riwayat & Status Muatan</h2>
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Komoditas</th>
                    <th>Muatan</th>
                    <th>Driver</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>18 Ags 2026</td>
                    <td>Cabai Merah</td>
                    <td>5 Ton</td>
                    <td>Pak Agus</td>
                    <td>
                      <i className="status blue">Dalam Perjalanan</i>
                    </td>
                  </tr>
                  <tr>
                    <td>15 Ags 2026</td>
                    <td>Bawang Merah</td>
                    <td>3.5 Ton</td>
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
              <p>
                <MapPin />
                Garut → Jakarta
              </p>
              <div className="progress">
                <i />
              </div>
              <Link className="button outline full" href="/orders">
                <MessageCircle />
                Chat Driver WA
              </Link>
            </section>
            <section className="card">
              <h2>Catatan Pemilik</h2>
              {[
                "Siapkan dokumen DO",
                "Telepon supplier pupuk",
                "Cek kualitas bawang",
              ].map((x) => (
                <label className="check" key={x}>
                  <input type="checkbox" />
                  {x}
                </label>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
