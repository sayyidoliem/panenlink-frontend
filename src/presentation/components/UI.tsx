import type { ReactNode } from "react";
export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export function Stat({
  icon,
  title,
  value,
  sub,
  tone = "green",
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  sub: string;
  tone?: string;
}) {
  return (
    <article className="stat">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <small>{sub}</small>
      </div>
    </article>
  );
}
export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Toast({ text }: { text: string }) {
  return <div className="toast">✓ {text}</div>;
}
