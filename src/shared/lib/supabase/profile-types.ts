export type AssetType = "field" | "truck";

export type DocumentStatus = "Verified" | "Pending" | "Not Uploaded";

export type SupabaseProfile = {
  id: string;
  name: string | null;
  role: string | null;
  location: string | null;
  phone: string | null;
  photo_url: string | null;
  verified: boolean;
  member_since: string | null;
  load_count: number | null;
  completion_percentage: number | null;
  rating: number | null;
};

export type ProfileAssetRow = {
  id: string;
  user_id: string;
  type: AssetType;
  title: string | null;
  description: string | null;
  location: string | null;
  detail: string | null;
  image_url: string | null;
  image_path: string | null;
};

export type VerificationDocumentRow = {
  id: string;
  user_id: string;
  document_type: string;
  title: string | null;
  description: string | null;
  status: DocumentStatus;
  file_name: string | null;
  file_path: string | null;
};
