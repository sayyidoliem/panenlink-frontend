import { AppShell } from "@/components/layout/AppShell";
import {
  MapPin,
  Calendar,
  Verified,
  IdCard,
  Car,
  FileText,
  Star,
} from "lucide-react";
export default function Page() {
  return (
    <AppShell>
      <div className="page">
        <section className="card profile-hero">
          <div className="profile-photo">HS</div>
          <div>
            <h1>
              Pak Haji Supriatna{" "}
              <i>
                <Verified />
                Akun Terverifikasi - Level Gold
              </i>
            </h1>
            <h3>Petani Utama & Pengumpul</h3>
            <p>
              <MapPin />
              Garut, Jawa Barat　
              <Calendar />
              Member since Jan 2024
            </p>
          </div>
          <aside>
            <b>
              42<small>Muatan</small>
            </b>
            <b>
              98%<small>Completion</small>
            </b>
            <b>
              4.9<small>Rating</small>
            </b>
          </aside>
        </section>
        <div className="profile-grid">
          <section>
            <h2>Verifikasi Identitas & Dokumen Usaha</h2>
            {[
              [IdCard, "KTP", "Verified"],
              [Car, "SIM B2", "Verified"],
              [FileText, "STNK", "Pending"],
            ].map(([I, n, s]) => {
              const X = I as typeof IdCard;
              return (
                <article className="verify" key={String(n)}>
                  <X />
                  <div>
                    <b>{String(n)}</b>
                    <small>Dokumen resmi pengguna</small>
                  </div>
                  <i>{String(s)}</i>
                </article>
              );
            })}
          </section>
          <section>
            <h2>Aset Pertanian & Logistik</h2>
            <div className="asset-grid">
              <article>
                <div className="asset-image field" />
                <b>Lahan Cabai Merah</b>
                <p>2.5 Hektar - Garut</p>
              </article>
              <article>
                <div className="asset-image truck" />
                <b>Isuzu Traga Pick-up</b>
                <p>Z 8201 AB - Box Pendingin</p>
              </article>
            </div>
            <article className="card review">
              <b>Pak Agus • Driver CDD</b>
              <span>
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </span>
              <p>“Proses muat cepat, penimbangan jujur dan ramah.”</p>
            </article>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
