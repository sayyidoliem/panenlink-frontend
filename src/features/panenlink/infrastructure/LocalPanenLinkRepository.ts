import type { PanenLinkRepository } from "../domain/PanenLinkRepository";
import type {
  CreateHarvestInput,
  CreateTripInput,
  Harvest,
  Match,
  Notification,
  ParseResult,
  Trip,
} from "../domain/models";
import * as seed from "./seed";
const K = {
  h: "pl_harvests",
  t: "pl_trips",
  m: "pl_matches",
  n: "pl_notifications",
} as const;
const delay = () => new Promise((r) => setTimeout(r, 180));
export class LocalPanenLinkRepository implements PanenLinkRepository {
  private read<T>(key: string, fallback: T): T {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    const value = structuredClone(fallback);
    this.write(key, value);
    return value;
  }
  private write(key: string, value: unknown) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  async listHarvests() {
    await delay();
    return this.read(K.h, seed.harvests);
  }
  async createHarvest(input: CreateHarvestInput) {
    const item: Harvest = {
      ...input,
      id: `H-${Date.now().toString().slice(-5)}`,
      status: "Menunggu",
    };
    this.write(K.h, [item, ...(await this.listHarvests())]);
    return item;
  }
  async listTrips() {
    return this.read(K.t, seed.trips);
  }
  async createTrip(input: CreateTripInput) {
    const item: Trip = {
      ...input,
      id: `T-${Date.now().toString().slice(-4)}`,
      status: "Tersedia",
      availableKg: input.capacityKg,
    };
    this.write(K.t, [item, ...(await this.listTrips())]);
    return item;
  }
  async listMatches() {
    return this.read(K.m, seed.matches);
  }
  async runMatching() {
    const h = (await this.listHarvests()).find((x) => x.status === "Menunggu");
    const t = (await this.listTrips()).find(
      (x) => x.status === "Tersedia" && x.availableKg >= (h?.weightKg ?? 0),
    );
    if (!h || !t) return this.listMatches();
    const cost = h.weightKg * 1500;
    const item: Match = {
      id: `M-${Date.now().toString().slice(-4)}`,
      harvestId: h.id,
      tripId: t.id,
      farmerName: h.farmerName,
      driverName: t.driverName,
      commodity: h.commodity,
      weightKg: h.weightKg,
      pickup: h.location,
      destination: "Pasar Induk Osowilangun",
      detourKm: 12.6,
      eta: "2j 25m",
      farmerCost: cost,
      baselineCost: Math.round(cost * 1.72),
      driverRevenue: Math.round(cost * 0.92),
      platformFee: Math.round(cost * 0.08),
      status: "Ditawarkan",
    };
    this.write(K.m, [item, ...(await this.listMatches())]);
    this.write(
      K.h,
      (await this.listHarvests()).map((x) =>
        x.id === h.id ? { ...x, status: "Cocok" } : x,
      ),
    );
    this.write(
      K.t,
      (await this.listTrips()).map((x) =>
        x.id === t.id ? { ...x, status: "Ditawarkan" } : x,
      ),
    );
    return [item, ...(await this.listMatches())];
  }
  async updateMatch(id: string, status: Match["status"]) {
    const all = await this.listMatches();
    this.write(
      K.m,
      all.map((x) => (x.id === id ? { ...x, status } : x)),
    );
    if (status === "Diterima") {
      const match = all.find((x) => x.id === id);
      if (match)
        this.write(
          K.t,
          (await this.listTrips()).map((x) =>
            x.id === match.tripId ? { ...x, status: "Berjalan" } : x,
          ),
        );
    }
  }
  async parseMessage(message: string): Promise<ParseResult> {
    await delay();
    const low = message.toLowerCase();
    const commodity =
      ["cabai", "bawang", "tomat", "kentang", "kol"].find((x) =>
        low.includes(x),
      ) ?? "cabai merah";
    const num = Number(low.match(/\d+/)?.[0] ?? 200);
    const weightKg = low.includes("kuintal")
      ? num * 100
      : low.includes("ton")
        ? num * 1000
        : num;
    return {
      commodity: commodity.replace(/^./, (c) => c.toUpperCase()),
      weightKg,
      location: (
        message.match(/(?:di|dari)\s+([A-Za-z ,]+)/i)?.[1] ?? "Batu, Malang"
      ).trim(),
      readyAt: "2026-08-02T07:00",
      confidence: 0.94,
    };
  }
  async listNotifications() {
    return this.read(K.n, seed.notifications);
  }
  async markNotificationsRead() {
    this.write(
      K.n,
      (await this.listNotifications()).map((x) => ({ ...x, read: true })),
    );
  }
  async reset() {
    Object.values(K).forEach((k) => window.localStorage.removeItem(k));
  }
}
