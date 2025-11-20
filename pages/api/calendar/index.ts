import type { NextApiRequest, NextApiResponse } from "next";
import { readHolidayRecords } from "../../../lib/server/holidayData";

const VALID_STORES = ["adachi-odai", "minowa"];

export type HolidayResponse = {
  holidays: { date: string; note?: string; isHoliday: boolean; store: string }[];
};

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<HolidayResponse | { message: string }>
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { month, store } = request.query;

  if (typeof month !== "string" || !MONTH_PARAM_PATTERN.test(month)) {
    response.status(400).json({ message: "Invalid or missing month parameter" });
    return;
  }

  if (typeof store !== "string" || !VALID_STORES.includes(store)) {
    response.status(400).json({ message: "Invalid or missing store parameter" });
    return;
  }

  const records = await readHolidayRecords();
  const monthPrefix = `${month}-`;
  const monthRecords = records.filter(
    (record) => record.date.startsWith(monthPrefix) && record.store === store
  );

  response.status(200).json({ holidays: monthRecords });
}
