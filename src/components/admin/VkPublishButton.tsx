"use client";

import { useState } from "react";

type VkErrorType = "reauth" | "permission" | "unknown";

export function VkPublishButton({
  listingId,
  alreadyPublished,
}: {
  listingId: number | string;
  alreadyPublished: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<VkErrorType | null>(null);

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
    setErrorType(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/vk-publish`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Не удалось опубликовать в ВК");
        setErrorType((json?.errorType as VkErrorType) ?? "unknown");
        setPending(false);
        return;
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось опубликовать в ВК");
      setErrorType("unknown");
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
      {errorType === "reauth" ? (
        <a
          href="/api/vk/authorize"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "1px solid #991b1b",
            color: "#991b1b",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Переавторизоваться в ВК
        </a>
      ) : null}
      {errorType === "permission" ? (
        <span style={{ color: "#991b1b", fontSize: 12 }}>
          Токену не хватает прав на это действие — переавторизация не поможет, нужно проверить
          доступы приложения (wall/photos/groups) в кабинете VK ID.
        </span>
      ) : null}
    </div>
  );
}
