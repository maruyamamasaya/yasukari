export type PhotoUpload = {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "登録済み" | "確認済み";
  s3Url: string;
  notes?: string;
};

const STORAGE_KEY = "admin-photo-uploads";

export const loadPhotoUploads = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as PhotoUpload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load photo uploads", error);
    return [];
  }
};

export const savePhotoUploads = (uploads: PhotoUpload[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
  } catch (error) {
    console.error("Failed to save photo uploads", error);
  }
};

export const findPhotoUpload = (uploads: PhotoUpload[], uploadId?: string) => {
  if (!uploadId) {
    return null;
  }

  return uploads.find((upload) => upload.id === uploadId) ?? null;
};
