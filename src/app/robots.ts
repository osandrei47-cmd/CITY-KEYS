import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/feed/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Админка Payload — авторизация всё равно не пустит робота внутрь,
        // но саму страницу входа незачем индексировать.
        "/staff-x7k2",
        // REST/GraphQL API Payload — не страницы для людей.
        "/api",
        // Секретный обход режима реконструкции (см. src/proxy.ts) — не
        // предназначен для обнаружения через поиск.
        "/preview-ck2026",
        // XML-фиды для Авито/ЦИАН/Яндекс.Недвижимости/Домклик — данные для
        // агрегаторов, не HTML-страницы для основных поисковых роботов.
        "/feed",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
