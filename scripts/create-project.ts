/**
 * Создаёт Project в обход админ-формы через Payload Local API — тот же
 * обходной путь, что и scripts/create-listing.ts, на случай если drawer
 * "Выбрать из существующих" у поля "Обложка карточки" упадёт на том же
 * баге (payload#16333, см. комментарий в Listings.ts).
 *
 * Запуск (Node 20.6+, .env.local в корне web/):
 *   npx tsx scripts/create-project.ts
 */
process.loadEnvFile(".env.local");

import { getPayload } from "payload";
import type { Project } from "@/payload-types";

// ---------- Правьте здесь ----------
const PROJECTS_TO_CREATE: Array<
  Omit<Project, "id" | "coverPhoto" | "updatedAt" | "createdAt"> & {
    // Имя файла ровно как в коллекции Media (столбец Filename в списке
    // /staff-x7k2/collections/media) — скрипт сам найдёт его id по имени.
    coverPhotoFilename: string;
  }
> = [
  {
    title: "Усть-Луга. ИЖС",
    slug: "ust-luga-izhs",
    coverPhotoFilename: "2026-08-07_16-33-31.png",
    shortDescription:
      "Загородный модульный кластер ИЖС на 500 сотках у порта Усть-Луга: первая очередь запускается за 90 дней с доходностью 20–22% годовых.",
    status: "sale",
    metric: "Доходность 20–22% годовых",
    isPublished: true,
  },
];
// ------------------------------------

async function resolveCoverPhotoId(payload: Awaited<ReturnType<typeof getPayload>>, filename: string) {
  const { docs } = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
  });
  const id = docs[0]?.id;
  if (!id) throw new Error(`Файл "${filename}" не найден в Media`);
  return id;
}

async function main() {
  // Динамический импорт: статический import выполнился бы раньше
  // process.loadEnvFile выше (ESM хостит все static import до тела модуля),
  // и payload.config.ts прочитал бы PAYLOAD_SECRET как undefined.
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  for (const { coverPhotoFilename, ...data } of PROJECTS_TO_CREATE) {
    const coverPhoto = await resolveCoverPhotoId(payload, coverPhotoFilename);

    const created = await payload.create({
      collection: "projects",
      data: { ...data, coverPhoto },
    });

    console.log(`Создан проект «${created.title}» (id=${created.id}), обложка привязана`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[create-project] ошибка:", error);
    process.exit(1);
  });
