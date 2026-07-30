import Link from "next/link";
import { katalogHref, type DealFilter } from "@/lib/katalog-filters";

export function DealToggle({
  deal,
  category,
}: {
  deal: DealFilter;
  category?: string;
}) {
  return (
    <div className="inline-flex rounded-[3px] border border-line p-1">
      {(
        [
          { key: "buy", label: "Купить" },
          { key: "rent", label: "Снять" },
        ] as const
      ).map((opt) => (
        <Link
          key={opt.key}
          href={katalogHref({ deal: opt.key, category })}
          className={`rounded-[2px] px-5 py-2 text-[14px] font-bold transition-colors ${
            deal === opt.key ? "bg-accent text-accent-ink" : "text-ink-secondary hover:text-ink"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
