"use client";
import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = old;
    };
  }, [onClose]);
  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <Button variant="ghost" aria-label="Tutup" onClick={onClose}>
            ×
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
