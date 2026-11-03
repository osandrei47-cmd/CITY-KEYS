// Отображение и форматирование для коллекции BlogPosts.
// Сами типы (BlogPost) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекции.

import type { BlogPost, Media } from "@/payload-types";

export type { BlogPost };

export function isMediaDoc(value: number | Media | null | undefined): value is Media {
  return typeof value === "object" && value !== null;
}

const META_DESCRIPTION_MAX_LENGTH = 160;

function truncateAtWord(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function buildBlogMetaTitle(post: BlogPost): string {
  return post.metaTitle?.trim() || `${post.title} — CITY KEYS`;
}

export function buildBlogMetaDescription(post: BlogPost): string {
  // metaDescription — явный override, выводится как есть (не обрезается:
  // раз его вписали вручную именно под SEO, 160 символов — не жёсткий
  // лимит, а подсказка только для автогенерируемого варианта из excerpt).
  const override = post.metaDescription?.trim();
  if (override) return override;
  return truncateAtWord(post.excerpt, META_DESCRIPTION_MAX_LENGTH);
}

export function formatBlogDate(dateString: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(new Date(dateString));
}
