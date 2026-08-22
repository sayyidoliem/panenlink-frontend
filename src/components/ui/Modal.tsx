"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";

import { Button } from "./Button";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const stopPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={stopPropagation}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>

          <Button
            type="button"
            variant="ghost"
            aria-label="Tutup dialog"
            onClick={onClose}
          >
            ×
          </Button>
        </div>

        {children}
      </section>
    </div>
  );
}
