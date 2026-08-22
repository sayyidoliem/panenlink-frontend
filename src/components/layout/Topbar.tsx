"use client";
import Link from "next/link";
import { Bell, Moon, Sun, ChevronDown } from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
import { useState } from "react";
export function Topbar() {
  const { lang, setLang, theme, setTheme, account } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <span />
      <div className="top-actions">
        <button onClick={() => setLang(lang === "id" ? "en" : "id")}>
          {lang.toUpperCase()} <ChevronDown size={14} />
        </button>
        <button
          aria-label="Tema"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
        <button
          className="notification"
          aria-label="Notifikasi"
          onClick={() => setOpen(!open)}
        >
          <Bell />
          <i />
        </button>
        {open && (
          <div className="top-popover">
            <b>Notifikasi</b>
            <p>Muatan baru tersedia di sekitar Anda.</p>
            <p>Dokumen STNK sedang ditinjau.</p>
          </div>
        )}
        <Link className="avatar" href="/profile">
          {account.photo ? (
            <img src={account.photo} alt="Profil" />
          ) : (
            account.name
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")
          )}
        </Link>
      </div>
    </header>
  );
}
