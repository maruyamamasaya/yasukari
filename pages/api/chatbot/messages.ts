import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient } from "../../../lib/dynamodb";

type ChatbotRequestBody = {
  message?: string;
  sessionId?: string | null;
  clientId?: string;
  userId?: string | null;
};

type ChatbotResponseBody = {
  sessionId: string;
  userMessage: {
    messageId: string;
    messageIndex: number;
    createdAt: string;
    content: string;
  };
  assistantMessage: {
    messageId: string;
    messageIndex: number;
    createdAt: string;
    content: string;
  };
};

function nowIsoString(): string {
  return new Date().toISOString();
}

async function findLatestMessageIndex(
  sessionId: string
): Promise<number> {
  const client = getDocumentClient();
  const response = await client.send(
    new QueryCommand({
      TableName: "ChatMessages",
      KeyConditionExpression: "session_id = :sessionId",
      ExpressionAttributeValues: { ":sessionId": sessionId },
      ProjectionExpression: "message_index",
      ScanIndexForward: false,
      Limit: 1,
    })
  );

  const latest = response.Items?.[0]?.message_index;
  if (typeof latest === "number") {
    return latest;
  }

  if (typeof latest === "string") {
    const parsed = Number(latest);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

async function ensureSessionRecord(
  sessionId: string,
  userId: string | null,
  clientId: string,
  now: string
) {
  const client = getDocumentClient();
  const existing = await client.send(
    new GetCommand({
      TableName: "ChatSessions",
      Key: { session_id: sessionId },
    })
  );

  if (existing.Item) {
    await client.send(
      new UpdateCommand({
        TableName: "ChatSessions",
        Key: { session_id: sessionId },
        UpdateExpression:
          "SET #last_activity_at = :now, #user_id = :user_id, #client_id = :client_id, #is_logged_in = :is_logged_in",
        ExpressionAttributeNames: {
          "#last_activity_at": "last_activity_at",
          "#user_id": "user_id",
          "#client_id": "client_id",
          "#is_logged_in": "is_logged_in",
        },
        ExpressionAttributeValues: {
          ":now": now,
          ":user_id": userId,
          ":client_id": clientId,
          ":is_logged_in": Boolean(userId),
        },
      })
    );
    return;
  }

  await client.send(
    new PutCommand({
      TableName: "ChatSessions",
      Item: {
        session_id: sessionId,
        user_id: userId,
        client_id: clientId,
        is_logged_in: Boolean(userId),
        created_at: now,
        last_activity_at: now,
      },
    })
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatbotResponseBody | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  const { message, sessionId, clientId, userId }: ChatbotRequestBody =
    req.body ?? {};

  if (!clientId || typeof clientId !== "string") {
    return res.status(400).json({ error: "clientId is required" });
  }

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const normalizedSessionId =
    typeof sessionId === "string" && sessionId.trim().length > 0
      ? sessionId
      : randomUUID();
  const normalizedUserId =
    typeof userId === "string" && userId.trim().length > 0 ? userId : null;
  const now = nowIsoString();

  await ensureSessionRecord(normalizedSessionId, normalizedUserId, clientId, now);

  const latestIndex = await findLatestMessageIndex(normalizedSessionId);
  const userMessageIndex = latestIndex + 1;
  const assistantMessageIndex = userMessageIndex + 1;

  const userMessageId = randomUUID();
  const assistantMessageId = randomUUID();
  const assistantContent = "ただいま確認中です。後ほどご回答いたします。";

  const client = getDocumentClient();
  await client.send(
    new PutCommand({
      TableName: "ChatMessages",
      Item: {
        session_id: normalizedSessionId,
        message_id: userMessageId,
        role: "user",
        content: message,
        user_id: normalizedUserId,
        client_id: clientId,
        created_at: now,
        message_index: userMessageIndex,
      },
    })
  );

  await client.send(
    new PutCommand({
      TableName: "ChatMessages",
      Item: {
        session_id: normalizedSessionId,
        message_id: assistantMessageId,
        role: "assistant",
        content: assistantContent,
        user_id: normalizedUserId,
        client_id: clientId,
        created_at: now,
        message_index: assistantMessageIndex,
      },
    })
  );

  return res.status(200).json({
    sessionId: normalizedSessionId,
    userMessage: {
      messageId: userMessageId,
      messageIndex: userMessageIndex,
      createdAt: now,
      content: message,
    },
    assistantMessage: {
      messageId: assistantMessageId,
      messageIndex: assistantMessageIndex,
      createdAt: now,
      content: assistantContent,
    },
  });
}
