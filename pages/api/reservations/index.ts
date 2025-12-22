import type { NextApiRequest, NextApiResponse } from "next";

import { verifyCognitoIdToken, COGNITO_ID_TOKEN_COOKIE } from "../../../lib/cognitoServer";
import { createReservation, fetchAllReservations, Reservation } from "../../../lib/reservations";

type ReservationListResponse = {
  reservations: Reservation[];
};

type CreateReservationRequest = {
  storeName?: string;
  vehicleModel?: string;
  vehicleCode?: string;
  vehiclePlate?: string;
  pickupAt?: string;
  returnAt?: string;
  status?: string;
  paymentAmount?: number;
  paymentId?: string;
  paymentDate?: string;
  rentalDurationHours?: number | null;
  rentalCompletedAt?: string;
  reservationCompletedFlag?: boolean;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  couponCode?: string;
  couponDiscount?: number;
  notes?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationListResponse | { error: string }>
) {
  if (req.method === "GET") {
    try {
      const reservations = await fetchAllReservations();
      return res.status(200).json({ reservations });
    } catch (error) {
      console.error("Failed to load reservations", error);
      return res.status(500).json({ error: "予約データの取得に失敗しました。" });
    }
  }

  if (req.method === "POST") {
    try {
      const token = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
      const payload = await verifyCognitoIdToken(token);

      if (!payload?.sub) {
        return res.status(401).json({ error: "認証が必要です" });
      }

      const body = req.body as CreateReservationRequest;
      const requiredFields: Array<keyof CreateReservationRequest> = [
        "storeName",
        "vehicleModel",
        "vehicleCode",
        "pickupAt",
        "returnAt",
        "paymentAmount",
        "paymentId",
      ];

      const missingField = requiredFields.find((field) => !body[field]);
      if (missingField) {
        return res.status(400).json({ error: `${missingField} is required` });
      }

      const reservation = await createReservation({
        storeName: body.storeName!,
        vehicleModel: body.vehicleModel!,
        vehicleCode: body.vehicleCode!,
        vehiclePlate: body.vehiclePlate ?? body.vehicleCode ?? "未設定",
        pickupAt: body.pickupAt!,
        returnAt: body.returnAt!,
        status: (body.status as Reservation["status"]) || "予約受付完了",
        paymentAmount: body.paymentAmount!,
        paymentId: body.paymentId!,
        paymentDate: body.paymentDate,
        rentalDurationHours: body.rentalDurationHours ?? null,
        rentalCompletedAt: body.rentalCompletedAt,
        reservationCompletedFlag: body.reservationCompletedFlag ?? false,
        memberId: payload.sub,
        memberName: body.memberName ?? payload["name"] ?? "",
        memberEmail: body.memberEmail ?? (payload["email"] as string) ?? "",
        memberPhone: body.memberPhone ?? "",
        couponCode: body.couponCode,
        couponDiscount: body.couponDiscount,
        options: {
          vehicleCoverage: "",
          theftCoverage: "",
        },
        notes: body.notes,
      });

      return res.status(201).json({ reservations: [reservation] });
    } catch (error) {
      console.error("Failed to create reservation", error);
      return res.status(500).json({ error: "予約データの保存に失敗しました。" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
}
