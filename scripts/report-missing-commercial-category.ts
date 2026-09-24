/**
 * Разовый отчёт: коммерческие объекты (propertyType === "commercial") без
 * заполненного commercialCategory — обязательного поля, которое требуется
 * новой валидацией в src/collections/Listings.ts (задача про <commercial-type>
 * в фиде Яндекса/Домклик). Валидация действует только при сохранении через
 * форму — уже существующие в базе объекты она не проверяет и не блокирует,
 * поэтому нужен этот отчёт, чтобы донастроить их вручную через админку.
 *
 * Ничего не меняет — только читает. Реальные объекты живут на проде (см.
 * memory "Seed scripts target prod DB"), поэтому по умолчанию смотрим
 * .env.prod.local — как в scripts/sync-schema.ts.
 *
 * Запуск (из папки web/):
 *   npx tsx scripts/report-missing-commercial-category.ts               # прод, если есть .env.prod.local, иначе dev
 *   npx tsx scripts/report-missing-commercial-category.ts .env.local        # явно dev
 *   npx tsx scripts/report-missing-commercial-category.ts .env.prod.local   # явно прод
 */
import { existsSync } from "node:fs";

const ENV_ARG = process.argv[2];
const ENV_FILE = ENV_ARG ? ENV_ARG : existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
if (!existsSync(ENV_FILE)) {
  console.error(`env-файл "${ENV_FILE}" не найден.`);
  process.exit(1);
}
process.loadEnvFile(ENV_FILE);
if (ENV_FILE === ".env.local") {
  console.warn("[report] .env.prod.local не найден — смотрю dev-базу (city_keys_dev), это не боевые данные.");
}

// ВАЖНО: "payload"/"@payload-config" — динамический import, а не статический
// сверху. Статические import в ESM поднимаются выше process.loadEnvFile()
// и читают пустые переменные окружения (см. тот же комментарий в
// quick-add-listings.ts, коммит ea78b42).
async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const { docs, totalDocs } = await payload.find({
    collection: "listings",
    where: {
      and: [{ propertyType: { equals: "commercial" } }, { commercialCategory: { exists: false } }],
    },
    depth: 0,
    limit: 1000,
    select: { title: true, address: true, locality: true, dealType: true, status: true },
  });

  console.log(`[report] env: ${ENV_FILE}`);
  if (totalDocs === 0) {
    console.log("[report] коммерческих объектов без категории не найдено — донастраивать нечего.");
    process.exit(0);
  }

  console.log(`[report] без commercialCategory: ${totalDocs}\n`);
  for (const doc of docs) {
    const place = [doc.locality, doc.address].filter(Boolean).join(", ");
    console.log(`  id=${doc.id}  «${doc.title}»  ${place}  (${doc.dealType}, ${doc.status})`);
    console.log(`    → /staff-x7k2/collections/listings/${doc.id}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[report] ошибка:", error);
    process.exit(1);
  });
