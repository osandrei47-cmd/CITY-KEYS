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
