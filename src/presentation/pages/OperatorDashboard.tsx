import { useState } from "react";
import {
  Package,
  Truck,
  Waypoints,
  Wallet,
  Play,
  Download,
  RotateCcw,
  MapPin,
} from "lucide-react";
import type { Harvest, Trip, Match } from "../../domain/models";
import { Stat, Badge, Toast, rupiah } from "../components/UI";
export function OperatorDashboard({
  data,
  actions,
}: {
  data: { harvests: Harvest[]; trips: Trip[]; matches: Match[]; stats: any };
  actions: any;
}) {
  const [tab, setTab] = useState("matches"),
    [toast, setToast] = useState("");
  const run = async () => {
    await actions.runMatching();
    setToast("Optimasi selesai dan rekomendasi baru dibuat");
    setTimeout(() => setToast(""), 2500);
  };
  const exp = () => {
    const b = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      }),
      u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = "panenlink-export.json";
    a.click();
    URL.revokeObjectURL(u);
  };
  return (
    <>
      <div className="welcome operator">
        <div>
          <Badge>Operasional normal</Badge>
          <h2>Ringkasan jaringan PanenLink</h2>
          <p>
            Pantau panen, armada, pencocokan, dan dampak ekonomi dalam satu
            tempat.
          </p>
        </div>
        <div className="toolbar">
          <button className="secondary" onClick={exp}>
            <Download /> Ekspor
          </button>
          <button className="primary" onClick={run}>
            <Play /> Jalankan Optimasi
          </button>
        </div>
      </div>
      <div className="stats">
        <Stat
          icon={<Package />}
          title="Panen aktif"
          value={data.stats.activeHarvests}
          sub="970 kg total"
        />
        <Stat
          icon={<Truck />}
          title="Truk tersedia"
          value={data.stats.availableTrucks}
          sub="4.030 kg kapasitas"
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
          value={rupiah(data.stats.savings)}
          sub="43% rata-rata"
          tone="purple"
        />
      </div>
      <div className="grid-main">
        <section className="panel map-panel">
          <div className="panel-title">
            <div>
              <h3>Peta Operasional</h3>
              <p>Koridor Malang, Kediri, Surabaya</p>
            </div>
            <Badge tone="blue">Live simulation</Badge>
          </div>
          <div className="ops-map">
            <div className="road r1" />
            <div className="road r2" />
            <span className="map-dot farmer f1">
              🌶️<small>Batu · 200 kg</small>
            </span>
            <span className="map-dot farmer f2">
              🧅<small>Nganjuk · 450 kg</small>
            </span>
            <span className="map-dot truck-dot t1">
              🚚<small>TRK-208</small>
            </span>
            <span className="map-dot market-dot mm1">
              🏪<small>Surabaya</small>
            </span>
          </div>
        </section>
        <section className="panel activity">
          <div className="panel-title">
            <div>
              <h3>Dampak Hari Ini</h3>
              <p>Estimasi dari pencocokan aktif</p>
            </div>
          </div>
          <div className="impact">
            <b>520 kg</b>
            <span>Potensi food loss dicegah</span>
          </div>
          <div className="impact">
            <b>186 km</b>
            <span>Perjalanan kosong dialihkan</span>
          </div>
          <div className="impact">
            <b>42,8 kg</b>
            <span>Estimasi CO₂ dihindari</span>
          </div>
          <div className="progress">
            <span>
              Target muatan harian <b>68%</b>
            </span>
            <i>
              <em />
            </i>
          </div>
        </section>
      </div>
      <section className="panel data-panel">
        <div className="tabs">
          <button
            className={tab === "matches" ? "active" : ""}
            onClick={() => setTab("matches")}
          >
            Hasil Pencocokan
          </button>
          <button
            className={tab === "harvests" ? "active" : ""}
            onClick={() => setTab("harvests")}
          >
            Daftar Panen
          </button>
          <button
            className={tab === "trips" ? "active" : ""}
            onClick={() => setTab("trips")}
          >
            Armada Backhaul
          </button>
          <button
            className="reset"
            onClick={async () => {
              await actions.reset();
              setToast("Data demo dikembalikan");
            }}
          >
            <RotateCcw /> Reset demo
          </button>
        </div>
        <div className="table-wrap">
          {tab === "matches" ? (
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Petani & komoditas</th>
                  <th>Pengemudi</th>
                  <th>Rute</th>
                  <th>Biaya / hemat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.matches.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <b>{m.id}</b>
                      <small>{m.weightKg} kg</small>
                    </td>
                    <td>
                      <b>{m.farmerName}</b>
                      <small>{m.commodity}</small>
                    </td>
                    <td>
                      {m.driverName}
                      <small>{m.tripId}</small>
                    </td>
                    <td>
                      <MapPin /> {m.pickup}
                      <small>
                        Detour {m.detourKm} km · {m.eta}
                      </small>
                    </td>
                    <td>
                      <b>{rupiah(m.farmerCost)}</b>
                      <small className="green-text">
                        Hemat {rupiah(m.baselineCost - m.farmerCost)}
                      </small>
                    </td>
                    <td>
                      <Badge
                        tone={m.status === "Diterima" ? "green" : "orange"}
                      >
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "harvests" ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Petani</th>
                  <th>Komoditas</th>
                  <th>Lokasi</th>
                  <th>Siap</th>
                  <th>Risiko</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.harvests.map((h) => (
                  <tr key={h.id}>
                    <td>{h.id}</td>
                    <td>
                      <b>{h.farmerName}</b>
                    </td>
                    <td>
                      {h.commodity}
                      <small>{h.weightKg} kg</small>
                    </td>
                    <td>{h.location}</td>
                    <td>{new Date(h.readyAt).toLocaleString("id-ID")}</td>
                    <td>
                      <Badge tone={h.risk === "Tinggi" ? "red" : "orange"}>
                        {h.risk}
                      </Badge>
                    </td>
                    <td>
                      <Badge>{h.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pengemudi</th>
                  <th>Rute</th>
                  <th>Kendaraan</th>
                  <th>Kapasitas</th>
                  <th>Detour</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.trips.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>
                      <b>{t.driverName}</b>
                    </td>
                    <td>
                      {t.origin} → {t.destination}
                    </td>
                    <td>
                      {t.vehicle}
                      <small>{t.plate}</small>
                    </td>
                    <td>
                      {t.availableKg}/{t.capacityKg} kg
                    </td>
                    <td>{t.maxDetourKm} km</td>
                    <td>
                      <Badge tone="blue">{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      {toast && <Toast text={toast} />}
    </>
  );
}
