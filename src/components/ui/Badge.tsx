import type { ReactNode } from "react";
export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "orange" | "red";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
