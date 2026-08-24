"use client";

import {
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  FileText,
  IdCard,
  LandPlot,
  Mail,
  MapPin,
  Pencil,
  Phone,
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
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useUiTranslation } from "@/shared/app/useUiTranslation";
import { createClient } from "@/shared/lib/supabase/client";

type AssetType = "field" | "truck";
type DocumentStatus = "Verified" | "Pending" | "Not Uploaded";
type ProfileModal = "profile" | "asset" | null;

type ProfileData = {
  id: string;
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  photo: string;
  verified: boolean;
  memberSince: string;
  loadCount: number;
  completionPercentage: number;
  rating: number;
};

type ProfileAsset = {
  id: string;
  type: AssetType;
  title: string;
  description: string;
  location: string;
  detail: string;
  image: string;
  imagePath: string;
};

type ProfileAssetRow = {
  id: unknown;
  type: unknown;
  title: unknown;
  description: unknown;
  location: unknown;
  detail: unknown;
  image_url: unknown;
  image_path: unknown;
};

type VerificationDocumentRow = {
  id: unknown;
  document_type: unknown;
  title: unknown;
  description: unknown;
  status: unknown;
  file_name: unknown;
  file_path: unknown;
};

type VerificationDocument = {
  id: string;
  documentType: string;
  title: string;
  description: string;
  status: DocumentStatus;
  fileName: string;
  filePath: string;
};

const EMPTY_PROFILE: ProfileData = {
  id: "",
  name: "-",
  role: "-",
  location: "-",
  email: "-",
  phone: "0",
  photo: "",
  verified: false,
  memberSince: "-",
  loadCount: 0,
  completionPercentage: 0,
  rating: 0,
};

const INITIAL_DOCUMENTS = [
  {
    documentType: "ktp",
    title: "KTP",
    description: "Kartu Tanda Penduduk",
  },
  {
    documentType: "sim",
    title: "SIM B2",
    description: "Surat Izin Mengemudi",
  },
  {
    documentType: "stnk",
    title: "STNK",
    description: "Surat Tanda Nomor Kendaraan",
  },
  {
    documentType: "land",
    title: "Sertifikat Lahan",
    description: "Dokumen kepemilikan atau pengelolaan lahan",
  },
] as const;

function textFallback(value: unknown) {
  if (typeof value !== "string") {
    return "-";
  }

  const result = value.trim();

  return result || "-";
}

function phoneFallback(value: unknown) {
  if (typeof value !== "string") {
    return "0";
  }

  const result = value.replace(/\D/g, "");

  return result || "0";
}

function numberFallback(value: unknown) {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

function getInitials(name: string) {
  if (!name || name === "-") {
    return "-";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMemberSince(value: string) {
  if (!value || value === "-") {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function safeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  return "bin";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

export default function ProfilePage() {
  const supabase = createClient();

  const t = useUiTranslation([
    "Edit Profil",
    "Akun Terverifikasi - Gold",
    "Member since Jan 2024",
    "Muatan",
    "Profil Bisnis",
    "Siap menerima mitra logistik dan pembeli baru",
    "Dokumen inti aktif, aset tersimpan, dan data kontak sudah siap untuk proses matching muatan.",
    "98% lengkap",
    "Verifikasi Identitas & Dokumen Usaha",
    "Aset Pertanian & Logistik",
    "Kelola lahan dan armada yang terhubung dengan akun.",
    "Tambah Lahan / Armada",
    "Ulasan Mitra",
    "Kelengkapan",
    "Rating",
    "Edit foto profil",
    "Unggah",
    "Ganti",
    "Lahan",
    "Armada",
    "dokumen terverifikasi",
  ]);

  const [modal, setModal] = useState<ProfileModal>(null);
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [assets, setAssets] = useState<ProfileAsset[]>([]);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);

  const [assetPreview, setAssetPreview] = useState("");
  const [editingAsset, setEditingAsset] = useState<ProfileAsset | null>(null);

  const ensureInitialDocuments = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("verification_documents")
        .select("document_type")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const existingTypes = new Set(
        (data ?? []).map((item: { document_type: unknown }) =>
          String(item.document_type),
        ),
      );

      const missingDocuments = INITIAL_DOCUMENTS.filter(
        (document) => !existingTypes.has(document.documentType),
      ).map((document) => ({
        user_id: userId,
        document_type: document.documentType,
        title: document.title,
        description: document.description,
        status: "Not Uploaded" as DocumentStatus,
        file_name: "",
        file_path: "",
      }));

      if (missingDocuments.length === 0) {
        return;
      }

      const { error: insertError } = await supabase
        .from("verification_documents")
        .insert(missingDocuments);

      if (insertError) {
        throw insertError;
      }
    },
    [supabase],
  );

  const loadProfileData = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setProfile(EMPTY_PROFILE);
        setAssets([]);
        setDocuments([]);
        return;
      }

      const authName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.username ??
        "-";

      const authPhone =
        user.phone ??
        user.user_metadata?.phone ??
        user.user_metadata?.phone_number ??
        "0";

      const authPhoto =
        user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "";

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select(
          [
            "id",
            "name",
            "role",
            "location",
            "phone",
            "photo_url",
            "verified",
            "member_since",
            "load_count",
            "completion_percentage",
            "rating",
          ].join(","),
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileRow) {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: textFallback(authName),
            role: "-",
            location: "-",
            phone: phoneFallback(authPhone),
            photo_url: authPhoto || "",
            verified: false,
            member_since: user.created_at,
            load_count: 0,
            completion_percentage: 0,
            rating: 0,
          });

        if (createProfileError) {
          throw createProfileError;
        }
      }

      await ensureInitialDocuments(user.id);

      const [
        { data: currentProfile, error: currentProfileError },
        { data: assetRows, error: assetsError },
        { data: documentRows, error: documentsError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            [
              "id",
              "name",
              "role",
              "location",
              "phone",
              "photo_url",
              "verified",
              "member_since",
              "load_count",
              "completion_percentage",
              "rating",
            ].join(","),
          )
          .eq("id", user.id)
          .single(),

        supabase
          .from("profile_assets")
          .select(
            [
              "id",
              "user_id",
              "type",
              "title",
              "description",
              "location",
              "detail",
              "image_url",
              "image_path",
            ].join(","),
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),

        supabase
          .from("verification_documents")
          .select(
            [
              "id",
              "user_id",
              "document_type",
              "title",
              "description",
              "status",
              "file_name",
              "file_path",
            ].join(","),
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (currentProfileError) {
        throw currentProfileError;
      }

      if (assetsError) {
        throw assetsError;
      }

      if (documentsError) {
        throw documentsError;
      }

      setProfile({
        id: user.id,
        name: textFallback(currentProfile?.name ?? authName),
        role: textFallback(currentProfile?.role),
        location: textFallback(currentProfile?.location),
        email: textFallback(user.email),
        phone: phoneFallback(currentProfile?.phone ?? authPhone),
        photo: String(currentProfile?.photo_url ?? authPhoto ?? ""),
        verified: Boolean(currentProfile?.verified),
        memberSince: String(
          currentProfile?.member_since ?? user.created_at ?? "-",
        ),
        loadCount: numberFallback(currentProfile?.load_count),
        completionPercentage: numberFallback(
          currentProfile?.completion_percentage,
        ),
        rating: numberFallback(currentProfile?.rating),
      });

      setAssets(
        ((assetRows as ProfileAssetRow[] | null) ?? []).map((asset) => ({
          id: String(asset.id),
          type: asset.type === "truck" ? "truck" : "field",
          title: textFallback(asset.title),
          description: textFallback(asset.description),
          location: textFallback(asset.location),
          detail: textFallback(asset.detail),
          image: String(asset.image_url ?? ""),
          imagePath: String(asset.image_path ?? ""),
        })),
      );

      setDocuments(
        ((documentRows as VerificationDocumentRow[] | null) ?? []).map(
          (document: VerificationDocumentRow) => {
            const status: DocumentStatus =
              document.status === "Verified" ||
              document.status === "Pending" ||
              document.status === "Not Uploaded"
                ? document.status
                : "Not Uploaded";

            return {
              id: String(document.id),
              documentType: String(document.document_type ?? ""),
              title: textFallback(document.title),
              description: textFallback(document.description),
              status,
              fileName: String(document.file_name ?? ""),
              filePath: String(document.file_path ?? ""),
            };
          },
        ),
      );
    } catch (error) {
      console.error("Gagal memuat profil Supabase:", error);

      setProfile(EMPTY_PROFILE);
      setAssets([]);
      setDocuments([]);
    }
  }, [ensureInitialDocuments, supabase]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    return () => {
      if (assetPreview.startsWith("blob:")) {
        URL.revokeObjectURL(assetPreview);
      }
    };
  }, [assetPreview]);

  const handleProfilePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Foto profil harus berupa file gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Ukuran foto profil maksimal 2 MB.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      const extension = getFileExtension(file);
      const filePath = `${user.id}/profile-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const photoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );

      if (updateProfileError) {
        await supabase.storage.from("profile-images").remove([filePath]);
        throw updateProfileError;
      }

      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          avatar_url: photoUrl,
          picture: photoUrl,
        },
      });

      if (updateAuthError) {
        console.error(
          "Foto tersimpan, tetapi metadata Auth gagal diperbarui:",
          updateAuthError,
        );
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        photo: photoUrl,
      }));
    } catch (error) {
      console.error("Foto profil gagal diunggah:", error);
      window.alert(`Foto profil gagal diunggah. ${getErrorMessage(error)}`);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = textFallback(formData.get("name"));
    const role = textFallback(formData.get("role"));
    const location = textFallback(formData.get("location"));
    const email = textFallback(formData.get("email"));
    const phone = phoneFallback(formData.get("phone"));

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      const authUpdate: {
        email?: string;
        data: {
          full_name: string;
          name: string;
          phone: string;
        };
      } = {
        data: {
          full_name: name,
          name,
          phone,
        },
      };

      const shouldUpdateEmail =
        email !== "-" && email !== user.email && email.includes("@");

      if (shouldUpdateEmail) {
        authUpdate.email = email;
      }

      const { error: authError } = await supabase.auth.updateUser(authUpdate);

      if (authError) {
        throw authError;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name,
          role,
          location,
          phone,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        throw profileError;
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        id: user.id,
        name,
        role,
        location,
        email: shouldUpdateEmail
          ? email
          : textFallback(user.email ?? currentProfile.email),
        phone,
      }));

      setModal(null);

      if (shouldUpdateEmail) {
        window.alert(
          "Profil berhasil disimpan. Perubahan email mungkin memerlukan konfirmasi melalui email lama atau email baru.",
        );
      }
    } catch (error) {
      console.error("Profil gagal disimpan:", error);
      window.alert(`Profil gagal disimpan. ${getErrorMessage(error)}`);
    }
  };

  const handleDocumentUpload = async (
    documentId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

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
      window.alert("Dokumen harus berformat PDF, JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Ukuran dokumen maksimal 5 MB.");
      return;
    }

    const document = documents.find((item) => item.id === documentId);

    if (!document) {
      return;
    }

    let uploadedFilePath = "";

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      uploadedFilePath = `${user.id}/${document.documentType}/${Date.now()}-${safeFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("verification-documents")
        .upload(uploadedFilePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("verification_documents")
        .update({
          status: "Pending",
          file_name: file.name,
          file_path: uploadedFilePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .eq("user_id", user.id);

      if (updateError) {
        await supabase.storage
          .from("verification-documents")
          .remove([uploadedFilePath]);

        throw updateError;
      }

      if (document.filePath && document.filePath !== uploadedFilePath) {
        const { error: removeOldFileError } = await supabase.storage
          .from("verification-documents")
          .remove([document.filePath]);

        if (removeOldFileError) {
          console.error("Dokumen lama gagal dihapus:", removeOldFileError);
        }
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((item) =>
          item.id === documentId
            ? {
                ...item,
                status: "Pending",
                fileName: file.name,
                filePath: uploadedFilePath,
              }
            : item,
        ),
      );

      window.alert(
        `${file.name} berhasil diunggah dan sedang menunggu verifikasi.`,
      );
    } catch (error) {
      console.error("Dokumen gagal diunggah:", error);
      window.alert(`Dokumen gagal diunggah. ${getErrorMessage(error)}`);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);

    if (!document) {
      return;
    }

    const confirmed = window.confirm(`Hapus dokumen ${document.title}?`);

    if (!confirmed) {
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      const { error: updateError } = await supabase
        .from("verification_documents")
        .update({
          status: "Not Uploaded",
          file_name: "",
          file_path: "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      if (document.filePath) {
        const { error: removeFileError } = await supabase.storage
          .from("verification-documents")
          .remove([document.filePath]);

        if (removeFileError) {
          console.error(
            "File dokumen gagal dihapus dari Storage:",
            removeFileError,
          );
        }
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((item) =>
          item.id === documentId
            ? {
                ...item,
                status: "Not Uploaded",
                fileName: "",
                filePath: "",
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Dokumen gagal dihapus:", error);
      window.alert(`Dokumen gagal dihapus. ${getErrorMessage(error)}`);
    }
  };

  const handleAssetImage = (event: ChangeEvent<HTMLInputElement>) => {
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

    if (assetPreview.startsWith("blob:")) {
      URL.revokeObjectURL(assetPreview);
    }

    setAssetPreview(URL.createObjectURL(file));
  };

  const openAddAssetModal = () => {
    if (assetPreview.startsWith("blob:")) {
      URL.revokeObjectURL(assetPreview);
    }

    setEditingAsset(null);
    setAssetPreview("");
    setModal("asset");
  };

  const openEditAssetModal = (asset: ProfileAsset) => {
    if (assetPreview.startsWith("blob:")) {
      URL.revokeObjectURL(assetPreview);
    }

    setEditingAsset(asset);
    setAssetPreview(asset.image);
    setModal("asset");
  };

  const closeAssetModal = () => {
    if (assetPreview.startsWith("blob:")) {
      URL.revokeObjectURL(assetPreview);
    }

    setModal(null);
    setEditingAsset(null);
    setAssetPreview("");
  };

  const handleAssetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const rawType = String(formData.get("type") ?? "field");
    const type: AssetType = rawType === "truck" ? "truck" : "field";

    const title = textFallback(formData.get("title"));
    const description = textFallback(formData.get("description"));
    const location = textFallback(formData.get("location"));
    const detail = textFallback(formData.get("detail"));
    const imageFile = formData.get("image");

    let uploadedImagePath = "";

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      let imageUrl = editingAsset?.image ?? "";
      let imagePath = editingAsset?.imagePath ?? "";

      if (imageFile instanceof File && imageFile.size > 0) {
        if (!imageFile.type.startsWith("image/")) {
          throw new Error("Foto aset harus berupa file gambar.");
        }

        if (imageFile.size > 3 * 1024 * 1024) {
          throw new Error("Ukuran foto aset maksimal 3 MB.");
        }

        const extension = getFileExtension(imageFile);

        uploadedImagePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("asset-images")
          .upload(uploadedImagePath, imageFile, {
            cacheControl: "3600",
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("asset-images")
          .getPublicUrl(uploadedImagePath);

        imageUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
        imagePath = uploadedImagePath;
      }

      if (editingAsset) {
        const oldImagePath = editingAsset.imagePath;

        const { data, error } = await supabase
          .from("profile_assets")
          .update({
            type,
            title,
            description,
            location,
            detail,
            image_url: imageUrl,
            image_path: imagePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAsset.id)
          .eq("user_id", user.id)
          .select(
            [
              "id",
              "type",
              "title",
              "description",
              "location",
              "detail",
              "image_url",
              "image_path",
            ].join(","),
          )
          .single();

        if (error) {
          if (uploadedImagePath) {
            await supabase.storage
              .from("asset-images")
              .remove([uploadedImagePath]);
          }

          throw error;
        }

        if (oldImagePath && imagePath && oldImagePath !== imagePath) {
          const { error: removeOldImageError } = await supabase.storage
            .from("asset-images")
            .remove([oldImagePath]);

          if (removeOldImageError) {
            console.error("Foto aset lama gagal dihapus:", removeOldImageError);
          }
        }

        setAssets((currentAssets) =>
          currentAssets.map((asset) =>
            asset.id === editingAsset.id
              ? {
                  id: String(data.id),
                  type: data.type === "truck" ? "truck" : "field",
                  title: textFallback(data.title),
                  description: textFallback(data.description),
                  location: textFallback(data.location),
                  detail: textFallback(data.detail),
                  image: String(data.image_url ?? ""),
                  imagePath: String(data.image_path ?? ""),
                }
              : asset,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("profile_assets")
          .insert({
            user_id: user.id,
            type,
            title,
            description,
            location,
            detail,
            image_url: imageUrl,
            image_path: imagePath,
          })
          .select(
            [
              "id",
              "type",
              "title",
              "description",
              "location",
              "detail",
              "image_url",
              "image_path",
            ].join(","),
          )
          .single();

        if (error) {
          if (uploadedImagePath) {
            await supabase.storage
              .from("asset-images")
              .remove([uploadedImagePath]);
          }

          throw error;
        }

        setAssets((currentAssets) => [
          ...currentAssets,
          {
            id: String(data.id),
            type: data.type === "truck" ? "truck" : "field",
            title: textFallback(data.title),
            description: textFallback(data.description),
            location: textFallback(data.location),
            detail: textFallback(data.detail),
            image: String(data.image_url ?? ""),
            imagePath: String(data.image_path ?? ""),
          },
        ]);
      }

      closeAssetModal();
    } catch (error) {
      console.error("Aset gagal disimpan:", error);
      window.alert(`Aset gagal disimpan. ${getErrorMessage(error)}`);
    }
  };

  const handleRemoveAsset = async (asset: ProfileAsset) => {
    const confirmed = window.confirm(`Hapus aset "${asset.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      const { error: deleteError } = await supabase
        .from("profile_assets")
        .delete()
        .eq("id", asset.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      if (asset.imagePath) {
        const { error: removeImageError } = await supabase.storage
          .from("asset-images")
          .remove([asset.imagePath]);

        if (removeImageError) {
          console.error(
            "Foto aset gagal dihapus dari Storage:",
            removeImageError,
          );
        }
      }

      setAssets((currentAssets) =>
        currentAssets.filter((item) => item.id !== asset.id),
      );
    } catch (error) {
      console.error("Aset gagal dihapus:", error);
      window.alert(`Aset gagal dihapus. ${getErrorMessage(error)}`);
    }
  };

  const handleResetAssets = async () => {
    const confirmed = window.confirm("Kembalikan aset ke data awal?");

    if (!confirmed) {
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sesi pengguna tidak ditemukan.");
      }

      const imagePaths = assets
        .map((asset) => asset.imagePath)
        .filter((path): path is string => Boolean(path));

      const { error: deleteError } = await supabase
        .from("profile_assets")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      if (imagePaths.length > 0) {
        const { error: removeImagesError } = await supabase.storage
          .from("asset-images")
          .remove(imagePaths);

        if (removeImagesError) {
          console.error("Sebagian foto aset gagal dihapus:", removeImagesError);
        }
      }

      setAssets([]);
    } catch (error) {
      console.error("Aset gagal direset:", error);
      window.alert(`Aset gagal direset. ${getErrorMessage(error)}`);
    }
  };

  const verifiedCount = documents.filter(
    (document) => document.status === "Verified",
  ).length;

  const completionPercentage = Math.min(
    100,
    Math.max(0, profile.completionPercentage),
  );

  return (
    <AppShell>
      <div className="page profile-page">
        <section className="card profile-hero">
          <div className="profile-hero-main">
            <label
              className="profile-photo profile-photo-editable"
              title={t("Edit foto profil")}
            >
              {profile.photo ? (
                <img
                  key={profile.photo}
                  src={profile.photo}
                  alt={`Foto profil ${profile.name}`}
                  className="profile-photo-image"
                />
              ) : (
                <span className="profile-photo-initials">
                  {getInitials(profile.name)}
                </span>
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

            <div className="profile-hero-copy">
              <div className="profile-title">
                <h1>{profile.name}</h1>

                {profile.verified && (
                  <i className="profile-verified">
                    <Verified aria-hidden="true" />
                    {t("Akun Terverifikasi - Gold")}
                  </i>
                )}
              </div>

              <h3>{profile.role}</h3>

              <p className="profile-meta">
                <span>
                  <MapPin aria-hidden="true" />
                  {profile.location}
                </span>

                <span>
                  <Calendar aria-hidden="true" />
                  {profile.memberSince === "-"
                    ? "-"
                    : `Member since ${formatMemberSince(profile.memberSince)}`}
                </span>
              </p>

              <div className="profile-contact">
                <span>
                  <Mail aria-hidden="true" />
                  {profile.email}
                </span>

                <span>
                  <Phone aria-hidden="true" />
                  {profile.phone === "0" ? "0" : `+${profile.phone}`}
                </span>
              </div>

              <Button variant="outline" onClick={() => setModal("profile")}>
                <Pencil aria-hidden="true" />
                {t("Edit Profil")}
              </Button>
            </div>
          </div>

          <aside className="profile-hero-stats">
            <b>
              {profile.loadCount}
              <small>{t("Muatan")}</small>
            </b>

            <b>
              {completionPercentage}%<small>{t("Kelengkapan")}</small>
            </b>

            <b className="profile-stat-rating">
              <span>
                {profile.rating}
                <Star aria-hidden="true" />
              </span>

              <small>{t("Rating")}</small>
            </b>
          </aside>
        </section>

        <div className="profile-grid">
          <section className="profile-column">
            <section className="card profile-highlight">
              <div>
                <small>{t("Profil Bisnis")}</small>

                <strong>
                  {t("Siap menerima mitra logistik dan pembeli baru")}
                </strong>

                <p>
                  {t(
                    "Dokumen inti aktif, aset tersimpan, dan data kontak sudah siap untuk proses matching muatan.",
                  )}
                </p>
              </div>

              <div className="profile-complete">
                <strong>{completionPercentage}%</strong>

                <small>{completionPercentage}% lengkap</small>

                <span className="profile-complete-bar" aria-hidden="true">
                  <i
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </span>
              </div>
            </section>

            <div className="profile-section-head">
              <div>
                <h2>{t("Verifikasi Identitas & Dokumen Usaha")}</h2>

                <p>
                  {verifiedCount}/{documents.length}{" "}
                  {t("dokumen terverifikasi")}
                </p>
              </div>
            </div>

            {documents.map((document) => {
              const DocumentIcon =
                document.documentType === "ktp"
                  ? IdCard
                  : document.documentType === "sim"
                    ? Car
                    : document.documentType === "land"
                      ? LandPlot
                      : FileText;

              return (
                <article className="verify verify-functional" key={document.id}>
                  <DocumentIcon aria-hidden="true" />

                  <div>
                    <b>{document.title}</b>
                    <small>{document.description}</small>

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
                          : document.status === "Not Uploaded"
                            ? "missing"
                            : "verified"
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
                        ? t("Unggah")
                        : t("Ganti")}

                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          handleDocumentUpload(document.id, event)
                        }
                      />
                    </label>

                    {document.status !== "Not Uploaded" && (
                      <button
                        type="button"
                        className="verify-remove"
                        aria-label={`Hapus dokumen ${document.title}`}
                        onClick={() => handleRemoveDocument(document.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="profile-column">
            <div className="profile-section-head">
              <div>
                <h2>{t("Aset Pertanian & Logistik")}</h2>

                <p>
                  {t("Kelola lahan dan armada yang terhubung dengan akun.")}
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

                <Button variant="ghost" onClick={openAddAssetModal}>
                  <Plus aria-hidden="true" />
                  {t("Tambah Lahan / Armada")}
                </Button>
              </div>
            </div>

            <div className="asset-grid">
              {assets.map((asset) => (
                <article className="asset-card" key={asset.id}>
                  <div
                    className={`asset-image ${asset.type}`}
                    style={{
                      backgroundImage: asset.image
                        ? `url("${asset.image}")`
                        : "none",
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

                      {asset.type === "field" ? t("Lahan") : t("Armada")}
                    </span>
                  </div>

                  <div className="asset-row">
                    <div>
                      <b>{asset.title}</b>

                      <p>
                        {asset.detail} - {asset.location}
                      </p>

                      <small>{asset.description}</small>
                    </div>

                    <div className="asset-card-actions">
                      <button
                        type="button"
                        className="asset-edit"
                        aria-label={`Edit ${asset.title}`}
                        title={`Edit ${asset.title}`}
                        onClick={() => openEditAssetModal(asset)}
                      >
                        <Pencil aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        className="asset-remove"
                        aria-label={`Hapus ${asset.title}`}
                        title={`Hapus ${asset.title}`}
                        onClick={() => handleRemoveAsset(asset)}
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
                  {t("Tambah Lahan / Armada")}
                </button>
              )}
            </div>

            <div className="profile-review-section">
              <h2>{t("Ulasan Mitra")}</h2>

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

                  <span className="review-stars" aria-label="Rating 5 dari 5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} aria-hidden="true" />
                    ))}
                  </span>
                </div>

                <p>
                  “Proses muat cepat, penimbangan jujur dan ramah. Akses jalan
                  ke lahan cukup baik untuk CDD.”
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
          <Modal title="Edit Profil" onClose={() => setModal(null)}>
            <form className="form" onSubmit={handleProfileSubmit}>
              <label>
                Nama Lengkap
                <input
                  name="name"
                  defaultValue={profile.name === "-" ? "" : profile.name}
                />
              </label>

              <label>
                Peran atau Jenis Usaha
                <input
                  name="role"
                  defaultValue={profile.role === "-" ? "" : profile.role}
                />
              </label>

              <label>
                Lokasi
                <input
                  name="location"
                  defaultValue={
                    profile.location === "-" ? "" : profile.location
                  }
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email === "-" ? "" : profile.email}
                />
              </label>

              <label>
                Nomor WhatsApp
                <input
                  name="phone"
                  inputMode="numeric"
                  defaultValue={profile.phone === "0" ? "" : profile.phone}
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
              editingAsset ? "Edit Lahan / Armada" : "Tambah Lahan / Armada"
            }
            onClose={closeAssetModal}
          >
            <form className="form asset-form" onSubmit={handleAssetSubmit}>
              <label>
                Jenis
                <select
                  name="type"
                  defaultValue={editingAsset?.type ?? "field"}
                  required
                >
                  <option value="field">Lahan Pertanian</option>
                  <option value="truck">Armada Logistik</option>
                </select>
              </label>

              <label>
                Title atau Nama Aset
                <input
                  name="title"
                  defaultValue={
                    editingAsset?.title === "-"
                      ? ""
                      : (editingAsset?.title ?? "")
                  }
                  placeholder="Contoh: Lahan Cabai Merah"
                />
              </label>

              <label>
                Deskripsi
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    editingAsset?.description === "-"
                      ? ""
                      : (editingAsset?.description ?? "")
                  }
                  placeholder="Jelaskan fungsi atau kondisi aset"
                />
              </label>

              <div className="form-grid">
                <label>
                  Lokasi
                  <input
                    name="location"
                    defaultValue={
                      editingAsset?.location === "-"
                        ? ""
                        : (editingAsset?.location ?? "")
                    }
                    placeholder="Contoh: Garut"
                  />
                </label>

                <label>
                  Luas, Kapasitas, atau Nomor Polisi
                  <input
                    name="detail"
                    defaultValue={
                      editingAsset?.detail === "-"
                        ? ""
                        : (editingAsset?.detail ?? "")
                    }
                    placeholder="2.5 Hektar atau Z 8201 AB"
                  />
                </label>
              </div>

              <label>
                Foto
                <input
                  name="image"
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
                  {editingAsset ? "Simpan Perubahan" : "Tambah Aset"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
