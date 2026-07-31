import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
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
