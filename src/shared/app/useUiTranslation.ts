"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/shared/app/AppProvider";

type Dictionary = Record<string, string>;

const fallbackEn: Dictionary = {
  "Pantau panen, armada, notifikasi, dan tren distribusi dari satu dashboard.":
    "Monitor harvests, fleets, notifications, and distribution trends from one dashboard.",
  "Operasi PanenLink Hari Ini": "Today's PanenLink Operations",
  "Distribusi Anda sedang bergerak dengan ritme yang bagus.":
    "Your distribution is moving with a strong rhythm.",
  "Dua armada aktif sedang berjalan, satu pengiriman siap muat, dan pusat notifikasi sudah sinkron dengan aktivitas dashboard.":
    "Two active fleets are moving, one shipment is ready for loading, and the notification center is already synced with dashboard activity.",
  "Lihat Peluang Muatan": "View Load Opportunities",
  "Atur Preferensi": "Adjust Preferences",
  "Ikon dashboard yang menggambarkan hasil panen, konektivitas armada, dan alur distribusi yang terus bergerak.":
    "A dashboard icon that represents harvest output, fleet connectivity, and an always-moving delivery flow.",
  "Total Terkirim": "Total Delivered",
  "Muatan Aktif": "Active Loads",
  "Total Hemat Ongkir": "Shipping Savings",
  "Cari Armada Balik": "Find Return Fleet",
  "Temukan armada kosong terdekat untuk menekan ongkir.":
    "Find the nearest empty fleet to reduce shipping costs.",
  "AI Ringkas Operasi": "AI Operations Brief",
  "Minta rekomendasi rute, harga, dan dokumen lebih cepat.":
    "Get route, pricing, and document recommendations faster.",
  "Rute Aktif": "Active Route",
  "Peta dibuat lebih premium dengan efek pseudo-3D dan overlay status.":
    "The map is upgraded with a premium pseudo-3D effect and status overlays.",
  "Riwayat & Status Muatan": "Load History & Status",
  "Ringkasan muatan aktif, antrean muat, dan pengiriman selesai.":
    "A summary of active loads, loading queues, and completed deliveries.",
  "Rute utama yang sedang menghasilkan pemasukan hari ini.":
    "The main route currently generating revenue today.",
  "Pusat Notifikasi": "Notification Center",
  "Notifikasi ini live dari aktivitas dashboard dan pengaturan aplikasi.":
    "These notifications are live from dashboard activity and app settings.",
  "Catatan Pemilik": "Owner Notes",
  "Checklist cepat untuk hal penting sebelum armada berangkat.":
    "A quick checklist for important items before the fleet departs.",
  "Insight Harian": "Daily Insights",
  "Rekomendasi cepat yang bisa langsung dipakai di operasi lapangan.":
    "Quick recommendations that can be used immediately in field operations.",
  "Pengaturan Akun & Dana": "Account & Funds Settings",
  "Atur preferensi akun, notifikasi, keamanan, dan tampilan dengan panel yang lebih rapi.":
    "Manage account preferences, notifications, security, and appearance with a cleaner panel.",
  "Update penting pengiriman dan pencairan aktif.":
    "Important shipment and payout updates are active.",
  "Semua update inti sedang dimatikan.": "All core updates are currently off.",
  "2FA aktif dan akun lebih aman untuk transaksi.":
    "2FA is active and your account is safer for transactions.",
  "Aktifkan 2FA agar keamanan akun meningkat.":
    "Enable 2FA to improve account security.",
  "Rekening aktif siap dipakai untuk pencairan dana hasil panen.":
    "An active bank account is ready for harvest payouts.",
  "Rekening Pencairan": "Payout Accounts",
  "Utama": "Primary",
  "Tambah Rekening": "Add Bank Account",
  "Keamanan Akun": "Account Security",
  "Ganti Kata Sandi": "Change Password",
  "PIN Transaksi": "Transaction PIN",
  "Digunakan untuk pencairan": "Used for payouts",
  "Ubah": "Edit",
  "Verifikasi 2 Langkah": "Two-Step Verification",
  "Via WhatsApp": "Via WhatsApp",
  "Sesi Aktif": "Active Sessions",
  "Perangkat ini": "This device",
  "Aktif": "Active",
  "Keluar": "Sign out",
  "Notifikasi": "Notifications",
  "Status Muatan": "Load Status",
  "Konfirmasi Pencairan": "Payout Confirmation",
  "Laporan Tren": "Trend Reports",
  "Pembaruan PanenLink": "PanenLink updates",
  "Tampilan & Bahasa": "Appearance & Language",
  "Terang": "Light",
  "Gelap": "Dark",
  "Sistem": "System",
  "Bahasa Indonesia": "Indonesian",
  "Ganti PIN": "Change PIN",
  "Bank": "Bank",
  "Nama": "Name",
  "Nomor": "Number",
  "Nilai lama": "Current value",
  "Nilai baru": "New value",
  "Simpan": "Save",
  "Asisten AI PanenLink": "PanenLink AI Assistant",
  "Ringkas operasional, bantu dokumen, dan buat laporan PDF dari percakapan Anda.":
    "Summarize operations, help with documents, and generate PDF reports from your chat.",
  "Generate laporan": "Generate report",
  "Unduh ringkasan percakapan AI menjadi PDF operasional.":
    "Download an AI conversation summary as an operations PDF.",
  "Bantuan cepat": "Quick help",
  "Topik muatan, driver, dokumen, lokasi, akun, dan pengaturan.":
    "Topics for loads, drivers, documents, locations, accounts, and settings.",
  "Tanyakan sesuatu...": "Ask something...",
  "Halo, saya Asisten PanenLink. Apa yang dapat saya bantu?":
    "Hello, I am the PanenLink Assistant. How can I help you?",
  "Edit Profil": "Edit Profile",
  "Akun Terverifikasi - Gold": "Verified Account - Gold",
  "Member since Jan 2024": "Member since Jan 2024",
  "Muatan": "Loads",
  "Profil Bisnis": "Business Profile",
  "Siap menerima mitra logistik dan pembeli baru":
    "Ready to receive new logistics partners and buyers",
  "Dokumen inti aktif, aset tersimpan, dan data kontak sudah siap untuk proses matching muatan.":
    "Core documents are active, assets are saved, and contact data is ready for load matching.",
  "98% lengkap": "98% complete",
  "Verifikasi Identitas & Dokumen Usaha":
    "Identity & Business Document Verification",
  "Aset Pertanian & Logistik": "Farm & Logistics Assets",
  "Kelola lahan dan armada yang terhubung dengan akun.":
    "Manage land and fleets linked to your account.",
  "Tambah Lahan / Armada": "Add Land / Fleet",
  "Ulasan Mitra": "Partner Reviews",
  "Kelengkapan": "Completion",
  "Rating": "Rating",
  "Edit foto profil": "Edit profile photo",
  "Unggah": "Upload",
  "Ganti": "Replace",
  "Lahan": "Land",
  "Armada": "Fleet",
  "dokumen terverifikasi": "documents verified",
  "Asal": "Origin",
  "Tujuan": "Destination",
  "Cari lokasi": "Search location",
  "Cari": "Search",
  "Tukar": "Swap",
  "Rute dihitung": "Route calculated",
  "Estimasi tiba": "ETA",
  "Jarak": "Distance",
  "Durasi": "Duration",
  "Pilih asal": "Select origin",
  "Pilih tujuan": "Select destination",
  "Lokasi saya": "My location",
  "Armada aktif": "Active fleet",
  "Jalur live": "Live lane",
};

export function useUiTranslation(texts: string[]) {
  const { lang } = useApp();
  const [translated, setTranslated] = useState<Dictionary>({});
  const key = useMemo(() => texts.join("||"), [texts]);

  useEffect(() => {
    let active = true;
    if (lang === "id") {
      return () => {
        active = false;
      };
    }

    const run = async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, source: "id", target: "en" }),
        });
        if (!res.ok) throw new Error("translation failed");
        const data = (await res.json()) as { translations?: Dictionary };
        if (active && data.translations) setTranslated(data.translations);
      } catch {
        if (active) setTranslated(fallbackEn);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [key, lang, texts]);

  return (text: string) =>
    lang === "en" ? fallbackEn[text] || translated[text] || text : text;
}
