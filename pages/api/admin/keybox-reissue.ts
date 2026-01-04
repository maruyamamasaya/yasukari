import type { NextApiRequest, NextApiResponse } from "next";

import { issueKeyboxPin } from "../../../lib/keybox";
import {
  fetchReservationsByMember,
  isActiveReservation,
  updateReservation,
} from "../../../lib/reservations";

type KeyboxReissueResponse = {
  success: boolean;
  pinCode: string;
  pinId?: string;
  unitId: string;
  qrCode?: string;
  qrImageUrl?: string;
  windowStart: string;
  windowEnd: string;
  signUsed?: string;
  targetName: string;
  reservationId?: string;
  memberId?: string;
  message?: string;
};

const parseTokyoDateTime = (value: string) => {
  const hasOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const dateString = hasOffset ? value : `${value}+09:00`;
  return new Date(dateString);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KeyboxReissueResponse | { message: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  try {
    const body = req.body as {
      windowStart?: string;
      windowEnd?: string;
      pinCode?: string;
      targetName?: string;
      unitId?: string;
      storeName?: string;
      memberId?: string;
    };

    if (!body.windowStart || !body.windowEnd) {
      return res.status(400).json({ message: "windowStart and windowEnd are required" });
    }

    const windowStart = parseTokyoDateTime(body.windowStart);
    const windowEnd = parseTokyoDateTime(body.windowEnd);
    if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime())) {
      return res.status(400).json({ message: "Invalid windowStart or windowEnd" });
    }

    let reservationId: string | undefined;
    let storeName = body.storeName;
    let targetName = body.targetName || "再発行PIN";

    if (body.memberId) {
      const reservations = await fetchReservationsByMember(body.memberId);
      const activeReservation = reservations.find((reservation) => isActiveReservation(reservation));
      if (!activeReservation) {
        return res
          .status(404)
          .json({ message: "選択された会員の利用中予約が見つかりませんでした。" });
      }
      reservationId = activeReservation.id;
      storeName = activeReservation.storeName;
      targetName = body.targetName || activeReservation.memberName || "再発行PIN";
    }

    const result = await issueKeyboxPin({
      windowStart,
      windowEnd,
      pinCode: body.pinCode || undefined,
      targetName,
      unitId: body.unitId || undefined,
      storeName,
      memberId: body.memberId || undefined,
      reservationId,
      source: "manual-reissue",
    });

    if (result.success && reservationId) {
      await updateReservation(reservationId, {
        keyboxPinCode: result.pinCode,
        keyboxPinId: result.pinId ?? "",
        keyboxQrCode: result.qrCode ?? "",
        keyboxQrImageUrl: result.qrImageUrl ?? "",
        keyboxUnitId: result.unitId,
        keyboxWindowStart: result.windowStart,
        keyboxWindowEnd: result.windowEnd,
        keyboxTargetName: result.targetName,
        keyboxSignUsed: result.signUsed,
      });
    }

    return res.status(200).json({
      success: result.success,
      pinCode: result.pinCode,
      pinId: result.pinId,
      unitId: result.unitId,
      qrCode: result.qrCode,
      qrImageUrl: result.qrImageUrl,
      windowStart: result.windowStart,
      windowEnd: result.windowEnd,
      signUsed: result.signUsed,
      targetName: result.targetName,
      reservationId,
      memberId: body.memberId || undefined,
      message: result.log.message,
    });
  } catch (error) {
    console.error("Failed to reissue keybox pin", error);
    return res.status(500).json({ message: "Failed to reissue keybox pin" });
  }
}
