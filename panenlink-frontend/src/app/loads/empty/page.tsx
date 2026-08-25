import { AppShell } from "@/components/layout/AppShell";
import { Search, Filter, MapPin, Plus, Minus } from "lucide-react";
export default function Page() {
  return (
    <AppShell flush>
      <div className="filterbar">
        <label>
          <Search />
          <input placeholder="Cari lokasi, komoditas..." />
        </label>
        <button>
          <Filter />
          Filter
        </button>
        <i>Radius: 50km</i>
        <span>0 Muatan Ditemukan</span>
      </div>
      <div className="split">
        <section className="empty-load">
          <div className="radar-icon">◎</div>
          <h2>Belum Ada Muatan di Sekitar Anda</h2>
          <p>
            Tidak ada muatan aktif dalam radius 50 km. Coba perluas area atau
            sesuaikan filter.
          </p>
          <div>
            <button className="button primary">Reset Semua Filter</button>
            <button className="button outline">Perluas Radius</button>
          </div>
        </section>
        <section className="radar-map">
          <div className="radar">
            <i />
            <MapPin />
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
