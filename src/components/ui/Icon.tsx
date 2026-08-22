import type { LucideIcon } from "lucide-react";
export function Icon({
  icon: Icon,
  size = 20,
}: {
  icon: LucideIcon;
  size?: number;
}) {
  return <Icon size={size} strokeWidth={1.9} />;
}
