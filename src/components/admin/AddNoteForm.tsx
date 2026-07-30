"use client";

import { useState } from "react";

type Note = { text: string; createdAt?: string | null; authorEmail?: string | null };

export function AddNoteForm({
  leadId,
  existingNotes,
}: {
  leadId?: number | string;
  existingNotes: Note[];
}) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  if (!leadId) {
    return (
      <p style={{ fontSize: 13, opacity: 0.6 }}>Сохраните заявку, чтобы начать вести заметки.</p>
    );
  }

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(false);
    try {
      // Дату и автора не отправляем — их проставит beforeChange-хук на
      // сервере (см. src/collections/Leads.ts), это надёжнее, чем доверять
      // часам браузера или подделываемому полю на клиенте.
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          notes: [{ text: trimmed }, ...existingNotes],
        }),
      });
      if (!res.ok) throw new Error("Не удалось сохранить запись");
      window.location.reload();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: «Позвонил, обсудили бюджет»"
        rows={2}
        style={{
          padding: 8,
          borderRadius: 4,
          border: "1px solid var(--theme-elevation-150)",
          font: "inherit",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !text.trim()}
          style={{
            alignSelf: "flex-start",
            padding: "6px 14px",
            borderRadius: 4,
            border: "none",
            background: "var(--theme-elevation-800)",
            color: "var(--theme-elevation-0)",
            cursor: pending ? "default" : "pointer",
          }}
        >
          {pending ? "Добавляю…" : "Добавить запись"}
        </button>
        {error ? (
          <span style={{ color: "#991b1b", fontSize: 12 }}>Не получилось сохранить</span>
        ) : null}
      </div>
    </div>
  );
}
