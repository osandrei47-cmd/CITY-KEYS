import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/ui/print-button";
import { getPayloadClient } from "@/lib/payload-client";
import {
  balconyLabels,
  bathroomLabels,
  buildListingMetaDescription,
  buildListingMetaTitle,
  buildingTypeLabels,
  dealTypeLabels,
  formatPrice,
  isMediaDoc,
  propertyTypeLabels,
  renovationLabels,
  richTextToPlainText,
  roomsLabels,
  statusLabels,
  truncateAtWord,
  viewLabels,
  type Listing,
} from "@/lib/listing-types";
import { contacts } from "@/lib/nav";
import { buildCanonical, buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";
import { buildListingProductJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/feed/constants";
import { absoluteUrl } from "@/lib/feed/helpers";

export const revalidate = 60;

// 2-3 предложения вместо полного текста — чтобы вместе с ПОЛНЫМ блоком
// характеристик, фото и контактами печатная версия объекта помещалась на
// один лист А4 (см. .listing-description-print в globals.css — полное
// описание на печати скрыто, показывается только этот укороченный вариант).
const PRINT_DESCRIPTION_MAX_LENGTH = 380;

async function getListing(id: string) {
  const payload = await getPayloadClient();
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const doc = await payload.findByID({
      collection: "listings",
      id: numericId,
      depth: 1,
    });
    return doc as unknown as Listing;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) {
    return { title: "Объект — CITY KEYS" };
  }

  const title = buildListingMetaTitle(listing);
  const description = buildListingMetaDescription(listing);
  const firstPhoto = (listing.photos ?? []).find(isMediaDoc);
  const image: OgImage = firstPhoto?.url
    ? {
        url: firstPhoto.url,
        width: firstPhoto.width ?? undefined,
        height: firstPhoto.height ?? undefined,
        alt: firstPhoto.alt || title,
      }
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: buildOpenGraph({
      title,
      description,
      path: `/katalog/obyekt/${listing.id}`,
      image,
    }),
    twitter: buildTwitter({ title, description, image }),
    alternates: buildCanonical(`/katalog/obyekt/${listing.id}`),
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const photos = (listing.photos ?? []).filter(isMediaDoc);
  const video = isMediaDoc(listing.droneVideo) ? listing.droneVideo : null;

  const listingUrl = `${SITE_URL}/katalog/obyekt/${listing.id}`;
  const productJsonLd = buildListingProductJsonLd({
    listing,
    url: listingUrl,
    description: buildListingMetaDescription(listing),
    imageUrls: photos.map((photo) => absoluteUrl(photo.url ?? "")).filter(Boolean),
  });

  const params_: Array<[string, string]> = [
    ["Тип недвижимости", propertyTypeLabels[listing.propertyType]],
    ["Тип сделки", dealTypeLabels[listing.dealType]],
    listing.rooms ? ["Комнат", roomsLabels[listing.rooms]] : null,
    listing.areaTotal ? ["Площадь общая", `${listing.areaTotal} м²`] : null,
    listing.areaLiving ? ["Площадь жилая", `${listing.areaLiving} м²`] : null,
    listing.areaKitchen ? ["Площадь кухни", `${listing.areaKitchen} м²`] : null,
    listing.areaLot ? ["Площадь участка", `${listing.areaLot} соток`] : null,
    listing.floor && listing.totalFloors
      ? ["Этаж", `${listing.floor} из ${listing.totalFloors}`]
      : null,
    listing.bathroom ? ["Санузел", bathroomLabels[listing.bathroom]] : null,
    listing.balcony ? ["Балкон / лоджия", balconyLabels[listing.balcony]] : null,
    listing.renovation ? ["Ремонт", renovationLabels[listing.renovation]] : null,
    listing.buildingType ? ["Тип дома", buildingTypeLabels[listing.buildingType]] : null,
    listing.view?.length ? ["Вид из окна", listing.view.map((v) => viewLabels[v]).join(", ")] : null,
    listing.cadastralNumber ? ["Кадастровый номер", listing.cadastralNumber] : null,
    ["Статус", statusLabels[listing.status]],
  ].filter((v): v is [string, string] => v !== null);

  const printDescription = truncateAtWord(
    richTextToPlainText(listing.description).replace(/\s+/g, " ").trim(),
    PRINT_DESCRIPTION_MAX_LENGTH,
  );

  return (
    <Section className="listing-print-page pb-24 pt-28 md:pt-36">
      <JsonLd data={productJsonLd} />
      <Container>
        <div className="listing-print-stack mx-auto flex max-w-[880px] flex-col gap-10">
          <div className="listing-header flex flex-col gap-3">
            {listing.mortgageAvailable ? (
              <span className="w-fit rounded-[3px] bg-accent px-2 py-1 text-[11px] font-bold text-accent-ink">
                Можно в ипотеку
              </span>
            ) : null}
            <h1 className="text-balance text-[28px] font-extrabold leading-tight md:text-[36px]">
              {listing.title}
            </h1>
            <p className="text-[15px] text-ink-secondary">{listing.address}</p>
            <p className="text-[26px] font-extrabold text-accent">
              {formatPrice(listing.price)}
            </p>
            <div className="no-print">
              <PrintButton />
            </div>
          </div>

          {photos.length ? (
            <PhotoLightbox
              photos={photos}
              containerClassName="listing-photos grid gap-3 md:grid-cols-2"
              sizes="(min-width: 768px) 50vw, 100vw"
              fallbackAlt={listing.title}
            />
          ) : (
            <PhotoPlaceholder
              className="no-print aspect-[16/9] rounded-[4px]"
              assetHint={`фото объекта «${listing.title}»`}
            />
          )}

          {video?.url ? (
            <div className="no-print flex flex-col gap-3">
              <h2 className="text-[15px] font-bold">Видео объекта</h2>
              <video
                controls
                preload="none"
                poster={photos[0]?.url || undefined}
                className="aspect-video w-full rounded-[4px] border border-line bg-surface"
              >
                <source src={video.url} type={video.mimeType || "video/mp4"} />
              </video>
            </div>
          ) : null}

          <div className="listing-params grid gap-x-8 gap-y-3 rounded-[4px] border border-line bg-surface p-6 sm:grid-cols-2">
            {params_.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-[13.5px]">
                <span className="text-ink-secondary">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {listing.description ? (
            <div className="no-print prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={listing.description} />
            </div>
          ) : null}

          {/* Печатная версия показывает укороченное описание вместо полного
              (см. PRINT_DESCRIPTION_MAX_LENGTH выше) — чтобы вместе с ПОЛНЫМ
              блоком характеристик, фото и контактами всё уместилось на один
              лист А4. */}
          {printDescription ? (
            <p className="print-only text-[13px] leading-relaxed">
              {printDescription}
            </p>
          ) : null}

          <div className="no-print flex flex-wrap gap-3">
            <Button href={`/kontakty?listing=${listing.id}`}>Оставить заявку</Button>
            <Button
              href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
              variant="ghost"
              ariaLabel="Позвонить"
            >
              Позвонить
            </Button>
            <Button href={contacts.telegram} variant="ghost">
              Telegram
            </Button>
            <Button href={contacts.max} variant="ghost">
              MAX
            </Button>
          </div>

          {/* Показывается только при печати (см. .print-only в globals.css) —
              чтобы у распечатанного/сохранённого в PDF листа были контакты
              агентства, даже если его показали не с телефона у сайта. */}
          <div className="print-only border-t border-line pt-4">
            <p className="font-semibold">Андрей Осипов — CITY KEYS</p>
            <p>{contacts.phone}</p>
            <p>city-keys.ru</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
