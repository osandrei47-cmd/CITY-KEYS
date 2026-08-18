// <script type="application/ld+json"> — единственный штатный способ отдать
// Schema.org-разметку в App Router (см. docs/seo-audit-2026-08-18.md, п.6).
// Экранируем "<", чтобы значение из данных не могло преждевременно закрыть
// сам тег <script> (тот же приём, что и в JSON.stringify для Next.js
// самого себя) — на случай, если в будущем в данных появится "</script>".
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
