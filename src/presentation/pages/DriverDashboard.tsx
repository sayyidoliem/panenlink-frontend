import { useState } from "react";
import {
  Truck,
  Route,
  Wallet,
  Package,
  MapPin,
  Clock,
  Plus,
} from "lucide-react";
import type { Harvest, Trip, Match } from "../../domain/models";
import { Stat, Badge, Modal, Toast, rupiah } from "../components/UI";
export function DriverDashboard({
  data,
  actions,
}: {
  data: { harvests: Harvest[]; trips: Trip[]; matches: Match[]; stats: any };
  actions: any;
}) {
  const [modal, setModal] = useState(false),
    [toast, setToast] = useState("");
  const offers = data.matches.filter((x) => x.status === "Ditawarkan");
  const change = async (id: string, s: "Diterima" | "Ditolak") => {
    await actions.updateMatch(id, s);
    setToast(
      s === "Diterima"
        ? "Muatan diterima, rute diperbarui"
        : "Penawaran ditolak",
    );
    setTimeout(() => setToast(""), 2400);
  };
  const submit = async (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await actions.createTrip({
      driverId: "D-1",
      driverName: "Andi Pratama",
      vehicle: String(f.get("vehicle")),
      plate: String(f.get("plate")),
      origin: String(f.get("origin")),
      destination: String(f.get("destination")),
      capacityKg: +String(f.get("capacity")),
      departureAt: String(f.get("departure")),
      maxDetourKm: +String(f.get("detour")),
    });
    setModal(false);
    setToast("Perjalanan pulang tersedia");
    setTimeout(() => setToast(""), 2400);
  };
  return (
    <>
      <div className="welcome">
        <div>
          <Badge tone="blue">Pengemudi aktif</Badge>
          <h2>Halo, Andi! Siap isi perjalanan pulang?</h2>
          <p>
            Ambil muatan di sepanjang rute dan dapatkan pendapatan tambahan.
          </p>
        </div>
        <button className="primary" onClick={() => setModal(true)}>
          <Plus /> Tambah Perjalanan
        </button>
      </div>
      <div className="stats">
        <Stat
          icon={<Wallet />}
          title="Pendapatan bulan ini"
          value="Rp2,84 jt"
          sub="+18% dari bulan lalu"
        />
        <Stat
          icon={<Package />}
          title="Muatan terangkut"
          value="1.240 kg"
          sub="7 pengiriman"
          tone="blue"
        />
        <Stat
          icon={<Route />}
          title="Rata-rata detour"
          value="13,2 km"
          sub="Di bawah batas 25 km"
          tone="orange"
        />
        <Stat
          icon={<Truck />}
          title="Kapasitas tersedia"
          value="1.800 kg"
          sub="Perjalanan berikutnya"
          tone="purple"
        />
      </div>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>Penawaran Muatan</h3>
            <p>Rekomendasi terbaik di sepanjang rute Anda</p>
          </div>
          <Badge tone="orange">{offers.length} baru</Badge>
        </div>
        <div className="offers">
          {offers.map((m) => (
            <article className="offer" key={m.id}>
              <div className="offer-top">
                <div className="crop">🧅</div>
                <div className="grow">
                  <h3>
                    {m.commodity} · {m.weightKg} kg
                  </h3>
                  <p>{m.farmerName}</p>
                </div>
                <strong>+{rupiah(m.driverRevenue)}</strong>
              </div>
              <div className="offer-route">
                <span>
                  <MapPin /> Pickup
                  <br />
                  <b>{m.pickup}</b>
                </span>
                <div className="dash">+{m.detourKm} km</div>
                <span>
                  <Truck /> Tujuan
                  <br />
                  <b>{m.destination}</b>
                </span>
              </div>
              <div className="offer-meta">
                <span>
                  <Clock /> ETA {m.eta}
                </span>
                <span>
                  Kapasitas terpakai {Math.round((m.weightKg / 1800) * 100)}%
                </span>
              </div>
              <div className="offer-actions">
                <button
                  className="danger"
                  onClick={() => change(m.id, "Ditolak")}
                >
                  Tolak
                </button>
                <button
                  className="primary"
                  onClick={() => change(m.id, "Diterima")}
                >
                  Terima Muatan
                </button>
              </div>
            </article>
          ))}
          {!offers.length && <p className="empty">Belum ada penawaran baru.</p>}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>Perjalanan Saya</h3>
            <p>Riwayat dan jadwal perjalanan pulang</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Rute</th>
                <th>Kendaraan</th>
                <th>Kapasitas</th>
                <th>Berangkat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.trips
                .filter((x) => x.driverId === "D-1")
                .map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>
                      <b>
                        {t.origin} → {t.destination}
                      </b>
                    </td>
                    <td>
                      {t.vehicle}
                      <small>{t.plate}</small>
                    </td>
                    <td>
                      {t.availableKg}/{t.capacityKg} kg
                    </td>
                    <td>{new Date(t.departureAt).toLocaleString("id-ID")}</td>
                    <td>
                      <Badge tone="blue">{t.status}</Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {modal && (
        <Modal
          title="Tambahkan Perjalanan Pulang"
          onClose={() => setModal(false)}
        >
          <form onSubmit={submit} className="form-grid">
            <label>
              Asal
              <input name="origin" required defaultValue="Malang" />
            </label>
            <label>
              Tujuan
              <input name="destination" required defaultValue="Surabaya" />
            </label>
            <label>
              Jenis kendaraan
              <input name="vehicle" required defaultValue="Colt Diesel Box" />
            </label>
            <label>
              Nomor polisi
              <input name="plate" required defaultValue="N 8421 UX" />
            </label>
            <label>
              Kapasitas kosong (kg)
              <input
                name="capacity"
                type="number"
                required
                defaultValue="1800"
              />
            </label>
            <label>
              Maksimum detour (km)
              <input name="detour" type="number" required defaultValue="25" />
            </label>
            <label className="full-field">
              Waktu berangkat
              <input
                name="departure"
                type="datetime-local"
                required
                defaultValue="2026-08-02T08:00"
              />
            </label>
            <button className="primary full-field" type="submit">
              Publikasikan Perjalanan
            </button>
          </form>
        </Modal>
      )}
      {toast && <Toast text={toast} />}
    </>
  );
}
