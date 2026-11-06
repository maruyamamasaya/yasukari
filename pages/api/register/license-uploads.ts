import crypto from "crypto";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from '../../../lib/cognitoServer';
import { noStore, ownerPrefix, pendingImageRoute, requirePrivateLicenseBucket } from '../../../lib/privateLicense';

const bucketName =
  process.env.LICENSE_UPLOADS_BUCKET ??
  process.env.PHOTO_UPLOADS_BUCKET ??
  "yasukari-file";
const bucketRegion = process.env.AWS_REGION ?? "ap-northeast-1";

type UploadRequestBody = {
  data?: string;
  fileName?: string;
  contentType?: string;
};

function sanitizeFileName(fileName?: string) {
  if (!fileName) {
    return "image";
  }

  const { name, ext } = path.parse(fileName);
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
  return `${safeName}${ext}`;
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
  await requirePrivateLicenseBucket(s3Client);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "private, no-store, max-age=0",
    })
  );

  return key;
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

  noStore(response);
  let user;
  try { user = await verifyCognitoIdToken(request.cookies?.[COGNITO_ID_TOKEN_COOKIE]); }
  catch { return response.status(503).json({ message: '認証を確認できません。' }); }
  if (!user?.sub) return response.status(401).json({ message: 'ログインが必要です。' });

  const { data, fileName, contentType }: UploadRequestBody = request.body ?? {};

  if (typeof data !== "string" || data.length === 0) {
    response.status(400).json({ message: "画像データが送信されていません。" });
    return;
  }

  let body: Buffer;
  try {
    body = Buffer.from(data, "base64");
  } catch (error) {
    console.error("Failed to decode image payload", error);
    response.status(400).json({ message: "画像データの形式が不正です。" });
    return;
  }

  const detectedType = body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'image/jpeg'
    : body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png'
    : body.toString('ascii', 0, 4) === 'RIFF' && body.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null;
  if (!detectedType || body.length > 7 * 1024 * 1024) {
    return response.status(400).json({ message: 'JPEG・PNG・WebPの画像（7MB以下）を指定してください。' });
  }
  const normalizedPrefix = ownerPrefix(user.sub);
  const objectKey = `${normalizedPrefix}${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(
    fileName
  )}`;

  try {
    await uploadToS3({
      key: objectKey,
      body,
      contentType: detectedType,
    });

    response.status(200).json({ url: pendingImageRoute(objectKey) });
  } catch (error) {
    console.error("Failed to upload license image", error);
    response
      .status(500)
      .json({ message: "画像のアップロードに失敗しました。もう一度お試しください。" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
