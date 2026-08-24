"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/shared/app/AppProvider";

type Dictionary = Record<string, string>;

const fallbackEn: Dictionary = {
  "Welcome Back": "Welcome Back",
  "Masuk ke hub logistik agrikultur Anda.":
    "Sign in to your agricultural logistics hub.",
  "Lanjutkan dengan Google": "Continue with Google",
  ATAU: "OR",
  "Email atau Nomor HP": "Email or Phone Number",
  "Masukkan email atau no HP": "Enter your email or phone number",
  "Kata Sandi": "Password",
  "Ingat Saya": "Remember me",
  "Lupa Kata Sandi?": "Forgot password?",
  "Masuk Sekarang": "Sign In",
  "Belum punya akun?": "Don't have an account?",
  "Daftar Sekarang": "Register Now",
  "Buat Akun Pemilik Panen": "Create a Grower Account",
  "Mulai publikasikan hasil panen dan temukan armada balik terdekat.":
    "Start publishing your harvest and find the nearest return fleet.",
  "Nama Lengkap / Username": "Full Name / Username",
  "Masukkan nama lengkap": "Enter your full name",
  "Email atau WhatsApp": "Email or WhatsApp",
  "08123456789 atau email@domain.com": "08123456789 or email@domain.com",
  "Konfirmasi Kata Sandi": "Confirm Password",
  "Minimal 8 karakter": "Minimum 8 characters",
  "Ulangi kata sandi": "Repeat your password",
  "Saya menyetujui Syarat & Ketentuan.": "I agree to the Terms & Conditions.",
  "Daftar Akun Pemilik Panen": "Create Grower Account",
  "Sudah punya akun?": "Already have an account?",
  "Masuk di sini": "Sign in here",
};

export function useAuthTranslation(texts: string[]) {
  const { lang } = useApp();
  const [translated, setTranslated] = useState<Dictionary>({});

  const key = useMemo(() => texts.join("||"), [texts]);

  useEffect(() => {
    let active = true;

    if (lang === "id") {
      return () => {
        active = false;
      };
    }

    const run = async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, source: "id", target: "en" }),
        });

        if (!res.ok) throw new Error("translation failed");
        const data = (await res.json()) as { translations?: Dictionary };
        if (active && data.translations) setTranslated(data.translations);
      } catch {
        if (active) setTranslated(fallbackEn);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [key, lang, texts]);

  return (text: string) =>
    lang === "en" ? fallbackEn[text] || translated[text] || text : text;
}
