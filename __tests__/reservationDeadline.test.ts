import {
  getReservationDeadline,
  isBeforeReservationDeadline,
} from "../lib/reservationDeadline";

describe("reservation deadline", () => {
  test("closes at 17:00 JST on the day before pickup", () => {
    expect(getReservationDeadline("2026-09-25T01:00:00.000Z")?.toISOString()).toBe(
      "2026-09-24T08:00:00.000Z"
    );
    expect(isBeforeReservationDeadline(
      "2026-09-25T01:00:00.000Z",
      new Date("2026-09-24T08:00:00.000Z")
    )).toBe(true);
    expect(isBeforeReservationDeadline(
      "2026-09-25T01:00:00.000Z",
      new Date("2026-09-24T08:00:00.001Z")
    )).toBe(false);
  });

  test("uses Sunday as the deadline for a Tuesday pickup", () => {
    expect(getReservationDeadline("2026-09-29T01:00:00.000Z")?.toISOString()).toBe(
      "2026-09-27T08:00:00.000Z"
    );
  });

  test("uses the pickup date in Japan even around the UTC date boundary", () => {
    expect(getReservationDeadline("2026-09-24T15:30:00.000Z")?.toISOString()).toBe(
      "2026-09-24T08:00:00.000Z"
    );
  });

  test("rejects invalid pickup timestamps", () => {
    expect(getReservationDeadline("not-a-date")).toBeNull();
    expect(isBeforeReservationDeadline("not-a-date")).toBe(false);
  });
});
