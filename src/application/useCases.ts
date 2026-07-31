import type { PanenLinkRepository } from "../domain/repositories/PanenLinkRepository";
export class PanenLinkUseCases {
  constructor(private repo: PanenLinkRepository) {}
  getDashboard = async () => {
    const [h, t, m] = await Promise.all([
      this.repo.listHarvests(),
      this.repo.listTrips(),
      this.repo.listMatches(),
    ]);
    return {
      harvests: h,
      trips: t,
      matches: m,
      stats: {
        activeHarvests: h.filter((x) => x.status !== "Terkirim").length,
        availableTrucks: t.filter(
          (x) => x.status === "Tersedia" || x.status === "Ditawarkan",
        ).length,
        matchedKg: m
          .filter((x) => x.status !== "Ditolak")
          .reduce((a, b) => a + b.weightKg, 0),
        savings: m
          .filter((x) => x.status !== "Ditolak")
          .reduce((a, b) => a + b.baselineCost - b.farmerCost, 0),
      },
    };
  };
  createHarvest = (x: Parameters<PanenLinkRepository["createHarvest"]>[0]) =>
    this.repo.createHarvest(x);
  createTrip = (x: Parameters<PanenLinkRepository["createTrip"]>[0]) =>
    this.repo.createTrip(x);
  runMatching = () => this.repo.runMatching();
  updateMatch = (
    id: string,
    s: Parameters<PanenLinkRepository["updateMatch"]>[1],
  ) => this.repo.updateMatch(id, s);
  parseMessage = (m: string) => this.repo.parseMessage(m);
  notifications = () => this.repo.listNotifications();
  readNotifications = () => this.repo.markNotificationsRead();
  reset = () => this.repo.reset();
}
