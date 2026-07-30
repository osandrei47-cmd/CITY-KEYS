export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <b className="font-sans text-2xl font-extrabold tabular-nums tracking-tight">
        {value}
      </b>
      <span className="text-[11px] text-ink-secondary">{label}</span>
    </div>
  );
}

export function StatRow({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-8 md:gap-12">
      {stats.map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} />
      ))}
    </div>
  );
}
