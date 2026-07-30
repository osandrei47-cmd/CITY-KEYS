// Отображение и форматирование для коллекции Listings.
// Сами типы (Listing, Media) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекций.

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
