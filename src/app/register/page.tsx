"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthTranslation } from "@/components/auth/useAuthTranslation";
export default function Page() {
  const t = useAuthTranslation([
    "Buat Akun Pemilik Panen",
    "Mulai publikasikan hasil panen dan temukan armada balik terdekat.",
    "Nama Lengkap / Username",
    "Masukkan nama lengkap",
    "Email atau WhatsApp",
    "08123456789 atau email@domain.com",
    "Kata Sandi",
    "Minimal 8 karakter",
    "Konfirmasi Kata Sandi",
    "Ulangi kata sandi",
    "Saya menyetujui Syarat & Ketentuan.",
    "Daftar Akun Pemilik Panen",
    "Sudah punya akun?",
    "Masuk di sini",
  ]);

  return (
    <AuthLayout mode="register">
      <header>
        <h1>{t("Buat Akun Pemilik Panen")}</h1>
        <p>{t("Mulai publikasikan hasil panen dan temukan armada balik terdekat.")}</p>
      </header>
      <form className="form">
        <label>
          {t("Nama Lengkap / Username")}
          <input placeholder={t("Masukkan nama lengkap")} />
        </label>
        <label>
          {t("Email atau WhatsApp")}
          <input placeholder={t("08123456789 atau email@domain.com")} />
        </label>
        <label>
          {t("Kata Sandi")}
          <input type="password" placeholder={t("Minimal 8 karakter")} />
        </label>
        <label>
          {t("Konfirmasi Kata Sandi")}
          <input type="password" placeholder={t("Ulangi kata sandi")} />
        </label>
        <label className="check">
          <input type="checkbox" />
          <span>{t("Saya menyetujui Syarat & Ketentuan.")}</span>
        </label>
        <Link className="button secondary full" href="/dashboard">
          {t("Daftar Akun Pemilik Panen")}
        </Link>
      </form>
      <p className="auth-switch">
        {t("Sudah punya akun?")} <Link href="/login">{t("Masuk di sini")}</Link>
      </p>
    </AuthLayout>
  );
}
