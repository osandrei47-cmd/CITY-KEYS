/**
 * Создаёт карточку проекта «Луга Парк» в коллекции Projects (пункт в
 * разделе /proekty, ведёт на вручную свёрстанную страницу
 * /proekty/luga-park). Тот же обходной путь через Payload Local API, что и
 * scripts/create-project.ts.
 *
 * ВАЖНО: пишет в БД из .env.prod.local, если файл есть (боевая база), иначе
 * в .env.local (по умолчанию city_keys_dev) — с предупреждением. Для
 * боевого запуска положите рядом .env.prod.local с прод-DATABASE_URL /
 * PAYLOAD_SECRET / S3_*.
 *
 * Запуск (Node 20.12+, из папки web/):
 *   npx tsx scripts/create-luga-park.ts
 *   npx tsx scripts/create-luga-park.ts <имя-файла-обложки-в-Media>
 */
import { existsSync } from "node:fs";

const ENV_FILE = existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
process.loadEnvFile(ENV_FILE);
console.log(`[env] загружен ${ENV_FILE}`);

// Обложка карточки — поле required в Projects. Пока отдельного фото «Луга
// Парк» нет, по умолчанию берём то же аэрофото массива, что у карточки
// «Усть-Луга. ИЖС» (тот же участок земли у Усть-Луги). Замените, когда
// появится своё фото: npx tsx scripts/create-luga-park.ts <filename>.
const DEFAULT_COVER_FILENAME = "2026-08-07_16-33-31.png";

async function main() {
  const coverFilename = process.argv[2] || DEFAULT_COVER_FILENAME;

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "projects",
    where: { slug: { equals: "luga-park" } },
    limit: 1,
  });
  if (existing.docs.length) {
    console.log(`Проект «Луга Парк» уже есть (id=${existing.docs[0].id}) — пропускаю.`);
    return;
  }

  const media = await payload.find({
    collection: "media",
    where: { filename: { equals: coverFilename } },
    limit: 1,
  });
  const coverPhoto = media.docs[0]?.id;
  if (!coverPhoto) throw new Error(`Файл обложки "${coverFilename}" не найден в Media`);

  const created = await payload.create({
    collection: "projects",
    data: {
      title: "Луга Парк",
      slug: "luga-park",
      coverPhoto,
      shortDescription:
        "Коттеджный посёлок на берегу реки Луга у д. Новое Куземкино: участки ИЖС от 12,5 соток, 50 метров до реки, готовая инфраструктура. 1-я очередь в продаже.",
      status: "sale",
      metric: "Участки от 820 000 ₽",
      isPublished: true,
    },
  });

  console.log(`Создан проект «${created.title}» (id=${created.id}), обложка: ${coverFilename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[create-luga-park] ошибка:", error);
    process.exit(1);
  });
