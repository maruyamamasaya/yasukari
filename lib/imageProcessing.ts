export type PreparedImage = {
  base64: string;
  fileName: string;
  contentType: string;
};

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function readBlobAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [, base64] = result.split(",");
        resolve(base64 ?? "");
      } else {
        reject(new Error("Invalid file data"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(blob);
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(image.src);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error("画像の読み込みに失敗しました。"));
    };
    image.src = URL.createObjectURL(file);
  });
}

function getScaledSize(width: number, height: number) {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

function normalizeFileName(originalName: string, extension = ".jpg") {
  const safeName = originalName.trim() || "image";
  const dotIndex = safeName.lastIndexOf(".");
  if (dotIndex === -1) return `${safeName}${extension}`;

  const base = safeName.slice(0, dotIndex) || "image";
  return `${base}${extension}`;
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const fallback = async () => ({
    base64: await readBlobAsBase64(file),
    fileName: file.name || "image",
    contentType: file.type || "application/octet-stream",
  });

  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return fallback();
  }

  try {
    const image = await loadImageFromFile(file);
    const { width, height } = getScaledSize(image.naturalWidth, image.naturalHeight);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return fallback();
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("画像の変換に失敗しました。"));
          }
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    });

    const base64 = await readBlobAsBase64(blob);
    return {
      base64,
      fileName: normalizeFileName(file.name, ".jpg"),
      contentType: "image/jpeg",
    };
  } catch (error) {
    console.error("Failed to optimize image before upload", error);
    return fallback();
  }
}
