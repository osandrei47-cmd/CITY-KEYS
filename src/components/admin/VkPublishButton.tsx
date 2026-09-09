"use client";

import { useState } from "react";

export function VkPublishButton({
  listingId,
  alreadyPublished,
}: {
  listingId: number | string;
  alreadyPublished: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (pending) return;

    if (alreadyPublished) {
      const confirmed = window.confirm(
        "Объект уже был опубликован в ВК. Опубликовать ещё раз (создастся второй пост)?",
      );
      if (!confirmed) return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/vk-publish`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Не удалось опубликовать в ВК");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось опубликовать в ВК");
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        style={{
          padding: "6px 14px",
          borderRadius: 4,
          border: "none",
          background: "#4c75a3",
          color: "#fff",
          fontWeight: 600,
          cursor: pending ? "default" : "pointer",
        }}
      >
        {pending ? "Публикую…" : alreadyPublished ? "Опубликовать повторно в ВК" : "Опубликовать в ВК"}
      </button>
      {error ? <span style={{ color: "#991b1b", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
