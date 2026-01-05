import type { NextApiRequest, NextApiResponse } from "next";

import { getCognitoAuthFromRequest } from "../../../lib/cognitoServer";
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
    const auth = await getCognitoAuthFromRequest({
      cookies: req.cookies,
      authorization: req.headers.authorization,
      setCookie: (cookies) => res.setHeader("Set-Cookie", cookies),
    });

    if (!auth?.payload.sub) {
      return res.status(401).json({ error: "認証が必要です" });
    }

    const reservations = await fetchReservationsByMember(auth.payload.sub);
    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("Failed to load member reservations", error);
    return res.status(500).json({ error: "予約データの取得に失敗しました。" });
  }
}
