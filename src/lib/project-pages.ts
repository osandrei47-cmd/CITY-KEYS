// Единый список проектов, для которых существует отдельная, вручную
// свёрстанная страница (папка src/app/(marketing)/proekty/{slug}/page.tsx),
// а не только карточка в CMS.
//
// Next.js сам разруливает маршрутизацию: статический маршрут
// proekty/ust-luga-izhs всегда имеет приоритет над динамическим
// proekty/[slug] — то есть этот список НЕ управляет тем, какая страница
// откроется. Он нужен только для sitemap.ts: чтобы в карту сайта попадали
// ссылки на реальные, наполненные страницы, а не на автоматическую
// заглушку "страница готовится" (см. proekty/[slug]/page.tsx) — иначе
// поисковик будет находить в sitemap тонкий дублирующийся контент.
//
// Если верстаете новую страницу под проект — добавьте её slug сюда же,
// в том же коммите, что и саму папку с page.tsx.
export const HAND_BUILT_PROJECT_SLUGS: readonly string[] = ["ust-luga-izhs", "luga-park"];

export function hasHandBuiltProjectPage(slug: string): boolean {
  return HAND_BUILT_PROJECT_SLUGS.includes(slug);
}
