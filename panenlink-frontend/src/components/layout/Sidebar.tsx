"use client";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { usePathname } from "next/navigation";
import { nav, bottom } from "./nav";
import { useApp } from "@/shared/app/AppProvider";
export function Sidebar() {
  const p = usePathname(),
    { t } = useApp();
  return (
    <aside className="sidebar">
      <Link href="/" className="side-brand">
        <Sprout />
        <span>
          PanenLink<small>Agri-Logistics</small>
        </span>
      </Link>
      <nav>
        {nav.map(({ href, key, icon: I }) => (
          <Link
            key={href}
            href={href}
            className={
              p === href || p.startsWith(href + "/")
                ? "side-link active"
                : "side-link"
            }
          >
            <I />
            <span>{t(key)}</span>
          </Link>
        ))}
      </nav>
      <nav className="side-bottom">
        {bottom.map(({ href, key, icon: I }) => (
          <Link key={href} href={href} className="side-link">
            <I />
            <span>{t(key)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
