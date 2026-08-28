import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { getPayloadClient } from "@/lib/payload-client";
import { ChecklistGate } from "@/components/checklist/ChecklistGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Чек-лист документов — CITY KEYS",
  robots: { index: false, follow: false },
};

// Страница сама не читает данные сделки — только убеждается, что токен
// вообще существует (иначе notFound()). Содержимое чек-листа отдаёт
// /api/checklist/[token]/verify ПОСЛЕ проверки телефона (см. ChecklistGate) —
// если отдать данные здесь, на сервере, телефонная проверка была бы
// бутафорской: HTML с чек-листом утёк бы ещё до её прохождения.
async function tokenExists(token: string): Promise<boolean> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "deal-checklist-links",
    where: { token: { equals: token } },
    depth: 0,
    limit: 1,
  });
  return docs.length > 0;
}

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const exists = await tokenExists(token);
  if (!exists) notFound();

  return (
    <Section className="checklist-print-page pb-24 pt-28 md:pt-36">
      <div className="mx-auto flex max-w-[560px] flex-col gap-8">
        <ChecklistGate token={token} />
      </div>
    </Section>
  );
}
