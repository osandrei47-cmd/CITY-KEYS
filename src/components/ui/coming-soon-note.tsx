export function ComingSoonNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[60ch] rounded-[3px] border border-line bg-surface px-5 py-4 text-[13px] leading-relaxed text-ink-secondary">
      {children}
    </p>
  );
}
