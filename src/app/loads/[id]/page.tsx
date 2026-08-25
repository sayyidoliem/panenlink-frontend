"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Route, Clock, Truck, Info, Lock, MessageCircle } from "lucide-react";
import { useCallback, useMemo, useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/shared/app/AppProvider";
import { createClient } from "@/shared/lib/supabase/client";

type VehicleType = "Pickup" | "CDE" | "CDD Box" | "Fuso" | "Tronton";

type RequirementRow = {
  requirement: unknown;
};

type OwnerRow = {
  id?: unknown;
  name?: unknown;
  phone?: unknown;
  location?: unknown;
};

type LoadDetailRow = {
  id: unknown;
  public_code: unknown;
  owner_id: unknown;
  commodity: unknown;
  weight_kg: unknown;
  pickup_date: unknown;
  pickup_time: unknown;
  vehicle_type: unknown;
  origin: unknown;
  destination: unknown;
  budget: unknown;
  notes: unknown;
  packaging: unknown;
  dimension_cbm: unknown;
  distance_km: unknown;
  eta_minutes: unknown;
  is_urgent: unknown;
  status: unknown;
  load_requirements: RequirementRow[] | null;
  profiles: OwnerRow | OwnerRow[] | null;
};

type LoadDetail = {
  id: string;
  publicCode: string;
  ownerId: string;
  commodity: string;
  weightKg: number;
  pickupDate: string | null;
  pickupTime: string | null;
  vehicleType: VehicleType | null;
  origin: string;
  destination: string;
  budget: number;
  notes: string;
  packaging: string;
  dimensionCbm: number;
  distanceKm: number;
  etaMinutes: number;
  urgent: boolean;
  status: string;
  requirements: string[];
  owner: {
    name: string;
    phone: string;
    location: string;
  };
};

function textFallback(value: unknown, fallback = "-") {
  if (typeof value !== "string") {
    return fallback;
  }

  const result = value.trim();

  return result || fallback;
}

function nullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result || null;
}

function numberFallback(value: unknown) {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = `62${phone.slice(1)}`;
  }

  return phone;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return value.slice(0, 5);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = Math.round(minutes % 60);

  if (hours <= 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}j ${remainingMinutes}m`;
}

function getOwner(value: OwnerRow | OwnerRow[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

export default function Page() {
  const params = useParams<{
    id: string;
  }>();

  const supabase = useMemo(() => createClient(), []);

  const { account, pushAlert } = useApp();

  const publicCode =
    typeof params.id === "string" ? decodeURIComponent(params.id) : "";

  const [load, setLoad] = useState<LoadDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [taking, setTaking] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!publicCode) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("loads")
        .select(
          `
                id,
                public_code,
                owner_id,
                commodity,
                weight_kg,
                pickup_date,
                pickup_time,
                vehicle_type,
                origin,
                destination,
                budget,
                notes,
                packaging,
                dimension_cbm,
                distance_km,
                eta_minutes,
                is_urgent,
                status,
                load_requirements (
                  requirement
                ),
                profiles!loads_owner_id_fkey (
                  id,
                  name,
                  phone,
                  location
                )
              `,
        )
        .eq("public_code", publicCode)
        .single();

      if (error) {
        throw error;
      }

      const row = data as unknown as LoadDetailRow;

      const rawOwner = getOwner(row.profiles);

      setLoad({
        id: String(row.id),
        publicCode: textFallback(row.public_code),
        ownerId: String(row.owner_id),
        commodity: textFallback(row.commodity),
        weightKg: numberFallback(row.weight_kg),
        pickupDate: nullableText(row.pickup_date),
        pickupTime: nullableText(row.pickup_time),
        vehicleType:
          row.vehicle_type === "Pickup" ||
          row.vehicle_type === "CDE" ||
          row.vehicle_type === "CDD Box" ||
          row.vehicle_type === "Fuso" ||
          row.vehicle_type === "Tronton"
            ? row.vehicle_type
            : null,
        origin: textFallback(row.origin),
        destination: textFallback(row.destination, "Tujuan belum ditentukan"),
        budget: numberFallback(row.budget),
        notes: textFallback(row.notes, "Tidak ada catatan tambahan."),
        packaging: textFallback(row.packaging, "Belum ditentukan"),
        dimensionCbm: numberFallback(row.dimension_cbm),
        distanceKm: numberFallback(row.distance_km),
        etaMinutes: numberFallback(row.eta_minutes),
        urgent: Boolean(row.is_urgent),
        status: textFallback(row.status),
        requirements: (row.load_requirements ?? [])
          .map((requirement) => textFallback(requirement.requirement, ""))
          .filter(Boolean),
        owner: {
          name: textFallback(rawOwner?.name, "Pemilik Muatan"),
          phone: normalizePhone(rawOwner?.phone),
          location: textFallback(rawOwner?.location),
        },
      });
    } catch (error) {
      console.error("Detail muatan gagal dimuat:", error);

      setLoad(null);
    } finally {
      setLoading(false);
    }
  }, [publicCode, supabase]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const takeLoad = async () => {
    if (!load || taking) {
      return;
    }

    setTaking(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      if (load.ownerId === user.id) {
        throw new Error("Pemilik tidak dapat mengambil muatannya sendiri.");
      }

      if (load.status !== "open") {
        throw new Error("Muatan ini sudah tidak tersedia.");
      }

      const { data: existingShipment, error: existingError } = await supabase
        .from("shipments")
        .select("id")
        .eq("load_id", load.id)
        .neq("status", "cancelled")
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingShipment) {
        throw new Error("Muatan ini sudah diambil oleh pengemudi lain.");
      }

      const { data: createdShipment, error: shipmentError } = await supabase
        .from("shipments")
        .insert({
          load_id: load.id,
          driver_id: user.id,
          driver_name: account.name === "-" ? null : account.name,
          vehicle_plate: null,
          vehicle_type: load.vehicleType,
          status: "picked_up",
          progress_percent: 0,
          eta_minutes: load.etaMinutes > 0 ? load.etaMinutes : null,
          payment_status: "unpaid",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (shipmentError) {
        throw shipmentError;
      }

      const { error: eventError } = await supabase
        .from("shipment_events")
        .insert({
          shipment_id: createdShipment.id,
          status: "picked_up",
          step_index: 0,
          note: "Muatan diambil oleh pengemudi.",
        });

      if (eventError) {
        await supabase.from("shipments").delete().eq("id", createdShipment.id);

        throw eventError;
      }

      const { data: updatedLoad, error: loadError } = await supabase
        .from("loads")
        .update({
          status: "matched",
        })
        .eq("id", load.id)
        .eq("status", "open")
        .select("id")
        .maybeSingle();

      if (loadError) {
        throw loadError;
      }

      if (!updatedLoad) {
        await supabase
          .from("shipment_events")
          .delete()
          .eq("shipment_id", createdShipment.id);

        await supabase.from("shipments").delete().eq("id", createdShipment.id);

        throw new Error("Muatan baru saja diambil oleh pengguna lain.");
      }

      pushAlert({
        title: "Muatan berhasil diambil",
        body: `${load.commodity} dengan ID ${load.publicCode} masuk ke daftar pesanan Anda.`,
        tone: "success",
      });

      window.alert("Muatan berhasil diambil.");

      window.location.href = "/orders";
    } catch (error) {
      console.error("Muatan gagal diambil:", error);

      window.alert(`Muatan gagal diambil. ${getErrorMessage(error)}`);

      await loadDetail();
    } finally {
      setTaking(false);
    }
  };

  const openWhatsApp = () => {
    if (!load) {
      return;
    }

    if (!load.owner.phone) {
      window.alert("Nomor WhatsApp pengirim belum tersedia.");

      return;
    }

    const message = encodeURIComponent(
      `Halo ${load.owner.name}, saya ingin membahas muatan ${load.commodity} dengan ID ${load.publicCode}.`,
    );

    const whatsappUrl = `https://wa.me/${load.owner.phone}?text=${message}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <AppShell>
        <div className="loading">Memuat detail muatan...</div>
      </AppShell>
    );
  }

  if (!load) {
    return (
      <AppShell>
        <div className="page">
          <Link href="/loads">/loads Kembali ke Cari Muatan</Link>

          <div className="empty-load">
            <h2>Muatan tidak ditemukan</h2>

            <p>Muatan mungkin sudah dihapus atau tidak dapat diakses.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const requirementText =
    load.requirements.length > 0 ? load.requirements.join(". ") : load.notes;

  return (
    <AppShell>
      <div className="page">
        <Link href="/loads">/loads Kembali ke Cari Muatan</Link>

        <div className="page-header">
          <div>
            <h1>
              {load.commodity} ({(load.weightKg / 1000).toFixed(1)} Ton){" "}
              {load.urgent && <i className="urgent">Urgent Pick-up</i>}
            </h1>

            <p>ID #{load.publicCode}</p>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <section className="card">
              <h2>Detail Rute & Waktu</h2>

              <div className="timeline">
                <article>
                  <small>PENGAMBILAN</small>

                  <h3>{load.origin}</h3>

                  <p>Pemilik: {load.owner.name}</p>

                  <b>
                    {formatDate(load.pickupDate)} •{" "}
                    {formatTime(load.pickupTime)} WIB
                  </b>
                </article>

                <article>
                  <small>PENGIRIMAN</small>

                  <h3>{load.destination}</h3>

                  <p>Tujuan pengiriman</p>

                  <b>Jadwal mengikuti kesepakatan</b>
                </article>
              </div>

              <div className="metrics">
                <span>
                  <Route />
                  {load.distanceKm > 0
                    ? `${load.distanceKm.toLocaleString("id-ID")} km`
                    : "-"}
                </span>

                <span>
                  <Clock />
                  {formatDuration(load.etaMinutes)}
                </span>

                <span>
                  <Truck />
                  {load.vehicleType ?? "-"}
                </span>
              </div>
            </section>

            <section className="card cargo">
              <h2>Detail Muatan</h2>

              <div>
                <span>
                  <small>Jenis Komoditas</small>

                  {load.commodity}
                </span>

                <span>
                  <small>Total Berat</small>
                  {(load.weightKg / 1000).toFixed(1)} Ton
                </span>

                <span>
                  <small>Kemasan</small>

                  {load.packaging}
                </span>

                <span>
                  <small>Dimensi</small>

                  {load.dimensionCbm > 0
                    ? `${load.dimensionCbm.toLocaleString("id-ID")} CBM`
                    : "-"}
                </span>
              </div>

              <p>
                <Info />
                {requirementText}
              </p>
            </section>
          </div>

          <aside className="card earnings">
            <h2>Ringkasan Pendapatan</h2>

            <strong>
              {load.budget > 0
                ? `Rp ${load.budget.toLocaleString("id-ID")}`
                : "Anggaran terbuka"}
            </strong>

            <p>
              Tarif Dasar
              <b>
                {load.budget > 0
                  ? `Rp ${load.budget.toLocaleString("id-ID")}`
                  : "-"}
              </b>
            </p>

            <p>
              Bonus Urgent
              <b>{load.urgent ? "Termasuk penawaran" : "Rp 0"}</b>
            </p>

            <button
              type="button"
              className="button secondary full"
              onClick={() => void takeLoad()}
              disabled={taking || load.status !== "open"}
            >
              AMBIL MUATAN INI
            </button>

            <button
              type="button"
              className="button outline full"
              onClick={openWhatsApp}
            >
              <MessageCircle />
              Chat Pengirim
            </button>

            <small>
              <Lock />
              Pembayaran dijamin aman oleh Escrow
            </small>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
