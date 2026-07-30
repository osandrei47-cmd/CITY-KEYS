import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Button } from "@/components/ui/button";
import { getPayloadClient } from "@/lib/payload-client";
import {
  balconyLabels,
  bathroomLabels,
  buildingTypeLabels,
  dealTypeLabels,
  formatPrice,
  isMediaDoc,
  propertyTypeLabels,
  renovationLabels,
  roomsLabels,
  statusLabels,
  viewLabels,
  type Listing,
} from "@/lib/listing-types";
import { contacts } from "@/lib/nav";

export const revalidate = 60;

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
  return { title: listing ? `${listing.title} — CITY KEYS` : "Объект — CITY KEYS" };
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

  const params_: Array<[string, string]> = [
    ["Тип недвижимости", propertyTypeLabels[listing.propertyType]],
    ["Тип сделки", dealTypeLabels[listing.dealType]],
    listing.rooms ? ["Комнат", roomsLabels[listing.rooms]] : null,
    listing.areaTotal ? ["Площадь общая", `${listing.areaTotal} м²`] : null,
    listing.areaLiving ? ["Площадь жилая", `${listing.areaLiving} м²`] : null,
    listing.areaKitchen ? ["Площадь кухни", `${listing.areaKitchen} м²`] : null,
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

  return (
    <Section className="pb-24 pt-28 md:pt-36">
      <Container>
        <div className="mx-auto flex max-w-[880px] flex-col gap-10">
          <div className="flex flex-col gap-3">
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
          </div>

          {photos.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
                  <Image
                    src={photo.url!}
                    alt={photo.alt || listing.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <PhotoPlaceholder className="aspect-[16/9] rounded-[4px]" assetHint={`фото объекта «${listing.title}»`} />
          )}

          <div className="grid gap-x-8 gap-y-3 rounded-[4px] border border-line bg-surface p-6 sm:grid-cols-2">
            {params_.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-[13.5px]">
                <span className="text-ink-secondary">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {listing.description ? (
            <div className="prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={listing.description} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button href={`/kontakty?listing=${listing.id}`}>Оставить заявку</Button>
            <Button href={contacts.telegram} variant="ghost">
              Telegram
            </Button>
            <Button href={contacts.max} variant="ghost">
              MAX
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
