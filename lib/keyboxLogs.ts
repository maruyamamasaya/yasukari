import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient, scanAllItems } from "./dynamodb";

export type KeyboxLog = {
  logId: string;
  reservationId?: string;
  memberId?: string;
  storeName?: string;
  unitId?: string;
  pinCode?: string;
  pinId?: string;
  qrCode?: string;
  qrImageUrl?: string;
  targetName?: string;
  windowStart?: string;
  windowEnd?: string;
  responseBody?: unknown;
  requestBody?: unknown;
  success: boolean;
  message?: string;
  signUsed?: string;
  createdAt: string;
};

const KEYBOX_LOG_TABLE = process.env.KEYBOX_LOG_TABLE ?? "keyboxExecutionLogs";

export async function addKeyboxLog(
  log: Omit<KeyboxLog, "logId" | "createdAt"> & { createdAt?: string }
): Promise<KeyboxLog> {
  const record: KeyboxLog = {
    ...log,
    logId: randomUUID(),
    createdAt: log.createdAt ?? new Date().toISOString(),
  };

  try {
    const client = getDocumentClient();
    await client.send(
      new PutCommand({
        TableName: KEYBOX_LOG_TABLE,
        Item: record,
      })
    );
  } catch (error) {
    console.error("Failed to store keybox log", error);
  }

  return record;
}

export async function fetchKeyboxLogs(limit = 200): Promise<KeyboxLog[]> {
  const items = await scanAllItems<KeyboxLog>({ TableName: KEYBOX_LOG_TABLE });
  return items
    .slice()
    .sort((a, b) => (a.createdAt || "" ) > (b.createdAt || "" ) ? -1 : 1)
    .slice(0, Math.max(1, limit));
}
