import Link from "next/link";
import { zhkHref, type RoomsValue } from "@/lib/zhk-filters";

// Короче, чем roomsLabels из lib/listing-types.ts ("1 комната" и т.д.) —
// для вкладок фильтра, где место в ряд ограничено.
const roomsFilterLabels: Record<RoomsValue, string> = {
  studio: "Студии",
  "1": "1-к",
  "2": "2-к",
  "3": "3-к",
  "4": "4-к",
  "5plus": "5+ к",
};

const roomsOrder: RoomsValue[] = ["studio", "1", "2", "3", "4", "5plus"];

export function RoomsFilter({
  slug,
  activeRooms,
  availableRooms,
}: {
  slug: string;
  activeRooms?: RoomsValue;
  availableRooms: RoomsValue[];
}) {
  // Планировки одного типа (или их вообще нет) — вкладки нечего
  // переключать, только занимали бы место.
  if (availableRooms.length < 2) return null;

  const options = roomsOrder.filter((rooms) => availableRooms.includes(rooms));

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={zhkHref({ slug })}
        className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
          !activeRooms
            ? "border-accent bg-accent text-accent-ink"
            : "border-line text-ink-secondary hover:border-ink/30 hover:text-ink"
        }`}
      >
        Все планировки
      </Link>
      {options.map((rooms) => (
        <Link
          key={rooms}
          href={zhkHref({ slug, rooms })}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            activeRooms === rooms
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-ink-secondary hover:border-ink/30 hover:text-ink"
          }`}
        >
          {roomsFilterLabels[rooms]}
        </Link>
      ))}
    </div>
  );
}
