const JAPAN_TIME_ZONE = "Asia/Tokyo";
const RESERVATION_CUTOFF_HOUR = 17;
const MONDAY = 1;

type JapanDate = {
  year: number;
  month: number;
  day: number;
};

const getJapanDate = (date: Date): JapanDate | null => {
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAPAN_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);

  return year && month && day ? { year, month, day } : null;
};

/**
 * Returns the reservation deadline for a pickup time.
 *
 * Reservations close at 17:00 JST on the previous business day. Monday is the
 * regular closing day, so a Tuesday pickup closes at 17:00 JST on Sunday.
 */
export const getReservationDeadline = (pickupAt: string): Date | null => {
  const pickupDate = getJapanDate(new Date(pickupAt));
  if (!pickupDate) return null;

  // Use UTC only as a calendar arithmetic container, then convert 17:00 JST
  // (08:00 UTC) to the actual deadline instant.
  const deadlineDay = new Date(Date.UTC(pickupDate.year, pickupDate.month - 1, pickupDate.day));
  deadlineDay.setUTCDate(deadlineDay.getUTCDate() - 1);
  while (deadlineDay.getUTCDay() === MONDAY) {
    deadlineDay.setUTCDate(deadlineDay.getUTCDate() - 1);
  }

  return new Date(
    Date.UTC(
      deadlineDay.getUTCFullYear(),
      deadlineDay.getUTCMonth(),
      deadlineDay.getUTCDate(),
      RESERVATION_CUTOFF_HOUR - 9
    )
  );
};

export const isBeforeReservationDeadline = (
  pickupAt: string,
  now: Date = new Date()
): boolean => {
  const deadline = getReservationDeadline(pickupAt);
  return deadline !== null && !Number.isNaN(now.getTime()) && now.getTime() <= deadline.getTime();
};

