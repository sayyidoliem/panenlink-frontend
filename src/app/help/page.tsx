"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Search, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";
const faq = [
  "Cara memasang muatan baru",
  "Cara menerima penawaran driver",
  "Cara mengubah rekening pencairan",
  "Cara verifikasi KTP dan STNK",
  "Mengapa lokasi tidak ditemukan?",
  "Cara menggunakan chatbot AI",
];
export default function Page() {
  const [q, setQ] = useState("");
  return (
    <AppShell>
      <div className="page">
        <PageHeader
          title="Pusat Bantuan"
          description="Temukan panduan penggunaan PanenLink."
        />
        <div className="help-search">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari bantuan..."
          />
        </div>
        <div className="faq-grid">
          {faq
            .filter((x) => x.toLowerCase().includes(q.toLowerCase()))
            .map((x, i) => (
              <details className="card" key={x}>
                <summary>{x}</summary>
                <p>
                  {i === 0
                    ? "Buka Post Muatan, isi detail, pilih lokasi pada peta, lalu klik Terbitkan."
                    : "Buka halaman terkait dari sidebar. Semua perubahan akan disimpan secara lokal pada perangkat ini."}
                </p>
              </details>
            ))}
        </div>
        <section className="card help-contact">
          <h2>Masih memerlukan bantuan?</h2>
          <a
            className="button primary"
            target="_blank"
            href="https://wa.me/6281234567890"
          >
            <MessageCircle />
            WhatsApp
          </a>
          <a className="button outline" href="mailto:halo@panenlink.id">
            <Mail />
            Email
          </a>
        </section>
      </div>
    </AppShell>
  );
}
