"use client";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { usePathname } from "next/navigation";
import { nav, navBottom } from "./nav";
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="side-brand">
        <Sprout />
        <span>
          PanenLink<small>Agri-Logistics</small>
        </span>
      </Link>
      <nav>
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={
              path === href || path.startsWith(href + "/")
                ? "side-link active"
                : "side-link"
            }
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <nav className="side-bottom">
        {navBottom.map(({ href, label, icon: Icon }) => (
          <Link key={label} href={href} className="side-link">
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
