export function Quote({
  children,
  author,
  source,
}: {
  children: string;
  author: string;
  source: string;
}) {
  return (
    <blockquote className="rounded-r-[3px] border-l-2 border-accent bg-surface px-6 py-5">
      <p className="text-[15px] leading-relaxed">«{children}»</p>
      <footer className="mt-3 text-[13px] text-ink-secondary">
        — {author}, {source}
      </footer>
    </blockquote>
  );
}
