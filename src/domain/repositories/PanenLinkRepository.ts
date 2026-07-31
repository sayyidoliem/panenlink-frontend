import type {
  Harvest,
  Trip,
  Match,
  Notification,
  ParseResult,
} from "../models";
export interface PanenLinkRepository {
  listHarvests(): Promise<Harvest[]>;
  createHarvest(input: Omit<Harvest, "id" | "status">): Promise<Harvest>;
  listTrips(): Promise<Trip[]>;
  createTrip(input: Omit<Trip, "id" | "status" | "availableKg">): Promise<Trip>;
  listMatches(): Promise<Match[]>;
  runMatching(): Promise<Match[]>;
  updateMatch(id: string, status: Match["status"]): Promise<void>;
  parseMessage(message: string): Promise<ParseResult>;
  listNotifications(): Promise<Notification[]>;
  markNotificationsRead(): Promise<void>;
  reset(): Promise<void>;
}
