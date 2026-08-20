// Общие помощники для Open Graph / Twitter Card метатегов.
// См. docs/seo-audit-2026-08-18.md, п.5 (желательные улучшения).

import { AGENCY_NAME } from "./feed/constants";

export type OgImage = { url: string; width?: number; height?: number; alt: string };

// Запасное изображение для страниц без собственного hero-фото (сейчас это
// /katalog и /proekty — их PageHero не задаёт photoSrc) — то же фото, что
// и на главной, самое узнаваемое на сайте.
export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/images/hero-tower-color.jpg",
  width: 5810,
  height: 3873,
  alt: "CITY KEYS — агентство недвижимости в Кингисеппе",
};

// ВАЖНО: Next.js не сливает вложенные объекты metadata между layout и
// page — если страница задаёт свой openGraph, он ПОЛНОСТЬЮ заменяет
// унаследованный, а не дополняет его отдельными полями (см. доки Next.js,
// generate-metadata.md, раздел "Merging"). Поэтому каждый вызов этой
// функции формирует самодостаточный объект — title/siteName/locale и
// прочее не нужно переносить в каждую страницу вручную.
export function buildOpenGraph({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
}) {
  return {
    title,
    description,
    url: path,
    siteName: AGENCY_NAME,
    type: "website" as const,
    locale: "ru_RU",
    images: [image],
  };
}

// Self-referencing canonical — на каждой странице сайта ровно один способ
// на неё сослаться, без ?query-хвостов и параметров сортировки/фильтра
// (см. docs/seo-audit-2026-08-18.md, п.7). `path` резолвится в абсолютный
// URL через metadataBase (как и openGraph.url) — тут можно передавать
// относительный путь.
export function buildCanonical(path: string) {
  return { canonical: path };
}

export function buildTwitter({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  image?: OgImage;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [image.url],
  };
}
