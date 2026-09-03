import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

// PDF-презентация посёлка «Луга Парк» — та же схема, что у
// src/lib/zhk-presentation-s3.ts и src/lib/ust-luga-izhs-s3.ts: файл лежит
// в том же бакете, что и публичные медиа Payload, но НЕ зарегистрирован как
// документ коллекции Media — под приватным префиксом. Реальная защита в
// том, что сервер сам скачивает объект и стримит байты в ответе
// (см. src/app/api/luga-park/route.ts) — прямой URL наружу не уходит.
export const LUGA_PARK_PDF_KEY = "private/proekty/luga-park-presentation.pdf";

export const LUGA_PARK_S3_BUCKET = process.env.S3_BUCKET || "";

let cachedClient: S3Client | null = null;

// Те же параметры клиента, что в src/payload.config.ts (s3Storage) и
// соседних *-s3.ts — единый источник правды на случай смены S3_* переменных.
export function getLugaParkS3Client(): S3Client {
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

// Есть ли уже загруженный файл презентации. Блок с лид-гейтом на странице
// показывается всегда (это блок 7 из ТЗ), но кнопка обещает PDF только
// когда файл действительно лежит в бакете — иначе форма просто принимает
// заявку и обещает прислать презентацию отдельно.
export async function lugaParkPresentationExists(): Promise<boolean> {
  try {
    const client = getLugaParkS3Client();
    await client.send(
      new HeadObjectCommand({ Bucket: LUGA_PARK_S3_BUCKET, Key: LUGA_PARK_PDF_KEY }),
    );
    return true;
  } catch {
    return false;
  }
}
