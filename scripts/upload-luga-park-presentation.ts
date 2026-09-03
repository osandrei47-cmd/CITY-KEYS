/**
 * Загружает PDF-презентацию посёлка «Луга Парк» в приватный ключ S3
 * (лид-гейт, см. src/lib/luga-park-s3.ts) — вне коллекции Media, не через
 * админку Payload. Та же схема, что scripts/upload-zhk-presentation.ts.
 *
 * Без аргумента загружает заглушку scripts/assets/luga-park-presentation-placeholder.pdf
 * (кнопка «Получить презентацию PDF» на сайте начнёт отдавать её сразу).
 * Когда будет финальная презентация — прогнать ещё раз с путём к ней.
 *
 * ВАЖНО: берёт S3_* из .env.prod.local, если файл есть, иначе из .env.local.
 *
 * Запуск (Node 20.12+, из папки web/):
 *   npx tsx scripts/upload-luga-park-presentation.ts
 *   npx tsx scripts/upload-luga-park-presentation.ts /путь/к/luga-park.pdf
 */
import { existsSync } from "node:fs";

const ENV_FILE = existsSync(".env.prod.local") ? ".env.prod.local" : ".env.local";
process.loadEnvFile(ENV_FILE);
console.log(`[env] загружен ${ENV_FILE}`);

const DEFAULT_PDF = "scripts/assets/luga-park-presentation-placeholder.pdf";

async function main() {
  const filePath = process.argv[2] || DEFAULT_PDF;

  const { readFileSync } = await import("node:fs");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getLugaParkS3Client, LUGA_PARK_S3_BUCKET, LUGA_PARK_PDF_KEY } = await import(
    "@/lib/luga-park-s3"
  );

  const body = readFileSync(filePath);
  const client = getLugaParkS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: LUGA_PARK_S3_BUCKET,
      Key: LUGA_PARK_PDF_KEY,
      Body: body,
      ContentType: "application/pdf",
      ACL: "private",
    }),
  );

  console.log(
    `Загружено: s3://${LUGA_PARK_S3_BUCKET}/${LUGA_PARK_PDF_KEY} (${body.length} байт, источник: ${filePath})`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[upload-luga-park-presentation] ошибка:", error);
    process.exit(1);
  });
