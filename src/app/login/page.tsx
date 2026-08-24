"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuthTranslation } from "@/components/auth/useAuthTranslation";

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

export default function Page() {
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

  return (
    <AuthLayout mode="login">
      <header>
        <h1>{t("Welcome Back")}</h1>
        <p>{t("Masuk ke hub logistik agrikultur Anda.")}</p>
      </header>
      <form className="form">
        <button type="button" className="google">
          <GoogleIcon />
          <span>{t("Lanjutkan dengan Google")}</span>
        </button>
        <div className="divider">{t("ATAU")}</div>
        <label>
          {t("Email atau Nomor HP")}
          <input placeholder={t("Masukkan email atau no HP")} />
        </label>
        <label>
          {t("Kata Sandi")}
          <input type="password" placeholder="••••••••" />
        </label>
        <div className="row">
          <label className="check">
            <input type="checkbox" /> <span>{t("Ingat Saya")}</span>
          </label>
          <a>{t("Lupa Kata Sandi?")}</a>
        </div>
        <Link className="button secondary full" href="/dashboard">
          {t("Masuk Sekarang")}
        </Link>
      </form>
      <p className="auth-switch">
        {t("Belum punya akun?")}{" "}
        <Link href="/register">{t("Daftar Sekarang")}</Link>
      </p>
    </AuthLayout>
  );
}
