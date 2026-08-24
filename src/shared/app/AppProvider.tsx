"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
export type Theme = "light" | "dark" | "system";
export type Lang = "id" | "en";
export type AlertTone = "info" | "success" | "warning";
export type AlertItem = {
  id: string;
  title: string;
  body: string;
  tone: AlertTone;
  time: string;
  read: boolean;
};
export type Account = {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  photo: string;
  verified: boolean;
  documents: Record<string, string>;
};
type State = {
  theme: Theme;
  lang: Lang;
  account: Account;
  notifications: Record<string, boolean>;
  alerts: AlertItem[];
  security: { twoFactor: boolean; pin: string; passwordChanged: string };
  setTheme: (v: Theme) => void;
  setLang: (v: Lang) => void;
  updateAccount: (v: Partial<Account>) => void;
  setNotifications: (v: Record<string, boolean>) => void;
  pushAlert: (v: Omit<AlertItem, "id" | "time" | "read">) => void;
  markAlertsRead: () => void;
  removeAlert: (id: string) => void;
  setSecurity: (v: Partial<State["security"]>) => void;
  t: (id: string) => string;
};
const defaults: Account = {
  name: "Haji Supriatna",
  email: "haji@panenlink.id",
  phone: "6281234567890",
  location: "Garut, Jawa Barat",
  role: "Petani & Pengumpul",
  photo: "",
  verified: true,
  documents: {
    KTP: "verified",
    SIM: "verified",
    STNK: "pending",
    Lahan: "missing",
  },
};
const dict: Record<Lang, Record<string, string>> = {
  id: {
    dashboard: "Dashboard",
    post: "Post Muatan",
    orders: "Daftar Pesanan",
    loads: "Cari Muatan",
    profile: "Profil",
    settings: "Pengaturan",
    help: "Pusat Bantuan",
    ai: "Asisten AI",
    logout: "Keluar",
    search: "Cari",
  },
  en: {
    dashboard: "Dashboard",
    post: "Post Load",
    orders: "Orders",
    loads: "Find Loads",
    profile: "Profile",
    settings: "Settings",
    help: "Help Center",
    ai: "AI Assistant",
    logout: "Sign Out",
    search: "Search",
  },
};
const defaultAlerts: AlertItem[] = [
  {
    id: "alert-load-1",
    title: "Muatan aktif bergerak",
    body: "Cabai Merah Garut - Jakarta telah menempuh 65% perjalanan.",
    tone: "info",
    time: "Baru saja",
    read: false,
  },
  {
    id: "alert-doc-1",
    title: "Dokumen diverifikasi",
    body: "KTP akun Anda sudah terverifikasi oleh PanenLink.",
    tone: "success",
    time: "12 menit lalu",
    read: false,
  },
];
const C = createContext<State | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"),
    [lang, setLang] = useState<Lang>("id"),
    [account, setAccount] = useState<Account>(defaults),
    [notifications, setNotificationsState] = useState<Record<string, boolean>>({
      loads: true,
      payout: true,
      trends: false,
    }),
    [alerts, setAlerts] = useState<AlertItem[]>(defaultAlerts),
    [security, setSecurityState] = useState({
      twoFactor: true,
      pin: "123456",
      passwordChanged: "Belum pernah",
    });
  useEffect(() => {
    try {
      const x = localStorage.getItem("pl_preferences");
      if (x) {
        const d = JSON.parse(x);
        setTheme(d.theme || "system");
        setLang(d.lang || "id");
        setAccount({ ...defaults, ...d.account });
        setNotificationsState(d.notifications || notifications);
        setAlerts(d.alerts || defaultAlerts);
        setSecurityState(d.security || security);
      }
    } catch {}
  }, []);
  useEffect(() => {
    const dark =
      theme === "dark" ||
      (theme === "system" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = lang;
    localStorage.setItem(
      "pl_preferences",
      JSON.stringify({ theme, lang, account, notifications, alerts, security }),
    );
  }, [theme, lang, account, notifications, alerts, security]);
  const value = useMemo<State>(
    () => ({
      theme,
      lang,
      account,
      notifications,
      alerts,
      security,
      setTheme,
      setLang,
      updateAccount: (v) => setAccount((a) => ({ ...a, ...v })),
      setNotifications: setNotificationsState,
      pushAlert: (v) =>
        setAlerts((current) => [
          {
            id: `alert-${Date.now()}-${current.length}`,
            title: v.title,
            body: v.body,
            tone: v.tone,
            time: "Baru saja",
            read: false,
          },
          ...current,
        ]),
      markAlertsRead: () =>
        setAlerts((current) =>
          current.map((alert) => ({ ...alert, read: true })),
        ),
      removeAlert: (id) =>
        setAlerts((current) => current.filter((alert) => alert.id !== id)),
      setSecurity: (v) => setSecurityState((s) => ({ ...s, ...v })),
      t: (id) => dict[lang][id] || id,
    }),
    [theme, lang, account, notifications, alerts, security],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useApp() {
  const x = useContext(C);
  if (!x) throw new Error("AppProvider missing");
  return x;
}
