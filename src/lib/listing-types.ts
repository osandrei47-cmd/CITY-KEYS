// Отображение и форматирование для коллекции Listings.
// Сами типы (Listing, Media) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекций.

import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import type { Listing, Media } from "@/payload-types";

export type { Listing, Media };

export const propertyTypeLabels: Record<Listing["propertyType"], string> = {
  kvartiry: "Квартира",
  doma: "Дом / коттедж",
  dachi: "Дача",
  commercial: "Коммерческая недвижимость",
  novostroyki: "Новостройка",
  uchastki: "Земельный участок",
};

export const roomsLabels: Record<string, string> = {
  studio: "Студия",
  "1": "1 комната",
  "2": "2 комнаты",
  "3": "3 комнаты",
  "4": "4 комнаты",
  "5plus": "5+ комнат",
};

export const bathroomLabels: Record<string, string> = {
  combined: "Совмещённый",
  separate: "Раздельный",
  multiple: "Более одного",
};

export const balconyLabels: Record<string, string> = {
  none: "Нет",
  "1": "1",
  "2": "2",
  "3plus": "3 и более",
};

export const renovationLabels: Record<string, string> = {
  none: "Без ремонта",
  cosmetic: "Косметический",
  euro: "Евроремонт",
  designer: "Дизайнерский",
};

export const viewLabels: Record<string, string> = {
  yard: "Двор",
  water: "Водоём",
  street: "Улица",
  park: "Парк",
  forest: "Лес",
};

export const buildingTypeLabels: Record<string, string> = {
  brick: "Кирпичный",
  panel: "Панельный",
  monolith: "Монолитный",
  block: "Блочный",
  wood: "Деревянный",
};

export const statusLabels: Record<Listing["status"], string> = {
  "for-sale": "В продаже",
  reserved: "Забронирован",
  sold: "Продан / сдан",
};

export const dealTypeLabels: Record<Listing["dealType"], string> = {
  sale: "Продажа",
  rent: "Аренда",
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

export function pluralizeObjects(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} объект`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} объекта`;
  return `${count} объектов`;
}

export function isMediaDoc(value: number | Media | null | undefined): value is Media {
  return typeof value === "object" && value !== null;
}

// Задел на будущее: метки объектов из каталога на Яндекс.Карте (см.
// src/components/ui/yandex-map.tsx). Сейчас нигде не вызывается — каталог и
// карточка объекта пока используют только текстовый адрес.
export function listingToMapMarker(
  listing: Listing,
): { lat: number; lng: number; hint?: string; balloonContent?: string } | null {
  if (typeof listing.lat !== "number" || typeof listing.lng !== "number") return null;
  return {
    lat: listing.lat,
    lng: listing.lng,
    hint: listing.title,
    balloonContent: `${listing.title} — ${formatPrice(listing.price)}`,
  };
}

// Простой обход Lexical JSON в plain text — параграфы разделяются пустой
// строкой, как в подтверждённом рабочем фиде (см. src/lib/feed/*, где эта
// функция раньше жила отдельно — перенесена сюда, чтобы meta-описание
// объекта (buildListingMetaDescription ниже) могло её переиспользовать без
// цикличного импорта feed/helpers.ts <-> listing-types.ts).
export function richTextToPlainText(
  data: Listing["description"] | null | undefined,
): string {
  if (!data) return "";
  const root = (data as SerializedEditorState).root;
  if (!root?.children) return "";

  function collectText(node: SerializedLexicalNode & { [k: string]: unknown }): string {
    const text = (node as unknown as { text?: unknown }).text;
    if (typeof text === "string") return text;
    const children = (node as unknown as { children?: SerializedLexicalNode[] }).children;
    if (Array.isArray(children)) {
      return children.map((child) => collectText(child as never)).join("");
    }
    return "";
  }

  return root.children
    .map((node) => collectText(node as never))
    .filter((text) => text.trim().length > 0)
    .join("\n\n")
    .trim();
}

const META_DESCRIPTION_MAX_LENGTH = 160;

// Обрезает по границе слова и добавляет многоточие — чтобы описание в
// выдаче поисковика не обрывалось посреди слова.
function truncateAtWord(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Уникальный <title> для страницы объекта — на основе его собственных
// данных, а не общего заголовка сайта (см. docs/seo-audit-2026-08-18.md, п.3).
export function buildListingMetaTitle(listing: Listing): string {
  const propertyType = propertyTypeLabels[listing.propertyType];
  const place = listing.locality || listing.address;
  return place
    ? `${listing.title} — ${propertyType} в ${place}, CITY KEYS`
    : `${listing.title} — ${propertyType}, CITY KEYS`;
}

// Уникальное meta-описание объекта: если у объекта заполнено текстовое
// описание — берём первые ~160 символов из него; если нет — собираем
// короткое описание из ключевых полей (тип, комнаты, площадь, адрес, цена),
// чтобы описание никогда не было пустым и никогда не дублировалось между
// объектами (см. docs/seo-audit-2026-08-18.md, п.3).
export function buildListingMetaDescription(listing: Listing): string {
  const plainText = richTextToPlainText(listing.description);
  if (plainText) {
    // richTextToPlainText разделяет абзацы через "\n\n" — уместно для
    // текстового описания на странице, но в <meta name="description">
    // и og:description переносы строк выглядят как артефакт (лишний
    // пробел/перенос посреди фразы в выдаче). Схлопываем в пробелы
    // только здесь, не трогая саму richTextToPlainText — её результат
    // с переносами нужен фидам (Авито/ЦИАН/Яндекс, см. lib/feed/*).
    const singleLine = plainText.replace(/\s+/g, " ").trim();
    return truncateAtWord(singleLine, META_DESCRIPTION_MAX_LENGTH);
  }

  const propertyType = propertyTypeLabels[listing.propertyType];
  const rooms = listing.rooms ? roomsLabels[listing.rooms] : null;
  const area = listing.areaTotal ? `${listing.areaTotal} м²` : null;
  const place = listing.locality || listing.address;
  const details = [propertyType, rooms, area].filter(Boolean).join(", ");

  const fallback = `${details}${place ? ` в ${place}` : ""}. Цена ${formatPrice(
    listing.price,
  )}. Агентство недвижимости CITY KEYS, Кингисепп.`;
  return truncateAtWord(fallback, META_DESCRIPTION_MAX_LENGTH);
}
