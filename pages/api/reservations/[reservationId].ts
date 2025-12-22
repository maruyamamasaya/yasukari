import type { NextApiRequest, NextApiResponse } from "next";

import {
  fetchReservationById,
  Reservation,
  updateReservation,
} from "../../../lib/reservations";

type ReservationDetailResponse = {
  reservation: Reservation;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationDetailResponse | { error: string }>
) {
  const reservationId = req.query.reservationId;
  if (typeof reservationId !== "string") {
    return res.status(400).json({ error: "reservationId is required" });
  }

  if (req.method === "GET") {
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

  if (req.method === "PATCH") {
    try {
      const existingReservation = await fetchReservationById(reservationId);
      if (!existingReservation) {
        return res.status(404).json({ error: "予約が見つかりませんでした" });
      }

      const body = req.body as Partial<Reservation> & { vehicleModel?: string };
      const updates: Partial<Reservation> = {};

      if (typeof body.vehicleCode === "string") {
        updates.vehicleCode = body.vehicleCode;
      }

      if (typeof body.vehiclePlate === "string") {
        updates.vehiclePlate = body.vehiclePlate;
      }

      if (body.vehicleCode || body.vehiclePlate) {
        if (body.vehicleModel && body.vehicleModel !== existingReservation.vehicleModel) {
          return res.status(400).json({ error: "同一車種の車両のみ選択できます" });
        }

        updates.vehicleChangedAt = body.vehicleChangedAt ?? new Date().toISOString();
        updates.vehicleChangeNotified = body.vehicleChangeNotified ?? false;
      }

      if (typeof body.status === "string") {
        updates.status = body.status;
      }

      if (typeof body.refundNote === "string") {
        updates.refundNote = body.refundNote;
      }

      if (typeof body.memberPhone === "string") {
        updates.memberPhone = body.memberPhone;
      }

      if (typeof body.memberCountryCode === "string") {
        updates.memberCountryCode = body.memberCountryCode;
      }

      if (typeof body.vehicleChangeNotified === "boolean" && !updates.vehicleChangedAt) {
        updates.vehicleChangeNotified = body.vehicleChangeNotified;
      }

      const reservation = await updateReservation(reservationId, updates);
      return res.status(200).json({ reservation });
    } catch (error) {
      console.error(`Failed to update reservation ${reservationId}`, error);
      return res.status(500).json({ error: "予約データの更新に失敗しました。" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
}
