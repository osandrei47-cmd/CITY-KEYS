// JSON-LD (Schema.org) разметка. См. docs/seo-audit-2026-08-18.md, п.6.

import { contacts } from "./nav";
import { AGENCY_NAME, SITE_URL } from "./feed/constants";
import { DEFAULT_OG_IMAGE } from "./seo";
import type { Listing } from "./listing-types";
import type { BlogPost } from "./blog-types";
import type { Service } from "./service-types";

// Координаты офиса — БЦ «Волна», Кингисепп, ул. Октябрьская, д.18а/14.
// Единственный источник для JSON-LD (главная, /kontakty) и для карты на
// /kontakty (кортеж [lat, lng] — формат, которого ждёт YandexMap) — не
// дублировать в других местах.
export const OFFICE_COORDINATES: [number, number] = [59.374028, 28.611297];

const OFFICE_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "ул. Октябрьская, д.18а/14, БЦ «Волна», 2 эт., оф.1",
  addressLocality: "Кингисепп",
  addressRegion: "Ленинградская область",
  addressCountry: "RU",
};

const AREA_SERVED = {
  "@type": "AdministrativeArea",
  name: "Кингисеппский район, Ленинградская область",
};

// RealEstateAgent — не LocalBusiness: это специализированный подтип
// LocalBusiness именно для агентств недвижимости (schema.org: Thing >
// Organization/Place > LocalBusiness > RealEstateAgent), с теми же
// свойствами (address, telephone, geo, sameAs...), но точнее описывающий
// род деятельности компании — более специфичный тип поисковики
// предпочитают более общему.
export function buildRealEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: AGENCY_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/images/andrey-office-suit.JPG`,
    telephone: contacts.phone,
    email: contacts.email,
    address: OFFICE_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: OFFICE_COORDINATES[0],
      longitude: OFFICE_COORDINATES[1],
    },
    areaServed: AREA_SERVED,
    sameAs: [contacts.telegram, contacts.vk, contacts.whatsapp, contacts.max],
    // aggregateRating сюда намеренно НЕ добавлен — см. объяснение в
    // сообщении коммита и в чате: рейтинги 5,0/Авито и 4,5/Яндекс взяты с
    // площадок, которые сайт не хостит и не может подтвердить перед
    // Google — заявлять чужие цифры как свой aggregateRating прямо
    // запрещено гайдлайнами Google по review snippets (self-serving /
    // неверифицируемые рейтинги), а риск — потеря rich results для всего
    // сайта целиком, а не только этой разметки.
  };
}

const AVAILABILITY_BY_STATUS: Record<Listing["status"], string> = {
  "for-sale": "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

export function buildListingProductJsonLd({
  listing,
  url,
  description,
  imageUrls,
}: {
  listing: Listing;
  url: string;
  description: string;
  imageUrls: string[];
}) {
  // Google требует хотя бы одну картинку для Product-разметки — если у
  // объекта ещё нет загруженных фото, подставляем то же запасное фото,
  // что и в openGraph (см. lib/seo.ts), а не пустой массив.
  const images = imageUrls.length ? imageUrls : [`${SITE_URL}${DEFAULT_OG_IMAGE.url}`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description,
    image: images,
    url,
    brand: { "@type": "Organization", name: AGENCY_NAME },
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "RUB",
      availability: AVAILABILITY_BY_STATUS[listing.status],
      url,
      seller: { "@type": "RealEstateAgent", name: AGENCY_NAME },
    },
  };
}

// Проект «Усть-Луга. ИЖС» — не единый товар с одной ценой, а
// инвестиционный пакет с диапазоном (см. firstStageStats на самой
// странице: «15–25 млн ₽ — инвестиции в 1-й этап»). AggregateOffer с
// lowPrice/highPrice — штатный способ schema.org выразить диапазон цен
// одного товара, точнее, чем один Offer с придуманной единой ценой.
export function buildUstLugaIzhsJsonLd() {
  const url = `${SITE_URL}/proekty/ust-luga-izhs`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Инвестиции в загородный модульный кластер ИЖС — Усть-Луга",
    description:
      "500 соток в частной собственности у порта Усть-Луга: 90 дней до первой выручки, доходность 20–22% годовых. Готовая юридическая основа и инфраструктура.",
    image: `${SITE_URL}/api/media/file/2026-08-07_16-33-31.png`,
    url,
    brand: { "@type": "Organization", name: AGENCY_NAME },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: 15000000,
      highPrice: 25000000,
      url,
      seller: { "@type": "RealEstateAgent", name: AGENCY_NAME },
    },
  };
}

// Коттеджный посёлок «Луга Парк» — розничная продажа лотов 1-й очереди с
// диапазоном цен (от 820 000 ₽ за участок типа А до 1 750 000 ₽ за участок
// типа Б с электричеством). AggregateOffer с lowPrice/highPrice — штатный
// способ schema.org выразить диапазон, как и на /proekty/ust-luga-izhs.
export function buildLugaParkJsonLd() {
  const url = `${SITE_URL}/proekty/luga-park`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Коттеджный посёлок «Луга Парк» — участки ИЖС на берегу реки Луга",
    description:
      "Продажа участков ИЖС в коттеджном посёлке «Луга Парк», д. Новое Куземкино. 1-я очередь: от 12,5 соток, 50 метров до реки, рассрочка и ипотека.",
    image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
    url,
    brand: { "@type": "Organization", name: AGENCY_NAME },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: 820000,
      highPrice: 1750000,
      offerCount: 6,
      url,
      seller: { "@type": "RealEstateAgent", name: AGENCY_NAME },
    },
  };
}

export function buildBlogArticleJsonLd({
  post,
  url,
  imageUrl,
}: {
  post: BlogPost;
  url: string;
  imageUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Person", name: post.author || "Андрей Осипов" },
    publisher: {
      "@type": "Organization",
      name: AGENCY_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/hero-tower-color.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function buildServiceJsonLd({ service, url }: { service: Service; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url,
    areaServed: AREA_SERVED,
    provider: {
      "@type": "RealEstateAgent",
      name: AGENCY_NAME,
      telephone: contacts.phone,
      address: OFFICE_ADDRESS,
      url: SITE_URL,
    },
  };
}

// FAQPage — только для статей, где реально есть блок вопрос-ответ (поле
// faq в коллекции BlogPosts). Пустой массив сюда не передавать — Google
// не даёт rich-сниппет для страницы без вопросов, а лишняя пустая
// разметка на остальных статьях не нужна.
export function buildFaqPageJsonLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
