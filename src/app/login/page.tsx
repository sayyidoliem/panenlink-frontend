"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthTranslation } from "@/components/auth/useAuthTranslation";
import { createClient } from "@/shared/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.08.72-2.47 1.15-4.08 1.15-3.13 0-5.79-2.12-6.74-4.96H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.28A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.55.38-2.28V6.64H1.26A12 12 0 0 0 0 12c0 1.94.46 3.78 1.26 5.36l4-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.81l3.43-3.43C17.95 1.17 15.24 0 12 0A12 12 0 0 0 1.26 6.64l4 3.08c.95-2.84 3.61-4.95 6.74-4.95Z"
      />
    </svg>
  );
}

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

  if (message.includes("invalid login credentials")) {
    return "Email atau kata sandi salah.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("email_not_confirmed")
  ) {
    return "Email belum dikonfirmasi. Silakan periksa kotak masuk Anda.";
  }

  if (message.includes("invalid email")) {
    return "Format email tidak valid.";
  }

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "Terlalu banyak percobaan login. Silakan coba kembali nanti.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "Koneksi internet bermasalah. Silakan coba kembali.";
  }

  if (message.includes("provider is not enabled")) {
    return "Metode login Google belum diaktifkan di Supabase.";
  }

  if (message.includes("cancelled") || message.includes("canceled")) {
    return "Proses masuk dengan Google dibatalkan.";
  }

  return "Login gagal. Silakan periksa data Anda dan coba kembali.";
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const t = useAuthTranslation([
    "Welcome Back",
    "Masuk ke hub logistik agrikultur Anda.",
    "Lanjutkan dengan Google",
    "ATAU",
    "Email atau Nomor HP",
    "Masukkan email atau no HP",
    "Kata Sandi",
    "Ingat Saya",
    "Lupa Kata Sandi?",
    "Masuk Sekarang",
    "Belum punya akun?",
    "Daftar Sekarang",
  ]);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      window.alert("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      window.alert(getSupabaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}` + "/auth/callback?next=/dashboard";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      window.alert(getSupabaseErrorMessage(error));

      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (loading) return;

    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );

    const email = emailInput?.value.trim().toLowerCase() ?? "";

    if (!email) {
      window.alert(
        "Masukkan email Anda terlebih dahulu, kemudian pilih Lupa Kata Sandi.",
      );

      emailInput?.focus();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}` + "/auth/callback?next=/update-password";

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      window.alert(
        "Tautan pengaturan ulang kata sandi telah dikirim ke email Anda.",
      );
    } catch (error) {
      window.alert(getSupabaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <header>
        <h1>{t("Welcome Back")}</h1>
        <p>{t("Masuk ke hub logistik agrikultur Anda.")}</p>
      </header>

      <form className="form" onSubmit={handleEmailLogin}>
        <button
          type="button"
          className="google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          <span>{t("Lanjutkan dengan Google")}</span>
        </button>

        <div className="divider">{t("ATAU")}</div>

        <label>
          {t("Email atau Nomor HP")}
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("Masukkan email atau no HP")}
            disabled={loading}
            required
          />
        </label>

        <label>
          {t("Kata Sandi")}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </label>

        <div className="row">
          <label className="check">
            <input name="remember" type="checkbox" disabled={loading} />
            <span>{t("Ingat Saya")}</span>
          </label>

          <a
            role="button"
            tabIndex={0}
            onClick={handleForgotPassword}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                void handleForgotPassword();
              }
            }}
          >
            {t("Lupa Kata Sandi?")}
          </a>
        </div>

        <button
          className="button secondary full"
          type="submit"
          disabled={loading}
        >
          {t("Masuk Sekarang")}
        </button>
      </form>

      <p className="auth-switch">
        {t("Belum punya akun?")}{" "}
        <Link href="/register">{t("Daftar Sekarang")}</Link>
      </p>
    </AuthLayout>
  );
}
