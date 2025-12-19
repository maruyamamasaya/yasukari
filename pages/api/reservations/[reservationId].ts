import type { NextApiRequest, NextApiResponse } from "next";

import { fetchReservationById, Reservation } from "../../../lib/reservations";

type ReservationDetailResponse = {
  reservation: Reservation;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationDetailResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  const reservationId = req.query.reservationId;
  if (typeof reservationId !== "string") {
    return res.status(400).json({ error: "reservationId is required" });
  }

  try {
    const reservation = await fetchReservationById(reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "予約が見つかりませんでした" });
    }

    return res.status(200).json({ reservation });
  } catch (error) {
    console.error(`Failed to load reservation ${reservationId}`, error);
    return res.status(500).json({ error: "予約データの取得に失敗しました。" });
  }
}
