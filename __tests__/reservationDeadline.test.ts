import { getReservationDeadline, hasReservationDeadlinePassed } from "../lib/reservationDeadline";

describe("reservationDeadline", () => {
  it("calculates the deadline as 5pm JST on the previous day", () => {
    expect(getReservationDeadline({ pickupDate: "2026-03-21" })?.toISOString()).toBe(
      "2026-03-20T08:00:00.000Z"
    );
  });

  it("uses the pickup date in JST even when the ISO string is stored in UTC", () => {
    expect(getReservationDeadline({ pickupAt: "2026-03-20T15:00:00.000Z" })?.toISOString()).toBe(
      "2026-03-20T08:00:00.000Z"
    );
  });

  it("allows reservations before the cutoff and blocks them at the cutoff", () => {
    const pickupDate = "2026-03-21";

    expect(
      hasReservationDeadlinePassed({ pickupDate }, new Date("2026-03-20T07:59:59.000Z"))
    ).toBe(false);
    expect(
      hasReservationDeadlinePassed({ pickupDate }, new Date("2026-03-20T08:00:00.000Z"))
    ).toBe(true);
  });
});
