import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ListingCard } from "@/components/ui/listing-card";
import { RoomsFilter } from "@/components/ui/rooms-filter";
import { ComingSoonNote } from "@/components/ui/coming-soon-note";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { ZhkPresentationForm } from "@/components/zhk/presentation-form";
import { IconCheck } from "@/components/ui/icons";
import { getPayloadClient } from "@/lib/payload-client";
import { zhkPresentationExists } from "@/lib/zhk-presentation-s3";
import { zhkVideoExists, zhkVideoUrl } from "@/lib/zhk-video";
import { ZHK_KEY_FACTS } from "@/lib/zhk-key-facts";
import { isMediaDoc, type Listing } from "@/lib/listing-types";
import {
  buildComplexMetaDescription,
  buildComplexMetaTitle,
  complexStatusLabels,
  type ResidentialComplex,
} from "@/lib/complex-types";
import { roomsOrder, type RoomsValue } from "@/lib/zhk-filters";
import { buildCanonical, buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getComplex(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "residential-complexes",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 1,
    limit: 1,
  });
  return (docs[0] as unknown as ResidentialComplex) ?? null;
}

async function getComplexListings(complexId: number) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "listings",
    where: {
      residentialComplex: { equals: complexId },
      status: { not_equals: "sold" },
    },
    sort: "price",
    depth: 1,
    limit: 200,
  });
  return docs as unknown as Listing[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const complex = await getComplex(slug);
  if (!complex) {
    return { title: "ЖК — CITY KEYS" };
  }

  const title = buildComplexMetaTitle(complex);
  const description = buildComplexMetaDescription(complex);
  const cover = isMediaDoc(complex.coverPhoto) ? complex.coverPhoto : null;
  const image: OgImage = cover?.url
    ? {
        url: cover.url,
        width: cover.width ?? undefined,
        height: cover.height ?? undefined,
        alt: cover.alt || title,
      }
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: `/zhk/${complex.slug}`, image }),
    twitter: buildTwitter({ title, description, image }),
    alternates: buildCanonical(`/zhk/${complex.slug}`),
  };
}

export default async function ResidentialComplexPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rooms?: string }>;
}) {
  const { slug } = await params;
  const { rooms: roomsParam } = await searchParams;
  const complex = await getComplex(slug);
  if (!complex) notFound();

  const [fetchedListings, hasPresentation, hasVideo] = await Promise.all([
    getComplexListings(complex.id),
    zhkPresentationExists(complex.slug),
    zhkVideoExists(complex.slug),
  ]);

  // Сначала все 1-комнатные, потом 2-комнатные и т.д. — сортировка стабильна,
  // так что порядок "как сейчас" (по цене, см. getComplexListings) сохраняется
  // внутри каждой группы комнатности.
  const listings = [...fetchedListings].sort(
    (a, b) => roomsOrder.indexOf(a.rooms ?? "studio") - roomsOrder.indexOf(b.rooms ?? "studio"),
  );

  const availableRooms = Array.from(
    new Set(listings.map((l) => l.rooms).filter((r): r is RoomsValue => Boolean(r))),
  );
  const activeRooms = availableRooms.find((r) => r === roomsParam);
  const visibleListings = activeRooms
    ? listings.filter((l) => l.rooms === activeRooms)
    : listings;

  const cover = isMediaDoc(complex.coverPhoto) ? complex.coverPhoto : null;
  const gallery = (complex.gallery ?? []).filter(isMediaDoc);

  const metaLines = [
    complex.address ? { label: "Адрес", value: complex.address } : null,
    complex.developer ? { label: "Застройщик", value: complex.developer } : null,
    { label: "Статус", value: complexStatusLabels[complex.status] },
  ].filter((v): v is { label: string; value: string } => v !== null);

  const keyFacts = ZHK_KEY_FACTS[complex.slug];

  return (
    <>
      <PageHero
        eyebrow="Новостройка"
        title={complex.title}
        subtitle={complex.shortDescription || undefined}
        photoSrc={cover?.url || undefined}
        photoAlt={cover?.alt || complex.title}
        photoAssetHint={`фото ЖК «${complex.title}»`}
      />

      {/* Видео — та же схема, что на /proekty/ust-luga-izhs: прямая
          публичная ссылка на S3, без поля в схеме residential-complexes.
          Блок просто не рендерится, пока по условному пути в бакете нет
          файла (см. src/lib/zhk-video.ts) — не нужно ничего чистить, когда
          видео появится, оно подхватится само. */}
      {hasVideo ? (
        <Section className="pt-0">
          <Eyebrow>Видео</Eyebrow>
          <h2 className="mt-3 text-[20px] font-extrabold">{complex.title} на видео</h2>
          <div className="mt-6 overflow-hidden rounded-[4px] border-2 border-accent bg-surface">
            <video
              controls
              preload="none"
              poster={cover?.url || undefined}
              className="aspect-video w-full"
            >
              <source src={zhkVideoUrl(complex.slug)} type="video/mp4" />
            </video>
          </div>
        </Section>
      ) : null}

      <Section className="pt-0">
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-[4px] border border-line bg-surface p-6">
          {metaLines.map((line) => (
            <div key={line.label} className="flex flex-col gap-1">
              <span className="text-[12px] text-ink-secondary">{line.label}</span>
              <span className="text-[14px] font-semibold">{line.value}</span>
            </div>
          ))}
        </div>

        <div className={`mt-8 grid gap-10 ${keyFacts ? "md:grid-cols-[1.3fr_1fr]" : ""}`}>
          {complex.description ? (
            <div className="prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={complex.description} />
            </div>
          ) : null}

          {keyFacts ? (
            <div>
              <Eyebrow>Преимущества</Eyebrow>
              <ul className="mt-4 flex flex-col gap-3">
                {keyFacts.map((fact) => (
                  <li
                    key={fact}
                    className="flex items-center gap-3 rounded-[4px] border border-line bg-surface p-3.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-accent/10 text-accent">
                      <IconCheck className="h-5 w-5" />
                    </span>
                    <span className="text-[13.5px] font-semibold leading-snug">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Презентация — та же лид-гейт-механика, что на /proekty/ust-luga-izhs
          (см. src/components/zhk/presentation-form.tsx): PDF отдаётся только
          после имени и телефона, файл лежит приватно в S3, без публичного
          URL. Блок скрыт, пока для этого ЖК файл не загружен. */}
      {hasPresentation ? (
        <Section className="pt-0">
          <Eyebrow>Презентация</Eyebrow>
          <h2 className="mt-3 text-[20px] font-extrabold">Полная презентация ЖК</h2>
          <div className="mt-6">
            <ZhkPresentationForm slug={complex.slug} title={complex.title} />
          </div>
        </Section>
      ) : null}

      {gallery.length ? (
        <Section className="pt-0">
          <Eyebrow>Галерея</Eyebrow>
          <div className="mt-4">
            <PhotoLightbox
              photos={gallery}
              containerClassName="grid gap-3 sm:grid-cols-2 md:grid-cols-3"
              sizes="(min-width: 768px) 33vw, 100vw"
              fallbackAlt={complex.title}
            />
          </div>
        </Section>
      ) : null}

      <Section className="pt-0 pb-24">
        <div className="mb-6 flex flex-col gap-4">
          <h2 className="text-[22px] font-extrabold">Планировки</h2>
          <RoomsFilter slug={complex.slug} activeRooms={activeRooms} availableRooms={availableRooms} />
        </div>

        {listings.length ? (
          visibleListings.length ? (
            <div className="grid gap-8 md:grid-cols-3">
              {visibleListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-ink-secondary">
              По этому фильтру планировок пока нет — попробуйте другой вариант.
            </p>
          )
        ) : (
          <ComingSoonNote>Планировки скоро появятся — следите за обновлениями.</ComingSoonNote>
        )}
      </Section>
    </>
  );
}
