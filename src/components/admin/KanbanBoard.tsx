"use client";

import { useState, type DragEvent } from "react";
import { DEAL_STAGES } from "@/lib/lead-deal-stages";

export type KanbanCard = {
  id: number;
  name: string;
  phone: string;
  sourceLabel: string;
  listingTitle?: string | null;
  openTasksCount: number;
};

export function KanbanBoard({
  initialColumns,
}: {
  initialColumns: Record<string, KanbanCard[]>;
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  function handleDragStart(e: DragEvent, card: KanbanCard, fromStage: string) {
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

    // Ищем карточку в текущем состоянии СРАЗУ, а не внутри апдейтера setColumns —
    // React вызывает функцию-апдейтер асинхронно, и код после setColumns может
    // выполниться раньше, чем она отработает (movedCard будет ещё undefined).
    const movedCard = columns[fromStage]?.find((c) => c.id === id);
    if (!movedCard) return;

    setColumns((prev) => ({
      ...prev,
      [fromStage]: (prev[fromStage] ?? []).filter((c) => c.id !== id),
      [toStage]: [movedCard, ...(prev[toStage] ?? [])],
    }));

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dealStage: toStage }),
      });
      if (!res.ok) throw new Error("Не удалось обновить этап сделки");
    } catch {
      // Не удалось сохранить — возвращаем карточку в исходную колонку.
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
      {DEAL_STAGES.map((stage) => {
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
                  href={`/staff-x7k2/collections/leads/${card.id}`}
                  style={{ fontWeight: 600, fontSize: 13.5 }}
                >
                  {card.name}
                </a>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{card.phone}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{card.sourceLabel}</div>
                {card.listingTitle ? (
                  <div style={{ fontSize: 11, marginTop: 4 }}>Объект: {card.listingTitle}</div>
                ) : null}
                {card.openTasksCount > 0 ? (
                  <div style={{ fontSize: 11, marginTop: 4, color: "#b45309" }}>
                    Открытых задач: {card.openTasksCount}
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
