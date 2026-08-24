"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { nav, bottom } from "./nav";
import { useApp } from "@/shared/app/AppProvider";
import { createClient } from "@/shared/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useApp();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleClose = () => {
      setIsLoggingOut(false);
    };

    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  const openLogoutDialog = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();

      requestAnimationFrame(() => {
        cancelButtonRef.current?.focus();
      });
    }
  };

  const closeLogoutDialog = () => {
    if (isLoggingOut) {
      return;
    }

    dialogRef.current?.close();
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      dialogRef.current?.close();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal keluar dari akun:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <Link href="/" className="side-brand">
          <Sprout />
          <span>
            PanenLink
            <small>Agri-Logistics</small>
          </span>
        </Link>

        <nav>
          {nav.map(({ href, key, icon: I }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "side-link active" : "side-link"}
            >
              <I />
              <span>{t(key)}</span>
            </Link>
          ))}
        </nav>

        <nav className="side-bottom">
          {bottom.map(({ href, key, icon: I }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "side-link active" : "side-link"}
              onClick={key === "logout" ? openLogoutDialog : undefined}
            >
              <I />
              <span>{t(key)}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <dialog
        ref={dialogRef}
        className="logout-dialog"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeLogoutDialog();
          }
        }}
        onCancel={(event) => {
          if (isLoggingOut) {
            event.preventDefault();
          }
        }}
      >
        <div className="logout-dialog-content">
          <h2 id="logout-dialog-title">
            {lang === "en" ? "Sign out?" : "Keluar dari akun?"}
          </h2>

          <p id="logout-dialog-description">
            {lang === "en"
              ? "Are you sure you want to sign out of your PanenLink account?"
              : "Apakah Anda yakin ingin keluar dari akun PanenLink?"}
          </p>

          <div className="logout-dialog-actions">
            <button
              ref={cancelButtonRef}
              type="button"
              className="logout-dialog-cancel"
              onClick={closeLogoutDialog}
              disabled={isLoggingOut}
            >
              {lang === "en" ? "Cancel" : "Batal"}
            </button>

            <button
              type="button"
              className="logout-dialog-confirm"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              {isLoggingOut
                ? lang === "en"
                  ? "Signing out..."
                  : "Sedang keluar..."
                : lang === "en"
                  ? "Sign out"
                  : "Keluar"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
