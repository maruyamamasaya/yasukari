const RESERVATION_TIME_ZONE = "Asia/Tokyo";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: RESERVATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatReservationDateKey = (date: Date): string => {
  const parts = dateKeyFormatter.formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const buildReservationDateKeys = (start: string, end: string): string[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return [];
  }

  const startKey = formatReservationDateKey(startDate);
  const endKey = formatReservationDateKey(endDate);
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const cursor = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const keys: string[] = [];

  while (cursor.toISOString().slice(0, 10) <= endKey) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
};

export const japaneseWallTimeToIso = (date: string, time: string): string =>
  new Date(`${date}T${time}:00+09:00`).toISOString();
