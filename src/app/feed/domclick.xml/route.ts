// Домклик: их нативная XML-схема закрыта логином в партнёрском кабинете
// (не удалось свериться напрямую), но их приём фидов поддерживает формат
// Яндекс.Недвижимости — переиспользуем тот же генератор. Когда будет
// доступ к партнёрскому кабинету Домклика — стоит свериться и при
// необходимости перейти на нативную схему.
//
// target="domclick" переключает пару отличий от чистого Яндекса — сейчас
// это только залог (<rent-pledge-amount> в дополнение к <rent-pledge>,
// см. disclaimer в src/lib/feed/yandex.ts): по скриншотам их формы
// ручного размещения залог — сумма, а не да/нет, но сама XML-схема
// Домклика не проверялась, так что это предположение, а не факт.

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

  const xml = buildYandexFeedXml(docs as unknown as Listing[], "domclick");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
