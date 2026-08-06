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
function resolveBuildId(): string {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    // Сборка без .git (например, из tarball) — такого быть не должно при
    // обычном git-деплое, но лучше отдать хоть что-то стабильное в рамках
    // одного process, чем каждый раз новый случайный ID.
    return String(Date.now());
  }
}

const nextConfig: NextConfig = {
  generateBuildId: () => resolveBuildId(),
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
