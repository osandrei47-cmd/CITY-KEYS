import { getPayloadClient } from "@/lib/payload-client";
import { phonesMatch } from "@/lib/checklist-auth";
import type { Lead } from "@/payload-types";

// Токен из ссылки — только первый фактор. Здесь дополнительно сверяем
// телефон участника с Lead.phone, привязанным к этой ссылке (DealChecklistLink.participant).
// Только при совпадении отдаём содержимое чек-листа — до этого момента
// клиент не получает вообще никаких данных сделки.
export const dynamic = "force-dynamic";

type RequestBody = { phone?: unknown };

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Некорректный запрос" }, { status: 400 });
  }

  if (typeof body.phone !== "string" || !body.phone.trim()) {
    return Response.json({ success: false, error: "Укажите номер телефона" }, { status: 400 });
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
    return Response.json(
      { success: false, error: "Телефон не совпадает — проверьте и попробуйте ещё раз" },
      { status: 403 },
    );
  }

  const dealId = typeof link.deal === "object" ? link.deal.id : link.deal;
  const deal = await payload.findByID({ collection: "deals", id: dealId, depth: 1 }).catch(() => null);
  if (!deal) {
    return Response.json({ success: false, error: "Сделка не найдена" }, { status: 404 });
  }

  return Response.json({
    success: true,
    participantName: participant.name,
    dealTitle: deal.title,
    listingTitle: typeof deal.listing === "object" ? deal.listing?.title : null,
    listingAddress: typeof deal.listing === "object" ? deal.listing?.address : null,
    items: (deal.documentsChecklist ?? []).map((item) => ({
      name: item.name,
      received: Boolean(item.received),
      comment: item.comment ?? null,
    })),
  });
}
