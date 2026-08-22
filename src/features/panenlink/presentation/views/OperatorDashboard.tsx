"use client";
import {
  Download,
  Package,
  Play,
  RotateCcw,
  Truck,
  Wallet,
  Waypoints,
} from "lucide-react";
import { useState } from "react";
import type { DashboardData } from "../../domain/models";
import type { PanenLinkController } from "../usePanenLinkController";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRupiah } from "@/shared/lib/format";
import { Stat, Welcome } from "../components/DashboardParts";
export function OperatorDashboard({
  data,
  actions,
}: {
  data: DashboardData;
  actions: PanenLinkController["actions"];
}) {
  const [tab, setTab] = useState<"matches" | "harvests" | "trips">("matches"),
    [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    await actions.runMatching();
    setBusy(false);
  };
  const exp = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.download = "panenlink-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <Welcome
        badge="Operasional normal"
        title="Ringkasan jaringan PanenLink"
        text="Pantau panen, armada, pencocokan, dan dampak ekonomi dalam satu tempat."
        action={
          <div className="actions">
            <Button variant="secondary" onClick={exp}>
              <Download />
              Ekspor
            </Button>
            <Button loading={busy} onClick={() => void run()}>
              <Play />
              Jalankan Optimasi
            </Button>
          </div>
        }
      />
      <div className="stats">
        <Stat
          icon={<Package />}
          title="Panen aktif"
          value={data.stats.activeHarvests}
          sub="Komoditas siap diangkut"
        />
        <Stat
          icon={<Truck />}
          title="Truk tersedia"
          value={data.stats.availableTrucks}
          sub="Kapasitas backhaul"
          tone="blue"
        />
        <Stat
          icon={<Waypoints />}
          title="Berhasil dicocokkan"
          value={`${data.stats.matchedKg} kg`}
          sub={`${data.matches.length} pencocokan`}
          tone="orange"
        />
        <Stat
          icon={<Wallet />}
          title="Hemat petani"
          value={formatRupiah(data.stats.savings)}
          sub="Dibanding sewa khusus"
          tone="purple"
        />
      </div>
      <Card
        title="Data Operasional"
        subtitle="Seluruh data demo tersimpan pada perangkat"
      >
        <div className="tabs">
          {(["matches", "harvests", "trips"] as const).map((x) => (
            <Button
              key={x}
              variant={tab === x ? "secondary" : "ghost"}
              onClick={() => setTab(x)}
            >
              {x === "matches"
                ? "Pencocokan"
                : x === "harvests"
                  ? "Panen"
                  : "Armada"}
            </Button>
          ))}
          <Button
            className="push"
            variant="danger"
            onClick={() => void actions.reset()}
          >
            <RotateCcw />
            Reset
          </Button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {tab === "matches" ? (
                  <>
                    <th>ID</th>
                    <th>Komoditas</th>
                    <th>Petani</th>
                    <th>Pengemudi</th>
                    <th>Biaya</th>
                    <th>Status</th>
                  </>
                ) : tab === "harvests" ? (
                  <>
                    <th>ID</th>
                    <th>Petani</th>
                    <th>Komoditas</th>
                    <th>Lokasi</th>
                    <th>Berat</th>
                    <th>Status</th>
                  </>
                ) : (
                  <>
                    <th>ID</th>
                    <th>Pengemudi</th>
                    <th>Rute</th>
                    <th>Kendaraan</th>
                    <th>Kapasitas</th>
                    <th>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {tab === "matches"
                ? data.matches.map((x) => (
                    <tr key={x.id}>
                      <td>{x.id}</td>
                      <td>{x.commodity}</td>
                      <td>{x.farmerName}</td>
                      <td>{x.driverName}</td>
                      <td>{formatRupiah(x.farmerCost)}</td>
                      <td>
                        <Badge tone="orange">{x.status}</Badge>
                      </td>
                    </tr>
                  ))
                : tab === "harvests"
                  ? data.harvests.map((x) => (
                      <tr key={x.id}>
                        <td>{x.id}</td>
                        <td>{x.farmerName}</td>
                        <td>{x.commodity}</td>
                        <td>{x.location}</td>
                        <td>{x.weightKg} kg</td>
                        <td>
                          <Badge>{x.status}</Badge>
                        </td>
                      </tr>
                    ))
                  : data.trips.map((x) => (
                      <tr key={x.id}>
                        <td>{x.id}</td>
                        <td>{x.driverName}</td>
                        <td>
                          {x.origin} → {x.destination}
                        </td>
                        <td>{x.vehicle}</td>
                        <td>
                          {x.availableKg}/{x.capacityKg} kg
                        </td>
                        <td>
                          <Badge tone="blue">{x.status}</Badge>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
