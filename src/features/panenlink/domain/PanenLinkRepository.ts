import type {
  CreateHarvestInput,
  CreateTripInput,
  Harvest,
  Match,
  Notification,
  ParseResult,
  Trip,
} from "./models";
export interface PanenLinkRepository {
  listHarvests(): Promise<Harvest[]>;
  createHarvest(i: CreateHarvestInput): Promise<Harvest>;
  listTrips(): Promise<Trip[]>;
  createTrip(i: CreateTripInput): Promise<Trip>;
  listMatches(): Promise<Match[]>;
  runMatching(): Promise<Match[]>;
  updateMatch(id: string, status: Match["status"]): Promise<void>;
  parseMessage(message: string): Promise<ParseResult>;
  listNotifications(): Promise<Notification[]>;
  markNotificationsRead(): Promise<void>;
  reset(): Promise<void>;
}
