/**
 * Ищет файлы в коллекции Media, на которые никто не ссылается — ни один
 * объект (Listings.photos/droneVideo), ЖК (ResidentialComplexes.coverPhoto/
 * gallery), проект (Projects.coverPhoto/gallery) и статья блога
 * (BlogPosts.coverPhoto). ТОЛЬКО ПОКАЗЫВАЕТ список — сам по себе ничего не
 * удаляет. См. docs/media-cleanup.md для процесса целиком.
 *
 * Запуск:
 *   npx tsx scripts/find-orphaned-media.ts                     # только посмотреть список (по умолчанию — прод, если есть .env.prod.local)
 *   npx tsx scripts/find-orphaned-media.ts .env.local           # явно dev
 *   npx tsx scripts/find-orphaned-media.ts .env.prod.local      # явно прод
 *   npx tsx scripts/find-orphaned-media.ts --delete 41,58,60    # удалить ТОЛЬКО эти id (сначала посмотрите список без --delete!)
 */
import { existsSync } from "node:fs";

const args = process.argv.slice(2);
const deleteArgIndex = args.indexOf("--delete");
const idsToDelete =
  deleteArgIndex !== -1
    ? (args[deleteArgIndex + 1] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
    : null;
const envArg = args.find((a, i) => a !== "--delete" && args[i - 1] !== "--delete");

const ENV_FILE = envArg ? envArg : existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
if (!existsSync(ENV_FILE)) {
  console.error(`env-файл "${ENV_FILE}" не найден.`);
  process.exit(1);
}
process.loadEnvFile(ENV_FILE);
if (ENV_FILE === ".env.local") {
  console.warn("[find-orphaned-media] .env.prod.local не найден — смотрю dev-базу (city_keys_dev), это не боевые данные.\n");
}

// Файлы, на которые в коде ссылаются НЕ через relationship-поле в схеме
// (а значит мой скрипт по связям их не увидит), а через поиск по имени
// файла — например скан свидетельства о товарном знаке на /o-kompanii
// (see src/app/(marketing)/o-kompanii/page.tsx, filename: { like: ... }).
// Такие файлы исключаются из списка кандидатов на удаление ниже — если
// такой лукап появится где-то ещё, добавьте его сюда.
const FILENAME_LOOKUPS_IN_CODE = ["city-keys-trademark-1252865"];

function idOf(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) return Number((value as { id: unknown }).id);
  return null;
}

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  console.log(`[find-orphaned-media] env: ${ENV_FILE}`);

  // ---------- Удаление (если передан --delete) ----------
  if (idsToDelete) {
    if (idsToDelete.some((id) => Number.isNaN(id))) {
      console.error("--delete: не все id — числа, проверьте список через запятую без пробелов внутри чисел.");
      process.exit(1);
    }
    console.log(`Удаляю ${idsToDelete.length} файл(ов) из Media (и из S3 — см. docs/media-cleanup.md): ${idsToDelete.join(", ")}\n`);
    for (const id of idsToDelete) {
      try {
        const doc = await payload.delete({ collection: "media", id });
        console.log(`  ✅ id=${id} (${doc.filename ?? "?"}) удалён`);
      } catch (error) {
        console.log(`  ❌ id=${id} — ошибка: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    process.exit(0);
  }

  // ---------- Сбор всех id media, на которые есть ссылка ----------
  const usedIds = new Set<number>();

  const { docs: listings } = await payload.find({
    collection: "listings",
    depth: 0,
    limit: 10000,
    select: { photos: true, droneVideo: true },
  });
  for (const l of listings) {
    for (const p of l.photos ?? []) {
      const id = idOf(p);
      if (id) usedIds.add(id);
    }
    const dv = idOf(l.droneVideo);
    if (dv) usedIds.add(dv);
  }

  const { docs: blogPosts } = await payload.find({
    collection: "blog-posts",
    depth: 0,
    limit: 10000,
    select: { coverPhoto: true },
  });
  for (const b of blogPosts) {
    const id = idOf(b.coverPhoto);
    if (id) usedIds.add(id);
  }

  const { docs: projects } = await payload.find({
    collection: "projects",
    depth: 0,
    limit: 10000,
    select: { coverPhoto: true, gallery: true },
  });
  for (const pr of projects) {
    const id = idOf(pr.coverPhoto);
    if (id) usedIds.add(id);
    for (const g of pr.gallery ?? []) {
      const gid = idOf(g);
      if (gid) usedIds.add(gid);
    }
  }

  const { docs: complexes } = await payload.find({
    collection: "residential-complexes",
    depth: 0,
    limit: 10000,
    select: { coverPhoto: true, gallery: true },
  });
  for (const c of complexes) {
    const id = idOf(c.coverPhoto);
    if (id) usedIds.add(id);
    for (const g of c.gallery ?? []) {
      const gid = idOf(g);
      if (gid) usedIds.add(gid);
    }
  }

  console.log(`Используется (на что есть ссылка хотя бы откуда-то): ${usedIds.size} файлов\n`);

  // ---------- Все файлы Media и разница ----------
  const { docs: allMedia, totalDocs } = await payload.find({
    collection: "media",
    depth: 0,
    limit: 10000,
    sort: "-createdAt",
  });

  const orphaned = allMedia.filter(
    (m) =>
      !usedIds.has(m.id) &&
      !FILENAME_LOOKUPS_IN_CODE.some((pattern) => m.filename?.includes(pattern)),
  );
  const totalBytes = orphaned.reduce((sum, m) => sum + (m.filesize ?? 0), 0);

  console.log(`Всего файлов в Media: ${totalDocs}`);
  console.log(`Без единой ссылки (кандидаты на удаление): ${orphaned.length}`);
  console.log(`Суммарный размер: ${(totalBytes / 1024 / 1024).toFixed(1)} МБ`);
  console.log(
    `(исключены из списка как «используются по имени файла в коде, не по связи»: ${FILENAME_LOOKUPS_IN_CODE.join(", ")})\n`,
  );

  if (orphaned.length === 0) {
    console.log("Осиротевших файлов не найдено — чистить нечего.");
    return;
  }

  console.log("Список (проверьте глазами перед удалением — например, откройте id в /staff-x7k2/collections/media/<id>):\n");
  for (const m of orphaned) {
    const sizeKb = m.filesize ? `${Math.round(m.filesize / 1024)} КБ` : "размер неизвестен";
    console.log(`  id=${m.id}  ${m.filename ?? "(без имени)"}  ${sizeKb}  создан ${m.createdAt}`);
  }

  console.log(
    `\nЧтобы удалить конкретные файлы (файл в Media + сам файл в S3 — удаляется автоматически, см. docs/media-cleanup.md):`,
  );
  console.log(`  npx tsx scripts/find-orphaned-media.ts --delete ${orphaned.map((m) => m.id).join(",")}`);
  console.log("(впишите только те id, которые сами проверили и точно не нужны — не обязательно все сразу)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
