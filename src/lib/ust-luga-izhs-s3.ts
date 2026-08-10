import { S3Client } from "@aws-sdk/client-s3";

// PDF-презентация лежит в том же бакете, что и публичные медиафайлы Payload,
// но НЕ зарегистрирована как документ коллекции Media — только под этим
// ключом, вне префиксов, которые использует Media, чтобы не попасть в
// публичный список файлов. Реальная защита обеспечивается тем, что сервер
// сам скачивает объект и отдаёт байты в ответе (см. src/app/api/ust-luga-izhs/route.ts)
// — наружу не уходит вообще никакой URL на файл, поэтому не важно, как
// именно устроена приватность бакета на стороне Timeweb (bucket policy или
// per-object ACL — это здесь не проверено и не имеет значения для этой схемы).
export const UST_LUGA_IZHS_PDF_KEY = "private/ust-luga-izhs-presentation.pdf";

export const UST_LUGA_IZHS_S3_BUCKET = process.env.S3_BUCKET || "";

let cachedClient: S3Client | null = null;

// Те же параметры клиента, что в src/payload.config.ts (s3Storage) — единый
// источник правды на случай, если S3_* переменные когда-нибудь изменятся.
export function getUstLugaIzhsS3Client(): S3Client {
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
