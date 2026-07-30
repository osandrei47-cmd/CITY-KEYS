import { getPayloadClient } from "@/lib/payload-client";
import { activeListingsWhere } from "@/lib/feed/helpers";
import { buildCianFeedXml } from "@/lib/feed/cian";
import type { Listing } from "@/lib/listing-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "listings",
    where: activeListingsWhere,
    depth: 1,
    limit: 1000,
  });

  const xml = buildCianFeedXml(docs as unknown as Listing[]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
