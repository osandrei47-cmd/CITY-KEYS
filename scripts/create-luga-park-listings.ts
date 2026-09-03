/**
 * Создаёт 6 лотов 1-й очереди коттеджного посёлка «Луга Парк» как записи
 * коллекции Listings (у каждого — своя страница /katalog/obyekt/[id] с
 * готовой логикой печати). Привязывает их к карточке проекта «Луга Парк»
 * через поле project. Идёт напрямую через Payload Local API.
 *
 * Предварительно: прогнать scripts/create-luga-park.ts (нужна карточка
 * проекта).
 *
 * ВАЖНО: пишет в БД из .env.prod.local, если файл есть (боевая база), иначе
 * в .env.local (по умолчанию city_keys_dev) — с предупреждением.
 *
 * Идемпотентно: лот с уже существующим точным title пропускается.
 *
 * Запуск (Node 20.12+, из папки web/):
 *   npx tsx scripts/create-luga-park-listings.ts
 */
import { existsSync } from "node:fs";

const ENV_FILE = existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
process.loadEnvFile(ENV_FILE);
console.log(`[env] загружен ${ENV_FILE}`);

import type { Listing } from "@/payload-types";
import { LUGA_PARK_LOTS, formatLugaParkPrice } from "@/lib/luga-park";

const ADDRESS =
  "Ленинградская область, Кингисеппский район, д. Новое Куземкино, коттеджный посёлок «Луга Парк»";
const LOCALITY = "деревня Новое Куземкино";

// Минимальный корректный Lexical JSON — по абзацу на строку (как при Enter
// в редакторе Payload). Тот же приём, что в scripts/quick-add-listings.ts.
function plainTextToLexical(text: string) {
  const lines = text.split("\n");
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: null,
      children: lines.map((line) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: null,
        textStyle: "",
        textFormat: 0,
        children: line.trim()
          ? [
              {
                mode: "normal",
                text: line,
                type: "text",
                style: "",
                detail: 0,
                format: 0,
                version: 1,
              },
            ]
          : [],
      })),
    },
  };
}

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const projectRes = await payload.find({
    collection: "projects",
    where: { slug: { equals: "luga-park" } },
    limit: 1,
  });
  const project = projectRes.docs[0];
  if (!project) {
    throw new Error(
      "Карточка проекта «Луга Парк» не найдена — сначала прогоните scripts/create-luga-park.ts",
    );
  }

  let created = 0;
  for (const [index, lot] of LUGA_PARK_LOTS.entries()) {
    const existing = await payload.find({
      collection: "listings",
      where: { title: { equals: lot.title } },
      limit: 1,
    });
    if (existing.docs.length) {
      console.log(`• «${lot.title}» уже есть (id=${existing.docs[0].id}) — пропускаю.`);
      continue;
    }

    // Первый лот каждого типа помечаем «Старт продаж» для наглядности —
    // потом редактируется в CMS без разработчика.
    const isFirstOfZone = LUGA_PARK_LOTS.findIndex((l) => l.zone === lot.zone) === index;

    const description = [
      `Участок ИЖС в коттеджном посёлке «Луга Парк», ${LOCALITY}. Тип зоны ${lot.zone}, площадь ${lot.areaM2.toLocaleString("ru-RU")} м² (${lot.areaSotkiLabel}).`,
      "",
      `Цена без подключения электричества — ${formatLugaParkPrice(lot.priceNoElectric)}. Цена с подключением электричества — ${formatLugaParkPrice(lot.priceWithElectric)}.`,
      "",
      "Электричество — ЛЭП по границе участка, подключение оформляется отдельно. Внутренние проезды укатаны щебнем, круглогодичный проезд. До реки Луга — 50 метров.",
      "",
      "Доступны рассрочка, ипотека на участок ИЖС и 100% оплата.",
    ].join("\n");

    const data: Record<string, unknown> = {
      title: lot.title,
      propertyType: "uchastki",
      price: lot.priceNoElectric,
      address: ADDRESS,
      locality: LOCALITY,
      areaLot: Math.round((lot.areaM2 / 100) * 100) / 100,
      status: "for-sale",
      dealType: "sale",
      mortgageAvailable: true,
      project: project.id,
      description: plainTextToLexical(description),
    };
    if (isFirstOfZone) data.badge = "start";

    const doc = (await payload.create({
      collection: "listings",
      data: data as unknown as Omit<Listing, "id" | "updatedAt" | "createdAt" | "leads">,
    })) as unknown as Listing;

    console.log(`✅ «${doc.title}» — создан лот №${doc.id}`);
    created += 1;
  }

  console.log(`\nИтого создано: ${created} из ${LUGA_PARK_LOTS.length}. Проект id=${project.id}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[create-luga-park-listings] ошибка:", error);
    process.exit(1);
  });
