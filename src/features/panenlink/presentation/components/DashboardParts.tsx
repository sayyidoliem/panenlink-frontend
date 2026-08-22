import type { ReactNode } from "react";
export function Welcome({
  badge,
  title,
  text,
  action,
}: {
  badge: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <section className="welcome">
      <div>
        <span className="pill">{badge}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {action}
    </section>
  );
}
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
