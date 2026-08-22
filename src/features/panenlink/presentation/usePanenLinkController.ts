"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CreateHarvestInput,
  CreateTripInput,
  DashboardData,
  Match,
  Notification,
  ParseResult,
  Role,
} from "../domain/models";
import { LocalPanenLinkRepository } from "../infrastructure/LocalPanenLinkRepository";
import { PanenLinkUseCases } from "../application/PanenLinkUseCases";
export function usePanenLinkController() {
  const useCases = useMemo(
    () => new PanenLinkUseCases(new LocalPanenLinkRepository()),
    [],
  );
  const [role, setRole] = useState<Role>("operator"),
    [data, setData] = useState<DashboardData | null>(null),
    [notifications, setNotifications] = useState<Notification[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [d, n] = await Promise.all([
        useCases.getDashboard(),
        useCases.notifications(),
      ]);
      setData(d);
      setNotifications(n);
    } catch {
      setError("Data PanenLink gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [useCases]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const execute = useCallback(
    async (task: () => Promise<unknown>) => {
      await task();
      await refresh();
    },
    [refresh],
  );
  return {
    role,
    setRole,
    data,
    notifications: notifications.filter(
      (n) => n.role === role || n.role === "all",
    ),
    loading,
    error,
    actions: {
      createHarvest: (x: CreateHarvestInput) =>
        execute(() => useCases.createHarvest(x)),
      createTrip: (x: CreateTripInput) => execute(() => useCases.createTrip(x)),
      runMatching: () => execute(() => useCases.runMatching()),
      updateMatch: (id: string, s: Match["status"]) =>
        execute(() => useCases.updateMatch(id, s)),
      parseMessage: (m: string): Promise<ParseResult> =>
        useCases.parseMessage(m),
      read: () => execute(() => useCases.readNotifications()),
      reset: () => execute(() => useCases.reset()),
    },
  };
}
export type PanenLinkController = ReturnType<typeof usePanenLinkController>;
