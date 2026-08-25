import type { Listing } from "@/payload-types";

export type RoomsValue = NonNullable<Listing["rooms"]>;

// Единый порядок комнатности — переиспользуется и в фильтре (RoomsFilter),
// и в сортировке сетки планировок на странице ЖК.
export const roomsOrder: RoomsValue[] = ["studio", "1", "2", "3", "4", "5plus"];

export function zhkHref({ slug, rooms }: { slug: string; rooms?: RoomsValue | null }): string {
  const params = new URLSearchParams();
  if (rooms) params.set("rooms", rooms);
  const qs = params.toString();
  return `/zhk/${slug}${qs ? `?${qs}` : ""}`;
}
