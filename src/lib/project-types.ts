// Отображение и форматирование для коллекции Projects.
// Сами типы (Project) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекции.

import type { Project } from "@/payload-types";

export type { Project };

export const projectStatusLabels: Record<Project["status"], string> = {
  sale: "Идёт продажа",
  development: "В разработке",
  completed: "Завершён",
};

const META_DESCRIPTION_MAX_LENGTH = 160;

function truncateAtWord(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Уникальные <title>/description для страницы проекта — на основе его
// собственных данных из CMS (см. docs/seo-audit-2026-08-18.md, п.3).
// shortDescription — обязательное поле в Projects, поэтому описание
// никогда не оказывается пустым.
export function buildProjectMetaTitle(project: Project): string {
  return `${project.title} — CITY KEYS`;
}

export function buildProjectMetaDescription(project: Project): string {
  return truncateAtWord(project.shortDescription, META_DESCRIPTION_MAX_LENGTH);
}
