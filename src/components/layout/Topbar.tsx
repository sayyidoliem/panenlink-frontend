"use client";
import Link from "next/link";
import { Bell, Moon, Sun, ChevronDown, CheckCheck, X } from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
import { useState } from "react";
export function Topbar() {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    account,
    alerts,
    markAlertsRead,
    removeAlert,
  } = useApp();
  const [open, setOpen] = useState(false);
  const unreadCount = alerts.filter((alert) => !alert.read).length;
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
          onClick={() => {
            setOpen(!open);
            if (!open) markAlertsRead();
          }}
        >
          <Bell />
          {unreadCount > 0 && <i />}
        </button>
        {open && (
          <div className="top-popover">
            <div className="top-popover-head">
              <b>Notifikasi</b>
              <small>{unreadCount} baru</small>
            </div>
            <button
              type="button"
              className="top-popover-action"
              onClick={markAlertsRead}
            >
              <CheckCheck />
              Tandai dibaca
            </button>
            <div className="top-popover-list">
              {alerts.map((alert) => (
                <article
                  key={alert.id}
                  className={`top-alert ${alert.read ? "read" : ""}`}
                >
                  <span className={`top-alert-dot ${alert.tone}`} />
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.body}</p>
                    <small>{alert.time}</small>
                  </div>
                  <button
                    type="button"
                    className="top-alert-remove"
                    aria-label={`Hapus notifikasi ${alert.title}`}
                    onClick={() => removeAlert(alert.id)}
                  >
                    <X />
                  </button>
                </article>
              ))}
            </div>
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
