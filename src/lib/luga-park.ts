// Единый источник правды по коттеджному посёлку «Луга Парк»
// (/proekty/luga-park). Слаг проекта в коллекции Projects, статические
// данные лотов 1-й очереди и помощники отображения бейджа/статуса.
//
// Почему статика, а не только CMS: тип зоны, площадь и обе цены (без
// электричества / с электричеством) для 1-й очереди зафиксированы в ТЗ и
// меняются редко, а поле price у Listing одно. В CMS у каждого лота лежит
// базовая цена (без электричества), редактируемые badge и status — их
// страница посёлка берёт из живой записи, сопоставляя лот с записью по
// точному совпадению title (см. LUGA_PARK_LOTS[].title и
// scripts/create-luga-park-listings.ts).

import type { Listing } from "@/payload-types";

export const LUGA_PARK_PROJECT_SLUG = "luga-park";

export type LugaParkLot = {
  /** Точный title записи в коллекции Listings — ключ сопоставления. */
  title: string;
  zone: "А" | "Б";
  areaM2: number;
  /** Как показываем площадь в сотках, строкой (в ТЗ — «~12,5 соток»). */
  areaSotkiLabel: string;
  priceNoElectric: number;
  priceWithElectric: number;
};

// 4 лота типа А + 2 лота типа Б = 6 лотов 1-й очереди.
export const LUGA_PARK_LOTS: LugaParkLot[] = [
  {
    title: "Луга Парк — участок А1 (12,5 соток)",
    zone: "А",
    areaM2: 1247.5,
    areaSotkiLabel: "~12,5 соток",
    priceNoElectric: 820_000,
    priceWithElectric: 970_000,
  },
  {
    title: "Луга Парк — участок А2 (12,5 соток)",
    zone: "А",
    areaM2: 1247.5,
    areaSotkiLabel: "~12,5 соток",
    priceNoElectric: 820_000,
    priceWithElectric: 970_000,
  },
  {
    title: "Луга Парк — участок А3 (12,5 соток)",
    zone: "А",
    areaM2: 1247.5,
    areaSotkiLabel: "~12,5 соток",
    priceNoElectric: 820_000,
    priceWithElectric: 970_000,
  },
  {
    title: "Луга Парк — участок А4 (12,5 соток)",
    zone: "А",
    areaM2: 1247.5,
    areaSotkiLabel: "~12,5 соток",
    priceNoElectric: 820_000,
    priceWithElectric: 970_000,
  },
  {
    title: "Луга Парк — участок Б1 (25 соток)",
    zone: "Б",
    areaM2: 2495,
    areaSotkiLabel: "~25 соток",
    priceNoElectric: 1_600_000,
    priceWithElectric: 1_750_000,
  },
  {
    title: "Луга Парк — участок Б2 (25 соток)",
    zone: "Б",
    areaM2: 2495,
    areaSotkiLabel: "~25 соток",
    priceNoElectric: 1_600_000,
    priceWithElectric: 1_750_000,
  },
];

export const lugaParkBadgeLabels: Record<string, string> = {
  start: "Старт продаж",
  last: "Последние участки",
};

// Цветовая пометка статуса лота на карточке — редактируется в CMS без
// разработчика (поле status коллекции Listings).
export const lugaParkStatusLabels: Record<Listing["status"], string> = {
  "for-sale": "В наличии",
  reserved: "Забронирован",
  sold: "Продан",
};

export const lugaParkStatusClasses: Record<Listing["status"], string> = {
  "for-sale": "bg-emerald-500/15 text-emerald-400",
  reserved: "bg-amber-500/15 text-amber-400",
  sold: "bg-red-500/15 text-red-400",
};

export function formatLugaParkPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}
