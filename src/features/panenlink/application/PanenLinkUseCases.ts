import type { PanenLinkRepository } from "../domain/PanenLinkRepository";
import type {
  CreateHarvestInput,
  CreateTripInput,
  DashboardData,
  Match,
} from "../domain/models";
export class PanenLinkUseCases {
  constructor(private readonly repository: PanenLinkRepository) {}
  async getDashboard(): Promise<DashboardData> {
    const [harvests, trips, matches] = await Promise.all([
      this.repository.listHarvests(),
      this.repository.listTrips(),
      this.repository.listMatches(),
    ]);
    const valid = matches.filter((x) => x.status !== "Ditolak");
    return {
      harvests,
      trips,
      matches,
      stats: {
        activeHarvests: harvests.filter((x) => x.status !== "Terkirim").length,
        availableTrucks: trips.filter((x) =>
          ["Tersedia", "Ditawarkan"].includes(x.status),
        ).length,
        matchedKg: valid.reduce((a, b) => a + b.weightKg, 0),
        savings: valid.reduce((a, b) => a + b.baselineCost - b.farmerCost, 0),
      },
    };
  }
  createHarvest(i: CreateHarvestInput) {
    return this.repository.createHarvest(i);
  }
  createTrip(i: CreateTripInput) {
    return this.repository.createTrip(i);
  }
  runMatching() {
    return this.repository.runMatching();
  }
  updateMatch(id: string, s: Match["status"]) {
    return this.repository.updateMatch(id, s);
  }
  parseMessage(m: string) {
    return this.repository.parseMessage(m);
  }
  notifications() {
    return this.repository.listNotifications();
  }
  readNotifications() {
    return this.repository.markNotificationsRead();
  }
  reset() {
    return this.repository.reset();
  }
}
