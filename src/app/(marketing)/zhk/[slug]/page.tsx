import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { ComingSoonNote } from "@/components/ui/coming-soon-note";
import { Button } from "@/components/ui/button";
import { getPayloadClient } from "@/lib/payload-client";
import { isMediaDoc } from "@/lib/listing-types";
import { contacts } from "@/lib/nav";
import type { ResidentialComplex } from "@/payload-types";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const complex = await getComplex(slug);
  return { title: complex ? `${complex.name} — CITY KEYS` : "ЖК — CITY KEYS" };
}

export default async function ResidentialComplexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const complex = await getComplex(slug);
  if (!complex) notFound();

  const cover = isMediaDoc(complex.coverPhoto) ? complex.coverPhoto : null;

  return (
    <>
      <PageHero
        eyebrow="Новостройка"
        title={complex.name}
        subtitle={complex.shortDescription || undefined}
        photoSrc={cover?.url || undefined}
        photoAlt={cover?.alt || complex.name}
        photoAssetHint={`фото ЖК «${complex.name}»`}
      />

      <Section>
        <ComingSoonNote>
          Страница {complex.name} пока в разработке — планировки, галерея и
          условия от застройщика появятся здесь отдельной задачей. Пока
          можно узнать актуальную информацию напрямую.
        </ComingSoonNote>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/kontakty">Оставить заявку</Button>
          <Button href={contacts.telegram} variant="ghost">
            Telegram
          </Button>
          <Button href={contacts.max} variant="ghost">
            MAX
          </Button>
        </div>
      </Section>
    </>
  );
}
