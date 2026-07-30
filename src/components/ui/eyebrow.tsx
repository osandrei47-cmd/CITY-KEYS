import { type ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-secondary">
      {children}
    </span>
  );
}
