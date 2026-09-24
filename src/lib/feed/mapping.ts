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

// ---------- Аренда: коммерческая недвижимость (Яндекс/Домклик) ----------
// В отличие от остального файла, эти мапперы сверены не с рабочим фидом,
// а напрямую с официальной документацией: yandex.ru/support/realty/ru/
// feed/requirements-commercial.html (раздел про коммерческую аренду,
// проверено 2026-09-24). Это единственный подтверждённый источник для
// арендных полей коммерции во всём проекте — Avito/CIAN для тех же полей
// остаются рабочей гипотезой (см. их собственные disclaimer-комментарии
// в avito.ts/cian.ts).

const commercialBuildingTypeMap: Record<string, string> = {
  "business-center": "business center",
  "shopping-center": "shopping center",
  "detached-building": "detached building",
  "residential-building": "residential building",
  warehouse: "warehouse",
};

// <commercial-building-type> — строгий enum из 5 значений (см. комментарий
// выше). Сами варианты поля commercialBuildingType в Payload (Listings.ts)
// подобраны так, чтобы отображаться на этот список один-в-один.
export function toCommercialBuildingTypeYandex(value: Listing["commercialBuildingType"]): string | null {
  if (!value) return null;
  return commercialBuildingTypeMap[value] ?? null;
}

// <deal-status> — обязателен для аренды, для продажи не передаётся вообще.
// У нас есть данные для него только у коммерции (поле rentalType) — для
// жилой аренды без источника правды не угадываем и тег не выводим.
const dealStatusMap: Record<string, string> = {
  direct: "direct rent",
  sublease: "subrent",
};

export function toDealStatusYandex(value: Listing["rentalType"]): string | null {
  if (!value) return null;
  return dealStatusMap[value] ?? null;
}

// <renovation> для коммерческих объектов — свой закрытый список из 7
// значений, отличный от типовых «косметический/евроремонт» у жилья (тот
// маппинг — toRenovationRu выше, используется только для не-коммерции).
// Наше поле finishType (Без отделки/Чистовая/Офисная) грубее официального
// списка, соответствие ниже — обоснованный выбор, а не документированный факт.
const commercialRenovationMap: Record<string, string> = {
  none: "черновая отделка",
  finished: "с отделкой",
  office: "хороший",
};

export function toCommercialRenovationYandex(value: Listing["finishType"]): string | null {
  if (!value) return null;
  return commercialRenovationMap[value] ?? null;
}

// rentalDeposit — свободный текст админки ("60 000 ₽", "Без залога",
// "1 месяц аренды" и т.п.). Из него нужны два разных значения:
//  - булево "залог есть" — для <rent-pledge> у Яндекса (см. yandex.ts);
//  - сумма числом — только для Домклика (см. hasRentalDeposit ниже и
//    disclaimer в yandex.ts про rent-pledge-amount).
// Не разделяем на два регэкспа с одинаковым смыслом: "нет цифр в тексте"
// не то же самое, что "залога нет" (агент мог написать "есть, сумма
// уточняется" без единой цифры) — поэтому hasRentalDeposit не выведена
// из parseRentalDepositAmount, а проверяет текст отдельно.
export function hasRentalDeposit(value: Listing["rentalDeposit"]): boolean {
  if (!value) return false;
  return !/^\s*(без\s*залога|нет)\s*$/i.test(value);
}

const NUMBER_TOKEN = "\\d[\\d\\s\\u00A0]*\\d|\\d";

export function parseRentalDepositAmount(value: Listing["rentalDeposit"]): number | null {
  if (!value || !hasRentalDeposit(value)) return null;
  // Свободный текст может содержать не только сумму, но и посторонние
  // числа ("85 000 ₽ (1 месяц)", "1 месячная оплата (85 000 ₽)") — что из
  // них сумма, формально не определить. Эвристика: сперва ищем число
  // рядом с ₽/руб (в обоих примерах выше это даст правильные 85 000), и
  // только если такого нет — берём первое число в тексте как раньше.
  // Это по-прежнему эвристика, а не гарантия для произвольного текста.
  const currencyMatch = value.match(new RegExp(`(${NUMBER_TOKEN})\\s*(?:₽|руб)`, "i"));
  const numberToken = currencyMatch?.[1] ?? value.match(new RegExp(NUMBER_TOKEN))?.[0];
  if (!numberToken) return null;
  const digits = numberToken.replace(/[^\d]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
