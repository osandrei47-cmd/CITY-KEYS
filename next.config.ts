import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Без этого Next.js генерирует случайный BUILD_ID на каждую сборку. Если
// контейнер на Timeweb пересобирается независимо на каждом рестарте (а не
// один раз с раскаткой одного артефакта на все реплики), это рвёт Server
// Actions, вызванные из уже открытой вкладки: клиентский бандл ссылается на
// action по ID, привязанному к старому BUILD_ID, сервер после пересборки его
// не узнаёт — "Failed to find Server Action ... older or newer deployment".
// Приводим BUILD_ID к commit SHA — он одинаков для всех реплик одного и того
// же коммита независимо от того, сколько раз каждая из них пересобиралась.
//
// На практике `git rev-parse HEAD` на сборке Timeweb падает — судя по всему,
// buildpack собирает из архива исходников без .git (см. лог первого же
// деплоя: BUILD_ID пришёл как unix-время сборки, а не хэш коммита — раньше
// эта ветка ничего не логировала и падение прошло незамеченным). Сначала
// пробуем переменные окружения, которые под похожим именем сами
// прокидывают некоторые CI/PaaS — если у Timeweb найдётся своя (нужно
// свериться в их доках/поддержке), просто добавить её имя в список ниже.
const COMMIT_SHA_ENV_CANDIDATES = [
  "GIT_COMMIT_SHA",
  "GIT_COMMIT",
  "SOURCE_COMMIT",
  "SOURCE_VERSION",
  "COMMIT_SHA",
  "CI_COMMIT_SHA",
];

function resolveBuildId(): string {
  for (const name of COMMIT_SHA_ENV_CANDIDATES) {
    const value = process.env[name];
    if (value) return value;
  }

  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch (error) {
    // Раньше эта ветка молча отдавала Date.now() без единого следа в логах
    // сборки — из-за этого падение git rev-parse осталось незамеченным на
    // протяжении нескольких деплоев. Больше так не делаем: если долетели
    // сюда, значит ни одна из переменных выше не задана И git недоступен —
    // BUILD_ID будет случайным (время сборки), а не привязанным к коммиту,
    // и это нужно видеть в логе сборки, а не только в рантайме потом.
    console.warn(
      `[build] generateBuildId: не удалось получить commit SHA — ни одна из переменных (${COMMIT_SHA_ENV_CANDIDATES.join(", ")}) не задана, и "git rev-parse HEAD" завершился ошибкой (${error instanceof Error ? error.message : String(error)}). BUILD_ID будет временной меткой сборки.`,
    );
    return String(Date.now());
  }
}

const nextConfig: NextConfig = {
  generateBuildId: () => resolveBuildId(),
  // Канонический домен — city-keys.ru без www (см. SITE_URL в
  // src/lib/feed/constants.ts и canonical/OG-теги на всех страницах). Без
  // этого редиректа www.city-keys.ru и city-keys.ru — два разных URL с
  // одинаковым контентом для поисковиков (дубли, размытие ссылочного веса),
  // а Telegram/VK-превью и репосты с www-ссылкой не совпадали бы с
  // canonical. 308 (permanent) — конкретный адрес не появится в другом виде
  // задним числом, править на 307 не потребуется.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.city-keys.ru" }],
        destination: "https://city-keys.ru/:path*",
        permanent: true,
      },
    ];
  },
  // См. cache-handler.mjs: в контейнере на Timeweb App Platform процесс
  // запускается от пользователя без прав на запись в .next/cache, поэтому
  // кэш (включая оптимизированные изображения) храним в памяти, а не на диске.
  cacheHandler: path.resolve(dirname, "cache-handler.mjs"),
  cacheMaxMemorySize: 0,
  images: {
    customCacheHandler: true,
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
      {
        pathname: "/images/**",
      },
    ],
  },
};

export default withPayload(nextConfig);
