import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Landmark,
  PlusCircle,
  KeyRound,
  Shield,
  Smartphone,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
export default function Page() {
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Pengaturan Akun & Dana"
          description="Kelola rekening bank, keamanan akun, dan preferensi sistem PanenLink."
        />
        <div className="settings-grid">
          <div>
            <h2>Rekening Pencairan</h2>
            <div className="bank-grid">
              <article className="card bank">
                <i>Utama</i>
                <Landmark />
                <b>Bank BCA</b>
                <p>Haji Supriatna</p>
                <strong>8291 **** 3910</strong>
              </article>
              <button className="add-bank">
                <PlusCircle />
                Tambah Rekening Baru
              </button>
            </div>
            <h2>Keamanan Akun</h2>
            <section className="card settings-list">
              {[
                [KeyRound, "Ganti Kata Sandi"],
                [Shield, "Verifikasi 2 Langkah"],
              ].map(([I, t]) => {
                const X = I as typeof Shield;
                return (
                  <article key={String(t)}>
                    <X />
                    <div>
                      <b>{String(t)}</b>
                      <small>Kelola keamanan akun</small>
                    </div>
                    <span>Ubah</span>
                  </article>
                );
              })}
            </section>
            <h3>Sesi Aktif</h3>
            <section className="card sessions">
              <p>
                <Smartphone />
                Samsung Galaxy S23 <i>Aktif</i>
              </p>
              <p>
                <Monitor />
                Chrome / Windows <i>Keluar</i>
              </p>
            </section>
          </div>
          <aside>
            <h2>Notifikasi</h2>
            <section className="card toggles">
              {["Status Muatan", "Konfirmasi Pencairan", "Laporan Tren"].map(
                (x, i) => (
                  <label key={x}>
                    <span>
                      <b>{x}</b>
                      <small>Pembaruan sistem PanenLink</small>
                    </span>
                    <input type="checkbox" defaultChecked={i < 2} />
                  </label>
                ),
              )}
            </section>
            <h2>Tampilan & Bahasa</h2>
            <section className="card appearance">
              <div>
                <button className="active">
                  <Sun />
                  Terang
                </button>
                <button>
                  <Moon />
                  Gelap
                </button>
              </div>
              <select>
                <option>Bahasa Indonesia (ID)</option>
                <option>English (EN)</option>
              </select>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
