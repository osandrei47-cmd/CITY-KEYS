import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Презентации ЖК лежат в том же бакете, что и публичные медиафайлы Payload,
// но НЕ зарегистрированы как документы коллекции Media — под приватным
// префиксом, вне того, что использует Media, чтобы не попасть в публичный
// список файлов. Та же схема, что и у src/lib/ust-luga-izhs-s3.ts: реальная
// защита в том, что сервер сам скачивает объект и отдаёт байты в ответе
// (см. src/app/api/zhk-presentation/[slug]/route.ts) — наружу не уходит
// прямой URL на файл. Один ключ на слаг ЖК, а не общий на всю коллекцию —
// так у каждого комплекса своя презентация без путаницы.
export function zhkPresentationS3Key(slug: string): string {
  return `private/zhk/${slug}-presentation.pdf`;
}

export const ZHK_PRESENTATION_S3_BUCKET = process.env.S3_BUCKET || "";

let cachedClient: S3Client | null = null;

// Те же параметры клиента, что в src/payload.config.ts (s3Storage) и
// src/lib/ust-luga-izhs-s3.ts — единый источник правды на случай, если
// S3_* переменные когда-нибудь изменятся.
export function getZhkPresentationS3Client(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
      region: process.env.S3_REGION || "ru-1",
      endpoint: process.env.S3_ENDPOINT || "",
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return cachedClient;
}

// Решает, показывать ли на странице ЖК блок "получить презентацию" — без
// отдельного поля в схеме residential-complexes (см. обсуждение: не хотим
// лишний push схемы ради одного галочки). Спрашиваем S3 напрямую HEAD-ом.
export async function zhkPresentationExists(slug: string): Promise<boolean> {
  try {
    const client = getZhkPresentationS3Client();
    await client.send(
      new HeadObjectCommand({ Bucket: ZHK_PRESENTATION_S3_BUCKET, Key: zhkPresentationS3Key(slug) }),
    );
    return true;
  } catch {
    return false;
  }
}
