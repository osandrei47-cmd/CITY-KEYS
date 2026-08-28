"use client";

import { useState } from "react";
import { contacts } from "@/lib/nav";

type Item = { name: string; received: boolean; comment: string | null };

export function ChecklistItems({
  token,
  phone,
  participantName,
  dealTitle,
  listingTitle,
  listingAddress,
  initialItems,
}: {
  token: string;
  phone: string;
  participantName: string;
  dealTitle: string;
  listingTitle: string | null;
  listingAddress: string | null;
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pendingIndexes, setPendingIndexes] = useState<Set<number>>(new Set());

  async function toggle(index: number) {
    const current = items[index];
    const nextReceived = !current.received;

    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, received: nextReceived } : it)));
    setPendingIndexes((prev) => new Set(prev).add(index));

    try {
      const res = await fetch(`/api/checklist/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, itemIndex: index, received: nextReceived }),
      });
      if (!res.ok) throw new Error("update failed");
    } catch {
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, received: current.received } : it)));
    } finally {
      setPendingIndexes((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  const receivedCount = items.filter((it) => it.received).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="checklist-print-list flex flex-col gap-2">
        <h1 className="text-[24px] font-extrabold">{dealTitle}</h1>
        {listingTitle ? (
          <p className="text-[14px] text-ink-secondary">
            {listingTitle}
            {listingAddress ? `, ${listingAddress}` : ""}
          </p>
        ) : null}
        <p className="text-[13.5px] text-ink-secondary">
          Здравствуйте, {participantName}! Отметьте документы по мере готовности — статус сразу увидит агент.
        </p>
      </div>

      <div className="no-print flex flex-col gap-1">
        <div className="flex items-center justify-between text-[13px] text-ink-secondary">
          <span>Готово документов</span>
          <span>
            {receivedCount} из {items.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: items.length ? `${(receivedCount / items.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-[4px] border border-line bg-surface p-4"
          >
            <input
              type="checkbox"
              checked={item.received}
              disabled={pendingIndexes.has(i)}
              onChange={() => toggle(i)}
              className="no-print mt-1 h-5 w-5 shrink-0 accent-accent"
            />
            <span
              className="print-only mt-0.5 shrink-0 text-[14px] font-bold"
              aria-hidden
            >
              {item.received ? "☑" : "☐"}
            </span>
            <div className="flex flex-col gap-1">
              <span className={`text-[14.5px] ${item.received ? "text-ink-secondary line-through" : "text-ink"}`}>
                {item.name}
              </span>
              {item.comment ? (
                <span className="text-[12.5px] text-ink-secondary">Комментарий агента: {item.comment}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="no-print flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-ink/30 px-6 py-3 text-[14px] font-bold text-ink transition-colors hover:border-ink/60"
        >
          Скачать PDF
        </button>
        <a
          href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
          className="text-[13.5px] text-ink-secondary underline underline-offset-2"
        >
          Есть вопросы? Позвоните агенту
        </a>
      </div>

      <div className="print-only border-t border-line pt-4 text-[12px]">
        <p className="font-semibold">CITY KEYS — {contacts.phone}</p>
      </div>
    </div>
  );
}
