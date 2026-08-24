"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { SupabaseProfile } from "@/shared/lib/supabase/profile-types";

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
  security: {
    twoFactor: boolean;
    pin: string;
    passwordChanged: string;
  };
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

function profileToAccount(
  profile: SupabaseProfile,
  email: string,
  currentAccount: Account,
): Account {
  return {
    ...currentAccount,
    name: profile.name ?? currentAccount.name,
    email: email || currentAccount.email,
    phone: profile.phone ?? currentAccount.phone,
    location: profile.location ?? currentAccount.location,
    role: profile.role ?? currentAccount.role,
    photo: profile.photo_url ?? currentAccount.photo,
    verified: profile.verified ?? currentAccount.verified,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("id");
  const [account, setAccount] = useState<Account>(defaults);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const [notifications, setNotificationsState] = useState<
    Record<string, boolean>
  >({
    loads: true,
    payout: true,
    trends: false,
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(defaultAlerts);

  const [security, setSecurityState] = useState({
    twoFactor: true,
    pin: "123456",
    passwordChanged: "Belum pernah",
  });

  const loadAccountFromSupabase = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Gagal mengambil pengguna Supabase:", userError.message);
      return;
    }

    if (!user) {
      return;
    }

    const { data: profile, error: profileError } = (await supabase
      .from("profiles")
      .select(
        `
          id,
          name,
          role,
          location,
          phone,
          photo_url,
          verified,
          member_since,
          load_count,
          completion_percentage,
          rating
        `,
      )
      .eq("id", user.id)
      .maybeSingle()) as { data: SupabaseProfile | null; error: any };

    if (profileError) {
      console.error(
        "Gagal mengambil profil dari Supabase:",
        profileError.message,
      );

      setAccount((currentAccount) => ({
        ...currentAccount,
        email: user.email ?? currentAccount.email,
      }));

      return;
    }

    if (!profile) {
      setAccount((currentAccount) => ({
        ...currentAccount,
        name:
          typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : currentAccount.name,
        email: user.email ?? currentAccount.email,
        photo:
          typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : currentAccount.photo,
      }));

      return;
    }

    setAccount((currentAccount) =>
      profileToAccount(profile, user.email ?? "", currentAccount),
    );
  }, [supabase]);

  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem("pl_preferences");

      if (savedPreferences) {
        const data = JSON.parse(savedPreferences) as {
          theme?: Theme;
          lang?: Lang;
          account?: Partial<Account>;
          notifications?: Record<string, boolean>;
          alerts?: AlertItem[];
          security?: State["security"];
        };

        setTheme(data.theme ?? "system");
        setLang(data.lang ?? "id");

        /*
         * Account dari localStorage hanya menjadi data sementara.
         * Setelah ini, data profil terbaru akan diambil dari Supabase.
         */
        setAccount({
          ...defaults,
          ...data.account,
          documents: {
            ...defaults.documents,
            ...data.account?.documents,
          },
        });

        setNotificationsState(
          data.notifications ?? {
            loads: true,
            payout: true,
            trends: false,
          },
        );

        setAlerts(data.alerts ?? defaultAlerts);

        setSecurityState(
          data.security ?? {
            twoFactor: true,
            pin: "123456",
            passwordChanged: "Belum pernah",
          },
        );
      }
    } catch (error) {
      console.error("Gagal membaca preferensi lokal:", error);
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    void loadAccountFromSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAccountFromSupabase();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAccountFromSupabase, preferencesLoaded, supabase]);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    const dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = lang;

    localStorage.setItem(
      "pl_preferences",
      JSON.stringify({
        theme,
        lang,
        account,
        notifications,
        alerts,
        security,
      }),
    );
  }, [
    preferencesLoaded,
    theme,
    lang,
    account,
    notifications,
    alerts,
    security,
  ]);

  const updateAccount = useCallback(
    (values: Partial<Account>) => {
      /*
       * State diperbarui langsung agar seluruh UI yang memakai useApp()
       * langsung mendapatkan data terbaru.
       */
      setAccount((currentAccount) => ({
        ...currentAccount,
        ...values,
        documents: values.documents
          ? {
              ...currentAccount.documents,
              ...values.documents,
            }
          : currentAccount.documents,
      }));

      /*
       * Sinkronkan hanya kolom yang memang tersedia pada tabel profiles.
       */
      void (async () => {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (userError) {
            console.error(
              "Gagal mendapatkan pengguna untuk memperbarui profil:",
              userError.message,
            );
          }

          return;
        }

        const profileUpdates: Partial<SupabaseProfile> = {};

        if (values.name !== undefined) {
          profileUpdates.name = values.name;
        }

        if (values.phone !== undefined) {
          profileUpdates.phone = values.phone;
        }

        if (values.location !== undefined) {
          profileUpdates.location = values.location;
        }

        if (values.role !== undefined) {
          profileUpdates.role = values.role;
        }

        if (values.photo !== undefined) {
          profileUpdates.photo_url = values.photo;
        }

        if (values.verified !== undefined) {
          profileUpdates.verified = values.verified;
        }

        if (Object.keys(profileUpdates).length > 0) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("id", user.id);

          if (updateError) {
            console.error(
              "Gagal memperbarui profil di Supabase:",
              updateError.message,
            );

            /*
             * Ambil ulang profil agar state kembali mengikuti data
             * yang sebenarnya tersimpan di Supabase.
             */
            await loadAccountFromSupabase();
          }
        }

        /*
         * Email berada di Supabase Auth, bukan pada tabel profiles.
         * Proses ini dapat mengirim email konfirmasi, tergantung
         * konfigurasi autentikasi Supabase.
         */
        if (values.email !== undefined && values.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: values.email,
          });

          if (emailError) {
            console.error(
              "Gagal memperbarui email Supabase:",
              emailError.message,
            );

            await loadAccountFromSupabase();
          }
        }
      })();
    },
    [loadAccountFromSupabase, supabase],
  );

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
      updateAccount,
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
          current.map((alert) => ({
            ...alert,
            read: true,
          })),
        ),
      removeAlert: (id) =>
        setAlerts((current) => current.filter((alert) => alert.id !== id)),
      setSecurity: (v) =>
        setSecurityState((current) => ({
          ...current,
          ...v,
        })),
      t: (id) => dict[lang][id] || id,
    }),
    [theme, lang, account, notifications, alerts, security, updateAccount],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useApp() {
  const context = useContext(C);

  if (!context) {
    throw new Error("AppProvider missing");
  }

  return context;
}
