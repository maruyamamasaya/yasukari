import type { NextApiRequest, NextApiResponse } from "next";
import {
  removeHolidayRecord,
  upsertHolidayRecord,
} from "../../../lib/server/holidayData";

const VALID_STORES = ["adachi-odai", "minowa"];

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<
    { date: string; note?: string; isHoliday: boolean; store: string } | {
      message: string;
    }
  >
) {
  const { date, store } = request.query;

  if (typeof date !== "string" || !DATE_PARAM_PATTERN.test(date)) {
    response.status(400).json({ message: "Invalid date parameter" });
    return;
  }

  if (typeof store !== "string" || !VALID_STORES.includes(store)) {
    response.status(400).json({ message: "Invalid or missing store parameter" });
    return;
  }

  if (request.method === "PUT") {
    const { is_holiday: isHoliday, note } = request.body ?? {};

    if (isHoliday !== true && isHoliday !== false) {
      response.status(400).json({ message: "is_holiday must be boolean" });
      return;
    }

    const noteText = typeof note === "string" ? note.trim() : "";

    if (noteText.length > 100) {
      response.status(400).json({ message: "note must be 100 characters or fewer" });
      return;
    }

    await upsertHolidayRecord({
      date,
      store,
      isHoliday,
      note: noteText || undefined,
    });
    response.status(200).json({
      date,
      note: noteText || undefined,
      isHoliday,
      store,
    });
    return;
  }

  if (request.method === "DELETE") {
    await removeHolidayRecord(date, store);
    response.status(204).end();
    return;
  }

  response.setHeader("Allow", "PUT, DELETE");
  response.status(405).json({ message: "Method Not Allowed" });
}
