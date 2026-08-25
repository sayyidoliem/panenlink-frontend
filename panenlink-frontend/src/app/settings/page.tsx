"use client";
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
  MonitorCog,
} from "lucide-react";
import { useApp, type Theme, type Lang } from "@/shared/app/AppProvider";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
export default function Page() {
  const a = useApp(),
    [modal, setModal] = useState<"bank" | "password" | "pin" | null>(null),
    [banks, setBanks] = useState([
      { bank: "BCA", name: a.account.name, number: "82913910" },
    ]);
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Pengaturan Akun & Dana"
          description="Seluruh perubahan disimpan pada perangkat."
        />
        <div className="settings-grid">
          <div>
            <h2>Rekening Pencairan</h2>
            <div className="bank-grid">
              {banks.map((b, i) => (
                <article className="card bank" key={i}>
                  <i>Utama</i>
                  <Landmark />
                  <b>Bank {b.bank}</b>
                  <p>{b.name}</p>
                  <strong>{b.number}</strong>
                </article>
              ))}
              <button className="add-bank" onClick={() => setModal("bank")}>
                <PlusCircle />
                Tambah Rekening
              </button>
            </div>
            <h2>Keamanan Akun</h2>
            <section className="card settings-list">
              <article onClick={() => setModal("password")}>
                <KeyRound />
                <div>
                  <b>Ganti Kata Sandi</b>
                  <small>{a.security.passwordChanged}</small>
                </div>
                <span>Ubah</span>
              </article>
              <article onClick={() => setModal("pin")}>
                <Shield />
                <div>
                  <b>PIN Transaksi</b>
                  <small>Digunakan untuk pencairan</small>
                </div>
                <span>Ubah</span>
              </article>
              <article>
                <Shield />
                <div>
                  <b>Verifikasi 2 Langkah</b>
                  <small>Via WhatsApp</small>
                </div>
                <input
                  type="checkbox"
                  checked={a.security.twoFactor}
                  onChange={(e) =>
                    a.setSecurity({ twoFactor: e.target.checked })
                  }
                />
              </article>
            </section>
            <h3>Sesi Aktif</h3>
            <section className="card sessions">
              <p>
                <Smartphone />
                Perangkat ini <i>Aktif</i>
              </p>
              <p>
                <Monitor />
                Chrome / Windows{" "}
                <button onClick={() => alert("Sesi dikeluarkan")}>
                  Keluar
                </button>
              </p>
            </section>
          </div>
          <aside>
            <h2>Notifikasi</h2>
            <section className="card toggles">
              {Object.entries(a.notifications).map(([k, v]) => (
                <label key={k}>
                  <span>
                    <b>
                      {k === "loads"
                        ? "Status Muatan"
                        : k === "payout"
                          ? "Konfirmasi Pencairan"
                          : "Laporan Tren"}
                    </b>
                    <small>Pembaruan PanenLink</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={v}
                    onChange={(e) =>
                      a.setNotifications({
                        ...a.notifications,
                        [k]: e.target.checked,
                      })
                    }
                  />
                </label>
              ))}
            </section>
            <h2>Tampilan & Bahasa</h2>
            <section className="card appearance">
              <div>
                {[
                  ["light", Sun, "Terang"],
                  ["dark", Moon, "Gelap"],
                  ["system", MonitorCog, "Sistem"],
                ].map(([v, I, l]) => {
                  const X = I as typeof Sun;
                  return (
                    <button
                      key={String(v)}
                      className={a.theme === v ? "active" : ""}
                      onClick={() => a.setTheme(v as Theme)}
                    >
                      <X />
                      {String(l)}
                    </button>
                  );
                })}
              </div>
              <select
                value={a.lang}
                onChange={(e) => a.setLang(e.target.value as Lang)}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </section>
          </aside>
        </div>
        {modal && (
          <Modal
            title={
              modal === "bank"
                ? "Tambah Rekening"
                : modal === "password"
                  ? "Ganti Kata Sandi"
                  : "Ganti PIN"
            }
            onClose={() => setModal(null)}
          >
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (modal === "bank")
                  setBanks([
                    ...banks,
                    {
                      bank: String(f.get("bank")),
                      name: String(f.get("name")),
                      number: String(f.get("number")),
                    },
                  ]);
                else
                  a.setSecurity(
                    modal === "pin"
                      ? { pin: String(f.get("new")) }
                      : { passwordChanged: new Date().toLocaleString("id-ID") },
                  );
                setModal(null);
              }}
            >
              {modal === "bank" ? (
                <>
                  <label>
                    Bank
                    <input name="bank" required />
                  </label>
                  <label>
                    Nama
                    <input name="name" required />
                  </label>
                  <label>
                    Nomor
                    <input name="number" required />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Nilai lama
                    <input type="password" required />
                  </label>
                  <label>
                    Nilai baru
                    <input name="new" type="password" minLength={6} required />
                  </label>
                </>
              )}
              <button className="button primary">Simpan</button>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
