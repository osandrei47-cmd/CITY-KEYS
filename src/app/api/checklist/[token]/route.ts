import { getPayloadClient } from "@/lib/payload-client";
import { phonesMatch } from "@/lib/checklist-auth";
import type { Lead } from "@/payload-types";

// Отмечает один пункт чек-листа выполненным/невыполненным. Телефон
// проверяется заново на каждый запрос (не полагаемся на то, что /verify уже
// проходили раньше в этом сеансе) — та же логика, что и в verify/route.ts.
//
// Проверено эмпирически (2026-08-28): в `npm run dev` (Turbopack) этот роут
// и verify/route.ts стабильно отдают 404 — Turbopack в dev-режиме не
// резолвит вложенные API-роуты под динамическим сегментом ([token]/route.ts
// + [token]/verify/route.ts одновременно). На `next build --webpack` +
// `next start` оба роута работают корректно (проверено curl'ом). Ещё один
// подтверждённый Turbopack-баг в этом проекте, см. также комментарий в
// scripts/check-server-actions-key.mjs про Server Actions — по той же
// причине сборка идёт через --webpack. Если понадобится отладить эти
// роуты локально — используйте `npm run build && npm run start`, не `dev`.
export const dynamic = "force-dynamic";

type RequestBody = { phone?: unknown; itemIndex?: unknown; received?: unknown };

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Некорректный запрос" }, { status: 400 });
  }

  if (
    typeof body.phone !== "string" ||
    typeof body.itemIndex !== "number" ||
    typeof body.received !== "boolean"
  ) {
    return Response.json({ success: false, error: "Некорректный запрос" }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "deal-checklist-links",
    where: { token: { equals: token } },
    depth: 1,
    limit: 1,
  });
  const link = docs[0];
  if (!link) {
    return Response.json({ success: false, error: "Ссылка недействительна" }, { status: 404 });
  }

  const participant = link.participant as Lead;
  if (typeof participant !== "object" || !participant?.phone || !phonesMatch(body.phone, participant.phone)) {
    return Response.json({ success: false, error: "Телефон не совпадает" }, { status: 403 });
  }

  const dealId = typeof link.deal === "object" ? link.deal.id : link.deal;
  const deal = await payload.findByID({ collection: "deals", id: dealId, depth: 0 }).catch(() => null);
  if (!deal) {
    return Response.json({ success: false, error: "Сделка не найдена" }, { status: 404 });
  }

  const items = [...(deal.documentsChecklist ?? [])];
  const index = body.itemIndex;
  if (index < 0 || index >= items.length) {
    return Response.json({ success: false, error: "Пункт не найден" }, { status: 400 });
  }
  items[index] = { ...items[index], received: body.received };

  await payload.update({
    collection: "deals",
    id: deal.id,
    data: { documentsChecklist: items },
  });

  return Response.json({ success: true });
}
