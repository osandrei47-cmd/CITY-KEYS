import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/components/ui/contact-form";
import { YandexMap } from "@/components/ui/yandex-map";
import { contacts } from "@/lib/nav";
import { getPayloadClient } from "@/lib/payload-client";
import { formatPrice, type Listing } from "@/lib/listing-types";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { buildRealEstateAgentJsonLd, OFFICE_COORDINATES } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

const TITLE = "Контакты — CITY KEYS";
const DESCRIPTION =
  "Пишите или звоните напрямую — отвечаю сам, обычно в течение дня. Офис CITY KEYS в Кингисеппе, ул. Октябрьская, д.18а/14.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/kontakty",
    image: {
      url: "/images/andrey-otzyvy-hero-banner.jpg",
      width: 3729,
      height: 1678,
      alt: "Андрей Осипов улыбается на фоне жилых домов",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/kontakty"),
};

async function getLinkedListing(listingParam: string | undefined) {
  const id = Number(listingParam);
  if (!Number.isFinite(id)) return null;

  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: "listings", id });
    return doc as unknown as Listing;
  } catch {
    return null;
  }
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing: listingParam } = await searchParams;
  const listing = await getLinkedListing(listingParam);

  return (
    <>
      <JsonLd data={buildRealEstateAgentJsonLd()} />

      <PageBannerHero
        eyebrow="Контакты"
        title="Отвечаю лично — без колл-центра"
        subtitle="Пишите или звоните напрямую — отвечаю сам, обычно в течение дня."
        photoSrc="/images/andrey-otzyvy-hero-banner.jpg"
        photoAlt="Андрей Осипов улыбается на фоне жилых домов"
        photoPosition="50% 60%"
      />

      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-[14.5px] text-ink-secondary">
              <div className="flex items-center gap-2 text-[15px] font-bold text-ink">
                <span className="h-2 w-2 rounded-full bg-accent" />
                На связи в любое время
              </div>
              <p>{contacts.address}</p>
              <p>
                {contacts.phone} · {contacts.email}
              </p>
              <div className="mt-1 flex gap-4 font-semibold text-accent">
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`} aria-label="Позвонить">
                  Позвонить
                </a>
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
                <a href={contacts.max} target="_blank" rel="noopener noreferrer">
                  MAX
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
              <Image
                src="/images/andrey-phone.jpg"
                alt="Андрей на связи с клиентом"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <ContactForm
            listingId={listing?.id}
            listingLabel={listing ? `${listing.title} — ${formatPrice(listing.price)}` : undefined}
          />
        </div>
      </Section>

      <Section>
        <Eyebrow>Как нас найти</Eyebrow>
        <h2 className="mt-2 text-[20px] font-extrabold">{contacts.address}</h2>
        <div className="mt-6">
          <YandexMap
            center={OFFICE_COORDINATES}
            zoom={16}
            markers={[
              {
                lat: OFFICE_COORDINATES[0],
                lng: OFFICE_COORDINATES[1],
                hint: "CITY KEYS",
                balloonContent: contacts.address,
              },
            ]}
            className="aspect-[16/9] w-full"
          />
        </div>
      </Section>

      <Section className="pb-24 pt-0" border={false}>
        <p className="text-[12.5px] text-ink-secondary">
          Индивидуальный предприниматель Осипов Андрей Владимирович · ИНН
          470705914908 · ОГРНИП 317470400007509
        </p>
      </Section>
    </>
  );
}
