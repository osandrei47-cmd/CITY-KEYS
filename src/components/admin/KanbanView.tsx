import type { AdminViewServerProps } from "payload";
import type { Lead, Task } from "@/payload-types";
import { DEAL_STAGES } from "@/lib/lead-deal-stages";
import { LEAD_SOURCE_LABELS } from "@/lib/lead-sources";
import { KanbanBoard, type KanbanCard } from "./KanbanBoard";

export const KanbanView = async ({ payload }: AdminViewServerProps) => {
  const [{ docs: leads }, { docs: openTasks }] = await Promise.all([
    payload.find({ collection: "leads", depth: 1, limit: 500, sort: "-createdAt" }),
    payload.find({
      collection: "tasks",
      depth: 0,
      limit: 1000,
      where: { done: { equals: false } },
    }),
  ]);

  const openTaskCounts = new Map<number, number>();
  for (const task of openTasks as Task[]) {
    const leadId = typeof task.lead === "object" ? task.lead?.id : task.lead;
    if (typeof leadId !== "number") continue;
    openTaskCounts.set(leadId, (openTaskCounts.get(leadId) ?? 0) + 1);
  }

  const columns: Record<string, KanbanCard[]> = Object.fromEntries(
    DEAL_STAGES.map((stage) => [stage.value, []]),
  );

  for (const lead of leads as Lead[]) {
    const card: KanbanCard = {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      sourceLabel: LEAD_SOURCE_LABELS[lead.source] ?? lead.source,
      listingTitle: typeof lead.listing === "object" ? lead.listing?.title : null,
      openTasksCount: openTaskCounts.get(lead.id) ?? 0,
    };
    columns[lead.dealStage]?.push(card);
  }

  return (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Канбан заявок</h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 20 }}>
        Перетащите карточку в другую колонку, чтобы изменить этап сделки.
      </p>
      <KanbanBoard initialColumns={columns} />
    </div>
  );
};
