"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  BellRing,
  CircleDollarSign,
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
import { useUiTranslation } from "@/shared/app/useUiTranslation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
export default function Page() {
  const a = useApp(),
    [modal, setModal] = useState<"bank" | "password" | "pin" | null>(null),
    [banks, setBanks] = useState([
      { bank: "BCA", name: a.account.name, number: "82913910" },
    ]);
  const t = useUiTranslation([
    "Pengaturan Akun & Dana",
    "Atur preferensi akun, notifikasi, keamanan, dan tampilan dengan panel yang lebih rapi.",
    "Update penting pengiriman dan pencairan aktif.",
    "Semua update inti sedang dimatikan.",
    "2FA aktif dan akun lebih aman untuk transaksi.",
    "Aktifkan 2FA agar keamanan akun meningkat.",
    "Rekening aktif siap dipakai untuk pencairan dana hasil panen.",
    "Rekening Pencairan",
    "Utama",
    "Tambah Rekening",
    "Keamanan Akun",
    "Ganti Kata Sandi",
    "PIN Transaksi",
    "Digunakan untuk pencairan",
    "Ubah",
    "Verifikasi 2 Langkah",
    "Via WhatsApp",
    "Sesi Aktif",
    "Perangkat ini",
    "Aktif",
    "Keluar",
    "Notifikasi",
    "Status Muatan",
    "Konfirmasi Pencairan",
    "Laporan Tren",
    "Pembaruan PanenLink",
    "Tampilan & Bahasa",
    "Terang",
    "Gelap",
    "Sistem",
    "Bahasa Indonesia",
    "Ganti PIN",
    "Bank",
    "Nama",
    "Nomor",
    "Nilai lama",
    "Nilai baru",
    "Simpan",
  ]);
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title={t("Pengaturan Akun & Dana")}
          description={t(
            "Atur preferensi akun, notifikasi, keamanan, dan tampilan dengan panel yang lebih rapi.",
          )}
        />
        <section className="settings-overview">
          <article className="card settings-overview-card">
            <BellRing />
            <div>
              <strong>Notification Center</strong>
              <p>
                {a.notifications.loads || a.notifications.payout
                  ? t("Update penting pengiriman dan pencairan aktif.")
                  : t("Semua update inti sedang dimatikan.")}
              </p>
            </div>
          </article>
          <article className="card settings-overview-card">
            <Shield />
            <div>
              <strong>Security Score</strong>
              <p>
                {a.security.twoFactor
                  ? t("2FA aktif dan akun lebih aman untuk transaksi.")
                  : t("Aktifkan 2FA agar keamanan akun meningkat.")}
              </p>
            </div>
          </article>
          <article className="card settings-overview-card">
            <CircleDollarSign />
            <div>
              <strong>Payout Ready</strong>
              <p>
                {t(
                  "Rekening aktif siap dipakai untuk pencairan dana hasil panen.",
                )}
              </p>
            </div>
          </article>
        </section>
        <div className="settings-grid">
          <div>
            <h2>{t("Rekening Pencairan")}</h2>
            <div className="bank-grid">
              {banks.map((b, i) => (
                <article className="card bank" key={i}>
                  <i>{t("Utama")}</i>
                  <Landmark />
                  <b>
                    Bank {b.bank}
                  </b>
                  <p>{b.name}</p>
                  <strong>{b.number}</strong>
                </article>
              ))}
              <button className="add-bank" onClick={() => setModal("bank")}>
                <PlusCircle />
                {t("Tambah Rekening")}
              </button>
            </div>
            <h2>{t("Keamanan Akun")}</h2>
            <section className="card settings-list">
              <article onClick={() => setModal("password")}>
                <KeyRound />
                <div>
                  <b>{t("Ganti Kata Sandi")}</b>
                  <small>{a.security.passwordChanged}</small>
                </div>
                <span>{t("Ubah")}</span>
              </article>
              <article onClick={() => setModal("pin")}>
                <Shield />
                <div>
                  <b>{t("PIN Transaksi")}</b>
                  <small>{t("Digunakan untuk pencairan")}</small>
                </div>
                <span>{t("Ubah")}</span>
              </article>
              <article>
                <Shield />
                <div>
                  <b>{t("Verifikasi 2 Langkah")}</b>
                  <small>{t("Via WhatsApp")}</small>
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
            <h3>{t("Sesi Aktif")}</h3>
            <section className="card sessions">
              <p>
                <Smartphone />
                {t("Perangkat ini")} <i>{t("Aktif")}</i>
              </p>
              <p>
                <Monitor />
                Chrome / Windows{" "}
                <button onClick={() => alert("Sesi dikeluarkan")}>
                  {t("Keluar")}
                </button>
              </p>
            </section>
          </div>
          <aside>
            <h2>{t("Notifikasi")}</h2>
            <section className="card toggles">
              {Object.entries(a.notifications).map(([k, v]) => (
                <label key={k}>
                  <span>
                    <b>
                      {k === "loads"
                        ? t("Status Muatan")
                        : k === "payout"
                          ? t("Konfirmasi Pencairan")
                          : t("Laporan Tren")}
                    </b>
                    <small>{t("Pembaruan PanenLink")}</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={v}
                    onChange={(e) => {
                      a.setNotifications({
                        ...a.notifications,
                        [k]: e.target.checked,
                      });
                      a.pushAlert({
                        title: "Preferensi notifikasi diperbarui",
                        body: `${k === "loads" ? "Status muatan" : k === "payout" ? "Konfirmasi pencairan" : "Laporan tren"} ${e.target.checked ? "diaktifkan" : "dimatikan"}.`,
                        tone: e.target.checked ? "success" : "warning",
                      });
                    }}
                  />
                </label>
              ))}
            </section>
            <h2>{t("Tampilan & Bahasa")}</h2>
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
                      {t(String(l))}
                    </button>
                  );
                })}
              </div>
              <select
                value={a.lang}
                onChange={(e) => a.setLang(e.target.value as Lang)}
              >
                <option value="id">{t("Bahasa Indonesia")}</option>
                <option value="en">English</option>
              </select>
            </section>
          </aside>
        </div>
        {modal && (
          <Modal
            title={
              modal === "bank"
                ? t("Tambah Rekening")
                : modal === "password"
                  ? t("Ganti Kata Sandi")
                  : t("Ganti PIN")
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
                    {t("Bank")}
                    <input name="bank" required />
                  </label>
                  <label>
                    {t("Nama")}
                    <input name="name" required />
                  </label>
                  <label>
                    {t("Nomor")}
                    <input name="number" required />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    {t("Nilai lama")}
                    <input type="password" required />
                  </label>
                  <label>
                    {t("Nilai baru")}
                    <input name="new" type="password" minLength={6} required />
                  </label>
                </>
              )}
              <button className="button primary">{t("Simpan")}</button>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
