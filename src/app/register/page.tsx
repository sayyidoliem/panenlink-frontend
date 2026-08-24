"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  updateProfile,
} from "firebase/auth";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthTranslation } from "@/components/auth/useAuthTranslation";
import { auth } from "@/shared/lib/firebase";

function getFirebaseErrorMessage(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.";
    case "auth/missing-password":
      return "Kata sandi wajib diisi.";
    case "auth/network-request-failed":
      return "Koneksi internet bermasalah. Silakan coba kembali.";
    case "auth/operation-not-allowed":
      return "Registrasi email belum diaktifkan di Firebase Console.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Silakan coba kembali nanti.";
    default:
      return "Pendaftaran gagal. Silakan periksa data dan coba kembali.";
  }
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
    const confirmPassword = String(
      formData.get("confirmPassword") ?? "",
    );
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
      await setPersistence(auth, browserLocalPersistence);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credential.user, {
        displayName: name,
      });

      router.replace("/dashboard");
    } catch (error) {
      window.alert(getFirebaseErrorMessage(error));
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
          <input
            name="terms"
            type="checkbox"
            disabled={loading}
            required
          />
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
        {t("Sudah punya akun?")}{" "}
        <Link href="/login">{t("Masuk di sini")}</Link>
      </p>
    </AuthLayout>
  );
}