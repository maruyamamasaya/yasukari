import type { NextApiRequest, NextApiResponse } from "next";

import { getMailHistory, MailHistoryEntry } from "../../../lib/mailHistory";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<{ history: MailHistoryEntry[] } | { message: string }>
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", ["GET"]);
    response.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const limitParam = Array.isArray(request.query.limit)
    ? request.query.limit[0]
    : request.query.limit;
  const parsedLimit = limitParam ? Number(limitParam) : undefined;
  const limit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;

  const history = await getMailHistory(limit);
  response.status(200).json({ history });
}
