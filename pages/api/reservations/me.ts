import type { NextApiRequest, NextApiResponse } from "next";

import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from "../../../lib/cognitoServer";
import { fetchReservationsByMember, Reservation } from "../../../lib/reservations";

type ReservationListResponse = {
  reservations: Reservation[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationListResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  try {
    const token = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
    const payload = await verifyCognitoIdToken(token);

    if (!payload?.sub) {
      return res.status(401).json({ error: "認証が必要です" });
    }

    const reservations = await fetchReservationsByMember(payload.sub);
    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("Failed to load member reservations", error);
    return res.status(500).json({ error: "予約データの取得に失敗しました。" });
  }
}
