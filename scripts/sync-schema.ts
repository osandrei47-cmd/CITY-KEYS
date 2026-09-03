/**
 * Синхронизирует схему БД с текущим конфигом коллекций (Payload dev push —
 * тот же механизм, что запускает `next dev` при старте: drizzle pushSchema
 * для аддитивных изменений полей, см.
 * node_modules/@payloadcms/drizzle/dist/utilities/pushDevSchema.js).
 *
 * Нужен после добавления/изменения полей в src/collections/*. В проекте нет
 * файлов миграций — схема накатывается именно этим push-ом.
 *
 * По умолчанию берёт .env.local (dev, city_keys_dev). Для боевой базы —
 * положить рядом .env.prod.local с прод-DATABASE_URL / PAYLOAD_SECRET и
 * запускать так же; скрипт сам предпочтёт этот файл.
 *
 * Запуск (Node 20.12+, из папки web/):
 *   npx tsx scripts/sync-schema.ts
 *
 * ВАЖНО: NODE_ENV не должен быть "production" — иначе push не сработает
 * (в проде Payload ждёт файлы миграций, которых тут нет).
 */
import { existsSync } from "node:fs";

const ENV_FILE = existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
process.loadEnvFile(ENV_FILE);

if (process.env.NODE_ENV === "production") {
  console.error("NODE_ENV=production — push отключён. Снимите NODE_ENV и повторите.");
  process.exit(1);
}

function dbLabel(): string {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/]+)\/([^?]+)/);
  return match ? `${match[1]}/${match[2]}` : "(DATABASE_URL не задан)";
}

async function main() {
  console.log(`[sync-schema] env: ${ENV_FILE}`);
  console.log(`[sync-schema] БД: ${dbLabel()}`);

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");

  // Сам вызов init → connect → pushDevSchema (адаптер @payloadcms/db-postgres,
  // connect.js: NODE_ENV !== 'production' && push !== false).
  const payload = await getPayload({ config });

  // Адаптер @payloadcms/db-postgres после connect держит pg.Pool в .pool
  // (см. node_modules/@payloadcms/db-postgres/dist/connect.js) — в типах
  // BaseDatabaseAdapter его нет, поэтому явный каст.
  const pool = (payload.db as unknown as {
    pool: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> };
  }).pool;

  const columnExists = async (table: string, column: string): Promise<boolean> => {
    const { rows } = await pool.query(
      `select 1 from information_schema.columns where table_name = $1 and column_name = $2`,
      [table, column],
    );
    return rows.length > 0;
  };

  // ВАЖНО про relationship-поле Listings.project:
  // одиночная связь (без hasMany, не полиморфная) в @payloadcms/db-postgres —
  // это ПРЯМАЯ FK-колонка `<name>_id` на таблице самой коллекции, ровно как
  // существующий listings.residential_complex_id. В таблицу listings_rels
  // уходят только hasMany / полиморфные связи. Поэтому проверяем
  // listings.project_id, а НЕ listings_rels.projects_id.
  const checks: Array<[string, string]> = [
    ["listings", "badge"],
    ["leads", "interest_type"],
    ["listings", "project_id"],
  ];

  let allOk = true;
  for (const [table, column] of checks) {
    const ok = await columnExists(table, column);
    allOk &&= ok;
    console.log(`  ${ok ? "✅" : "❌"} ${table}.${column}`);
  }

  // Функциональная проверка: заставляем Payload собрать и выполнить SQL,
  // который трогает project_id. Если колонки нет — бросит ту же ошибку
  // "column listings.project_id does not exist", что валила next build.
  try {
    await payload.find({
      collection: "listings",
      where: { project: { exists: false } },
      limit: 1,
      depth: 0,
    });
    console.log("  ✅ payload.find по полю project отрабатывает");
  } catch (error) {
    allOk = false;
    console.log(`  ❌ payload.find по полю project упал: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(
    allOk
      ? "\n[sync-schema] схема синхронизирована."
      : "\n[sync-schema] НЕ ВСЕ колонки на месте — см. вывод выше.",
  );
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  console.error("[sync-schema] ошибка:", error);
  process.exit(1);
});
