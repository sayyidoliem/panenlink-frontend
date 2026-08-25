import { createClient } from "@/shared/lib/supabase/client";
import type {
  LoadRow,
  ShipmentWithLoad,
} from "@/shared/lib/supabase/database-types";

const supabase = () => createClient();
export async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase().auth.getUser();
  if (error || !user)
    throw error ?? new Error("Sesi pengguna tidak ditemukan.");
  return user;
}
export async function listOpenLoads(): Promise<LoadRow[]> {
  const { data, error } = await supabase()
    .from("loads")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LoadRow[];
}
export async function getLoad(publicCode: string) {
  const { data, error } = await supabase()
    .from("loads")
    .select(
      "*, load_requirements(requirement), profiles!loads_owner_id_fkey(name,phone,location)",
    )
    .eq("public_code", publicCode)
    .single();
  if (error) throw error;
  return data;
}
export async function createLoad(
  input: Omit<
    LoadRow,
    "id" | "owner_id" | "public_code" | "created_at" | "updated_at"
  >,
  requirements: string[],
) {
  const user = await requireUser();
  const public_code = `LOAD-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
  const { data, error } = await supabase()
    .from("loads")
    .insert({ ...input, owner_id: user.id, public_code })
    .select("*")
    .single();
  if (error) throw error;
  if (requirements.length) {
    const { error: requirementError } = await supabase()
      .from("load_requirements")
      .insert(
        requirements.map((requirement) => ({ load_id: data.id, requirement })),
      );
    if (requirementError) {
      await supabase().from("loads").delete().eq("id", data.id);
      throw requirementError;
    }
  }
  await supabase().rpc("refresh_profile_metrics", { target_user: user.id });
  return data as LoadRow;
}
export async function listMyShipments(): Promise<ShipmentWithLoad[]> {
  const user = await requireUser();
  const { data, error } = await supabase()
    .from("shipments")
    .select("*, loads(*)")
    .or(`driver_id.eq.${user.id},loads.owner_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ShipmentWithLoad[];
}
export async function addShipmentEvent(
  shipmentId: string,
  status: string,
  stepIndex: number,
  note?: string,
) {
  const progress = Math.min(100, Math.max(0, stepIndex * 33));
  const { error } = await supabase()
    .from("shipment_events")
    .insert({
      shipment_id: shipmentId,
      status,
      step_index: stepIndex,
      note: note ?? null,
    });
  if (error) throw error;
  const { error: updateError } = await supabase()
    .from("shipments")
    .update({
      status,
      progress_percent: status === "delivered" ? 100 : progress,
      delivered_at: status === "delivered" ? new Date().toISOString() : null,
    })
    .eq("id", shipmentId);
  if (updateError) throw updateError;
}
