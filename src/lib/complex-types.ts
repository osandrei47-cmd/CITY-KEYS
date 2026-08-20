// Отображение и форматирование для коллекции ResidentialComplexes (Новостройки).
// Сами типы (ResidentialComplex) — автогенерируемые Payload'ом в
// src/payload-types.ts, обновляются командой `npm run generate:types` при
// изменении схемы коллекции.

import type { ResidentialComplex } from "@/payload-types";

export type { ResidentialComplex };

export const complexStatusLabels: Record<ResidentialComplex["status"], string> = {
  planned: "На этапе проекта",
  "under-construction": "Строится",
  completed: "Сдан",
  frozen: "Заморожен",
};

const META_DESCRIPTION_MAX_LENGTH = 160;

function truncateAtWord(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Уникальные <title>/description для страницы ЖК — на основе его
// собственных данных из CMS (тот же паттерн, что и у buildProjectMetaTitle/
// buildListingMetaTitle, см. docs/seo-audit-2026-08-18.md, п.3).
export function buildComplexMetaTitle(complex: ResidentialComplex): string {
  return `${complex.title} — CITY KEYS`;
}

export function buildComplexMetaDescription(complex: ResidentialComplex): string {
  const fallback = `Планировки и условия покупки в ${complex.title} — от агентства CITY KEYS.`;
  const text = complex.shortDescription?.trim() || fallback;
  return truncateAtWord(text, META_DESCRIPTION_MAX_LENGTH);
}
