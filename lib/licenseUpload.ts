import { prepareImageForUpload } from "./imageProcessing";

export type LicenseUploadResult = {
  url: string;
  fileName: string;
  uploadedAt: string;
};

type UploadResponse = {
  url?: string;
  message?: string;
};

export const uploadLicenseImage = async (file: File): Promise<LicenseUploadResult> => {
  const { base64, fileName, contentType } = await prepareImageForUpload(file);
  const response = await fetch("/api/register/license-uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: base64,
      fileName,
      contentType,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as UploadResponse;

  if (!response.ok) {
    const message = result.message || "免許証画像のアップロードに失敗しました。";
    throw new Error(message);
  }

  if (!result.url) {
    throw new Error("免許証画像のURLが取得できませんでした。");
  }

  return {
    url: result.url,
    fileName,
    uploadedAt: new Date().toISOString(),
  };
};
