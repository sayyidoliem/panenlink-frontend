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

type NotificationSettings = {
  loads: boolean;
  payout: boolean;
  trends: boolean;
};

type SecurityState = {
  twoFactor: boolean;
  pin: string;
  passwordChanged: string;
};

type State = {
  theme: Theme;
  lang: Lang;
  account: Account;
  notifications: Record<string, boolean>;
  alerts: AlertItem[];
  security: SecurityState;
  setTheme: (value: Theme) => void;
  setLang: (value: Lang) => void;
  updateAccount: (value: Partial<Account>) => void;
  setNotifications: (value: Record<string, boolean>) => void;
  pushAlert: (value: Omit<AlertItem, "id" | "time" | "read">) => void;
  markAlertsRead: () => void;
  removeAlert: (id: string) => void;
  setSecurity: (value: Partial<SecurityState>) => void;
  t: (id: string) => string;
};

type UserSettingsRow = {
  user_id: string;
  theme: Theme;
  lang: Lang;
  notify_loads: boolean;
  notify_payout: boolean;
  notify_trends: boolean;
  two_factor_enabled: boolean;
  password_changed_label: string | null;
};

type AlertRow = {
  id: string;
  title: string;
  body: string;
  tone: AlertTone;
  read: boolean;
  created_at: string;
};

type VerificationDocumentRow = {
  document_type: string;
  status: string;
};

const EMPTY_ACCOUNT: Account = {
  name: "-",
  email: "-",
  phone: "0",
  location: "-",
  role: "-",
  photo: "",
  verified: false,
  documents: {},
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  loads: true,
  payout: true,
  trends: false,
};

const DEFAULT_SECURITY: SecurityState = {
  twoFactor: false,
  pin: "",
  passwordChanged: "Belum pernah",
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

const AppContext = createContext<State | null>(null);

function getText(value: unknown, fallback = "-") {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = value.trim();

  return result || fallback;
}

function getPhone(value: unknown) {
  if (typeof value !== "string") {
    return "0";
  }

  const phone = value.replace(/\D/g, "");

  return phone || "0";
}

function profileToAccount(profile: SupabaseProfile, email: string): Account {
  return {
    name: getText(profile.name),
    email: getText(email),
    phone: getPhone(profile.phone),
    location: getText(profile.location),
    role: getText(profile.role),
    photo: typeof profile.photo_url === "string" ? profile.photo_url : "",
    verified: Boolean(profile.verified),
    documents: {},
  };
}

function formatAlertTime(createdAt: string) {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "-";
  }

  const difference = Date.now() - created.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} hari lalu`;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(created);
}

function alertRowToItem(row: AlertRow): AlertItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tone: row.tone,
    read: row.read,
    time: formatAlertTime(row.created_at),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [theme, setThemeState] = useState<Theme>("light");
  const [lang, setLangState] = useState<Lang>("id");
  const [account, setAccount] = useState<Account>(EMPTY_ACCOUNT);

  const [notifications, setNotificationsState] = useState<
    Record<string, boolean>
  >(DEFAULT_NOTIFICATIONS);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [security, setSecurityState] =
    useState<SecurityState>(DEFAULT_SECURITY);

  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const applyAppearance = useCallback((nextTheme: Theme, nextLang: Lang) => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const isDark =
      nextTheme === "dark" || (nextTheme === "system" && prefersDark);

    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    document.documentElement.lang = nextLang;
  }, []);

  const ensureUserSettings = useCallback(
    async (currentUserId: string) => {
      const { data, error } = await supabase
        .from("user_settings")
        .select(
          [
            "user_id",
            "theme",
            "lang",
            "notify_loads",
            "notify_payout",
            "notify_trends",
            "two_factor_enabled",
            "password_changed_label",
          ].join(","),
        )
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        return data as UserSettingsRow;
      }

      const { data: createdSettings, error: createError } = await supabase
        .from("user_settings")
        .insert({
          user_id: currentUserId,
          theme: "light",
          lang: "id",
          notify_loads: true,
          notify_payout: true,
          notify_trends: false,
          two_factor_enabled: false,
          password_changed_label: "Belum pernah",
        })
        .select(
          [
            "user_id",
            "theme",
            "lang",
            "notify_loads",
            "notify_payout",
            "notify_trends",
            "two_factor_enabled",
            "password_changed_label",
          ].join(","),
        )
        .single();

      if (createError) {
        throw createError;
      }

      return createdSettings as UserSettingsRow;
    },
    [supabase],
  );

  const loadApplicationData = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUserId(null);
      setAccount(EMPTY_ACCOUNT);
      setAlerts([]);
      setNotificationsState(DEFAULT_NOTIFICATIONS);
      setSecurityState(DEFAULT_SECURITY);
      setInitialized(true);
      return;
    }

    setUserId(user.id);

    try {
      const [profileResult, settings, alertsResult, documentsResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              [
                "id",
                "name",
                "role",
                "location",
                "phone",
                "photo_url",
                "verified",
                "member_since",
                "load_count",
                "completion_percentage",
                "rating",
              ].join(","),
            )
            .eq("id", user.id)
            .maybeSingle(),

          ensureUserSettings(user.id),

          supabase
            .from("alerts")
            .select(
              ["id", "title", "body", "tone", "read", "created_at"].join(","),
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(50),

          supabase
            .from("verification_documents")
            .select("document_type,status")
            .eq("user_id", user.id),
        ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (alertsResult.error) {
        throw alertsResult.error;
      }

      if (documentsResult.error) {
        throw documentsResult.error;
      }

      const profile = profileResult.data as SupabaseProfile | null;

      const authName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        "-";

      const authPhone =
        user.phone ??
        user.user_metadata?.phone ??
        user.user_metadata?.phone_number ??
        "0";

      const authPhoto =
        user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "";

      const documents = Object.fromEntries(
        ((documentsResult.data as VerificationDocumentRow[] | null) ?? []).map(
          (document: VerificationDocumentRow) => [
            String(document.document_type),
            String(document.status),
          ],
        ),
      );

      if (profile) {
        setAccount({
          ...profileToAccount(profile, user.email ?? "-"),
          documents,
        });
      } else {
        setAccount({
          name: getText(authName),
          email: getText(user.email),
          phone: getPhone(authPhone),
          location: "-",
          role: "-",
          photo: String(authPhoto),
          verified: false,
          documents,
        });
      }

      const settingsRow = settings as UserSettingsRow;

      setThemeState(settingsRow.theme);
      setLangState(settingsRow.lang);

      setNotificationsState({
        loads: settingsRow.notify_loads,
        payout: settingsRow.notify_payout,
        trends: settingsRow.notify_trends,
      });

      setSecurityState({
        twoFactor: settingsRow.two_factor_enabled,
        pin: "",
        passwordChanged: settingsRow.password_changed_label ?? "Belum pernah",
      });

      setAlerts(
        ((alertsResult.data as AlertRow[] | null) ?? []).map(alertRowToItem),
      );

      applyAppearance(settingsRow.theme, settingsRow.lang);
    } catch (error) {
      console.error("Gagal memuat data aplikasi dari Supabase:", error);
    } finally {
      setInitialized(true);
    }
  }, [applyAppearance, ensureUserSettings, supabase]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "pl_anonymous_theme",
    ) as Theme | null;

    const savedLang = localStorage.getItem("pl_anonymous_lang") as Lang | null;

    const initialTheme =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "light";

    const initialLang = savedLang === "en" ? "en" : "id";

    setThemeState(initialTheme);
    setLangState(initialLang);
    applyAppearance(initialTheme, initialLang);

    void loadApplicationData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadApplicationData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyAppearance, loadApplicationData, supabase]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    applyAppearance(theme, lang);
  }, [applyAppearance, initialized, theme, lang]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      applyAppearance(theme, lang);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [applyAppearance, lang, theme]);

  const updateUserSettings = useCallback(
    async (
      values: Partial<{
        theme: Theme;
        lang: Lang;
        notify_loads: boolean;
        notify_payout: boolean;
        notify_trends: boolean;
        two_factor_enabled: boolean;
        password_changed_label: string;
      }>,
    ) => {
      if (!userId) {
        return;
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: userId,
          ...values,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

      if (error) {
        console.error("Pengaturan gagal disimpan:", error.message);

        await loadApplicationData();
      }
    },
    [loadApplicationData, supabase, userId],
  );

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      applyAppearance(value, lang);

      if (userId) {
        void updateUserSettings({
          theme: value,
        });
      } else {
        localStorage.setItem("pl_anonymous_theme", value);
      }
    },
    [applyAppearance, lang, updateUserSettings, userId],
  );

  const setLang = useCallback(
    (value: Lang) => {
      setLangState(value);
      applyAppearance(theme, value);

      if (userId) {
        void updateUserSettings({
          lang: value,
        });
      } else {
        localStorage.setItem("pl_anonymous_lang", value);
      }
    },
    [applyAppearance, theme, updateUserSettings, userId],
  );

  const updateAccount = useCallback(
    (values: Partial<Account>) => {
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

      void (async () => {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          await loadApplicationData();
          return;
        }

        const profileUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

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

        if (Object.keys(profileUpdates).length > 1) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: user.id,
                ...profileUpdates,
              },
              {
                onConflict: "id",
              },
            );

          if (profileError) {
            console.error("Profil gagal diperbarui:", profileError.message);

            await loadApplicationData();
            return;
          }
        }

        if (values.email !== undefined && values.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: values.email,
          });

          if (emailError) {
            console.error("Email gagal diperbarui:", emailError.message);

            await loadApplicationData();
          }
        }
      })();
    },
    [loadApplicationData, supabase],
  );

  const setNotifications = useCallback(
    (value: Record<string, boolean>) => {
      const nextNotifications = {
        loads: Boolean(value.loads),
        payout: Boolean(value.payout),
        trends: Boolean(value.trends),
      };

      setNotificationsState(nextNotifications);

      void updateUserSettings({
        notify_loads: nextNotifications.loads,
        notify_payout: nextNotifications.payout,
        notify_trends: nextNotifications.trends,
      });
    },
    [updateUserSettings],
  );

  const pushAlert = useCallback(
    (value: Omit<AlertItem, "id" | "time" | "read">) => {
      const temporaryId = `alert-${Date.now()}`;

      const optimisticAlert: AlertItem = {
        id: temporaryId,
        title: value.title,
        body: value.body,
        tone: value.tone,
        time: "Baru saja",
        read: false,
      };

      setAlerts((currentAlerts) => [optimisticAlert, ...currentAlerts]);

      if (!userId) {
        return;
      }

      void (async () => {
        const { data, error } = await supabase
          .from("alerts")
          .insert({
            user_id: userId,
            title: value.title,
            body: value.body,
            tone: value.tone,
            read: false,
          })
          .select(
            ["id", "title", "body", "tone", "read", "created_at"].join(","),
          )
          .single();

        if (error) {
          console.error("Notifikasi gagal dibuat:", error.message);

          setAlerts((currentAlerts) =>
            currentAlerts.filter((alert) => alert.id !== temporaryId),
          );

          return;
        }

        const createdAlert = alertRowToItem(data as AlertRow);

        setAlerts((currentAlerts) =>
          currentAlerts.map((alert) =>
            alert.id === temporaryId ? createdAlert : alert,
          ),
        );
      })();
    },
    [supabase, userId],
  );

  const markAlertsRead = useCallback(() => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) => ({
        ...alert,
        read: true,
      })),
    );

    if (!userId) {
      return;
    }

    void (async () => {
      const { error } = await supabase
        .from("alerts")
        .update({
          read: true,
        })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        console.error("Notifikasi gagal ditandai dibaca:", error.message);

        await loadApplicationData();
      }
    })();
  }, [loadApplicationData, supabase, userId]);

  const removeAlert = useCallback(
    (id: string) => {
      let removedAlert: AlertItem | undefined;

      setAlerts((currentAlerts) => {
        removedAlert = currentAlerts.find((alert) => alert.id === id);

        return currentAlerts.filter((alert) => alert.id !== id);
      });

      if (!userId || id.startsWith("alert-")) {
        return;
      }

      void (async () => {
        const { error } = await supabase
          .from("alerts")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Notifikasi gagal dihapus:", error.message);

          if (removedAlert) {
            setAlerts((currentAlerts) => [
              removedAlert as AlertItem,
              ...currentAlerts,
            ]);
          }
        }
      })();
    },
    [supabase, userId],
  );

  const setSecurity = useCallback(
    (value: Partial<SecurityState>) => {
      const safeValue = {
        ...value,
        pin: "",
      };

      setSecurityState((currentSecurity) => ({
        ...currentSecurity,
        ...safeValue,
        pin: "",
      }));

      const settingsUpdate: Partial<{
        two_factor_enabled: boolean;
        password_changed_label: string;
      }> = {};

      if (value.twoFactor !== undefined) {
        settingsUpdate.two_factor_enabled = value.twoFactor;
      }

      if (value.passwordChanged !== undefined) {
        settingsUpdate.password_changed_label = value.passwordChanged;
      }

      if (Object.keys(settingsUpdate).length > 0) {
        void updateUserSettings(settingsUpdate);
      }
    },
    [updateUserSettings],
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
      setNotifications,
      pushAlert,
      markAlertsRead,
      removeAlert,
      setSecurity,
      t: (id) => dict[lang][id] || id,
    }),
    [
      account,
      alerts,
      lang,
      markAlertsRead,
      notifications,
      pushAlert,
      removeAlert,
      security,
      setLang,
      setNotifications,
      setSecurity,
      setTheme,
      theme,
      updateAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppProvider missing");
  }

  return context;
}
