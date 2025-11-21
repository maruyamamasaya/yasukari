import crypto from "crypto";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucketName = process.env.BIKE_MODELS_BUCKET ?? "yasukari-file";
const bucketRegion = process.env.AWS_REGION ?? "ap-northeast-1";
const bucketPrefix = process.env.BIKE_MODELS_PREFIX ?? "BikeModels/";

type UploadRequestBody = {
  data?: string;
  fileName?: string;
  contentType?: string;
};

function normalizePrefix(prefix: string) {
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

function sanitizeFileName(fileName?: string) {
  if (!fileName) {
    return "image";
  }

  const { name, ext } = path.parse(fileName);
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
  return `${safeName}${ext}`;
}

function encodeS3Key(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

const s3Client = new S3Client({ region: bucketRegion });

async function uploadToS3({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${encodeS3Key(key)}`;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<{ url: string } | { message: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", ["POST"]);
    response.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { data, fileName, contentType }: UploadRequestBody = request.body ?? {};

  if (typeof data !== "string" || data.length === 0) {
    response.status(400).json({ message: "画像データが送信されていません。" });
    return;
  }

  const normalizedContentType =
    typeof contentType === "string" && contentType.trim().length > 0
      ? contentType
      : "application/octet-stream";

  let body: Buffer;
  try {
    body = Buffer.from(data, "base64");
  } catch (error) {
    console.error("Failed to decode image payload", error);
    response.status(400).json({ message: "画像データの形式が不正です。" });
    return;
  }

  const normalizedPrefix = normalizePrefix(bucketPrefix);
  const objectKey = `${normalizedPrefix}${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;

  try {
    const url = await uploadToS3({
      key: objectKey,
      body,
      contentType: normalizedContentType,
    });

    response.status(200).json({ url });
  } catch (error) {
    console.error("Failed to upload bike model image", error);
    response
      .status(500)
      .json({ message: "メイン画像のアップロードに失敗しました。もう一度お試しください。" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
