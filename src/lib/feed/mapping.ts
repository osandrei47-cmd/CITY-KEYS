import type { Listing } from "@/lib/listing-types";

export type YandexCategory = "квартира" | "дом с участком" | "участок" | "коммерческая";

export function toYandexCategory(propertyType: Listing["propertyType"]): YandexCategory {
  switch (propertyType) {
    case "kvartiry":
    case "novostroyki":
      return "квартира";
    case "doma":
    case "dachi":
      return "дом с участком";
    case "uchastki":
      return "участок";
    case "commercial":
      return "коммерческая";
  }
}

export function toDealTypeRu(dealType: Listing["dealType"]): "продажа" | "аренда" {
  return dealType === "rent" ? "аренда" : "продажа";
}

const renovationMap: Record<string, string> = {
  none: "требует ремонта",
  cosmetic: "с отделкой",
  euro: "евроремонт",
  designer: "дизайнерский",
};

export function toRenovationRu(value: Listing["renovation"]): string | null {
  if (!value) return null;
  return renovationMap[value] ?? null;
}

const buildingTypeMap: Record<string, string> = {
  brick: "кирпичный",
  panel: "панельный",
  monolith: "монолит",
  block: "блочный",
  wood: "деревянный",
};

export function toBuildingTypeRu(value: Listing["buildingType"]): string | null {
  if (!value) return null;
  return buildingTypeMap[value] ?? null;
}

const windowViewMap: Record<string, string> = {
  yard: "во двор",
  street: "на улицу",
};

export function toWindowViewRu(value: Listing["view"]): string | null {
  if (!value?.length) return null;
  for (const v of value) {
    if (windowViewMap[v]) return windowViewMap[v];
  }
  return null;
}

export function toIsoWithOffset(date: string | Date): string {
  return new Date(date).toISOString().replace("Z", "+00:00");
}
