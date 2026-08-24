"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthTranslation } from "@/components/auth/useAuthTranslation";
import { createClient } from "@/shared/lib/supabase/client";

function getSupabaseErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message.toLowerCase()
        : "";

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 0;

  if (
    message.includes("user already registered") ||
    message.includes("already been registered")
  ) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
  }

  if (message.includes("invalid email")) {
    return "Format email tidak valid.";
  }

  if (
    message.includes("password should be") ||
    message.includes("weak password") ||
    message.includes("password is too weak")
  ) {
    return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.";
  }

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "Terlalu banyak percobaan. Silakan coba kembali nanti.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "Koneksi internet bermasalah. Silakan coba kembali.";
  }

  if (message.includes("signup is disabled")) {
    return "Registrasi email belum diaktifkan di Supabase.";
  }

  return "Pendaftaran gagal. Silakan periksa data dan coba kembali.";
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const acceptedTerms = formData.get("terms") === "on";

    if (!name || !email || !password || !confirmPassword) {
      window.alert("Seluruh data pendaftaran wajib diisi.");
      return;
    }

    if (password.length < 8) {
      window.alert("Kata sandi harus memiliki minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      window.alert("Konfirmasi kata sandi tidak sama.");
      return;
    }

    if (!acceptedTerms) {
      window.alert("Anda harus menyetujui Syarat & Ketentuan.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const emailRedirectTo =
        `${window.location.origin}` + "/auth/callback?next=/dashboard";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
            name,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      window.alert(
        "Pendaftaran berhasil. Silakan periksa email Anda untuk mengonfirmasi akun.",
      );

      router.replace("/login");
      router.refresh();
    } catch (error) {
      window.alert(getSupabaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <header>
        <h1>{t("Buat Akun Pemilik Panen")}</h1>
        <p>
          {t(
            "Mulai publikasikan hasil panen dan temukan armada balik terdekat.",
          )}
        </p>
      </header>

      <form className="form" onSubmit={handleRegister}>
        <label>
          {t("Nama Lengkap / Username")}
          <input
            name="name"
            autoComplete="name"
            placeholder={t("Masukkan nama lengkap")}
            disabled={loading}
            required
          />
        </label>

        <label>
          {t("Email atau WhatsApp")}
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("08123456789 atau email@domain.com")}
            disabled={loading}
            required
          />
        </label>

        <label>
          {t("Kata Sandi")}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder={t("Minimal 8 karakter")}
            disabled={loading}
            required
          />
        </label>

        <label>
          {t("Konfirmasi Kata Sandi")}
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder={t("Ulangi kata sandi")}
            disabled={loading}
            required
          />
        </label>

        <label className="check">
          <input name="terms" type="checkbox" disabled={loading} required />
          <span>{t("Saya menyetujui Syarat & Ketentuan.")}</span>
        </label>

        <button
          className="button secondary full"
          type="submit"
          disabled={loading}
        >
          {t("Daftar Akun Pemilik Panen")}
        </button>
      </form>

      <p className="auth-switch">
        {t("Sudah punya akun?")} <Link href="/login">{t("Masuk di sini")}</Link>
      </p>
    </AuthLayout>
  );
}
