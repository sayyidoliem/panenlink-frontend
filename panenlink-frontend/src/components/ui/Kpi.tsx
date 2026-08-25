import type { LucideIcon } from "lucide-react";
export function Kpi({
  icon: Icon,
  label,
  value,
  tone = "green",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="kpi">
      <span className={`kpi-icon ${tone}`}>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
