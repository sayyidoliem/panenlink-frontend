export type Role = "farmer" | "driver" | "operator";
export type HarvestStatus = "Menunggu" | "Cocok" | "Dijemput" | "Terkirim";
export interface User {
  id: string;
  name: string;
  role: Role;
  location: string;
}
export interface Harvest {
  id: string;
  farmerId: string;
  farmerName: string;
  commodity: string;
  weightKg: number;
  location: string;
  readyAt: string;
  status: HarvestStatus;
  pricePerKg: number;
  risk: "Rendah" | "Sedang" | "Tinggi";
}
export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  vehicle: string;
  plate: string;
  origin: string;
  destination: string;
  capacityKg: number;
  availableKg: number;
  departureAt: string;
  maxDetourKm: number;
  status: "Tersedia" | "Ditawarkan" | "Berjalan" | "Selesai";
}
export interface Match {
  id: string;
  harvestId: string;
  tripId: string;
  farmerName: string;
  driverName: string;
  commodity: string;
  weightKg: number;
  pickup: string;
  destination: string;
  detourKm: number;
  eta: string;
  farmerCost: number;
  baselineCost: number;
  driverRevenue: number;
  platformFee: number;
  status: "Ditawarkan" | "Diterima" | "Ditolak" | "Selesai";
}
export interface Notification {
  id: string;
  role: Role | "all";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
export interface DashboardStats {
  activeHarvests: number;
  availableTrucks: number;
  matchedKg: number;
  savings: number;
}
export interface ParseResult {
  commodity: string;
  weightKg: number;
  location: string;
  readyAt: string;
  confidence: number;
}
