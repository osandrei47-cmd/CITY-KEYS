/**
 * Одноразовая загрузка PDF-презентации «Усть-Луга ИЖС» в S3 — вне коллекции
 * Media (см. src/lib/ust-luga-izhs-s3.ts, почему), поэтому не через админку
 * Payload, а напрямую через AWS SDK.
 *
 * Запуск (Node 20.6+, .env.local в корне web/, нужны S3_* переменные):
 *   npx tsx scripts/upload-ust-luga-izhs-presentation.ts /путь/к/presentation.pdf
 *
 * После загрузки стоит один раз вручную проверить, что прямой URL объекта
 * (https://<S3_ENDPOINT>/<S3_BUCKET>/<ключ из UST_LUGA_IZHS_PDF_KEY>) не
 * отдаётся без авторизации (403/404) — при выбранной в route.ts схеме
 * (сервер сам стримит файл, наружу URL не уходит) это не критично, но
 * дёшево и стоит сделать один раз.
 */
process.loadEnvFile(".env.local");

import { readFile } from "fs/promises";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Использование: npx tsx scripts/upload-ust-luga-izhs-presentation.ts <путь-к-pdf>");
  process.exit(1);
}

async function main() {
  // Динамический import: src/lib/ust-luga-izhs-s3.ts читает process.env.S3_*
  // на уровне модуля — статический import той же строкой ниже из-за
  // ESM-hoisting выполнился бы ДО process.loadEnvFile() выше по файлу,
  // и переменные ещё не были бы загружены (ровно так уже один раз упало).
  const { getUstLugaIzhsS3Client, UST_LUGA_IZHS_PDF_KEY, UST_LUGA_IZHS_S3_BUCKET } = await import(
    "@/lib/ust-luga-izhs-s3"
  );

  const body = await readFile(filePath);
  const client = getUstLugaIzhsS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: UST_LUGA_IZHS_S3_BUCKET,
      Key: UST_LUGA_IZHS_PDF_KEY,
      Body: body,
      ContentType: "application/pdf",
      // Дополнительный слой защиты — не единственная линия (см. комментарий
      // в ust-luga-izhs-s3.ts про то, почему на него нельзя полагаться
      // целиком, если приватность бакета определяется его policy, а не
      // per-object ACL).
      ACL: "private",
    }),
  );

  console.log(`Загружено: s3://${UST_LUGA_IZHS_S3_BUCKET}/${UST_LUGA_IZHS_PDF_KEY}`);
}

main().catch((error) => {
  console.error("[upload-ust-luga-izhs-presentation] ошибка:", error);
  process.exit(1);
});
