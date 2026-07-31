import type { PanenLinkRepository } from "../../domain/repositories/PanenLinkRepository";
import type {
  Harvest,
  Trip,
  Match,
  Notification,
  ParseResult,
} from "../../domain/models";
import * as seed from "../data/seed";
const K = {
  h: "pl_harvests",
  t: "pl_trips",
  m: "pl_matches",
  n: "pl_notifications",
};
const wait = () => new Promise((r) => setTimeout(r, 250));
const read = <T>(k: string, f: T): T => {
  const v = localStorage.getItem(k);
  if (v) return JSON.parse(v);
  localStorage.setItem(k, JSON.stringify(f));
  return structuredClone(f);
};
const write = (k: string, v: unknown) =>
  localStorage.setItem(k, JSON.stringify(v));
export class LocalPanenLinkRepository implements PanenLinkRepository {
  async listHarvests() {
    await wait();
    return read(K.h, seed.harvests);
  }
  async createHarvest(input: Omit<Harvest, "id" | "status">) {
    const x = {
      ...input,
      id: `H-${Date.now().toString().slice(-5)}`,
      status: "Menunggu" as const,
    };
    const all = await this.listHarvests();
    write(K.h, [x, ...all]);
    return x;
  }
  async listTrips() {
    return read(K.t, seed.trips);
  }
  async createTrip(input: Omit<Trip, "id" | "status" | "availableKg">) {
    const x = {
      ...input,
      id: `T-${Date.now().toString().slice(-4)}`,
      status: "Tersedia" as const,
      availableKg: input.capacityKg,
    };
    const all = await this.listTrips();
    write(K.t, [x, ...all]);
    return x;
  }
  async listMatches() {
    return read(K.m, seed.matches);
  }
  async runMatching() {
    await wait();
    const h = (await this.listHarvests()).find((x) => x.status === "Menunggu");
    const t = (await this.listTrips()).find(
      (x) => x.status === "Tersedia" && x.availableKg >= (h?.weightKg || 0),
    );
    if (!h || !t) return this.listMatches();
    const cost = Math.round(h.weightKg * 1500);
    const m: Match = {
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
    const ms = await this.listMatches();
    write(K.m, [m, ...ms]);
    write(
      K.h,
      (await this.listHarvests()).map((x) =>
        x.id === h.id ? { ...x, status: "Cocok" } : x,
      ),
    );
    write(
      K.t,
      (await this.listTrips()).map((x) =>
        x.id === t.id ? { ...x, status: "Ditawarkan" } : x,
      ),
    );
    return [m, ...ms];
  }
  async updateMatch(id: string, status: Match["status"]) {
    const ms = await this.listMatches();
    write(
      K.m,
      ms.map((x) => (x.id === id ? { ...x, status } : x)),
    );
    if (status === "Diterima") {
      const m = ms.find((x) => x.id === id);
      if (m)
        write(
          K.t,
          (await this.listTrips()).map((x) =>
            x.id === m.tripId ? { ...x, status: "Berjalan" } : x,
          ),
        );
    }
  }
  async parseMessage(message: string): Promise<ParseResult> {
    await wait();
    const low = message.toLowerCase();
    const commodity =
      ["cabai", "bawang", "tomat", "kentang", "kol"].find((x) =>
        low.includes(x),
      ) || "Cabai Merah";
    const num = Number((low.match(/\d+/) || ["200"])[0]);
    const weightKg = low.includes("kuintal")
      ? num * 100
      : low.includes("ton")
        ? num * 1000
        : num;
    const location = (
      message.match(/(?:di|dari)\s+([A-Za-z ]+)/i)?.[1] || "Batu, Malang"
    ).trim();
    return {
      commodity: commodity.replace(/^./, (c) => c.toUpperCase()),
      weightKg,
      location,
      readyAt: "2026-08-02T07:00",
      confidence: 0.94,
    };
  }
  async listNotifications() {
    return read(K.n, seed.notifications);
  }
  async markNotificationsRead() {
    write(
      K.n,
      (await this.listNotifications()).map((x) => ({ ...x, read: true })),
    );
  }
  async reset() {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
  }
}
