import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient } from "../../../../lib/dynamodb";

type ChatSessionRecord = {
  session_id: string;
  user_id?: string | null;
  client_id: string;
  is_logged_in?: boolean;
  created_at: string;
  last_activity_at: string;
};

type ChatMessageRecord = {
  session_id: string;
  message_id: string;
  message_index: number | string;
  role: "user" | "assistant";
  content: string;
  user_id?: string | null;
  client_id: string;
  created_at: string;
};

type InquiryDetailResponse = {
  inquiry: {
    sessionId: string;
    isLoggedIn: boolean;
    userId: string | null;
    clientId: string;
    createdAt: string;
    lastActivityAt: string;
    messages: Array<{
      messageId: string;
      role: "user" | "assistant";
      content: string;
      userId: string | null;
      clientId: string;
      createdAt: string;
      messageIndex: number;
    }>;
  };
};

function normalizeSession(record: ChatSessionRecord) {
  return {
    sessionId: record.session_id,
    isLoggedIn: Boolean(record.is_logged_in || record.user_id),
    userId: typeof record.user_id === "string" ? record.user_id : null,
    clientId: record.client_id,
    createdAt: record.created_at,
    lastActivityAt: record.last_activity_at,
  };
}

function normalizeMessages(records: ChatMessageRecord[]) {
  return records.map((message) => ({
    messageId: message.message_id,
    role: message.role,
    content: message.content,
    userId: typeof message.user_id === "string" ? message.user_id : null,
    clientId: message.client_id,
    createdAt: message.created_at,
    messageIndex:
      typeof message.message_index === "number"
        ? message.message_index
        : Number(message.message_index),
  }));
}

async function findLatestMessageIndex(sessionId: string) {
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

  const parsed = Number(latest);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function fetchSession(sessionId: string) {
  const client = getDocumentClient();
  const session = await client.send(
    new GetCommand({
      TableName: "ChatSessions",
      Key: { session_id: sessionId },
    })
  );

  return session.Item as ChatSessionRecord | undefined;
}

async function fetchMessages(sessionId: string) {
  const client = getDocumentClient();
  const response = await client.send(
    new QueryCommand({
      TableName: "ChatMessages",
      KeyConditionExpression: "session_id = :sessionId",
      ExpressionAttributeValues: { ":sessionId": sessionId },
      ScanIndexForward: true,
    })
  );

  return normalizeMessages((response.Items ?? []) as ChatMessageRecord[]);
}

async function appendReply(session: ChatSessionRecord, content: string) {
  const client = getDocumentClient();
  const now = new Date().toISOString();
  const nextIndex = (await findLatestMessageIndex(session.session_id)) + 1;
  const messageId = randomUUID();

  await client.send(
    new PutCommand({
      TableName: "ChatMessages",
      Item: {
        session_id: session.session_id,
        message_id: messageId,
        message_index: nextIndex,
        role: "assistant",
        content,
        user_id: session.user_id ?? null,
        client_id: session.client_id,
        created_at: now,
      },
    })
  );

  await client.send(
    new UpdateCommand({
      TableName: "ChatSessions",
      Key: { session_id: session.session_id },
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
        ":user_id": session.user_id ?? null,
        ":client_id": session.client_id,
        ":is_logged_in": Boolean(session.is_logged_in || session.user_id),
      },
    })
  );

  return {
    messageId,
    content,
    role: "assistant" as const,
    userId: typeof session.user_id === "string" ? session.user_id : null,
    clientId: session.client_id,
    createdAt: now,
    messageIndex: nextIndex,
    lastActivityAt: now,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InquiryDetailResponse | { error: string }>
) {
  const { sessionId } = req.query;

  if (typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const session = await fetchSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (req.method === "POST") {
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (content.length === 0) {
      return res.status(400).json({ error: "content is required" });
    }

    const reply = await appendReply(session, content);
    return res.status(200).json({
      inquiry: {
        ...normalizeSession({ ...session, last_activity_at: reply.lastActivityAt }),
        messages: [reply],
      },
    });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  const messages = await fetchMessages(sessionId);

  return res.status(200).json({
    inquiry: {
      ...normalizeSession(session),
      messages,
    },
  });
}
