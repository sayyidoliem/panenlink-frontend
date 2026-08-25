"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Download, FileText, Package, Phone } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { useApp } from "@/shared/app/AppProvider";
import { createClient } from "@/shared/lib/supabase/client";
import {
  downloadPodPdf,
  downloadSuratJalanPdf,
} from "@/shared/lib/pdfDocuments";

type ShipmentStatus =
  | "picked_up"
  | "in_transit"
  | "nearby"
  | "delivered"
  | "cancelled";

type PaymentStatus = "unpaid" | "paid";

type LoadRow = {
  id: unknown;
  public_code: unknown;
  owner_id: unknown;
  commodity: unknown;
  weight_kg: unknown;
  origin: unknown;
  destination: unknown;
  vehicle_type: unknown;
  eta_minutes: unknown;
  status: unknown;
};

type ShipmentRow = {
  id: unknown;
  load_id: unknown;
  driver_id: unknown;
  driver_name: unknown;
  vehicle_plate: unknown;
  vehicle_type: unknown;
  status: unknown;
  progress_percent: unknown;
  eta_minutes: unknown;
  payment_status: unknown;
  started_at: unknown;
  delivered_at: unknown;
  created_at: unknown;
  updated_at: unknown;
  loads: LoadRow | LoadRow[] | null;
};

type ShipmentEventRow = {
  id: unknown;
  shipment_id: unknown;
  status: unknown;
  step_index: unknown;
  note: unknown;
  created_at: unknown;
};

type ShipmentItem = {
  id: string;
  loadId: string;
  loadUuid: string;
  ownerId: string;
  driverId: string;
  commodity: string;
  weight: string;
  weightKg: number;
  origin: string;
  destination: string;
  driverName: string;
  vehiclePlate: string;
  vehicleType: string;
  status: ShipmentStatus;
  statusLabel: string;
  progressPercent: number;
  etaMinutes: number;
  paymentStatus: PaymentStatus;
  startedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  date: string;
};

const shipmentSteps: {
  status: Exclude<ShipmentStatus, "cancelled">;
  label: string;
  stepIndex: number;
  progress: number;
}[] = [
  {
    status: "picked_up",
    label: "Muatan Diambil",
    stepIndex: 0,
    progress: 0,
  },
  {
    status: "in_transit",
    label: "Dalam Perjalanan",
    stepIndex: 1,
    progress: 33,
  },
  {
    status: "nearby",
    label: "Dekat Lokasi",
    stepIndex: 2,
    progress: 67,
  },
  {
    status: "delivered",
    label: "Terkirim",
    stepIndex: 3,
    progress: 100,
  },
];

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

function getRelatedLoad(value: LoadRow | LoadRow[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeShipmentStatus(value: unknown): ShipmentStatus {
  if (
    value === "picked_up" ||
    value === "in_transit" ||
    value === "nearby" ||
    value === "delivered" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "picked_up";
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
  return value === "paid" ? "paid" : "unpaid";
}

function statusToLabel(status: ShipmentStatus) {
  switch (status) {
    case "picked_up":
      return "Muatan Diambil";

    case "in_transit":
      return "Dalam Perjalanan";

    case "nearby":
      return "Dekat Lokasi";

    case "delivered":
      return "Terkirim";

    case "cancelled":
      return "Dibatalkan";
  }
}

function formatWeight(weightKg: number) {
  return `${(weightKg / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} Ton`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatEta(minutes: number) {
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

function shipmentRowToItem(row: ShipmentRow): ShipmentItem | null {
  const load = getRelatedLoad(row.loads);

  if (!load) {
    return null;
  }

  const status = normalizeShipmentStatus(row.status);

  const weightKg = numberFallback(load.weight_kg);

  const createdAt = textFallback(row.created_at, new Date().toISOString());

  const deliveredAt = nullableText(row.delivered_at);

  return {
    id: String(row.id),
    loadUuid: String(load.id),
    loadId: textFallback(load.public_code),
    ownerId: String(load.owner_id),
    driverId: row.driver_id == null ? "" : String(row.driver_id),
    commodity: textFallback(load.commodity),
    weight: formatWeight(weightKg),
    weightKg,
    origin: textFallback(load.origin),
    destination: textFallback(load.destination, "Tujuan belum ditentukan"),
    driverName: textFallback(row.driver_name, "Pengemudi"),
    vehiclePlate: textFallback(row.vehicle_plate, "-"),
    vehicleType: textFallback(row.vehicle_type ?? load.vehicle_type, "-"),
    status,
    statusLabel: statusToLabel(status),
    progressPercent: Math.min(
      100,
      Math.max(0, numberFallback(row.progress_percent)),
    ),
    etaMinutes: numberFallback(row.eta_minutes ?? load.eta_minutes),
    paymentStatus: normalizePaymentStatus(row.payment_status),
    startedAt: nullableText(row.started_at),
    deliveredAt,
    createdAt,
    date: formatDate(deliveredAt ?? createdAt),
  };
}

function getCurrentStep(status: ShipmentStatus) {
  if (status === "cancelled") {
    return 0;
  }

  const index = shipmentSteps.findIndex((step) => step.status === status);

  return index < 0 ? 0 : index;
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
  const supabase = useMemo(() => createClient(), []);

  const { account, pushAlert } = useApp();

  const [tab, setTab] = useState("running");

  const [shipments, setShipments] = useState<ShipmentItem[]>([]);

  const [shipmentEvents, setShipmentEvents] = useState<
    Record<string, ShipmentEventRow[]>
  >({});

  const [currentUserId, setCurrentUserId] = useState("");

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const loadShipments = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setCurrentUserId("");
        setShipments([]);
        setShipmentEvents({});
        return;
      }

      setCurrentUserId(user.id);

      const { data: ownedLoadRows, error: ownedLoadsError } = await supabase
        .from("loads")
        .select("id")
        .eq("owner_id", user.id);

      if (ownedLoadsError) {
        throw ownedLoadsError;
      }

      const ownedLoadIds = (ownedLoadRows ?? []).map((load: { id: unknown }) =>
        String(load.id),
      );

      const driverQuery = supabase
        .from("shipments")
        .select(
          `
                id,
                load_id,
                driver_id,
                driver_name,
                vehicle_plate,
                vehicle_type,
                status,
                progress_percent,
                eta_minutes,
                payment_status,
                started_at,
                delivered_at,
                created_at,
                updated_at,
                loads (
                  id,
                  public_code,
                  owner_id,
                  commodity,
                  weight_kg,
                  origin,
                  destination,
                  vehicle_type,
                  eta_minutes,
                  status
                )
              `,
        )
        .eq("driver_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      const ownerQuery =
        ownedLoadIds.length > 0
          ? supabase
              .from("shipments")
              .select(
                `
                    id,
                    load_id,
                    driver_id,
                    driver_name,
                    vehicle_plate,
                    vehicle_type,
                    status,
                    progress_percent,
                    eta_minutes,
                    payment_status,
                    started_at,
                    delivered_at,
                    created_at,
                    updated_at,
                    loads (
                      id,
                      public_code,
                      owner_id,
                      commodity,
                      weight_kg,
                      origin,
                      destination,
                      vehicle_type,
                      eta_minutes,
                      status
                    )
                  `,
              )
              .in("load_id", ownedLoadIds)
              .order("created_at", {
                ascending: false,
              })
          : Promise.resolve({
              data: [],
              error: null,
            });

      const [driverResult, ownerResult] = await Promise.all([
        driverQuery,
        ownerQuery,
      ]);

      if (driverResult.error) {
        throw driverResult.error;
      }

      if (ownerResult.error) {
        throw ownerResult.error;
      }

      const combinedRows = [
        ...((driverResult.data ?? []) as unknown as ShipmentRow[]),
        ...((ownerResult.data ?? []) as unknown as ShipmentRow[]),
      ];

      const uniqueRows = Array.from(
        new Map(combinedRows.map((row) => [String(row.id), row])).values(),
      );

      const items = uniqueRows
        .map(shipmentRowToItem)
        .filter((item): item is ShipmentItem => item !== null)
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        );

      setShipments(items);

      const shipmentIds = items.map((shipment) => shipment.id);

      if (shipmentIds.length === 0) {
        setShipmentEvents({});
        return;
      }

      const { data: eventRows, error: eventsError } = await supabase
        .from("shipment_events")
        .select(
          [
            "id",
            "shipment_id",
            "status",
            "step_index",
            "note",
            "created_at",
          ].join(","),
        )
        .in("shipment_id", shipmentIds)
        .order("step_index", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (eventsError) {
        throw eventsError;
      }

      const groupedEvents = ((eventRows ?? []) as ShipmentEventRow[]).reduce<
        Record<string, ShipmentEventRow[]>
      >((result, event) => {
        const shipmentId = String(event.shipment_id);

        result[shipmentId] = [...(result[shipmentId] ?? []), event];

        return result;
      }, {});

      setShipmentEvents(groupedEvents);
    } catch (error) {
      console.error("Pengiriman gagal dimuat:", error);

      setShipments([]);
      setShipmentEvents({});

      window.alert(`Pengiriman gagal dimuat. ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    const shipmentChannel = supabase
      .channel("orders-shipments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        () => {
          void loadShipments();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_events",
        },
        () => {
          void loadShipments();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(shipmentChannel);
    };
  }, [loadShipments, supabase]);

  const runningShipments = useMemo(
    () =>
      shipments.filter(
        (shipment) =>
          shipment.status !== "delivered" && shipment.status !== "cancelled",
      ),
    [shipments],
  );

  const completedShipments = useMemo(
    () => shipments.filter((shipment) => shipment.status === "delivered"),
    [shipments],
  );

  const cancelledShipments = useMemo(
    () => shipments.filter((shipment) => shipment.status === "cancelled"),
    [shipments],
  );

  const activeShipment = runningShipments[0] ?? null;

  const currentStep = activeShipment
    ? getCurrentStep(activeShipment.status)
    : 0;

  const activeEvents = activeShipment
    ? (shipmentEvents[activeShipment.id] ?? [])
    : [];

  const historyShipments =
    tab === "done"
      ? completedShipments
      : tab === "cancel"
        ? cancelledShipments
        : completedShipments;

  const isActiveDriver = Boolean(
    activeShipment && activeShipment.driverId === currentUserId,
  );

  const driverPhone = account.phone === "0" ? "" : account.phone;

  const whatsappUrl =
    activeShipment && driverPhone
      ? `https://wa.me/${driverPhone}?text=${encodeURIComponent(
          `Halo, saya ingin membahas muatan #${activeShipment.loadId}`,
        )}`
      : "";

  const advanceShipmentStatus = async () => {
    if (!activeShipment || updating) {
      return;
    }

    if (!isActiveDriver) {
      window.alert("Hanya pengemudi yang dapat memperbarui status pengiriman.");

      return;
    }

    const nextStep =
      shipmentSteps[Math.min(shipmentSteps.length - 1, currentStep + 1)];

    if (activeShipment.status === nextStep.status) {
      return;
    }

    setUpdating(true);

    try {
      const timestamp = new Date().toISOString();

      const { data: updatedShipment, error: updateError } = await supabase
        .from("shipments")
        .update({
          status: nextStep.status,
          progress_percent: nextStep.progress,
          delivered_at: nextStep.status === "delivered" ? timestamp : null,
        })
        .eq("id", activeShipment.id)
        .eq("driver_id", currentUserId)
        .eq("status", activeShipment.status)
        .select("id")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!updatedShipment) {
        throw new Error(
          "Status pengiriman telah berubah. Data akan dimuat ulang.",
        );
      }

      const { error: eventError } = await supabase
        .from("shipment_events")
        .insert({
          shipment_id: activeShipment.id,
          status: nextStep.status,
          step_index: nextStep.stepIndex,
          note: `Status diperbarui menjadi ${nextStep.label}.`,
        });

      if (eventError) {
        console.error("Event pengiriman gagal dicatat:", eventError);
      }

      if (nextStep.status === "delivered") {
        const { error: deliveredLoadError } = await supabase
          .from("loads")
          .update({
            status: "matched",
          })
          .eq("id", activeShipment.loadUuid);

        if (deliveredLoadError) {
          console.error(
            "Status muatan gagal disinkronkan:",
            deliveredLoadError,
          );
        }
      }

      pushAlert({
        title: "Status pengiriman diperbarui",
        body: `${activeShipment.loadId} sekarang berstatus ${nextStep.label}.`,
        tone: nextStep.status === "delivered" ? "success" : "info",
      });

      await loadShipments();
    } catch (error) {
      console.error("Status pengiriman gagal diperbarui:", error);

      window.alert(`Status gagal diperbarui. ${getErrorMessage(error)}`);

      await loadShipments();
    } finally {
      setUpdating(false);
    }
  };

  const createDocumentData = (shipment: ShipmentItem) => ({
    loadId: shipment.loadId,
    commodity: shipment.commodity,
    weight: shipment.weight,
    origin: shipment.origin,
    destination: shipment.destination,
    driverName: shipment.driverName,
    vehiclePlate: shipment.vehiclePlate,
    vehicleType: shipment.vehicleType,
    status: shipment.statusLabel,
    date: shipment.date,
  });

  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Riwayat & Pelacakan Muatan"
          description="Pantau armada dan dokumen pengiriman."
        />

        <div className="tabs order-tabs">
          {[
            ["running", "Berjalan"],
            ["done", "Selesai"],
            ["cancel", "Dibatalkan"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "running" && activeShipment ? (
          <section className="card tracking">
            <div>
              <header>
                <span>
                  <h2>
                    {activeShipment.commodity} {activeShipment.weight}
                  </h2>

                  <p>#{activeShipment.loadId}</p>
                </span>

                <i>
                  <Clock />
                  ETA: {formatEta(activeShipment.etaMinutes)}
                </i>
              </header>

              <ol>
                {shipmentSteps.map((shipmentStep, index) => {
                  const hasEvent = activeEvents.some(
                    (event) =>
                      Number(event.step_index) === shipmentStep.stepIndex ||
                      event.status === shipmentStep.status,
                  );

                  return (
                    <li
                      key={shipmentStep.status}
                      className={
                        index < currentStep || (hasEvent && index < currentStep)
                          ? "done"
                          : index === currentStep
                            ? "active"
                            : ""
                      }
                    >
                      {shipmentStep.label}
                    </li>
                  );
                })}
              </ol>

              <footer>
                <span className="avatar lg">
                  {activeShipment.driverName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "DR"}
                </span>

                <div>
                  <b>{activeShipment.driverName}</b>

                  <small>{activeShipment.vehiclePlate}</small>
                </div>

                <a
                  href={whatsappUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => {
                    if (!whatsappUrl) {
                      event.preventDefault();

                      window.alert("Nomor WhatsApp belum tersedia.");
                    }
                  }}
                >
                  <Phone />
                  WA
                </a>

                <button
                  type="button"
                  className="button primary"
                  onClick={() =>
                    downloadSuratJalanPdf(createDocumentData(activeShipment))
                  }
                >
                  <FileText />
                  Surat Jalan
                </button>

                <button
                  type="button"
                  className="button secondary"
                  onClick={() => void advanceShipmentStatus()}
                  disabled={
                    updating ||
                    !isActiveDriver ||
                    activeShipment.status === "delivered"
                  }
                >
                  Perbarui Status
                </button>
              </footer>
            </div>

            <RouteMap key={activeShipment.id} initial={activeShipment.origin} />
          </section>
        ) : (
          <div className="empty-load">
            <h2>
              {loading
                ? "Memuat pengiriman"
                : tab === "done"
                  ? completedShipments.length > 0
                    ? "Pengiriman selesai"
                    : "Belum ada pengiriman selesai"
                  : tab === "cancel"
                    ? cancelledShipments.length > 0
                      ? "Pengiriman dibatalkan"
                      : "Tidak ada pembatalan"
                    : "Tidak ada pengiriman berjalan"}
            </h2>
          </div>
        )}

        <h2>Riwayat Pengiriman</h2>

        {historyShipments.map((shipment) => (
          <article className="history" key={shipment.id}>
            <Package />

            <div>
              <b>
                {shipment.commodity} {shipment.weight}
              </b>

              <small>
                {shipment.origin} → {shipment.destination}
              </small>
            </div>

            <i>
              {shipment.status === "delivered"
                ? shipment.paymentStatus === "paid"
                  ? "Selesai/Lunas"
                  : "Selesai/Belum Lunas"
                : "Dibatalkan"}
            </i>

            <button
              type="button"
              onClick={() => downloadPodPdf(createDocumentData(shipment))}
              disabled={shipment.status !== "delivered"}
            >
              <Download />
              POD
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
