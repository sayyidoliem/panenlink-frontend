import Link from "next/link";
import { Bell, Moon, ChevronDown } from "lucide-react";
export function Topbar() {
  return (
    <header className="topbar">
      <span />
      <div className="top-actions">
        <button>
          ID/EN <ChevronDown size={14} />
        </button>
        <button aria-label="Tema">
          <Moon />
        </button>
        <button className="notification" aria-label="Notifikasi">
          <Bell />
          <i />
        </button>
        <Link className="avatar" href="/profile">
          HS
        </Link>
      </div>
    </header>
  );
}
