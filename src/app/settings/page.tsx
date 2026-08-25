"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CircleDollarSign,
  KeyRound,
  Landmark,
  Monitor,
  MonitorCog,
  Moon,
  PlusCircle,
  Shield,
  Smartphone,
  Sun,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useApp, type Lang, type Theme } from "@/shared/app/AppProvider";
import { useUiTranslation } from "@/shared/app/useUiTranslation";
import { createClient } from "@/shared/lib/supabase/client";

type ModalType = "bank" | "password" | "pin" | null;

type BankAccount = {
  id: string;
  bank: string;
  name: string;
  number: string;
  isPrimary: boolean;
};

type BankAccountRow = {
  id: unknown;
  bank_name: unknown;
  account_name: unknown;
  account_number: unknown;
  is_primary: unknown;
};

function textFallback(value: unknown, fallback = "-") {
  if (typeof value !== "string") return fallback;
  const result = value.trim();
  return result || fallback;
}

function digitsOnly(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak diketahui.";
}

export default function Page() {
  const router = useRouter();
  const supabase = createClient();
  const app = useApp();

  const [modal, setModal] = useState<ModalType>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const logoutDialogRef = useRef<HTMLDialogElement | null>(null);
  const logoutCancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadBanks = useCallback(async () => {
    setLoadingBanks(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setBanks([]);
        return;
      }

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id,bank_name,account_name,account_number,is_primary")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      setBanks(
        ((data as BankAccountRow[] | null) ?? []).map((row) => ({
          id: String(row.id),
          bank: textFallback(row.bank_name),
          name: textFallback(row.account_name),
          number: textFallback(row.account_number),
          isPrimary: Boolean(row.is_primary),
        })),
      );
    } catch (error) {
      console.error("Rekening gagal dimuat:", error);
      setBanks([]);
      window.alert(`Rekening gagal dimuat. ${getErrorMessage(error)}`);
    } finally {
      setLoadingBanks(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadBanks();
  }, [loadBanks]);

  const openLogoutDialog = () => {
    const dialog = logoutDialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    requestAnimationFrame(() => logoutCancelButtonRef.current?.focus());
  };

  const closeLogoutDialog = () => {
    if (isLoggingOut) return;
    logoutDialogRef.current?.close();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logoutDialogRef.current?.close();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal keluar dari akun:", error);
      window.alert(`Gagal keluar. ${getErrorMessage(error)}`);
      setIsLoggingOut(false);
    }
  };

  const handleBankSubmit = async (formData: FormData) => {
    const bank = textFallback(formData.get("bank"), "");
    const name = textFallback(formData.get("name"), "");
    const number = digitsOnly(formData.get("number"));

    if (!bank || !name || !number) {
      throw new Error("Data rekening wajib diisi dengan benar.");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("Sesi pengguna tidak ditemukan.");

    const { error } = await supabase.from("bank_accounts").insert({
      user_id: user.id,
      bank_name: bank,
      account_name: name,
      account_number: number,
      is_primary: banks.length === 0,
    });

    if (error) throw error;

    app.pushAlert({
      title: "Rekening pencairan ditambahkan",
      body: `Rekening Bank ${bank} berhasil disimpan.`,
      tone: "success",
    });

    await loadBanks();
  };

  const handlePasswordSubmit = async (formData: FormData) => {
    const oldPassword = String(formData.get("old") ?? "");
    const newPassword = String(formData.get("new") ?? "");

    if (oldPassword.length < 1) {
      throw new Error("Kata sandi lama wajib diisi.");
    }

    if (newPassword.length < 8) {
      throw new Error("Kata sandi baru minimal 8 karakter.");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user?.email) throw new Error("Email pengguna tidak tersedia.");

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (verifyError) throw new Error("Kata sandi lama tidak sesuai.");

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    const changedLabel = new Date().toLocaleString("id-ID");
    const { error: settingsError } = await supabase
      .from("user_settings")
      .update({
        password_changed_label: changedLabel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (settingsError)
      console.error("Label kata sandi gagal disimpan:", settingsError);

    app.setSecurity({ passwordChanged: changedLabel });
    app.pushAlert({
      title: "Kata sandi diperbarui",
      body: "Kata sandi akun PanenLink berhasil diperbarui.",
      tone: "success",
    });
  };

  const handlePinSubmit = async (formData: FormData) => {
    const oldPin = digitsOnly(formData.get("old"));
    const newPin = digitsOnly(formData.get("new"));

    if (newPin.length !== 6) {
      throw new Error("PIN baru harus terdiri dari 6 angka.");
    }

    const { data, error } = await supabase.rpc("change_transaction_pin", {
      current_pin: oldPin || null,
      new_pin: newPin,
    });

    if (error) throw error;
    if (data !== true) throw new Error("PIN lama tidak sesuai.");

    app.pushAlert({
      title: "PIN transaksi diperbarui",
      body: "PIN transaksi berhasil diamankan dan diperbarui.",
      tone: "success",
    });
  };

  const handleModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal || saving) return;

    setSaving(true);
    try {
      const formData = new FormData(event.currentTarget);

      if (modal === "bank") await handleBankSubmit(formData);
      if (modal === "password") await handlePasswordSubmit(formData);
      if (modal === "pin") await handlePinSubmit(formData);

      setModal(null);
      window.alert("Perubahan berhasil disimpan.");
    } catch (error) {
      console.error("Pengaturan gagal disimpan:", error);
      window.alert(`Pengaturan gagal disimpan. ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

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
                {app.notifications.loads || app.notifications.payout
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
                {app.security.twoFactor
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
              {banks.map((bank) => (
                <article className="card bank" key={bank.id}>
                  {bank.isPrimary && <i>{t("Utama")}</i>}
                  <Landmark />
                  <b>Bank {bank.bank}</b>
                  <p>{bank.name}</p>
                  <strong>{bank.number}</strong>
                </article>
              ))}

              <button
                className="add-bank"
                onClick={() => setModal("bank")}
                disabled={loadingBanks}
              >
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
                  <small>{app.security.passwordChanged}</small>
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
                  checked={app.security.twoFactor}
                  onChange={(event) =>
                    app.setSecurity({ twoFactor: event.target.checked })
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
                <button type="button" onClick={openLogoutDialog}>
                  {t("Keluar")}
                </button>
              </p>
            </section>
          </div>

          <aside>
            <h2>{t("Notifikasi")}</h2>
            <section className="card toggles">
              {Object.entries(app.notifications).map(([key, value]) => (
                <label key={key}>
                  <span>
                    <b>
                      {key === "loads"
                        ? t("Status Muatan")
                        : key === "payout"
                          ? t("Konfirmasi Pencairan")
                          : t("Laporan Tren")}
                    </b>
                    <small>{t("Pembaruan PanenLink")}</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => {
                      app.setNotifications({
                        ...app.notifications,
                        [key]: event.target.checked,
                      });
                      app.pushAlert({
                        title: "Preferensi notifikasi diperbarui",
                        body: `${
                          key === "loads"
                            ? "Status muatan"
                            : key === "payout"
                              ? "Konfirmasi pencairan"
                              : "Laporan tren"
                        } ${event.target.checked ? "diaktifkan" : "dimatikan"}.`,
                        tone: event.target.checked ? "success" : "warning",
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
                ].map(([value, Icon, label]) => {
                  const AppearanceIcon = Icon as typeof Sun;
                  return (
                    <button
                      key={String(value)}
                      className={app.theme === value ? "active" : ""}
                      onClick={() => app.setTheme(value as Theme)}
                    >
                      <AppearanceIcon />
                      {t(String(label))}
                    </button>
                  );
                })}
              </div>

              <select
                value={app.lang}
                onChange={(event) => app.setLang(event.target.value as Lang)}
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
            onClose={() => !saving && setModal(null)}
          >
            <form className="form" onSubmit={handleModalSubmit}>
              {modal === "bank" ? (
                <>
                  <label>
                    {t("Bank")}
                    <input name="bank" required disabled={saving} />
                  </label>
                  <label>
                    {t("Nama")}
                    <input name="name" required disabled={saving} />
                  </label>
                  <label>
                    {t("Nomor")}
                    <input
                      name="number"
                      inputMode="numeric"
                      required
                      disabled={saving}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    {t("Nilai lama")}
                    <input
                      name="old"
                      type="password"
                      inputMode={modal === "pin" ? "numeric" : undefined}
                      required={modal === "password"}
                      disabled={saving}
                    />
                  </label>
                  <label>
                    {t("Nilai baru")}
                    <input
                      name="new"
                      type="password"
                      inputMode={modal === "pin" ? "numeric" : undefined}
                      minLength={modal === "pin" ? 6 : 8}
                      maxLength={modal === "pin" ? 6 : undefined}
                      required
                      disabled={saving}
                    />
                  </label>
                </>
              )}
              <button className="button primary" disabled={saving}>
                {t("Simpan")}
              </button>
            </form>
          </Modal>
        )}

        <dialog
          ref={logoutDialogRef}
          className="logout-dialog"
          aria-labelledby="settings-logout-dialog-title"
          aria-describedby="settings-logout-dialog-description"
          onClose={() => setIsLoggingOut(false)}
          onCancel={(event) => {
            if (isLoggingOut) event.preventDefault();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLogoutDialog();
          }}
        >
          <div
            className="logout-dialog-content"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="settings-logout-dialog-title">
              {app.lang === "en" ? "Sign out?" : "Keluar dari akun?"}
            </h2>
            <p id="settings-logout-dialog-description">
              {app.lang === "en"
                ? "Are you sure you want to sign out of your PanenLink account?"
                : "Apakah Anda yakin ingin keluar dari akun PanenLink?"}
            </p>
            <div className="logout-dialog-actions">
              <button
                ref={logoutCancelButtonRef}
                type="button"
                className="logout-dialog-cancel"
                onClick={closeLogoutDialog}
                disabled={isLoggingOut}
              >
                {app.lang === "en" ? "Cancel" : "Batal"}
              </button>
              <button
                type="button"
                className="logout-dialog-confirm"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
              >
                {isLoggingOut
                  ? app.lang === "en"
                    ? "Signing out..."
                    : "Sedang keluar..."
                  : app.lang === "en"
                    ? "Sign out"
                    : "Keluar"}
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </AppShell>
  );
}
