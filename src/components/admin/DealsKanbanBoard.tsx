"use client";

import { useState, type DragEvent } from "react";
import { DEAL_PIPELINE_STAGES } from "@/lib/deal-pipeline-stages";
import { formatPrice } from "@/lib/listing-types";

export type DealCard = {
  id: number;
  title: string;
  participantsSummary?: string | null;
  listingTitle?: string | null;
  amount?: number | null;
};

export function DealsKanbanBoard({
  initialColumns,
}: {
  initialColumns: Record<string, DealCard[]>;
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  function handleDragStart(e: DragEvent, card: DealCard, fromStage: string) {
    e.dataTransfer.setData("text/plain", String(card.id));
    e.dataTransfer.effectAllowed = "move";
    setDraggedFrom(fromStage);
  }

  async function handleDrop(e: DragEvent, toStage: string) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const fromStage = draggedFrom;
    setDraggedFrom(null);
    if (!id || !fromStage || fromStage === toStage) return;

    const movedCard = columns[fromStage]?.find((c) => c.id === id);
    if (!movedCard) return;

    setColumns((prev) => ({
      ...prev,
      [fromStage]: (prev[fromStage] ?? []).filter((c) => c.id !== id),
      [toStage]: [movedCard, ...(prev[toStage] ?? [])],
    }));

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error("Не удалось обновить этап сделки");
    } catch {
      setColumns((prev) => ({
        ...prev,
        [toStage]: (prev[toStage] ?? []).filter((c) => c.id !== id),
        [fromStage]: [movedCard, ...(prev[fromStage] ?? [])],
      }));
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
      {DEAL_PIPELINE_STAGES.map((stage) => {
        const cards = columns[stage.value] ?? [];
        return (
          <div
            key={stage.value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage.value)}
            style={{
              flex: "0 0 260px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "var(--theme-elevation-50)",
              borderRadius: 6,
              padding: 10,
              minHeight: 240,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 10px",
                borderRadius: 4,
                color: stage.color,
                background: stage.bg,
                fontWeight: 700,
                fontSize: 12.5,
              }}
            >
              <span>{stage.label}</span>
              <span>{cards.length}</span>
            </div>

            {cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card, stage.value)}
                style={{
                  background: "var(--theme-bg)",
                  border: "1px solid var(--theme-elevation-150)",
                  borderRadius: 4,
                  padding: "8px 10px",
                  cursor: "grab",
                  opacity: pendingIds.has(card.id) ? 0.5 : 1,
                }}
              >
                <a
                  href={`/staff-x7k2/collections/deals/${card.id}`}
                  style={{ fontWeight: 600, fontSize: 13.5 }}
                >
                  {card.title}
                </a>
                {card.participantsSummary ? (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{card.participantsSummary}</div>
                ) : null}
                {card.listingTitle ? (
                  <div style={{ fontSize: 11, marginTop: 4 }}>Объект: {card.listingTitle}</div>
                ) : null}
                {typeof card.amount === "number" ? (
                  <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    {formatPrice(card.amount)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
