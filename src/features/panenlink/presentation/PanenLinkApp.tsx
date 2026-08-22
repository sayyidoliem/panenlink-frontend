"use client";
import { LayoutDashboard, Sprout, Truck } from "lucide-react";
import { usePanenLinkController } from "./usePanenLinkController";
import { AppShell } from "./components/AppShell";
import { OperatorDashboard } from "./views/OperatorDashboard";
import { FarmerDashboard } from "./views/FarmerDashboard";
import { DriverDashboard } from "./views/DriverDashboard";
export function PanenLinkApp() {
  const c = usePanenLinkController();
  return (
    <AppShell
      role={c.role}
      setRole={c.setRole}
      notifications={c.notifications}
      onRead={c.actions.read}
    >
      {c.loading ? (
        <div className="loading">Memuat PanenLink...</div>
      ) : c.error ? (
        <div className="error">{c.error}</div>
      ) : c.data ? (
        c.role === "operator" ? (
          <OperatorDashboard data={c.data} actions={c.actions} />
        ) : c.role === "farmer" ? (
          <FarmerDashboard data={c.data} actions={c.actions} />
        ) : (
          <DriverDashboard data={c.data} actions={c.actions} />
        )
      ) : null}
    </AppShell>
  );
}
