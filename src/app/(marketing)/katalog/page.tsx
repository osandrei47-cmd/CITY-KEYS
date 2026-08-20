import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Building, House, LandPlot } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { MeshGradientCard, type MeshGradientIcon } from "@/components/ui/mesh-gradient-card";
import { HouseTreeIcon, CraneIcon } from "@/components/ui/mesh-icons";
import { DealToggle } from "@/components/ui/deal-toggle";
import { ListingCard } from "@/components/ui/listing-card";
import { getPayloadClient } from "@/lib/payload-client";
import { katalogHref, type DealFilter } from "@/lib/katalog-filters";
import { propertyTypeLabels, pluralizeObjects, type Listing } from "@/lib/listing-types";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import type { Where } from "payload";

const TITLE = "Каталог — CITY KEYS";
const DESCRIPTION =
  "Актуальные квартиры, дома, дачи, участки и коммерческая недвижимость в Кингисеппе и районе — от агентства CITY KEYS.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/katalog" }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/katalog"),
};

export const revalidate = 60;

const categories = [
  { label: "Квартиры", slug: "kvartiry", icon: Building2, variant: 0 },
  { label: "Дома и коттеджи", slug: "doma", icon: House, variant: 1 },
  { label: "Дачи", slug: "dachi", icon: HouseTreeIcon, variant: 2 },
  { label: "Коммерческая недвижимость", slug: "commercial", icon: Building, variant: 3 },
  { label: "Земельные участки", slug: "uchastki", icon: LandPlot, variant: 0 },
] as const;

function CategoryTile({
  label,
  href,
  isActive,
  icon,
  variant,
}: {
  label: string;
  href: string;
  isActive?: boolean;
  icon: MeshGradientIcon;
  variant: number;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-3">
      <MeshGradientCard
        icon={icon}
        variant={variant}
        iconSize={36}
        className={`aspect-[4/3] rounded-[4px] ${isActive ? "ring-2 ring-accent" : ""}`}
      />
      <span
        className={`text-[15px] font-bold group-hover:text-accent ${isActive ? "text-accent" : ""}`}
      >
        {label}
      </span>
    </Link>
  );
}

// Компактный переключатель категорий — заменяет собой большую плиточную
// сетку, когда конкретная категория уже выбрана (см. CatalogPage ниже).
// Без него, спрятав сетку, пользователь мог бы сменить категорию только
// через "Сбросить фильтр" + повторный клик по плитке — двумя экранами
// выше на мобильном. Здесь та же ссылка на /novostroyki, что и в общей
// сетке (это отдельный раздел сайта, а не propertyType-фильтр каталога).
function CategoryChips({
  deal,
  activeCategory,
}: {
  deal: DealFilter;
  activeCategory?: (typeof categories)[number]["slug"];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={katalogHref({ deal, category: c.slug })}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            activeCategory === c.slug
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-ink-secondary hover:border-ink/30 hover:text-ink"
          }`}
        >
          {c.label}
        </Link>
      ))}
      <Link
        href="/novostroyki"
        className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-secondary transition-colors hover:border-ink/30 hover:text-ink"
      >
        Новостройки
      </Link>
    </div>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string; category?: string }>;
}) {
  const { deal: dealParam, category } = await searchParams;
  const deal: DealFilter = dealParam === "rent" ? "rent" : "buy";
  const dealType = deal === "rent" ? "rent" : "sale";
  const activeCategory = categories.find((c) => c.slug === category)?.slug;

  const where: Where = {
    status: { not_equals: "sold" },
    dealType: { equals: dealType },
  };
  if (activeCategory) {
    where.propertyType = { equals: activeCategory };
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "listings",
    where,
    sort: "-createdAt",
    depth: 1,
    limit: 60,
  });

  const listings = docs as unknown as Listing[];

  return (
    <>
      {activeCategory ? (
        // Категория уже выбрана — общий хиро и большая сетка категорий
        // здесь только мешают: пользователь целенаправленно кликнул по
        // конкретной категории, а видит прежде всего общую "шапку"
        // каталога, и нужные объекты оказываются только после прокрутки
        // (см. задачу). Вместо этого — компактный заголовок с названием
        // категории, счётчиком и ссылкой назад на весь каталог, плюс
        // узкая строка чипов для быстрого переключения между категориями
        // (без неё пришлось бы сначала жать "Сбросить фильтр", прокручивать
        // наверх и только там менять категорию). Результаты этой категории
        // видны сразу, без скролла — независимо от того, сколько объектов
        // в ней сейчас заполнено.
        <Section className="pb-0 pt-28 md:pt-36" border={false}>
          <div className="flex flex-col gap-5">
            <Link
              href={katalogHref({ deal })}
              className="w-fit text-[12.5px] text-ink-secondary underline hover:text-ink"
            >
              ← Весь каталог
            </Link>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h1 className="text-[28px] font-extrabold md:text-[34px]">
                {propertyTypeLabels[activeCategory]}
              </h1>
              <span className="text-[13px] text-ink-secondary">
                {listings.length ? pluralizeObjects(listings.length) : null}
              </span>
            </div>
            <DealToggle deal={deal} category={activeCategory} />
            <CategoryChips deal={deal} activeCategory={activeCategory} />
          </div>
        </Section>
      ) : (
        <>
          <PageHero eyebrow="Каталог" title="Подберём объект под вашу задачу" />

          <Section className="pt-0">
            <DealToggle deal={deal} category={activeCategory} />
          </Section>

          <Section>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {categories.slice(0, 4).map((c) => (
                <CategoryTile
                  key={c.slug}
                  label={c.label}
                  href={katalogHref({ deal, category: c.slug })}
                  isActive={activeCategory === c.slug}
                  icon={c.icon}
                  variant={c.variant}
                />
              ))}
              <CategoryTile label="Новостройки" href="/novostroyki" icon={CraneIcon} variant={4} />
              {categories.slice(4).map((c) => (
                <CategoryTile
                  key={c.slug}
                  label={c.label}
                  href={katalogHref({ deal, category: c.slug })}
                  isActive={activeCategory === c.slug}
                  icon={c.icon}
                  variant={c.variant}
                />
              ))}
            </div>
          </Section>
        </>
      )}

      <Section className={activeCategory ? "pt-8" : undefined}>
        {!activeCategory ? (
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[22px] font-extrabold">Актуальные объекты</h2>
            <span className="text-[13px] text-ink-secondary">
              {listings.length ? pluralizeObjects(listings.length) : null}
            </span>
          </div>
        ) : null}

        {listings.length ? (
          <div className="grid gap-8 md:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink-secondary">
            По этому фильтру пока нет объектов — попробуйте другую категорию
            или переключатель «Купить/Снять».
          </p>
        )}

        <p className="mt-8 text-[12.5px] text-ink-secondary">
          Подробный фильтр (цена, площадь, ипотека, видео с дрона) и карта —
          отдельная функциональная задача, пока не подключены.
        </p>
      </Section>
    </>
  );
}
