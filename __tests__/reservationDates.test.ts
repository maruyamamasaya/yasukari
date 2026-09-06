import {
  buildReservationDateKeys,
  formatReservationDateKey,
  japaneseWallTimeToIso,
} from "../lib/reservationDates";

describe("reservation dates", () => {
  test("uses Japanese calendar dates for early-morning reservations", () => {
    expect(
      buildReservationDateKeys("2025-09-05T23:00:00.000Z", "2025-09-06T23:00:00.000Z")
    ).toEqual(["2025-09-06", "2025-09-07"]);
  });

  test("includes the return date when a reservation crosses midnight in Japan", () => {
    expect(
      buildReservationDateKeys("2025-09-06T14:00:00.000Z", "2025-09-06T16:00:00.000Z")
    ).toEqual(["2025-09-06", "2025-09-07"]);
  });

  test("formats the same instant independently of the server timezone", () => {
    expect(formatReservationDateKey(new Date("2025-09-05T23:00:00.000Z"))).toBe(
      "2025-09-06"
    );
  });

  test("serializes storefront wall time explicitly as Japan time", () => {
    expect(japaneseWallTimeToIso("2025-09-06", "08:00")).toBe(
      "2025-09-05T23:00:00.000Z"
    );
  });

  test("rejects invalid and reversed ranges", () => {
    expect(buildReservationDateKeys("invalid", "2025-09-06T00:00:00.000Z")).toEqual([]);
    expect(
      buildReservationDateKeys("2025-09-07T00:00:00.000Z", "2025-09-06T00:00:00.000Z")
    ).toEqual([]);
  });
});
