export type Theme = "light" | "dark" | "system";
export type Lang = "id" | "en";
export type AlertTone = "info" | "success" | "warning";
export type LoadStatus = "draft" | "open" | "matched" | "cancelled";
export type ShipmentStatus =
  | "picked_up"
  | "in_transit"
  | "nearby"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export type LoadRow = {
  id: string;
  public_code: string;
  owner_id: string;
  commodity: string;
  weight_kg: number;
  pickup_date: string | null;
  pickup_time: string | null;
  vehicle_type: "Pickup" | "CDE" | "CDD Box" | "Fuso" | "Tronton" | null;
  origin: string | null;
  destination: string | null;
  origin_lat: number | null;
  origin_lon: number | null;
  destination_lat: number | null;
  destination_lon: number | null;
  budget: number | null;
  notes: string | null;
  packaging: string | null;
  dimension_cbm: number | null;
  distance_km: number | null;
  eta_minutes: number | null;
  is_urgent: boolean;
  status: LoadStatus;
  created_at: string;
  updated_at: string;
};

export type ShipmentWithLoad = {
  id: string;
  load_id: string;
  driver_id: string | null;
  driver_name: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  status: ShipmentStatus;
  progress_percent: number;
  eta_minutes: number | null;
  payment_status: PaymentStatus;
  started_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  loads: LoadRow;
};
