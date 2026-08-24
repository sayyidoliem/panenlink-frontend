"use client";
import Link from "next/link";
import { Moon, Sprout, Sun } from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
export function AuthLayout({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  const { lang, setLang, theme, setTheme } = useApp();
  const copy = {
    login: {
      quote:
        lang === "en"
          ? "“Connecting every field to a trusted supply chain.”"
          : "“Menghubungkan setiap jengkal sawah dengan rantai pasok terpercaya.”",
      badge:
        lang === "en"
          ? "Agricultural Logistics Efficiency"
          : "Efisiensi Logistik Agrikultur",
    },
    register: {
      quote:
        lang === "en"
          ? "Harvest Distribution Without Middlemen."
          : "Distribusi Hasil Panen Tanpa Perantara.",
      badge:
        lang === "en"
          ? "Agricultural Logistics Efficiency"
          : "Efisiensi Logistik Agrikultur",
    },
  }[mode];
  return (
    <main className="auth">
      <section className={`auth-visual ${mode}`}>
        <div>
          <h2>{copy.quote}</h2>
          <span>{copy.badge}</span>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-tools">
          <div className="auth-lang-switch" aria-label="Language switcher">
            <button
              type="button"
              className={lang === "id" ? "active" : ""}
              onClick={() => setLang("id")}
            >
              ID
            </button>
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="auth-theme-toggle"
            aria-label="Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>
        <div className="auth-box">
          <Link href="/" className="auth-brand">
            <Sprout />
            PanenLink
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
