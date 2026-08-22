import {
  LayoutDashboard,
  PackagePlus,
  Truck,
  Users,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
export const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/post-load", label: "Post Muatan", icon: PackagePlus },
  { href: "/orders", label: "Daftar Pesanan", icon: Truck },
  { href: "/loads", label: "Cari Muatan", icon: Users },
  { href: "/profile", label: "Profil", icon: Wallet },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];
export const navBottom = [
  { href: "#", label: "Pusat Bantuan", icon: HelpCircle },
  { href: "/", label: "Keluar", icon: LogOut },
];
