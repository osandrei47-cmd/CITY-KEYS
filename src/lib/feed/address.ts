// Устраняет дублирование в адресе для фидов (баг, из-за которого Домклик
// отклонил объект: "Ленинградская область, Кингисеппский район,
// Кингисепп, Ленинградская область, город Кингисепп, микрорайон
// Касколовка, дом 2" — регион и населённый пункт дважды).
//
// Причина: поле «Адрес / район» (Listings.address) по описанию в админке
// должно содержать только улицу/дом, а область/район/населённый пункт —
// отдельно (Listing.locality, DEFAULT_REGION/DEFAULT_DISTRICT). На деле
// агенты заполняют address ПОЛНОЙ строкой ("Ленинградская область, город
// Кингисепп, проспект Карла Маркса, дом 62") — проверено на реальных
// объектах в проде (2026-09-24, id 26–35 — только id=31/32 без адреса
// вообще, у остальных address содержит регион/город). Раньше код фидов
// (yandex.ts: <region>+<district>+<locality-name>+<address>; avito.ts/
// cian.ts: [locality, address].join(", ")) добавлял регион/населённый
// пункт ПОВЕРХ уже готовой строки — отсюда дубли у всех объектов, не
// только у того, что отклонил Домклик.
//
// Решение здесь — не миграция данных (это потребовало бы вручную
// переисправить address во всех объектах и переучить агентов), а
// нормализация текста: вырезаем из address то, что и так будет выведено
// отдельно (Россия / регион / район / населённый пункт из locality —
// в любом порядке слов, с приставками "город"/"деревня"/"мкр."/"д." и
// т.п.). Это эвристика над свободным текстом, не гарантия для любых
// формулировок — если объект снова провалит гео-валидацию площадки,
// проверьте актуальный address этого объекта в первую очередь.

import { DEFAULT_DISTRICT, DEFAULT_REGION } from "./constants";

// ВАЖНО: \b (word boundary) в JS-регэкспах считается по \w, а \w — это
// только [A-Za-z0-9_], БЕЗ кириллицы. У строки из одних кириллических
// слов ни в одном месте нет перехода \w/\W, поэтому \b там никогда не
// сработает ("\b(деревня)\b" не найдёт "деревня" ни в "деревня Х", ни
// где-либо ещё) — этим было сломано первое рабочее предположение (см.
// git log). Поэтому приставки населённого пункта ищем и вырезаем через
// разбиение на слова по пробелам, а не через \b.
const LOCALITY_PREFIX_TOKENS = [
  "город",
  "гор.",
  "г.",
  "посёлок",
  "пос.",
  "деревня",
  "дер.",
  "д.",
  "село",
  "сел.",
  "станица",
  "ст.",
  "микрорайон",
  "мкр.",
  "мкр",
  "м-н",
];
const LOCALITY_PREFIX_WORDS = LOCALITY_PREFIX_TOKENS.map(escapeRegExp).join("|");

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "Ядро" населённого пункта из locality — без приставки "город"/
// "деревня"/"мкр." и т.п., чтобы найти его в address независимо от
// того, в каком порядке и с какой приставкой оно там написано
// ("Касколовка м-н" в address vs "м-н Касколовка" в locality).
function localityCore(locality: string): string {
  const prefixSet = new Set(LOCALITY_PREFIX_TOKENS);
  return locality
    .split(/\s+/)
    .filter((word) => !prefixSet.has(word.toLowerCase()))
    .join(" ")
    .trim();
}

function stripLeadingRepeated(value: string): string {
  let result = value.trim();
  const prefixes = [/^россия\s*,?\s*/i, new RegExp(`^${escapeRegExp(DEFAULT_REGION)}\\s*,?\\s*`, "i"), new RegExp(`^${escapeRegExp(DEFAULT_DISTRICT)}\\s*,?\\s*`, "i")];
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of prefixes) {
      const next = result.replace(re, "");
      if (next !== result) {
        result = next.trim();
        changed = true;
      }
    }
  }
  return result;
}

function stripLocalityMention(value: string, locality: string): string {
  const core = localityCore(locality);
  if (!core) return value;
  // (начало строки ИЛИ запятая) + необязательная приставка + ядро +
  // необязательная приставка (для случая "Касколовка м-н") + запятая/конец.
  const re = new RegExp(
    `(^|,\\s*)(?:${LOCALITY_PREFIX_WORDS})?\\s*${escapeRegExp(core)}\\s*(?:${LOCALITY_PREFIX_WORDS})?\\s*(,\\s*|$)`,
    "gi",
  );
  return value.replace(re, (_match, before: string, after: string) => (after ? before : before.replace(/,\s*$/, "")));
}

function tidyPunctuation(value: string): string {
  return value
    .replace(/^,\s*/, "")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/, "")
    .trim();
}

export type CleanAddress = {
  region: string;
  district: string;
  localityName: string | null;
  /** Адрес без региона/района/населённого пункта — улица, дом и т.п. Может быть пустой строкой (например, для деревни без адресов в пределах неё). */
  streetAddress: string;
};

export function buildCleanAddress(listing: {
  address?: string | null;
  locality?: string | null;
}): CleanAddress {
  const localityName = listing.locality?.trim() || null;

  let streetAddress = stripLeadingRepeated(listing.address ?? "");
  if (localityName) {
    streetAddress = stripLocalityMention(streetAddress, localityName);
  }
  streetAddress = tidyPunctuation(streetAddress);

  return {
    region: DEFAULT_REGION,
    district: DEFAULT_DISTRICT,
    localityName,
    streetAddress,
  };
}

// Для Avito/ЦИАН — только населённый пункт + улица/дом (без региона и
// района, как и раньше в этих двух фидах), но уже без дублей.
export function buildLocalityAndStreet(listing: { address?: string | null; locality?: string | null }): string {
  const { localityName, streetAddress } = buildCleanAddress(listing);
  return [localityName, streetAddress].filter(Boolean).join(", ");
}

// Для Яндекса/Домклика — полная строка на случай, если где-то нужна одной
// строкой (сам yandex.ts использует region/district/localityName/
// streetAddress как отдельные элементы <location>, см. buildOffer).
export function buildFullAddress(listing: { address?: string | null; locality?: string | null }): string {
  const { region, district, localityName, streetAddress } = buildCleanAddress(listing);
  return [region, district, localityName, streetAddress].filter(Boolean).join(", ");
}
