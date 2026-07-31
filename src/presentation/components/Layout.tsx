import { useState, type ReactNode } from "react";
import type { Role, Notification } from "../../domain/models";
import {
  Sprout,
  Truck,
  LayoutDashboard,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
export function Layout({
  role,
  setRole,
  notifications,
  onRead,
  children,
}: {
  role: Role;
  setRole: (r: Role) => void;
  notifications: Notification[];
  onRead: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const nav = [
    ["operator", "Pusat Operasi", LayoutDashboard],
    ["farmer", "Portal Petani", Sprout],
    ["driver", "Portal Pengemudi", Truck],
  ] as const;
  return (
    <div className="shell">
      <aside className={mobile ? "side show" : "side"}>
        <div className="brand">
          <div className="logo">
            <Sprout />
          </div>
          <div>
            <b>PanenLink</b>
            <small>Smart Backhaul</small>
          </div>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <p className="nav-label">PILIH PERAN DEMO</p>
        <nav>
          {nav.map(([r, l, I]) => (
            <button
              key={r}
              className={role === r ? "nav active" : "nav"}
              onClick={() => {
                setRole(r);
                setMobile(false);
              }}
            >
              <I />
              {l}
            </button>
          ))}
        </nav>
        <div className="side-card">
          <b>Efisiensi hari ini</b>
          <div className="ring">68%</div>
          <small>Kapasitas backhaul terpakai</small>
        </div>
        <div className="side-foot">
          <span className="avatar">PL</span>
          <div>
            <b>Demo PanenLink</b>
            <small>
              {role === "operator"
                ? "Administrator"
                : role === "farmer"
                  ? "Pak Budi"
                  : "Andi Pratama"}
            </small>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="mobile-menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div>
            <h1>
              {role === "operator"
                ? "Pusat Operasi"
                : role === "farmer"
                  ? "Portal Petani"
                  : "Portal Pengemudi"}
            </h1>
            <p>Sabtu, 1 Agustus 2026</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setOpen(!open)}>
              <Bell />
              <i>{notifications.filter((n) => !n.read).length}</i>
            </button>
            {open && (
              <div className="popover">
                <div className="pop-head">
                  <b>Notifikasi</b>
                  <button onClick={onRead}>Tandai dibaca</button>
                </div>
                {notifications.length ? (
                  notifications.map((n) => (
                    <div
                      className={!n.read ? "note unread" : "note"}
                      key={n.id}
                    >
                      <b>{n.title}</b>
                      <p>{n.message}</p>
                      <small>{n.time}</small>
                    </div>
                  ))
                ) : (
                  <p className="empty">Tidak ada notifikasi</p>
                )}
              </div>
            )}
            <button className="profile">
              <span className="avatar">
                {role === "farmer" ? "PB" : role === "driver" ? "AP" : "OP"}
              </span>
              <span>
                {role === "farmer"
                  ? "Pak Budi"
                  : role === "driver"
                    ? "Andi Pratama"
                    : "Operator"}
                <small>{role}</small>
              </span>
              <ChevronDown />
            </button>
          </div>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
