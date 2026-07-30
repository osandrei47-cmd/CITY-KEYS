import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { DealToggle } from "@/components/ui/deal-toggle";
import { ListingCard } from "@/components/ui/listing-card";
import { getPayloadClient } from "@/lib/payload-client";
import { katalogHref, type DealFilter } from "@/lib/katalog-filters";
import { propertyTypeLabels, pluralizeObjects, type Listing } from "@/lib/listing-types";
import type { Where } from "payload";

export const metadata: Metadata = {
  title: "Каталог — CITY KEYS",
};

export const revalidate = 60;

const categories = [
  { label: "Квартиры", slug: "kvartiry" },
  { label: "Дома и коттеджи", slug: "doma" },
  { label: "Дачи", slug: "dachi" },
  { label: "Коммерческая недвижимость", slug: "commercial" },
  { label: "Земельные участки", slug: "uchastki" },
] as const;

function CategoryTile({
  label,
  href,
  isActive,
  assetHint,
}: {
  label: string;
  href: string;
  isActive?: boolean;
  assetHint: string;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-3">
      <div className={`overflow-hidden rounded-[4px] ${isActive ? "ring-2 ring-accent" : ""}`}>
        <PhotoPlaceholder className="aspect-[4/3]" assetHint={assetHint} />
      </div>
      <span
        className={`text-[15px] font-bold group-hover:text-accent ${isActive ? "text-accent" : ""}`}
      >
        {label}
      </span>
    </Link>
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
              assetHint={`превью категории «${c.label}» — до реальных фото объектов`}
            />
          ))}
          <CategoryTile
            label="Новостройки"
            href="/novostroyki"
            assetHint="превью раздела «Новостройки» — до реальных фото ЖК"
          />
          {categories.slice(4).map((c) => (
            <CategoryTile
              key={c.slug}
              label={c.label}
              href={katalogHref({ deal, category: c.slug })}
              isActive={activeCategory === c.slug}
              assetHint={`превью категории «${c.label}» — до реальных фото объектов`}
            />
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-[22px] font-extrabold">
              {activeCategory ? propertyTypeLabels[activeCategory] : "Актуальные объекты"}
            </h2>
            {activeCategory ? (
              <Link
                href={katalogHref({ deal })}
                className="text-[12.5px] text-ink-secondary underline hover:text-ink"
              >
                Сбросить фильтр
              </Link>
            ) : null}
          </div>
          <span className="text-[13px] text-ink-secondary">
            {listings.length ? pluralizeObjects(listings.length) : null}
          </span>
        </div>

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
