import type { NextApiRequest, NextApiResponse } from "next";

import { fetchKeyboxLogs, KeyboxLog } from "../../../lib/keyboxLogs";

type KeyboxLogResponse = {
  logs: KeyboxLog[];
  fromFallback: boolean;
  errorMessage?: string;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<KeyboxLogResponse | { message: string }>
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
  const limit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : 200;

  try {
    const { logs, fromFallback, errorMessage } = await fetchKeyboxLogs(limit);
    response.status(200).json({ logs, fromFallback, errorMessage });
  } catch (error) {
    console.error("Failed to fetch keybox logs", error);
    response.status(500).json({ message: "Failed to fetch keybox logs" });
  }
}
