"use client";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex items-center justify-center gap-2 rounded-[3px] border border-ink/30 px-6 py-3 text-[14px] font-bold text-ink transition-colors hover:border-ink/60 ${className}`}
    >
      Распечатать / сохранить в PDF
    </button>
  );
}
