import crypto from "crypto";
import https from "https";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const bucketName = process.env.BIKE_MODELS_BUCKET ?? "yasukari-file";
const bucketRegion = process.env.AWS_REGION ?? "ap-northeast-1";
const bucketPrefix = process.env.BIKE_MODELS_PREFIX ?? "BikeModels/";

type UploadRequestBody = {
  data?: string;
  fileName?: string;
  contentType?: string;
};

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

function getAwsCredentials(): AwsCredentials {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS認証情報が設定されていません。");
  }

  return { accessKeyId, secretAccessKey, sessionToken };
}

function hashSha256(data: string | Buffer) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getAmzDates(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  const dateStamp = `${year}${month}${day}`;
  const amzDate = `${dateStamp}T${hours}${minutes}${seconds}Z`;

  return { amzDate, dateStamp };
}

function getSignatureKey(
  secretAccessKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
) {
  const kDate = crypto
    .createHmac("sha256", `AWS4${secretAccessKey}`)
    .update(dateStamp)
    .digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
  return crypto.createHmac("sha256", kService).update("aws4_request").digest();
}

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

function uploadToS3({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const host = `${bucketName}.s3.${bucketRegion}.amazonaws.com`;
  const { accessKeyId, secretAccessKey, sessionToken } = getAwsCredentials();

  const { amzDate, dateStamp } = getAmzDates(new Date());
  const payloadHash = hashSha256(body);

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    ...(sessionToken ? [`x-amz-security-token:${sessionToken}`] : []),
  ].join("\n");

  const signedHeaders = [
    "content-type",
    "host",
    "x-amz-content-sha256",
    "x-amz-date",
    ...(sessionToken ? ["x-amz-security-token"] : []),
  ].join(";");

  const canonicalRequest = [
    "PUT",
    `/${encodeS3Key(key)}`,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${bucketRegion}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, bucketRegion, "s3");
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string | number> = {
    Authorization: authorization,
    "Content-Type": contentType,
    "Content-Length": body.length,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (sessionToken) {
    headers["x-amz-security-token"] = sessionToken;
  }

  return new Promise<string>((resolve, reject) => {
    const request = https.request(
      {
        hostname: host,
        path: `/${encodeS3Key(key)}`,
        method: "PUT",
        headers,
      },
      (response) => {
        const chunks: Uint8Array[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve(`https://${host}/${encodeS3Key(key)}`);
          } else {
            reject(
              new Error(
                responseBody || `S3へのアップロードがステータス${response.statusCode ?? "unknown"}で失敗しました。`
              )
            );
          }
        });
      }
    );

    request.on("error", (error) => {
      reject(error);
    });

    request.write(body);
    request.end();
  });
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
