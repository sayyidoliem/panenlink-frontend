import { useEffect, useMemo, useState } from "react";
import { LocalPanenLinkRepository } from "../infrastructure/repositories/LocalPanenLinkRepository";
import { PanenLinkUseCases } from "../application/useCases";
import type {
  Harvest,
  Trip,
  Match,
  Role,
  Notification,
} from "../domain/models";
import { Layout } from "./components/Layout";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { DriverDashboard } from "./pages/DriverDashboard";
import { OperatorDashboard } from "./pages/OperatorDashboard";
const uc = new PanenLinkUseCases(new LocalPanenLinkRepository());
export function App() {
  const [role, setRole] = useState<Role>("operator");
  const [data, setData] = useState<{
    harvests: Harvest[];
    trips: Trip[];
    matches: Match[];
    stats: any;
  } | null>(null);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    setData(await uc.getDashboard());
    setNotes(await uc.notifications());
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  const actions = useMemo(
    () => ({
      createHarvest: async (x: any) => {
        await uc.createHarvest(x);
        await refresh();
      },
      createTrip: async (x: any) => {
        await uc.createTrip(x);
        await refresh();
      },
      runMatching: async () => {
        await uc.runMatching();
        await refresh();
      },
      updateMatch: async (id: string, s: Match["status"]) => {
        await uc.updateMatch(id, s);
        await refresh();
      },
      parseMessage: uc.parseMessage,
      reset: async () => {
        await uc.reset();
        await refresh();
      },
      read: async () => {
        await uc.readNotifications();
        await refresh();
      },
    }),
    [],
  );
  return (
    <Layout
      role={role}
      setRole={setRole}
      notifications={notes.filter((n) => n.role === role || n.role === "all")}
      onRead={actions.read}
    >
      {loading || !data ? (
        <div className="loading">
          <span />
          Memuat PanenLink...
        </div>
      ) : role === "farmer" ? (
        <FarmerDashboard data={data} actions={actions} />
      ) : role === "driver" ? (
        <DriverDashboard data={data} actions={actions} />
      ) : (
        <OperatorDashboard data={data} actions={actions} />
      )}
    </Layout>
  );
}
