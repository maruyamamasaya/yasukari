const JST_OFFSET_HOURS = 9;
const RESERVATION_DEADLINE_HOUR_JST = 17;
const PICKUP_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const jstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const getJstDateParts = (value: string | Date) => {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const parts = jstDateFormatter.formatToParts(parsed);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  return { year, month, day };
};

const buildUtcDateFromJst = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0
) =>
  new Date(Date.UTC(year, month - 1, day, hour - JST_OFFSET_HOURS, minute, second));

const getPickupDateParts = (pickupDate?: string, pickupAt?: string) => {
  if (typeof pickupDate === "string" && PICKUP_DATE_PATTERN.test(pickupDate)) {
    const [year, month, day] = pickupDate.split("-").map(Number);
    return { year, month, day };
  }

  if (typeof pickupAt === "string") {
    return getJstDateParts(pickupAt);
  }

  return null;
};

export const getReservationDeadline = (params: {
  pickupDate?: string;
  pickupAt?: string;
}): Date | null => {
  const pickupDateParts = getPickupDateParts(params.pickupDate, params.pickupAt);
  if (!pickupDateParts) {
    return null;
  }

  return buildUtcDateFromJst(
    pickupDateParts.year,
    pickupDateParts.month,
    pickupDateParts.day - 1,
    RESERVATION_DEADLINE_HOUR_JST
  );
};

export const hasReservationDeadlinePassed = (
  params: { pickupDate?: string; pickupAt?: string },
  now: Date = new Date()
): boolean => {
  const deadline = getReservationDeadline(params);
  if (!deadline) {
    return false;
  }

  return now.getTime() >= deadline.getTime();
};
