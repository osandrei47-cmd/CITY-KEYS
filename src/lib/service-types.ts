// Отображение и форматирование для коллекции Services.
// Сами типы (Service) — автогенерируемые Payload'ом в src/payload-types.ts,
// обновляются командой `npm run generate:types` при изменении схемы коллекции.

import type { Service } from "@/payload-types";
import { HouseArrowsIcon, HouseCalendarIcon, HouseGearIcon, HouseHandshakeIcon } from "@/components/ui/mesh-icons";
import type { MeshGradientIcon } from "@/components/ui/mesh-gradient-card";

export type { Service };

export const SERVICE_ICONS: Record<Service["icon"], MeshGradientIcon> = {
  "house-arrows": HouseArrowsIcon,
  "house-calendar": HouseCalendarIcon,
  "house-gear": HouseGearIcon,
  "house-handshake": HouseHandshakeIcon,
};

const META_DESCRIPTION_MAX_LENGTH = 160;

function truncateAtWord(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function buildServiceMetaTitle(service: Service): string {
  return service.metaTitle || `${service.title} в Кингисеппе — CITY KEYS`;
}

export function buildServiceMetaDescription(service: Service): string {
  return truncateAtWord(service.metaDescription || service.shortDescription, META_DESCRIPTION_MAX_LENGTH);
}
