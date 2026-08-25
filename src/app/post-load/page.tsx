"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteMap } from "@/components/maps/RouteMap";
import { useApp } from "@/shared/app/AppProvider";
import { createClient } from "@/shared/lib/supabase/client";

const vehicles = ["Pickup", "CDE", "CDD Box", "Fuso", "Tronton"] as const;

type VehicleType = (typeof vehicles)[number];

type Place = {
  label: string;
  lat: number;
  lon: number;
};

type LoadStatus = "draft" | "open";

type LoadInsert = {
  public_code: string;
  owner_id: string;
  commodity: string;
  weight_kg: number;
  pickup_date: string;
  pickup_time: string;
  vehicle_type: VehicleType;
  origin: string;
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
};

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

function generatePublicCode() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const random = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();

  return `LOAD-${year}${month}${day}-${random}`;
}

function normalizeNullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result || null;
}

function normalizeNullableNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const result = Number(normalized);

  return Number.isFinite(result) ? result : null;
}

export default function Page() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const { pushAlert } = useApp();

  const [location, setLocation] = useState("Garut");

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const saveLoad = async (form: HTMLFormElement, status: LoadStatus) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Sesi pengguna tidak ditemukan. Silakan masuk kembali.",
        );
      }

      const formData = new FormData(form);

      const commodity = String(formData.get("commodity") ?? "").trim();

      const weight = Number(formData.get("weight") ?? 0);

      const pickupDate = String(formData.get("date") ?? "").trim();

      const pickupTime = String(formData.get("time") ?? "").trim();

      const rawVehicle = String(formData.get("vehicle") ?? "");

      const vehicle = vehicles.includes(rawVehicle as VehicleType)
        ? (rawVehicle as VehicleType)
        : null;

      const budget = normalizeNullableNumber(formData.get("budget"));

      const notes = normalizeNullableText(formData.get("notes"));

      const requirements = Array.from(
        new Set(
          formData
            .getAll("special")
            .map((item) => String(item).trim())
            .filter(Boolean),
        ),
      );

      if (!commodity) {
        throw new Error("Komoditas wajib dipilih.");
      }

      if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error("Berat muatan harus lebih dari 0 kg.");
      }

      if (!pickupDate) {
        throw new Error("Tanggal pengambilan wajib diisi.");
      }

      if (!pickupTime) {
        throw new Error("Waktu pengambilan wajib diisi.");
      }

      if (!vehicle) {
        throw new Error("Jenis kendaraan wajib dipilih.");
      }

      if (budget !== null && budget < 0) {
        throw new Error("Anggaran tidak boleh bernilai negatif.");
      }

      const loadData: LoadInsert = {
        public_code: generatePublicCode(),
        owner_id: user.id,
        commodity,
        weight_kg: weight,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        vehicle_type: vehicle,
        origin: location.trim() || "Garut",
        destination: null,
        origin_lat: selectedPlace?.lat ?? null,
        origin_lon: selectedPlace?.lon ?? null,
        destination_lat: null,
        destination_lon: null,
        budget,
        notes,
        packaging: null,
        dimension_cbm: null,
        distance_km: null,
        eta_minutes: null,
        is_urgent: false,
        status,
      };

      const { data: createdLoad, error: loadError } = await supabase
        .from("loads")
        .insert(loadData)
        .select("id,public_code,status")
        .single();

      if (loadError) {
        throw loadError;
      }

      if (requirements.length > 0) {
        const { error: requirementError } = await supabase
          .from("load_requirements")
          .insert(
            requirements.map((requirement) => ({
              load_id: createdLoad.id,
              requirement,
            })),
          );

        if (requirementError) {
          const { error: rollbackError } = await supabase
            .from("loads")
            .delete()
            .eq("id", createdLoad.id)
            .eq("owner_id", user.id);

          if (rollbackError) {
            console.error("Rollback muatan gagal:", rollbackError);
          }

          throw requirementError;
        }
      }

      const { error: metricError } = await supabase.rpc(
        "refresh_profile_metrics",
        {
          target_user: user.id,
        },
      );

      if (metricError) {
        console.error("Metrik profil gagal diperbarui:", metricError);
      }

      if (status === "draft") {
        setSaved(true);

        pushAlert({
          title: "Draft muatan disimpan",
          body: `${commodity} ${weight.toLocaleString(
            "id-ID",
          )} kg telah disimpan sebagai draft.`,
          tone: "info",
        });

        window.alert("Draft muatan berhasil disimpan.");

        return;
      }

      pushAlert({
        title: "Muatan berhasil diterbitkan",
        body: `${commodity} dengan ID ${createdLoad.public_code} telah tersedia untuk dicari armada.`,
        tone: "success",
      });

      window.alert("Muatan berhasil diterbitkan.");

      router.push("/orders");
      router.refresh();
    } catch (error) {
      console.error("Muatan gagal disimpan:", error);

      window.alert(`Muatan gagal disimpan. ${getErrorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void saveLoad(event.currentTarget, "open");
  };

  const saveDraft = () => {
    const form = document.querySelector<HTMLFormElement>(".post-grid");

    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    void saveLoad(form, "draft");
  };

  return (
    <AppShell>
      <div className="page">
        <Link href="/dashboard">/dashboard Kembali</Link>

        <PageHeader
          title="Pasang Muatan Baru"
          description="Isi detail panen dan pilih lokasi pengambilan."
        />

        <form className="post-grid" onSubmit={submit}>
          <div>
            <section className="card form-section">
              <h2>Detail Hasil Panen</h2>

              <div className="form-grid">
                <label>
                  Komoditas
                  <select name="commodity" required disabled={submitting}>
                    <option value="">Pilih</option>

                    <option>Cabai</option>

                    <option>Bawang Merah</option>

                    <option>Tomat</option>
                  </select>
                </label>

                <label>
                  Berat (kg)
                  <input
                    name="weight"
                    type="number"
                    min="1"
                    step="1"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Tanggal
                  <input
                    name="date"
                    type="date"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Waktu
                  <input
                    name="time"
                    type="time"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            <section className="card form-section">
              <h2>Armada</h2>

              <div className="vehicle-grid">
                {vehicles.map((vehicle, index) => (
                  <label key={vehicle}>
                    <input
                      type="radio"
                      name="vehicle"
                      value={vehicle}
                      required
                      defaultChecked={index === 2}
                      disabled={submitting}
                    />

                    <span>
                      <Truck />
                      {vehicle}
                    </span>
                  </label>
                ))}
              </div>

              <div className="checks">
                {["Terpal Kedap Air", "Pendingin", "Muat Bongkar Sendiri"].map(
                  (requirement) => (
                    <label className="check" key={requirement}>
                      <input
                        name="special"
                        value={requirement}
                        type="checkbox"
                        disabled={submitting}
                      />

                      {requirement}
                    </label>
                  ),
                )}
              </div>
            </section>
          </div>

          <aside>
            <section className="card form-section">
              <h2>Lokasi & Penawaran</h2>

              <input
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                hidden
              />

              <RouteMap
                initial={location}
                onPick={(place) => {
                  setLocation(place.label);
                  setSelectedPlace(place);
                  setSaved(false);
                }}
              />

              <label>
                Anggaran
                <input
                  name="budget"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Rp 0"
                  disabled={submitting}
                />
              </label>

              <label>
                Catatan
                <textarea name="notes" rows={4} disabled={submitting} />
              </label>
            </section>

            <div className="action-row">
              <button
                type="button"
                className="button outline"
                onClick={saveDraft}
                disabled={submitting}
              >
                {saved ? "Draft Tersimpan" : "Simpan Draft"}
              </button>

              <button
                className="button secondary"
                type="submit"
                disabled={submitting}
              >
                Terbitkan
              </button>
            </div>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}
