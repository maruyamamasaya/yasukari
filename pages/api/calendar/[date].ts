import type { NextApiRequest, NextApiResponse } from "next";
import {
  removeHolidayRecord,
  upsertHolidayRecord,
} from "../../../lib/server/holidayData";

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<{ date: string; note?: string } | { message: string }>
) {
  const { date } = request.query;

  if (typeof date !== "string" || !DATE_PARAM_PATTERN.test(date)) {
    response.status(400).json({ message: "Invalid date parameter" });
    return;
  }

  if (request.method === "PUT") {
    const { is_holiday: isHoliday, note } = request.body ?? {};

    if (isHoliday !== true) {
      response.status(400).json({ message: "Only holiday records can be stored" });
      return;
    }

    const noteText = typeof note === "string" ? note : "";

    await upsertHolidayRecord({ date, note: noteText || undefined });
    response.status(200).json({ date, note: noteText || undefined });
    return;
  }

  if (request.method === "DELETE") {
    await removeHolidayRecord(date);
    response.status(204).end();
    return;
  }

  response.setHeader("Allow", "PUT, DELETE");
  response.status(405).json({ message: "Method Not Allowed" });
}
