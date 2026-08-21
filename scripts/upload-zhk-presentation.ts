/**
 * Разовый скрипт: загружает PDF презентации ЖК в приватный ключ S3 (лид-гейт,
 * см. src/lib/zhk-presentation-s3.ts). Не через Payload Media — файл не
 * должен быть публично доступен по прямой ссылке.
 *
 * Запуск (из папки web/):
 *   npx tsx scripts/upload-zhk-presentation.ts <slug> <путь-к-pdf>
 */
process.loadEnvFile(".env.local");

// ВАЖНО: динамический import ниже, а не статический сверху файла — иначе
// ESM-хойстинг выполнит его до process.loadEnvFile() и ZHK_PRESENTATION_S3_BUCKET
// зафиксирует пустую строку (S3_BUCKET на тот момент ещё не задан). См. тот
// же баг и его разбор в scripts/quick-add-listings.ts.
async function main() {
  const [slug, filePath] = process.argv.slice(2);
  if (!slug || !filePath) {
    throw new Error("Использование: npx tsx scripts/upload-zhk-presentation.ts <slug> <путь-к-pdf>");
  }

  const { readFileSync } = await import("fs");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getZhkPresentationS3Client, ZHK_PRESENTATION_S3_BUCKET, zhkPresentationS3Key } = await import(
    "../src/lib/zhk-presentation-s3"
  );

  const body = readFileSync(filePath);
  const client = getZhkPresentationS3Client();
  const key = zhkPresentationS3Key(slug);

  await client.send(
    new PutObjectCommand({
      Bucket: ZHK_PRESENTATION_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
    }),
  );

  console.log(`Загружено: s3://${ZHK_PRESENTATION_S3_BUCKET}/${key} (${body.length} байт)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[upload-zhk-presentation] ошибка:", error);
    process.exit(1);
  });
