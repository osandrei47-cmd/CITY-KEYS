import type { AdminViewServerProps } from "payload";
import type { Deal } from "@/payload-types";
import { DEAL_PIPELINE_STAGES } from "@/lib/deal-pipeline-stages";
import { DealsKanbanBoard, type DealCard } from "./DealsKanbanBoard";

export const DealsKanbanView = async ({ payload }: AdminViewServerProps) => {
  const { docs: deals } = await payload.find({
    collection: "deals",
    depth: 1,
    limit: 500,
    sort: "-updatedAt",
  });

  const columns: Record<string, DealCard[]> = Object.fromEntries(
    DEAL_PIPELINE_STAGES.map((stage) => [stage.value, []]),
  );

  for (const deal of deals as Deal[]) {
    const participantsSummary = (deal.participants ?? [])
      .map((p) => (typeof p.lead === "object" ? p.lead?.name : null))
      .filter(Boolean)
      .join(", ");

    const card: DealCard = {
      id: deal.id,
      title: deal.title || `Сделка №${deal.id}`,
      participantsSummary: participantsSummary || null,
      listingTitle: typeof deal.listing === "object" ? deal.listing?.title : null,
      amount: deal.amount ?? null,
    };
    columns[deal.stage]?.push(card);
  }

  return (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Канбан сделок</h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 20 }}>
        Перетащите карточку в другую колонку, чтобы изменить этап сделки.
      </p>
      <DealsKanbanBoard initialColumns={columns} />
    </div>
  );
};
