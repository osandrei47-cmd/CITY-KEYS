import { contacts } from "@/lib/nav";

export const SITE_URL = "https://city-keys.ru";

export const AGENCY_NAME = "CITY KEYS";
export const AGENT_NAME = "Андрей";

// Строгий формат +7XXXXXXXXXX без пробелов/дефисов — так его отдаёт
// подтверждённый рабочий фид (см. reference-feed.xml, sales-agent/phone).
export const AGENT_PHONE = contacts.phone.replace(/[^\d+]/g, "");

export const AGENT_EMAIL = contacts.email;

// Агентство сейчас работает только в Кингисеппском районе Ленинградской
// области — все объекты в reference-фиде относятся к этому региону/району,
// поэтому пока это константа, а не поле в админке. Если появятся объекты
// в другом районе/регионе — тут придётся завести настоящее поле в Listings.
export const DEFAULT_REGION = "Ленинградская область";
export const DEFAULT_DISTRICT = "Кингисеппский район";
