// Домклик: их нативная XML-схема закрыта логином в партнёрском кабинете
// (не удалось свериться напрямую), но их приём фидов поддерживает формат
// Яндекс.Недвижимости — переиспользуем тот же генератор. Когда будет
// доступ к партнёрскому кабинету Домклика — стоит свериться и при
// необходимости перейти на нативную схему.

import { getPayloadClient } from "@/lib/payload-client";
import { platformListingsWhere } from "@/lib/feed/helpers";
import { buildYandexFeedXml } from "@/lib/feed/yandex";
import type { Listing } from "@/lib/listing-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "listings",
    where: platformListingsWhere("publishDomclick"),
    depth: 1,
    limit: 1000,
  });

  const xml = buildYandexFeedXml(docs as unknown as Listing[]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
