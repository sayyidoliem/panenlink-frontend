"use client";
import { useState, type ReactNode } from "react";
import { Bell, LayoutDashboard, Menu, Sprout, Truck, X } from "lucide-react";
import type { Notification, Role } from "../../domain/models";
import { Button } from "@/components/ui/Button";
const nav = [
  { role: "operator", label: "Pusat Operasi", Icon: LayoutDashboard },
  { role: "farmer", label: "Portal Petani", Icon: Sprout },
  { role: "driver", label: "Portal Pengemudi", Icon: Truck },
] as const;
export function AppShell({
  role,
  setRole,
  notifications,
  onRead,
  children,
}: {
  role: Role;
  setRole: (r: Role) => void;
  notifications: Notification[];
  onRead: () => Promise<void>;
  children: ReactNode;
}) {
  const [mobile, setMobile] = useState(false),
    [open, setOpen] = useState(false);
  const title = nav.find((x) => x.role === role)?.label;
  return (
    <div className="shell">
      <aside className={`sidebar ${mobile ? "show" : ""}`}>
        <div className="brand">
          <span>
            <Sprout />
          </span>
          <div>
            <b>PanenLink</b>
            <small>Smart Backhaul</small>
          </div>
          <button className="mobile" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <p className="nav-label">PILIH PERAN DEMO</p>
        <nav>
          {nav.map(({ role: r, label, Icon }) => (
            <button
              key={r}
              className={role === r ? "nav active" : "nav"}
              onClick={() => {
                setRole(r);
                setMobile(false);
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="efficiency">
          <b>Efisiensi hari ini</b>
          <strong>68%</strong>
          <small>Kapasitas backhaul terpakai</small>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <button className="mobile" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div>
            <h1>{title}</h1>
            <p>Demo operasional PanenLink</p>
          </div>
          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Notifikasi"
            >
              <Bell />
              <i>{notifications.filter((n) => !n.read).length}</i>
            </button>
            {open && (
              <div className="popover">
                <div>
                  <b>Notifikasi</b>
                  <Button variant="ghost" onClick={() => void onRead()}>
                    Tandai dibaca
                  </Button>
                </div>
                {notifications.map((n) => (
                  <article className={!n.read ? "unread" : ""} key={n.id}>
                    <b>{n.title}</b>
                    <p>{n.message}</p>
                    <small>{n.time}</small>
                  </article>
                ))}
              </div>
            )}
            <span className="avatar">
              {role === "farmer" ? "PB" : role === "driver" ? "AP" : "OP"}
            </span>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
