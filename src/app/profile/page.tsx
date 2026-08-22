"use client";
import { AppShell } from "@/components/layout/AppShell";
import {
  MapPin,
  Verified,
  IdCard,
  Car,
  FileText,
  Upload,
  Edit3,
} from "lucide-react";
import { useApp } from "@/shared/app/AppProvider";
import { useState, type ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
export default function Page() {
  const { account, updateAccount } = useApp(),
    [edit, setEdit] = useState(false);
  const photo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => updateAccount({ photo: String(r.result) });
    r.readAsDataURL(f);
  };
  const doc = (name: string, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0])
      updateAccount({ documents: { ...account.documents, [name]: "pending" } });
  };
  return (
    <AppShell>
      <div className="page">
        <section className="card profile-hero">
          <label className="profile-photo editable">
            {account.photo ? (
              <img src={account.photo} alt="Profil" />
            ) : (
              account.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")
            )}
            <input type="file" accept="image/*" onChange={photo} />
            <Upload />
          </label>
          <div>
            <h1>
              {account.name}{" "}
              {account.verified && (
                <i>
                  <Verified />
                  Terverifikasi
                </i>
              )}
            </h1>
            <h3>{account.role}</h3>
            <p>
              <MapPin />
              {account.location}
            </p>
            <p>
              {account.email} · +{account.phone}
            </p>
          </div>
          <button className="button outline" onClick={() => setEdit(true)}>
            <Edit3 />
            Edit Profil
          </button>
        </section>
        <div className="profile-grid">
          <section>
            <h2>Verifikasi Identitas</h2>
            {[
              [IdCard, "KTP"],
              [Car, "SIM"],
              [FileText, "STNK"],
              [FileText, "Lahan"],
            ].map(([I, n]) => {
              const X = I as typeof IdCard,
                s = account.documents[String(n)] || "missing";
              return (
                <article className="verify" key={String(n)}>
                  <X />
                  <div>
                    <b>{String(n)}</b>
                    <small>Status: {s}</small>
                  </div>
                  <label className="button outline">
                    <Upload />
                    Unggah
                    <input
                      type="file"
                      hidden
                      onChange={(e) => doc(String(n), e)}
                    />
                  </label>
                </article>
              );
            })}
          </section>
          <section>
            <h2>Informasi Akun</h2>
            <article className="card">
              <p>
                Nama: <b>{account.name}</b>
              </p>
              <p>
                Email: <b>{account.email}</b>
              </p>
              <p>
                WhatsApp: <b>+{account.phone}</b>
              </p>
              <p>
                Lokasi: <b>{account.location}</b>
              </p>
            </article>
          </section>
        </div>
        {edit && (
          <Modal title="Edit Profil" onClose={() => setEdit(false)}>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateAccount(
                  Object.fromEntries(new FormData(e.currentTarget)) as any,
                );
                setEdit(false);
              }}
            >
              {["name", "email", "phone", "location", "role"].map((k) => (
                <label key={k}>
                  {k}
                  <input name={k} defaultValue={(account as any)[k]} required />
                </label>
              ))}
              <button className="button primary">Simpan</button>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
