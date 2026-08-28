"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API недоступен (например, не https) — ссылка уже видна текстом рядом, можно скопировать вручную
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 4,
        padding: "4px 10px",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        background: copied ? "var(--theme-success-100)" : "var(--theme-bg)",
      }}
    >
      {copied ? "Скопировано" : "Копировать ссылку"}
    </button>
  );
}
