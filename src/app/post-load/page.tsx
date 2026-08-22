import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Truck, MapPin } from "lucide-react";
const vehicles = ["Pickup", "CDE", "CDD Box", "Fuso", "Tronton"];
export default function Page() {
  return (
    <AppShell>
      <div className="page">
        <Link href="/dashboard" className="back">
          ← Kembali ke Dashboard
        </Link>
        <PageHeader
          title="Pasang Muatan Baru"
          description="Isi detail hasil panen Anda untuk menemukan armada pengangkut yang tepat."
        />
        <form className="post-grid">
          <div>
            <section className="card form-section">
              <h2>Detail Hasil Panen</h2>
              <div className="form-grid">
                <label>
                  Komoditas
                  <select>
                    <option>Pilih Komoditas</option>
                    <option>Cabai</option>
                    <option>Bawang Merah</option>
                  </select>
                </label>
                <label>
                  Estimasi Berat
                  <input type="number" placeholder="0 Ton" />
                </label>
                <label>
                  Tanggal Pengambilan
                  <input type="date" />
                </label>
                <label>
                  Waktu Pengambilan
                  <input type="time" />
                </label>
              </div>
            </section>
            <section className="card form-section">
              <h2>Spesifikasi Armada & Logistik</h2>
              <div className="vehicle-grid">
                {vehicles.map((x) => (
                  <label key={x}>
                    <input type="radio" name="vehicle" />
                    <span>
                      <Truck />
                      {x}
                    </span>
                  </label>
                ))}
              </div>
              <div className="checks">
                {[
                  "Terpal Kedap Air",
                  "Pendingin (Reefer)",
                  "Muat Bongkar Sendiri",
                ].map((x) => (
                  <label className="check" key={x}>
                    <input type="checkbox" />
                    {x}
                  </label>
                ))}
              </div>
            </section>
          </div>
          <aside>
            <section className="card form-section">
              <h2>Lokasi & Penawaran</h2>
              <label>
                Lokasi Pengambilan
                <input placeholder="Cari alamat atau koordinat" />
              </label>
              <div className="map-placeholder">
                <MapPin />
                Peta interaktif dimuat di sini
              </div>
              <label>
                Anggaran Tawaran
                <input type="number" placeholder="Rp 0" />
              </label>
              <label>
                Catatan Tambahan
                <textarea rows={4} placeholder="Catatan akses lokasi..." />
              </label>
            </section>
            <div className="action-row">
              <button className="button outline">Simpan Draft</button>
              <button className="button secondary">Terbitkan Muatan</button>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}
