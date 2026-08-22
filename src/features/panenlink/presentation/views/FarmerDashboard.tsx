"use client";
import { Leaf, Package, Send, Sparkles, Truck, Wallet } from "lucide-react";
import { useState } from "react";
import type { DashboardData, ParseResult } from "../../domain/models";
import type { PanenLinkController } from "../usePanenLinkController";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Stat, Welcome } from "../components/DashboardParts";
export function FarmerDashboard({
  data,
  actions,
}: {
  data: DashboardData;
  actions: PanenLinkController["actions"];
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(
      "Panen cabai 2 kuintal di Batu, siap besok pagi",
    ),
    [parsed, setParsed] = useState<ParseResult | null>(null);
  const mine = data.harvests.filter((x) => x.farmerId === "F-1");
  const submit = async () => {
    const p = parsed ?? (await actions.parseMessage(message));
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
    setOpen(false);
    setParsed(null);
  };
  return (
    <>
      <Welcome
        badge="Petani terverifikasi"
        title="Selamat datang, Pak Budi"
        text="Laporkan panen, lalu kami carikan truk pulang dengan biaya lebih hemat."
        action={
          <Button onClick={() => setOpen(true)}>
            <Package />
            Laporkan Panen
          </Button>
        }
      />
      <div className="stats">
        <Stat
          icon={<Package />}
          title="Panen aktif"
          value={mine.length}
          sub="Laporan Petani"
        />
        <Stat
          icon={<Truck />}
          title="Truk sekitar"
          value={data.stats.availableTrucks}
          sub="Radius 35 km"
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
      <Card>
        <header className="card-header">
          <div>
            <h2>Panen Saya</h2>
            <p>Status laporan terbaru</p>
          </div>
        </header>
        {mine.map((h) => (
          <article className="list-row" key={h.id}>
            <span className="emoji">🌶️</span>
            <div>
              <b>{h.commodity}</b>
              <p>
                {h.location} · {h.weightKg} kg
              </p>
            </div>
            <Badge tone={h.status === "Menunggu" ? "orange" : "green"}>
              {h.status}
            </Badge>
          </article>
        ))}
      </Card>
      {open && (
        <Modal title="Laporkan Hasil Panen" onClose={() => setOpen(false)}>
          <div className="form">
            <label>
              Pesan panen
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <Button
              variant="secondary"
              onClick={async () =>
                setParsed(await actions.parseMessage(message))
              }
            >
              <Sparkles />
              Analisis pesan
            </Button>
            {parsed && (
              <div className="parsed">
                <b>Keyakinan {Math.round(parsed.confidence * 100)}%</b>
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
                  Berat
                  <input
                    type="number"
                    value={parsed.weightKg}
                    onChange={(e) =>
                      setParsed({ ...parsed, weightKg: Number(e.target.value) })
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
              </div>
            )}
            <Button onClick={() => void submit()}>
              <Send />
              Kirim Laporan
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
