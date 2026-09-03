/**
 * Создаёт (или чинит обложку у) карточки проекта «Луга Парк» в коллекции
 * Projects — пункт в разделе /proekty, ведёт на вручную свёрстанную
 * страницу /proekty/luga-park. Через Payload Local API, как create-project.ts.
 *
 * Обложка (поле coverPhoto) ОБЯЗАТЕЛЬНО должна быть отдельным медиафайлом
 * этого проекта. Нельзя переиспользовать media-запись другого проекта: это
 * один и тот же ID, и замена файла в этой media-записи меняет обложку сразу
 * у всех, кто на неё ссылается (ровно этот баг был у «Усть-Луги» после
 * первой версии скрипта). Скрипт это проверяет и отказывается.
 *
 * ВАЖНО: пишет в БД из .env.prod.local, если файл есть (боевая база), иначе
 * в .env.local (city_keys_dev) — с предупреждением.
 *
 * Запуск (Node 20.12+, из папки web/). Имя файла — ровно как в колонке
 * Filename списка Media (/staff-x7k2/collections/media):
 *   npx tsx scripts/create-luga-park.ts <имя-файла-обложки>
 *
 * Если проект уже создан — тот же вызов ОБНОВИТ его обложку на указанный
 * файл (удобно, чтобы отвязать от чужого медиа).
 */
import { existsSync } from "node:fs";

const ENV_FILE = existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
process.loadEnvFile(ENV_FILE);
console.log(`[env] загружен ${ENV_FILE}`);

async function main() {
  const coverFilename = process.argv[2];
  if (!coverFilename) {
    throw new Error(
      "Укажите имя файла обложки: npx tsx scripts/create-luga-park.ts <имя-файла-в-Media>.\n" +
        "Это должен быть отдельный медиафайл «Луга Парка», не переиспользованный у другого проекта.",
    );
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const media = await payload.find({
    collection: "media",
    where: { filename: { equals: coverFilename } },
    limit: 1,
  });
  const coverPhoto = media.docs[0]?.id;
  if (!coverPhoto) throw new Error(`Файл обложки "${coverFilename}" не найден в Media`);

  // Не даём взять media-запись, которую уже использует ДРУГОЙ проект как
  // обложку — иначе смена файла в этой записи затронет оба проекта.
  const sharers = await payload.find({
    collection: "projects",
    where: {
      coverPhoto: { equals: coverPhoto },
      slug: { not_equals: "luga-park" },
    },
    depth: 0,
    limit: 5,
  });
  if (sharers.docs.length) {
    const names = sharers.docs.map((p) => `«${p.title}» (${p.slug})`).join(", ");
    throw new Error(
      `Медиафайл "${coverFilename}" (id=${coverPhoto}) уже используется как обложка проекта(ов): ${names}.\n` +
        "Загрузите отдельное фото для «Луга Парка» через админку и укажите его имя.",
    );
  }

  const existing = await payload.find({
    collection: "projects",
    where: { slug: { equals: "luga-park" } },
    limit: 1,
  });

  if (existing.docs.length) {
    const project = existing.docs[0];
    const updated = await payload.update({
      collection: "projects",
      id: project.id,
      data: { coverPhoto },
    });
    console.log(
      `Проект «Луга Парк» уже был (id=${updated.id}) — обложка обновлена на "${coverFilename}" (media id=${coverPhoto}).`,
    );
    return;
  }

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
