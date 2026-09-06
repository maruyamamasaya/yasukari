import type { DurationPriceMap } from "./dashboard/types";

export type DailyRentalPrice = { days: number; price: number };

const durationKeyForDays = (days: number) => {
  if (days <= 1) return "24h";
  if (days <= 2) return "2d";
  if (days <= 4) return "4d";
  if (days <= 7) return "1w";
  if (days <= 14) return "2w";
  return "1m";
};

/** Prefer model-specific pricing, then use the model's class pricing. */
export const resolveRentalPrice = (
  prices: DailyRentalPrice[],
  basePrices: DurationPriceMap | undefined,
  days: number
): number | null => {
  const exact = prices.find((item) => item.days === days)?.price;
  if (typeof exact === "number" && Number.isFinite(exact)) return exact;

  if (days > 31) {
    const monthly = prices.find((item) => item.days === 31)?.price ?? basePrices?.["1m"];
    return typeof monthly === "number" ? Math.round((monthly / 31) * days) : null;
  }

  const fallback = basePrices?.[durationKeyForDays(days)];
  return typeof fallback === "number" && Number.isFinite(fallback) ? fallback : null;
};
