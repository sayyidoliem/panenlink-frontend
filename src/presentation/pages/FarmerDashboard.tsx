import { useState } from "react";
import {
  Package,
  Truck,
  Wallet,
  Leaf,
  Send,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import type { Harvest, Trip, Match } from "../../domain/models";
import { Stat, Badge, Modal, Toast, rupiah } from "../components/UI";
export function FarmerDashboard({
  data,
  actions,
}: {
  data: { harvests: Harvest[]; trips: Trip[]; matches: Match[]; stats: any };
  actions: any;
}) {
  const [modal, setModal] = useState(false),
    [msg, setMsg] = useState("Panen cabai 2 kuintal di Batu, siap besok pagi"),
    [parsed, setParsed] = useState<any>(null),
    [toast, setToast] = useState("");
  const mine = data.harvests.filter(
    (x) => x.farmerId === "F-1" || x.farmerName === "Pak Budi",
  );
  const submit = async () => {
    const p = parsed || (await actions.parseMessage(msg));
    await actions.createHarvest({
      farmerId: "F-1",
      farmerName: "Pak Budi",
      commodity: p.commodity,
      weightKg: p.weightKg,
      location: p.location,
      readyAt: p.readyAt,
      pricePerKg: 44500,
      risk: "Sedang",
    });
    setModal(false);
    setParsed(null);
    setToast("Data panen berhasil dikirim");
    setTimeout(() => setToast(""), 2500);
  };
  return (
    <>
      <div className="welcome">
        <div>
          <Badge>Petani terverifikasi</Badge>
          <h2>Selamat pagi, Pak Budi! 👋</h2>
          <p>
            Laporkan panen Anda, lalu kami carikan truk pulang dengan biaya
            lebih hemat.
          </p>
        </div>
        <button className="primary" onClick={() => setModal(true)}>
          <Package /> Laporkan Panen
        </button>
      </div>
      <div className="stats">
        <Stat
          icon={<Package />}
          title="Panen aktif"
          value={mine.length}
          sub="1 menunggu pencocokan"
        />
        <Stat
          icon={<Truck />}
          title="Truk di sekitar"
          value={data.stats.availableTrucks}
          sub="Radius 35 kilometer"
          tone="blue"
        />
        <Stat
          icon={<Wallet />}
          title="Potensi hemat"
          value="43%"
          sub="Dibanding sewa khusus"
          tone="orange"
        />
        <Stat
          icon={<Leaf />}
          title="Panen terselamatkan"
          value="520 kg"
          sub="Bulan ini"
          tone="purple"
        />
      </div>
      <div className="grid-2">
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>Panen Saya</h3>
              <p>Status laporan dan pengangkutan terbaru</p>
            </div>
            <button className="text-btn" onClick={() => setModal(true)}>
              + Tambah
            </button>
          </div>
          {mine.map((h) => (
            <div className="harvest-row" key={h.id}>
              <div className="crop">🌶️</div>
              <div className="grow">
                <b>{h.commodity}</b>
                <p>
                  <MapPin /> {h.location} · <Clock />{" "}
                  {new Date(h.readyAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <b>{h.weightKg} kg</b>
                <Badge tone={h.status === "Menunggu" ? "orange" : "green"}>
                  {h.status}
                </Badge>
              </div>
            </div>
          ))}
          {!mine.length && <p className="empty">Belum ada panen.</p>}
        </section>
        <section className="panel recommendation">
          <div className="panel-title">
            <div>
              <h3>Rekomendasi Pasar</h3>
              <p>Berdasarkan harga bersih dan jarak</p>
            </div>
            <Sparkles />
          </div>
          <div className="market best">
            <span>1</span>
            <div>
              <b>Pasar Induk Osowilangun</b>
              <p>Surabaya · 98 km</p>
            </div>
            <strong>
              Rp44.500<small>/kg</small>
            </strong>
          </div>
          <div className="market">
            <span>2</span>
            <div>
              <b>Pasar Porong</b>
              <p>Sidoarjo · 76 km</p>
            </div>
            <strong>
              Rp42.800<small>/kg</small>
            </strong>
          </div>
          <div className="saving">
            <span>Estimasi pendapatan bersih</span>
            <b>{rupiah(200 * 44500 - 300000)}</b>
          </div>
        </section>
      </div>
      <section className="panel timeline">
        <div className="panel-title">
          <div>
            <h3>Perjalanan Aktif</h3>
            <p>Pantau status pengiriman Anda</p>
          </div>
        </div>
        <div className="route-map">
          <div className="route-line" />
          <span className="pin p1">
            📦<small>Pujon</small>
          </span>
          <span className="pin p2">
            🚚<small>Singosari</small>
          </span>
          <span className="pin p3">
            🏪<small>Porong</small>
          </span>
        </div>
      </section>
      {modal && (
        <Modal title="Laporkan Hasil Panen" onClose={() => setModal(false)}>
          <div className="chat">
            <div className="chat-note">
              Ceritakan hasil panen dengan bahasa sehari-hari.
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
            />
            <button
              className="secondary"
              onClick={async () => setParsed(await actions.parseMessage(msg))}
            >
              <Sparkles /> Analisis dengan AI
            </button>
            {parsed && (
              <div className="parsed">
                <b>
                  Hasil ekstraksi · keyakinan{" "}
                  {Math.round(parsed.confidence * 100)}%
                </b>
                <div className="form-grid">
                  <label>
                    Komoditas
                    <input
                      value={parsed.commodity}
                      onChange={(e) =>
                        setParsed({ ...parsed, commodity: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Berat (kg)
                    <input
                      type="number"
                      value={parsed.weightKg}
                      onChange={(e) =>
                        setParsed({ ...parsed, weightKg: +e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Lokasi
                    <input
                      value={parsed.location}
                      onChange={(e) =>
                        setParsed({ ...parsed, location: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Siap diambil
                    <input
                      type="datetime-local"
                      value={parsed.readyAt}
                      onChange={(e) =>
                        setParsed({ ...parsed, readyAt: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            )}
            <button className="primary full" onClick={submit}>
              <Send /> Kirim Laporan Panen
            </button>
          </div>
        </Modal>
      )}
      {toast && <Toast text={toast} />}
    </>
  );
}
