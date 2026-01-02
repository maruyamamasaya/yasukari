import crypto from "crypto";

import { addKeyboxLog, KeyboxLog } from "./keyboxLogs";
import { Reservation } from "./reservations";

const BASE_URL = process.env.KEYBOX_BASE_URL ?? "https://eco.blockchainlock.io";
const API_KEY = process.env.KEYBOX_API_KEY ?? process.env.API_KEY ?? "";
const SECRET_KEY = process.env.KEYBOX_SECRET_KEY ?? process.env.SECRET_KEY ?? "";
const UNIT_ID_OVERRIDE = process.env.KEYBOX_UNIT_ID_OVERRIDE ?? process.env.UNIT_ID_OVERRIDE ?? "";

const PATH_CREATE_PIN = "/api/eagle-pms/v1/createLockPin";
const BUFFER_MS = 60 * 60 * 1000; // 1 hour buffer before/after rental

const jsonMinified = (payload: unknown): string =>
  JSON.stringify(payload, (_key, value) => value ?? undefined);

const b64sha256 = (data: string): string => {
  const hash = crypto.createHash("sha256").update(data).digest();
  return hash.toString("base64");
};

const rfc1123Now = (): string => new Date().toUTCString();

const okResponse = (obj: Record<string, unknown> | null | undefined): boolean => {
  if (!obj) return false;
  if (obj["code"] === "0" && obj["msg"] === "success") return true;
  if (obj["msg"] === "success") return true;
  return false;
};

const signHeadersA = (path: string, body: string) => {
  const date = rfc1123Now();
  const digest = `SHA-256=${b64sha256(body)}`;
  const requestLine = `POST ${path} HTTP/1.1`;
  const stringToSign = `date: ${date}\n${requestLine}\ndigest: ${digest}`;

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(stringToSign)
    .digest("base64");

  const authorization = `hmac username="${API_KEY}", algorithm="hmac-sha256", headers="date request-line digest", signature="${signature}"`;

  return {
    headers: {
      Host: "eco.blockchainlock.io",
      "Content-Type": "application/json",
      "x-target-host": "default.pms",
      date,
      digest,
      authorization,
    },
    stringToSign,
  };
};

const signHeadersB = (path: string, body: string) => {
  const date = rfc1123Now();
  const digest = b64sha256(body);
  const stringToSign = `POST\n${path}\n` + `x-target-host: default.pms\n` + `date: ${date}\n` + `digest: ${digest}`;

  const signature = crypto.createHmac("sha256", SECRET_KEY).update(stringToSign).digest("base64");
  const authorization = `HMAC ${API_KEY}:${signature}`;

  return {
    headers: {
      Host: "eco.blockchainlock.io",
      "Content-Type": "application/json",
      "x-target-host": "default.pms",
      date,
      digest,
      authorization,
    },
    stringToSign,
  };
};

const parseJsonResponse = async (response: Response): Promise<Record<string, unknown>> => {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    return { http_status: response.status, text: await response.text(), error: String(error) };
  }
};

const postSignedJson = async (
  path: string,
  body: Record<string, unknown>
): Promise<{
  response: Record<string, unknown>;
  signUsed: "A" | "B";
  signString: string;
}> => {
  const url = `${BASE_URL}${path}`;
  const payload = jsonMinified(body);

  const { headers: headersA, stringToSign: stringA } = signHeadersA(path, payload);
  const resA = await fetch(url, {
    method: "POST",
    headers: headersA,
    body: payload,
  });
  const objA = await parseJsonResponse(resA);
  if (okResponse(objA)) {
    return { response: { ...objA, _sign_used: "A" }, signUsed: "A", signString: stringA };
  }

  const { headers: headersB, stringToSign: stringB } = signHeadersB(path, payload);
  const resB = await fetch(url, {
    method: "POST",
    headers: headersB,
    body: payload,
  });
  const objB = await parseJsonResponse(resB);
  return { response: { ...objB, _sign_used: "B" }, signUsed: "B", signString: stringB };
};

const toEpochSeconds = (date: Date): number => Math.floor(date.getTime() / 1000);

const randomPinCode = () => String(Math.floor(100000 + Math.random() * 900000));

const randomUnitId = () => crypto.randomBytes(12).toString("hex");

const qrImageUrl = (qrCode: string) =>
  qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrCode)}`
    : "";

export type KeyboxIssueResult = {
  log: KeyboxLog;
  reservationUpdates?: Partial<Reservation>;
};

type KeyboxIssueParams = {
  windowStart: Date;
  windowEnd: Date;
  targetName?: string;
  pinCode?: string;
  unitId?: string;
  storeName?: string;
  memberId?: string;
  reservationId?: string;
  source?: string;
};

type KeyboxIssueResponse = {
  log: KeyboxLog;
  pinCode: string;
  pinId?: string;
  qrCode?: string;
  qrImageUrl?: string;
  signUsed?: "A" | "B";
  unitId: string;
  windowStart: string;
  windowEnd: string;
  targetName: string;
  success: boolean;
};

export async function issueKeyboxPin(params: KeyboxIssueParams): Promise<KeyboxIssueResponse> {
  const targetName = params.targetName || "WEB予約PIN";
  const unitId = params.unitId || UNIT_ID_OVERRIDE || randomUnitId();
  const pinCode = params.pinCode || randomPinCode();

  if (!API_KEY || !SECRET_KEY) {
    const log = await addKeyboxLog({
      reservationId: params.reservationId,
      memberId: params.memberId,
      storeName: params.storeName,
      unitId,
      pinCode,
      success: false,
      message: "KEYBOX API_KEY / SECRET_KEY is not configured",
    });
    return {
      log,
      pinCode,
      unitId,
      windowStart: params.windowStart.toISOString(),
      windowEnd: params.windowEnd.toISOString(),
      targetName,
      success: false,
    };
  }

  const startEpoch = toEpochSeconds(params.windowStart);
  const endEpoch = toEpochSeconds(params.windowEnd);

  const body = {
    unitId,
    pinCode,
    sTime: String(startEpoch),
    eTime: String(endEpoch),
    targetName,
  };

  let responseBody: Record<string, unknown> = {};
  let signUsed: "A" | "B" | undefined;
  let message = "";
  let success = false;

  try {
    const result = await postSignedJson(PATH_CREATE_PIN, body);
    responseBody = result.response;
    signUsed = result.signUsed;
    success = okResponse(result.response);
    message = success ? "PIN created" : `API error: ${result.response?.msg ?? "unknown"}`;
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
    responseBody = { error: message };
  }

  const qrCode = (responseBody?.data as { qrCode?: string } | undefined)?.qrCode;
  const pinId = (responseBody?.data as { pinId?: string } | undefined)?.pinId;
  const qrCodeUrl = qrCode ? qrImageUrl(qrCode) : "";
  const logMessage = message
    ? params.source
      ? `${params.source}: ${message}`
      : message
    : undefined;

  const log = await addKeyboxLog({
    reservationId: params.reservationId,
    memberId: params.memberId,
    storeName: params.storeName,
    unitId,
    pinCode,
    pinId,
    qrCode,
    qrImageUrl: qrCodeUrl,
    windowStart: new Date(startEpoch * 1000).toISOString(),
    windowEnd: new Date(endEpoch * 1000).toISOString(),
    requestBody: body,
    responseBody,
    success,
    signUsed,
    targetName,
    message: logMessage,
  });

  return {
    log,
    pinCode,
    pinId,
    qrCode,
    qrImageUrl: qrCodeUrl,
    signUsed,
    unitId,
    windowStart: new Date(startEpoch * 1000).toISOString(),
    windowEnd: new Date(endEpoch * 1000).toISOString(),
    targetName,
    success,
  };
}

export async function issueKeyboxPinForReservation(
  reservation: Reservation
): Promise<KeyboxIssueResult> {
  const pickupAt = new Date(reservation.pickupAt);
  const returnAt = new Date(reservation.returnAt);

  if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime())) {
    const log = await addKeyboxLog({
      reservationId: reservation.id,
      memberId: reservation.memberId,
      storeName: reservation.storeName,
      unitId: UNIT_ID_OVERRIDE || "",
      pinCode: "",
      success: false,
      message: "Failed to parse pickup/return datetime for keybox issuance",
    });
    return { log };
  }

  const result = await issueKeyboxPin({
    windowStart: new Date(pickupAt.getTime() - BUFFER_MS),
    windowEnd: new Date(returnAt.getTime() + BUFFER_MS),
    targetName: reservation.memberName || "WEB予約PIN",
    storeName: reservation.storeName,
    memberId: reservation.memberId,
    reservationId: reservation.id,
    source: "reservation",
  });

  const reservationUpdates = result.success
    ? {
        keyboxPinCode: result.pinCode,
        keyboxPinId: result.pinId ?? "",
        keyboxQrCode: result.qrCode ?? "",
        keyboxQrImageUrl: result.qrImageUrl ?? "",
        keyboxUnitId: result.unitId,
        keyboxWindowStart: result.windowStart,
        keyboxWindowEnd: result.windowEnd,
        keyboxTargetName: result.targetName,
        keyboxSignUsed: result.signUsed,
      }
    : undefined;

  return { log: result.log, reservationUpdates };
}
