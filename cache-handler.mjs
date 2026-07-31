// Кастомный кэш-обработчик Next.js (ISR-страницы + оптимизированные
// изображения из next/image). Нужен из-за того, что в контейнере на Timeweb
// App Platform процесс `next start` запускается от непривилегированного
// пользователя, у которого нет прав на запись в .next/cache — в частности
// .next/cache/images создаётся лениво в рантайме (не во время сборки), так
// что заранее передать её во владение через Dockerfile невозможно (своего
// Dockerfile в проекте и нет — сборкой управляет buildpack Timeweb).
//
// Храним кэш в памяти процесса вместо диска: для ISR (revalidate: 60 на
// /katalog и /katalog/obyekt/[id]) это не критично — при рестарте страница
// просто перегенерируется заново; для картинок — просто пересчитаются.
// Размер кэша ограничен, чтобы не раздувать память процесса вариантами
// изображений (разные width/quality на каждое фото объекта).
const MAX_ENTRIES = 200;

const cache = new Map();

function remember(key, entry) {
  if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, entry);
}

export default class CacheHandler {
  async get(key) {
    return cache.get(key);
  }

  async set(key, data, ctx) {
    remember(key, {
      value: data,
      lastModified: Date.now(),
      tags: ctx?.tags ?? [],
    });
  }

  async revalidateTag(tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    for (const [key, entry] of cache) {
      if (entry.tags?.some((tag) => tagList.includes(tag))) {
        cache.delete(key);
      }
    }
  }

  resetRequestCache() {}
}
