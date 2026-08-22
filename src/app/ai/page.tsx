"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Bot, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
type M = { from: "user" | "bot"; text: string };
const answer = (q: string) => {
  const s = q.toLowerCase();
  if (s.includes("muatan"))
    return "Untuk memasang muatan, buka menu Post Muatan, isi komoditas, berat, jadwal, lokasi, dan kendaraan.";
  if (s.includes("verifikasi"))
    return "Buka Profil lalu unggah KTP, SIM, STNK, atau sertifikat lahan. Status awal akan menjadi pending.";
  if (s.includes("peta") || s.includes("lokasi"))
    return "Gunakan pencarian peta atau tombol lokasi perangkat. PanenLink memakai Photon/Nominatim dan OpenStreetMap.";
  if (s.includes("driver") || s.includes("whatsapp"))
    return "Tombol WA pada pesanan membuka WhatsApp dengan pesan dan ID muatan otomatis.";
  if (s.includes("password") || s.includes("pin"))
    return "Buka Pengaturan > Keamanan Akun untuk mengganti kata sandi, PIN, atau 2FA.";
  return "Saya dapat membantu tentang muatan, driver, peta, verifikasi, pembayaran, akun, dan pengaturan PanenLink.";
};
export default function Page() {
  const [m, setM] = useState<M[]>([
      {
        from: "bot",
        text: "Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?",
      },
    ]),
    [q, setQ] = useState("");
  useEffect(() => {
    const x = localStorage.getItem("pl_chat");
    if (x) setM(JSON.parse(x));
  }, []);
  useEffect(() => localStorage.setItem("pl_chat", JSON.stringify(m)), [m]);
  const send = () => {
    if (!q.trim()) return;
    const text = q;
    setM((x) => [
      ...x,
      { from: "user", text },
      { from: "bot", text: answer(text) },
    ]);
    setQ("");
  };
  return (
    <AppShell>
      <div className="chat-page">
        <header>
          <Bot />
          <div>
            <h1>Asisten AI PanenLink</h1>
            <p>Chatbot bantuan lokal untuk operasional PanenLink</p>
          </div>
          <button onClick={() => setM([])}>
            <Trash2 />
          </button>
        </header>
        <main>
          {m.map((x, i) => (
            <div key={i} className={`bubble ${x.from}`}>
              {x.text}
            </div>
          ))}
        </main>
        <footer>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Tanyakan sesuatu..."
          />
          <button onClick={send}>
            <Send />
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
