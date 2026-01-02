import type { NextApiRequest, NextApiResponse } from "next";

import { issueKeyboxPin } from "../../../lib/keybox";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<
    | {
        message: string;
      }
    | {
        success: boolean;
        pinCode: string;
        pinId?: string;
        unitId: string;
        qrCode?: string;
        qrImageUrl?: string;
        windowStart: string;
        windowEnd: string;
        signUsed?: string;
        message?: string;
      }
  >
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", ["POST"]);
    response.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { windowStart, windowEnd, targetName, pinCode, unitId, storeName } = request.body ?? {};

  if (!windowStart || !windowEnd) {
    response.status(400).json({ message: "windowStart and windowEnd are required" });
    return;
  }

  const startDate = new Date(windowStart);
  const endDate = new Date(windowEnd);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    response.status(400).json({ message: "Invalid windowStart or windowEnd" });
    return;
  }

  try {
    const result = await issueKeyboxPin({
      windowStart: startDate,
      windowEnd: endDate,
      targetName,
      pinCode,
      unitId,
      storeName,
      source: "admin-dashboard",
    });

    response.status(200).json({
      success: result.success,
      pinCode: result.pinCode,
      pinId: result.pinId,
      unitId: result.unitId,
      qrCode: result.qrCode,
      qrImageUrl: result.qrImageUrl,
      windowStart: result.windowStart,
      windowEnd: result.windowEnd,
      signUsed: result.signUsed,
      message: result.log.message,
    });
  } catch (error) {
    console.error("Failed to issue manual keybox pin", error);
    response.status(500).json({ message: "Failed to issue keybox pin" });
  }
}
