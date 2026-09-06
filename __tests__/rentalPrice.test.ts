import { resolveRentalPrice } from "../lib/rentalPrice";

describe("resolveRentalPrice", () => {
  it("prefers an exact model-specific daily price", () => {
    expect(resolveRentalPrice([{ days: 1, price: 5000 }], { "24h": 6000 }, 1)).toBe(5000);
  });

  it("falls back to the bike class price when model pricing is missing", () => {
    expect(resolveRentalPrice([], { "24h": 6000 }, 1)).toBe(6000);
  });

  it("does not invent a default price when neither source is configured", () => {
    expect(resolveRentalPrice([], undefined, 1)).toBeNull();
  });
});
