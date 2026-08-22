import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Search, Scale, MapPin, Plus, Minus } from "lucide-react";
const loads = [
  {
    name: "Cabai Merah Keriting",
    w: "5.0 Ton",
    route: "Garut → Jakarta",
    price: "Rp 4.500.000",
    urgent: true,
  },
  {
    name: "Bawang Merah",
    w: "3.2 Ton",
    route: "Brebes → Bandung",
    price: "Rp 2.100.000",
  },
  {
    name: "Tomat Apel",
    w: "2.8 Ton",
    route: "Sukabumi → Tangerang",
    price: "Rp 1.850.000",
  },
];
export default function Page() {
  return (
    <AppShell flush>
      <div className="filterbar">
        <label>
          <Search />
          <input placeholder="Cari kota asal, tujuan..." />
        </label>
        {["Semua Komoditas", "Tonase", "Tanggal", "Urutkan: Terbaru"].map(
          (x) => (
            <button key={x}>{x}</button>
          ),
        )}
      </div>
      <div className="split">
        <section className="load-list">
          <h3>Menampilkan 12 Muatan Tersedia di Jawa Barat</h3>
          {loads.map((x, i) => (
            <Link
              href="/loads/LOAD-2026-0821"
              className={i === 0 ? "load-card selected" : "load-card"}
              key={x.name}
            >
              <header>
                <span>
                  <b>{x.name}</b>
                  <small>
                    <Scale />
                    {x.w}
                  </small>
                </span>
                {x.urgent && <i>Urgent</i>}
              </header>
              <div className="route">
                <MapPin />
                <b>{x.route}</b>
              </div>
              <footer>
                <strong>{x.price}</strong>
                <span>{i === 0 ? "Ambil Muatan" : "Lihat Detail"}</span>
              </footer>
            </Link>
          ))}
        </section>
        <section className="map">
          <div className="map-route">
            <i />
            <span>Garut</span>
            <span>Jakarta</span>
          </div>
          <div className="map-tip">
            <b>Cabai Merah • 5.0 Ton</b>
            <small>Rp 4.5 M</small>
          </div>
          <div className="map-controls">
            <button>
              <Plus />
            </button>
            <button>
              <Minus />
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
