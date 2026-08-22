"use client";
import { Package, Plus, Route, Truck, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { DashboardData } from "../../domain/models";
import type { PanenLinkController } from "../usePanenLinkController";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah } from "@/shared/lib/format";
import { Stat, Welcome } from "../components/DashboardParts";
export function DriverDashboard({
  data,
  actions,
}: {
  data: DashboardData;
  actions: PanenLinkController["actions"];
}) {
  const [open, setOpen] = useState(false);
  const offers = data.matches.filter((x) => x.status === "Ditawarkan");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await actions.createTrip({
      driverId: "D-1",
      driverName: "Andi Pratama",
      vehicle: String(f.get("vehicle")),
      plate: String(f.get("plate")),
      origin: String(f.get("origin")),
      destination: String(f.get("destination")),
      capacityKg: Number(f.get("capacity")),
      departureAt: String(f.get("departure")),
      maxDetourKm: Number(f.get("detour")),
    });
    setOpen(false);
  };
  return (
    <>
      <Welcome
        badge="Pengemudi aktif"
        title="Halo, Andi! Siap isi perjalanan pulang?"
        text="Ambil muatan di sepanjang rute dan dapatkan pendapatan tambahan."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Tambah Perjalanan
          </Button>
        }
      />
      <div className="stats">
        <Stat
          icon={<Wallet />}
          title="Pendapatan"
          value="Rp2,84 jt"
          sub="Bulan ini"
        />
        <Stat
          icon={<Package />}
          title="Muatan"
          value="1.240 kg"
          sub="7 pengiriman"
          tone="blue"
        />
        <Stat
          icon={<Route />}
          title="Rata-rata detour"
          value="13,2 km"
          sub="Di bawah batas"
          tone="orange"
        />
        <Stat
          icon={<Truck />}
          title="Kapasitas"
          value="1.800 kg"
          sub="Tersedia"
          tone="purple"
        />
      </div>
      <Card
        title="Penawaran Muatan"
        subtitle="Rekomendasi terbaik di sepanjang rute"
      >
        <div className="offer-grid">
          {offers.map((m) => (
            <article className="offer" key={m.id}>
              <div>
                <span className="emoji">🧅</span>
                <h3>
                  {m.commodity} · {m.weightKg} kg
                </h3>
                <p>
                  {m.pickup} → {m.destination}
                </p>
                <strong>+{formatRupiah(m.driverRevenue)}</strong>
              </div>
              <div className="actions">
                <Button
                  variant="danger"
                  onClick={() => void actions.updateMatch(m.id, "Ditolak")}
                >
                  Tolak
                </Button>
                <Button
                  onClick={() => void actions.updateMatch(m.id, "Diterima")}
                >
                  Terima
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Card>
      {open && (
        <Modal title="Tambah Perjalanan Pulang" onClose={() => setOpen(false)}>
          <form className="form grid" onSubmit={submit}>
            <label>
              Asal
              <input name="origin" defaultValue="Malang" required />
            </label>
            <label>
              Tujuan
              <input name="destination" defaultValue="Surabaya" required />
            </label>
            <label>
              Kendaraan
              <input name="vehicle" defaultValue="Colt Diesel Box" required />
            </label>
            <label>
              Nomor polisi
              <input name="plate" defaultValue="N 8421 UX" required />
            </label>
            <label>
              Kapasitas
              <input
                name="capacity"
                type="number"
                defaultValue="1800"
                required
              />
            </label>
            <label>
              Detour maks.
              <input name="detour" type="number" defaultValue="25" required />
            </label>
            <label className="full">
              Waktu berangkat
              <input
                name="departure"
                type="datetime-local"
                defaultValue="2026-08-02T08:00"
                required
              />
            </label>
            <Button className="full" type="submit">
              Publikasikan
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
