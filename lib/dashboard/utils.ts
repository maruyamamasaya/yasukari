import { RentalAvailabilityMap } from "./types";

export function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const buildMaintenanceAvailability = (
  startDateString: string,
  months: number,
  note?: string
): RentalAvailabilityMap => {
  const startDate = new Date(startDateString);
  const monthDuration = Number.isFinite(months) ? Math.max(1, Math.floor(months)) : 1;

  if (Number.isNaN(startDate.getTime())) {
    return {};
  }

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + monthDuration);

  const map: RentalAvailabilityMap = {};
  for (const cursor = new Date(startDate); cursor < endDate; cursor.setDate(cursor.getDate() + 1)) {
    map[formatDateKey(cursor)] = {
      status: "MAINTENANCE",
      ...(note ? { note } : {}),
    };
  }

  return map;
};
