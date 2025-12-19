import type { NextApiRequest, NextApiResponse } from "next";

import { fetchAllReservations, Reservation } from "../../../lib/reservations";

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
    const reservations = await fetchAllReservations();
    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("Failed to load reservations", error);
    return res.status(500).json({ error: "予約データの取得に失敗しました。" });
  }
}
