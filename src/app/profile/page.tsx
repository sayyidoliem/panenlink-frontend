"use client";

import {
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  FileText,
  IdCard,
  LandPlot,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Truck,
  Upload,
  UserRound,
  Verified,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/shared/app/AppProvider";

type AssetType = "field" | "truck";
type DocumentStatus = "Verified" | "Pending" | "Not Uploaded";
type ProfileModal = "profile" | "asset" | null;

type ProfileAsset = {
  id: string;
  type: AssetType;
  title: string;
  description: string;
  location: string;
  detail: string;
  image: string;
};

type VerificationDocument = {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  fileName: string;
};

const ASSET_STORAGE_KEY = "pl_profile_assets";
const DOCUMENT_STORAGE_KEY = "pl_profile_documents";

const defaultAssets: ProfileAsset[] = [
  {
    id: "FIELD-1",
    type: "field",
    title: "Lahan Cabai Merah",
    description: "Lahan produksi cabai merah",
    location: "Garut",
    detail: "2.5 Hektar",
    image:
      "https://images.unsplash.com/photo-1592921870789-04563d55041c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "TRUCK-1",
    type: "truck",
    title: "Isuzu Traga Pick-up",
    description: "Armada distribusi hasil panen",
    location: "Garut",
    detail: "Z 8201 AB - Box Pendingin",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=700&q=80",
  },
];

const defaultDocuments: VerificationDocument[] = [
  {
    id: "ktp",
    title: "KTP",
    description: "Kartu Tanda Penduduk",
    status: "Verified",
    fileName: "ktp-haji-supriatna.pdf",
  },
  {
    id: "sim",
    title: "SIM B2",
    description: "Surat Izin Mengemudi",
    status: "Verified",
    fileName: "sim-b2-haji-supriatna.pdf",
  },
  {
    id: "stnk",
    title: "STNK",
    description: "Surat Tanda Nomor Kendaraan",
    status: "Pending",
    fileName: "stnk-isuzu-traga.pdf",
  },
  {
    id: "land",
    title: "Sertifikat Lahan",
    description: "Dokumen kepemilikan atau pengelolaan lahan",
    status: "Not Uploaded",
    fileName: "",
  },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

export default function ProfilePage() {
  const { account, updateAccount } = useApp();

  const [modal, setModal] = useState<ProfileModal>(null);
  const [assets, setAssets] =
    useState<ProfileAsset[]>(defaultAssets);
  const [documents, setDocuments] =
    useState<VerificationDocument[]>(defaultDocuments);

  const [assetPreview, setAssetPreview] = useState("");
  const [editingAsset, setEditingAsset] =
    useState<ProfileAsset | null>(null);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAssets(
      readStoredValue<ProfileAsset[]>(
        ASSET_STORAGE_KEY,
        defaultAssets,
      ),
    );

    setDocuments(
      readStoredValue<VerificationDocument[]>(
        DOCUMENT_STORAGE_KEY,
        defaultDocuments,
      ),
    );

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      ASSET_STORAGE_KEY,
      JSON.stringify(assets),
    );
  }, [assets, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      JSON.stringify(documents),
    );
  }, [documents, hydrated]);

  const handleProfilePhoto = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Foto profil harus berupa file gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Ukuran foto profil maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateAccount({
        photo: String(reader.result),
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleProfileSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const location = String(
      formData.get("location") ?? "",
    ).trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").replace(
      /\D/g,
      "",
    );

    if (!name || !role || !location || !email || !phone) {
      window.alert("Seluruh informasi profil wajib diisi.");
      return;
    }

    updateAccount({
      name,
      role,
      location,
      email,
      phone,
    });

    setModal(null);
  };

  const handleDocumentUpload = (
    documentId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      window.alert(
        "Dokumen harus berformat PDF, JPG, PNG, atau WEBP.",
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Ukuran dokumen maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status: "Pending",
              fileName: file.name,
            }
          : document,
      ),
    );

    window.alert(
      `${file.name} berhasil diunggah dan sedang menunggu verifikasi.`,
    );

    event.target.value = "";
  };

  const handleRemoveDocument = (documentId: string) => {
    const document = documents.find(
      (item) => item.id === documentId,
    );

    if (!document) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus dokumen ${document.title}?`,
    );

    if (!confirmed) {
      return;
    }

    setDocuments((currentDocuments) =>
      currentDocuments.map((item) =>
        item.id === documentId
          ? {
              ...item,
              status: "Not Uploaded",
              fileName: "",
            }
          : item,
      ),
    );
  };

  const handleAssetImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Foto aset harus berupa file gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      window.alert("Ukuran foto aset maksimal 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAssetPreview(String(reader.result));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openAddAssetModal = () => {
    setEditingAsset(null);
    setAssetPreview("");
    setModal("asset");
  };

  const openEditAssetModal = (asset: ProfileAsset) => {
    setEditingAsset(asset);
    setAssetPreview(asset.image);
    setModal("asset");
  };

  const closeAssetModal = () => {
    setModal(null);
    setEditingAsset(null);
    setAssetPreview("");
  };

  const handleAssetSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const type = String(
      formData.get("type") ?? "field",
    ) as AssetType;

    const title = String(
      formData.get("title") ?? "",
    ).trim();

    const description = String(
      formData.get("description") ?? "",
    ).trim();

    const location = String(
      formData.get("location") ?? "",
    ).trim();

    const detail = String(
      formData.get("detail") ?? "",
    ).trim();

    if (!title || !description || !location || !detail) {
      window.alert("Seluruh informasi aset wajib diisi.");
      return;
    }

    const fallbackImage =
      type === "field"
        ? defaultAssets[0].image
        : defaultAssets[1].image;

    if (editingAsset) {
      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === editingAsset.id
            ? {
                ...asset,
                type,
                title,
                description,
                location,
                detail,
                image:
                  assetPreview ||
                  editingAsset.image ||
                  fallbackImage,
              }
            : asset,
        ),
      );
    } else {
      const newAsset: ProfileAsset = {
        id: `ASSET-${Date.now()}`,
        type,
        title,
        description,
        location,
        detail,
        image: assetPreview || fallbackImage,
      };

      setAssets((currentAssets) => [
        ...currentAssets,
        newAsset,
      ]);
    }

    closeAssetModal();
  };

  const handleRemoveAsset = (asset: ProfileAsset) => {
    const confirmed = window.confirm(
      `Hapus aset "${asset.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setAssets((currentAssets) =>
      currentAssets.filter(
        (item) => item.id !== asset.id,
      ),
    );
  };

  const handleResetAssets = () => {
    const confirmed = window.confirm(
      "Kembalikan aset ke data awal?",
    );

    if (!confirmed) {
      return;
    }

    setAssets(defaultAssets);
  };

  return (
    <AppShell>
      <div className="page">
        <section className="card profile-hero">
          <label
            className="profile-photo profile-photo-editable"
            title="Klik untuk mengganti foto profil"
          >
            {account.photo ? (
              account.photo
            ) : (
              getInitials(
                account.name || "Haji Supriatna",
              )
            )}

            <span className="profile-photo-action">
              <Camera aria-hidden="true" />
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleProfilePhoto}
            />
          </label>

          <div>
            <div className="profile-title">
              <h1>
                {account.name || "Pak Haji Supriatna"}
              </h1>

              {account.verified && (
                <i className="profile-verified">
                  <Verified aria-hidden="true" />
                  Akun Terverifikasi - Level Gold
                </i>
              )}
            </div>

            <h3>
              {account.role ||
                "Petani Utama & Pengumpul"}
            </h3>

            <p>
              <span>
                <MapPin aria-hidden="true" />
                {account.location ||
                  "Garut, Jawa Barat"}
              </span>

              <span>
                <Calendar aria-hidden="true" />
                Member since Jan 2024
              </span>
            </p>

            <div className="profile-contact">
              <span>{account.email}</span>
              <span>+{account.phone}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setModal("profile")}
            >
              <Pencil aria-hidden="true" />
              Edit Profil
            </Button>
          </div>

          <aside>
            <b>
              42
              <small>Muatan</small>
            </b>

            <span className="profile-stat-separator" />

            <b>
              98%
              <small>Completion</small>
            </b>

            <span className="profile-stat-separator" />

            <b className="profile-stat-rating">
              <span>
                4.9
                <Star aria-hidden="true" />
              </span>

              <small>Rating</small>
            </b>
          </aside>
        </section>

        <div className="profile-grid">
          <section>
            <h2>
              Verifikasi Identitas & Dokumen Usaha
            </h2>

            {documents.map((document) => {
              const DocumentIcon =
                document.id === "ktp"
                  ? IdCard
                  : document.id === "sim"
                    ? Car
                    : document.id === "land"
                      ? LandPlot
                      : FileText;

              return (
                <article
                  className="verify verify-functional"
                  key={document.id}
                >
                  <DocumentIcon aria-hidden="true" />

                  <div>
                    <b>{document.title}</b>
                    <small>
                      {document.description}
                    </small>

                    {document.fileName && (
                      <small className="verify-file-name">
                        {document.fileName}
                      </small>
                    )}
                  </div>

                  <div className="verify-actions">
                    <i
                      className={
                        document.status === "Pending"
                          ? "pending"
                          : document.status ===
                              "Not Uploaded"
                            ? "missing"
                            : ""
                      }
                    >
                      {document.status === "Verified" && (
                        <CheckCircle2 aria-hidden="true" />
                      )}

                      {document.status}
                    </i>

                    <label className="verify-upload">
                      <Upload aria-hidden="true" />

                      {document.status === "Not Uploaded"
                        ? "Upload"
                        : "Ganti"}

                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          handleDocumentUpload(
                            document.id,
                            event,
                          )
                        }
                      />
                    </label>

                    {document.status !== "Not Uploaded" && (
                      <button
                        type="button"
                        className="verify-remove"
                        aria-label={`Hapus dokumen ${document.title}`}
                        onClick={() =>
                          handleRemoveDocument(document.id)
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section>
            <div className="profile-section-head">
              <div>
                <h2>Aset Pertanian & Logistik</h2>
                <p>
                  Kelola lahan dan armada yang terhubung
                  dengan akun.
                </p>
              </div>

              <div className="profile-asset-actions">
                <Button
                  variant="ghost"
                  onClick={handleResetAssets}
                  title="Kembalikan aset awal"
                >
                  <RotateCcw aria-hidden="true" />
                  Reset
                </Button>

                <Button
                  variant="ghost"
                  onClick={openAddAssetModal}
                >
                  <Plus aria-hidden="true" />
                  Tambah Lahan / Armada
                </Button>
              </div>
            </div>

            <div className="asset-grid">
              {assets.map((asset) => (
                <article key={asset.id}>
                  <div
                    className={`asset-image ${asset.type}`}
                    style={{
                      backgroundImage: `url("${asset.image}")`,
                    }}
                    role="img"
                    aria-label={asset.title}
                  >
                    <span className="asset-label">
                      {asset.type === "field" ? (
                        <LandPlot aria-hidden="true" />
                      ) : (
                        <Truck aria-hidden="true" />
                      )}

                      {asset.type === "field"
                        ? "Lahan"
                        : "Armada"}
                    </span>
                  </div>

                  <div className="asset-row">
                    <div>
                      <b>{asset.title}</b>

                      <p>
                        {asset.detail} - {asset.location}
                      </p>

                      <small>
                        {asset.description}
                      </small>
                    </div>

                    <div className="asset-card-actions">
                      <button
                        type="button"
                        className="asset-edit"
                        aria-label={`Edit ${asset.title}`}
                        title={`Edit ${asset.title}`}
                        onClick={() =>
                          openEditAssetModal(asset)
                        }
                      >
                        <Pencil aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        className="asset-remove"
                        aria-label={`Hapus ${asset.title}`}
                        title={`Hapus ${asset.title}`}
                        onClick={() =>
                          handleRemoveAsset(asset)
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {assets.length === 0 && (
                <button
                  type="button"
                  className="add-asset"
                  onClick={openAddAssetModal}
                >
                  <Plus aria-hidden="true" />
                  Tambah Lahan / Armada
                </button>
              )}
            </div>

            <div className="profile-review-section">
              <h2>Ulasan Mitra</h2>

              <article className="card review">
                <div className="review-head">
                  <div className="review-user">
                    <span className="avatar">
                      <UserRound aria-hidden="true" />
                    </span>

                    <div>
                      <b>Pak Agus</b>
                      <small>Driver CDD</small>
                    </div>
                  </div>

                  <span
                    className="review-stars"
                    aria-label="Rating 5 dari 5"
                  >
                    {Array.from({ length: 5 }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          aria-hidden="true"
                        />
                      ),
                    )}
                  </span>
                </div>

                <p>
                  “Proses muat cepat, penimbangan jujur
                  dan ramah. Akses jalan ke lahan cukup
                  baik untuk CDD.”
                </p>

                <div className="review-tags">
                  <span>Muat Tepat Waktu</span>
                  <span>Pembayaran Lunas</span>
                </div>
              </article>
            </div>
          </section>
        </div>

        {modal === "profile" && (
          <Modal
            title="Edit Profil"
            onClose={() => setModal(null)}
          >
            <form
              className="form"
              onSubmit={handleProfileSubmit}
            >
              <label>
                Nama Lengkap
                <input
                  name="name"
                  defaultValue={account.name}
                  required
                />
              </label>

              <label>
                Peran atau Jenis Usaha
                <input
                  name="role"
                  defaultValue={account.role}
                  required
                />
              </label>

              <label>
                Lokasi
                <input
                  name="location"
                  defaultValue={account.location}
                  required
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={account.email}
                  required
                />
              </label>

              <label>
                Nomor WhatsApp
                <input
                  name="phone"
                  inputMode="numeric"
                  defaultValue={account.phone}
                  required
                />
              </label>

              <Button type="submit" className="full">
                Simpan Perubahan
              </Button>
            </form>
          </Modal>
        )}

        {modal === "asset" && (
          <Modal
            title={
              editingAsset
                ? "Edit Lahan / Armada"
                : "Tambah Lahan / Armada"
            }
            onClose={closeAssetModal}
          >
            <form
              className="form asset-form"
              onSubmit={handleAssetSubmit}
            >
              <label>
                Jenis
                <select
                  name="type"
                  defaultValue={
                    editingAsset?.type ?? "field"
                  }
                  required
                >
                  <option value="field">
                    Lahan Pertanian
                  </option>

                  <option value="truck">
                    Armada Logistik
                  </option>
                </select>
              </label>

              <label>
                Title atau Nama Aset
                <input
                  name="title"
                  defaultValue={
                    editingAsset?.title ?? ""
                  }
                  placeholder="Contoh: Lahan Cabai Merah"
                  required
                />
              </label>

              <label>
                Deskripsi
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    editingAsset?.description ?? ""
                  }
                  placeholder="Jelaskan fungsi atau kondisi aset"
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Lokasi
                  <input
                    name="location"
                    defaultValue={
                      editingAsset?.location ?? ""
                    }
                    placeholder="Contoh: Garut"
                    required
                  />
                </label>

                <label>
                  Luas, Kapasitas, atau Nomor Polisi
                  <input
                    name="detail"
                    defaultValue={
                      editingAsset?.detail ?? ""
                    }
                    placeholder="2.5 Hektar atau Z 8201 AB"
                    required
                  />
                </label>
              </div>

              <label>
                Foto
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAssetImage}
                />
              </label>

              {assetPreview && (
                <div
                  className="asset-preview"
                  style={{
                    backgroundImage: `url("${assetPreview}")`,
                  }}
                  role="img"
                  aria-label="Pratinjau foto aset"
                />
              )}

              <div className="action-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAssetModal}
                >
                  Batal
                </Button>

                <Button type="submit">
                  {editingAsset
                    ? "Simpan Perubahan"
                    : "Tambah Aset"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}