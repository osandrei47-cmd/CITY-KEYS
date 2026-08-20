import type { Listing } from "@/payload-types";

export type RoomsValue = NonNullable<Listing["rooms"]>;

export function zhkHref({ slug, rooms }: { slug: string; rooms?: RoomsValue | null }): string {
  const params = new URLSearchParams();
  if (rooms) params.set("rooms", rooms);
  const qs = params.toString();
  return `/zhk/${slug}${qs ? `?${qs}` : ""}`;
}
