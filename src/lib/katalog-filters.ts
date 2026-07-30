import type { Listing } from "@/payload-types";

export type DealFilter = "buy" | "rent";
export type PropertyType = Listing["propertyType"];

export function katalogHref({
  deal,
  category,
}: {
  deal: DealFilter;
  category?: PropertyType | string | null;
}): string {
  const params = new URLSearchParams();
  // "buy" — значение по умолчанию, не засоряем URL им
  if (deal && deal !== "buy") params.set("deal", deal);
  if (category) params.set("category", category);
  const qs = params.toString();
  return `/katalog${qs ? `?${qs}` : ""}`;
}
