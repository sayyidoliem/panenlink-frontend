import {
  LayoutDashboard,
  PackagePlus,
  Truck,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Bot,
} from "lucide-react";
export const nav = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/post-load", key: "post", icon: PackagePlus },
  { href: "/orders", key: "orders", icon: Truck },
  { href: "/loads", key: "loads", icon: Search },
  { href: "/ai", key: "ai", icon: Bot },
  { href: "/profile", key: "profile", icon: User },
  { href: "/settings", key: "settings", icon: Settings },
];
export const bottom = [
  { href: "/help", key: "help", icon: HelpCircle },
  { href: "/login", key: "logout", icon: LogOut },
];
