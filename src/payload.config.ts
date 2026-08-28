import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Listings } from "./collections/Listings";
import { Leads } from "./collections/Leads";
import { Tasks } from "./collections/Tasks";
import { ResidentialComplexes } from "./collections/ResidentialComplexes";
import { Projects } from "./collections/Projects";
import { BlogPosts } from "./collections/BlogPosts";
import { Services } from "./collections/Services";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ["@/components/admin/KanbanNavLink#KanbanNavLink"],
      views: {
        leadsKanban: {
          Component: "@/components/admin/KanbanView#KanbanView",
          path: "/leads-kanban",
        },
      },
    },
  },
  routes: {
    admin: "/staff-x7k2",
  },
  i18n: {
    supportedLanguages: { ru, en },
    fallbackLanguage: "ru",
  },
  collections: [Users, Media, Listings, Leads, Tasks, ResidentialComplexes, Projects, BlogPosts, Services],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  plugins: [
    // Файлы медиа хранятся в Timeweb S3 (Object Storage), а не на диске
    // контейнера — тот пересоздаётся при каждом деплое и не даёт прав на
    // запись. disableLocalStorage выставляется плагином автоматически.
    //
    // clientUploads: true — загрузка идёт напрямую из браузера в S3 по
    // presigned URL, минуя наш сервер целиком. Без этого файл сначала
    // целиком летит в наш Next.js-контейнер на Timeweb App Platform, а тот
    // уже сам заливает его в S3 — и именно на этом первом прыжке платформа
    // (как и, например, Vercel — см. README пакета) режет запрос на каком-то
    // лимите тела запроса. Ровно так падала загрузка видео 13.3 МБ в поле
    // Media у Listings ("Failed to save 1 files") — сама Payload-загрузка
    // (mimeType, sharp, запись в S3) при этом полностью рабочая, проверено
    // локально через Local API тем же файлом. Требует CORS PUT на бакете
    // для origin сайта — настроено отдельным скриптом (см. историю коммитов),
    // не через код конфигурации.
    s3Storage({
      collections: {
        media: true,
      },
      clientUploads: true,
      bucket: process.env.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        region: process.env.S3_REGION || "ru-1",
        endpoint: process.env.S3_ENDPOINT || "",
        // Timeweb S3 (и большинство S3-совместимых хранилищ, кроме AWS)
        // требует path-style URL — бакет в пути, а не в поддомене.
        forcePathStyle: true,
        // AWS SDK v3 с версии 3.729 по умолчанию довешивает к каждому
        // PutObject чек-сумму (x-amz-checksum-crc32) — S3-совместимые
        // хранилища вне AWS часто такой заголовок не поддерживают и рвут
        // загрузку. Возвращаем поведение SDK к "как было до 3.729".
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      ssl: { rejectUnauthorized: false },
    },
  }),
  sharp,
});
