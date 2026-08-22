import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Clock, Phone, FileText, Download, Package } from "lucide-react";
export default function Page() {
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Riwayat & Pelacakan Muatan"
          description="Pantau armada pengangkut secara real-time dan kelola riwayat pengiriman."
        />
        <div className="tabs">
          <b>
            Berjalan <i>2 Aktif</i>
          </b>
          <span>Selesai</span>
          <span>Dibatalkan</span>
        </div>
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
              <li className="done">Muatan Diambil</li>
              <li className="active">Dalam Perjalanan</li>
              <li>Dekat Lokasi</li>
              <li>Terkirim</li>
            </ol>
            <footer>
              <span className="avatar lg">PA</span>
              <div>
                <b>Pak Agus</b>
                <small>B 9284 FCO • CDD Box</small>
              </div>
              <button className="button outline">
                <Phone />
                WA
              </button>
              <button className="button primary">
                <FileText />
                Surat Jalan
              </button>
            </footer>
          </div>
          <div className="tracking-map">
            <span>Rute: Garut → Jakarta</span>
          </div>
        </section>
        <h2>Riwayat Pengiriman</h2>
        {["Tomat Sayur 2.5 Ton", "Kentang Granola 4.0 Ton"].map((x) => (
          <article className="history" key={x}>
            <Package />
            <div>
              <b>{x}</b>
              <small>Bandung → Bekasi</small>
            </div>
            <i>Selesai/Lunas</i>
            <button>
              <Download />
              POD
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
