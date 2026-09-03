import Link from "next/link";
import type { Listing } from "@/payload-types";
import {
  formatLugaParkPrice,
  lugaParkBadgeLabels,
  lugaParkStatusClasses,
  lugaParkStatusLabels,
  type LugaParkLot,
} from "@/lib/luga-park";

// Карточка одного лота 1-й очереди на странице /proekty/luga-park.
// Статические данные (тип, площадь, обе цены) — из LUGA_PARK_LOTS,
// редактируемые в CMS badge и status — из сопоставленной записи Listings
// (по точному title). Если записи ещё нет (сиды не прогнаны) — карточка
// всё равно рендерится, но без ссылки на страницу объекта.
export function LugaParkLotCard({
  lot,
  listing,
}: {
  lot: LugaParkLot;
  listing?: Listing;
}) {
  const badge = listing?.badge ? lugaParkBadgeLabels[listing.badge] : null;
  const status = listing?.status ?? "for-sale";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-secondary">
            Тип {lot.zone}
          </p>
          <p className="mt-1 text-[18px] font-extrabold">
            {lot.areaM2.toLocaleString("ru-RU")} м²
          </p>
          <p className="text-[12.5px] text-ink-secondary">{lot.areaSotkiLabel}</p>
        </div>
        <span
          className={`shrink-0 rounded-[3px] px-2 py-1 text-[11px] font-bold ${lugaParkStatusClasses[status]}`}
        >
          {lugaParkStatusLabels[status]}
        </span>
      </div>

      {badge ? (
        <span className="w-fit rounded-[3px] bg-accent px-2 py-1 text-[11px] font-bold text-accent-ink">
          {badge}
        </span>
      ) : null}

      <dl className="mt-1 flex flex-col gap-2 border-t border-line pt-3 text-[13px]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-secondary">Без электричества</dt>
          <dd className="font-extrabold text-accent">
            {formatLugaParkPrice(lot.priceNoElectric)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-secondary">С электричеством</dt>
          <dd className="font-semibold">{formatLugaParkPrice(lot.priceWithElectric)}</dd>
        </div>
      </dl>

      {listing ? (
        <span className="mt-2 inline-flex w-fit items-center rounded-[3px] bg-accent px-4 py-2 text-[13px] font-bold text-accent-ink transition-colors group-hover:bg-[#e3ac6c]">
          Смотреть лот
        </span>
      ) : (
        <span className="mt-2 text-[12.5px] text-ink-secondary">
          Страница лота готовится
        </span>
      )}
    </>
  );

  const className =
    "group flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-5";

  if (listing) {
    return (
      <Link href={`/katalog/obyekt/${listing.id}`} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
