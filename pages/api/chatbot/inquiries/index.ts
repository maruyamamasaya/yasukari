import type { NextApiRequest, NextApiResponse } from "next";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient, scanAllItems } from "../../../../lib/dynamodb";

type ChatSessionRecord = {
  session_id: string;
  user_id?: string | null;
  client_id: string;
  is_logged_in?: boolean;
  created_at: string;
  last_activity_at: string;
};

type ChatMessageRecord = {
  content?: string;
};

type InquirySummaryResponse = {
  inquiries: Array<{
    sessionId: string;
    isLoggedIn: boolean;
    userId: string | null;
    clientId: string;
    createdAt: string;
    lastActivityAt: string;
    messageCount: number;
    userMessageCount: number;
    firstUserMessage?: string;
  }>;
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

async function countMessages(sessionId: string) {
  const client = getDocumentClient();

  const [messageCountResponse, userMessageCountResponse] = await Promise.all([
    client.send(
      new QueryCommand({
        TableName: "ChatMessages",
        KeyConditionExpression: "session_id = :sessionId",
        ExpressionAttributeValues: { ":sessionId": sessionId },
        Select: "COUNT",
      })
    ),
    client.send(
      new QueryCommand({
        TableName: "ChatMessages",
        KeyConditionExpression: "session_id = :sessionId",
        ExpressionAttributeValues: { ":sessionId": sessionId, ":role": "user" },
        FilterExpression: "#role = :role",
        ExpressionAttributeNames: { "#role": "role" },
        Select: "COUNT",
      })
    ),
  ]);

  return {
    messageCount: messageCountResponse.Count ?? 0,
    userMessageCount: userMessageCountResponse.Count ?? 0,
  };
}

async function findFirstUserMessage(sessionId: string) {
  const client = getDocumentClient();
  const response = await client.send(
    new QueryCommand({
      TableName: "ChatMessages",
      KeyConditionExpression: "session_id = :sessionId",
      ExpressionAttributeValues: { ":sessionId": sessionId },
      ScanIndexForward: true,
      Limit: 1,
    })
  );

  const firstMessage = response.Items?.[0] as ChatMessageRecord | undefined;
  return firstMessage?.content;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InquirySummaryResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  const sessions = await scanAllItems<ChatSessionRecord>({
    TableName: "ChatSessions",
    ProjectionExpression:
      "session_id, user_id, client_id, is_logged_in, created_at, last_activity_at",
  });

  const inquiries = await Promise.all(
    sessions.map(async (session) => {
      const { messageCount, userMessageCount } = await countMessages(session.session_id);
      const firstUserMessage = await findFirstUserMessage(session.session_id);

      return {
        ...normalizeSession(session),
        messageCount,
        userMessageCount,
        firstUserMessage,
      };
    })
  );

  const sorted = inquiries.sort((a, b) =>
    a.lastActivityAt > b.lastActivityAt ? -1 : 1
  );

  return res.status(200).json({ inquiries: sorted });
}
