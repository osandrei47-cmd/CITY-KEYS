import type { MetadataRoute } from "next";
import { getPayloadClient } from "@/lib/payload-client";
import { hasHandBuiltProjectPage } from "@/lib/project-pages";
import { SITE_URL } from "@/lib/feed/constants";
import type { Listing, Project, ResidentialComplex } from "@/payload-types";

// Карта сайта не обязана быть в реальном времени — раз в час более чем
// достаточно для того, как часто её вообще перечитывают поисковики.
export const revalidate = 3600;

// Статические публичные страницы. Синхронизировано с src/lib/nav.ts —
// изменили состав mainNav, обновите и этот список. Юридические документы
// (privacy-policy, terms, cookies, personal-data-consent) сюда намеренно
// не включены — это шаблонный текст без уникального контента, такие
// страницы обычно держат вне sitemap.
const STATIC_PATHS = [
  "",
  "/katalog",
  "/proekty",
  "/novostroyki",
  "/uslugi",
  "/ipoteka",
  "/strahovanie",
  "/otzyvy",
  "/blog",
  "/o-kompanii",
  "/andrey-osipov",
  "/kontakty",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();

  const [{ docs: projectDocs }, { docs: listingDocs }, { docs: complexDocs }] = await Promise.all([
    payload.find({
      collection: "projects",
      where: { isPublished: { equals: true } },
      depth: 0,
      limit: 1000,
    }),
    payload.find({
      collection: "listings",
      where: { status: { not_equals: "sold" } },
      depth: 0,
      limit: 5000,
    }),
    payload.find({
      collection: "residential-complexes",
      where: { isPublished: { equals: true } },
      depth: 0,
      limit: 1000,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/katalog" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Только проекты с реально существующей вручную свёрстанной страницей —
  // остальные пока отдают заглушку "страница готовится" (noindex, см.
  // proekty/[slug]/page.tsx) и в карту сайта попадать не должны.
  const projectEntries: MetadataRoute.Sitemap = (projectDocs as unknown as Project[])
    .filter((project) => hasHandBuiltProjectPage(project.slug))
    .map((project) => ({
      url: `${SITE_URL}/proekty/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const listingEntries: MetadataRoute.Sitemap = (listingDocs as unknown as Listing[]).map(
    (listing) => ({
      url: `${SITE_URL}/katalog/obyekt/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  // В отличие от Projects, у ЖК нет отдельного списка "вручную свёрстанных
  // страниц" — /zhk/[slug] один универсальный шаблон, реально рабочий для
  // любого опубликованного ЖК, поэтому гейтинг не нужен (как у listings).
  const complexEntries: MetadataRoute.Sitemap = (
    complexDocs as unknown as ResidentialComplex[]
  ).map((complex) => ({
    url: `${SITE_URL}/zhk/${complex.slug}`,
    lastModified: complex.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries, ...listingEntries, ...complexEntries];
}
