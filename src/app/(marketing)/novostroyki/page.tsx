import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { ComplexCard } from "@/components/ui/complex-card";
import { getPayloadClient } from "@/lib/payload-client";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import type { ResidentialComplex } from "@/lib/complex-types";

const TITLE = "Новостройки — CITY KEYS";
const DESCRIPTION =
  "Жилые комплексы, с которыми работает CITY KEYS — планировки, условия покупки и актуальные цены от застройщика.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/novostroyki" }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/novostroyki"),
};

export const dynamic = "force-dynamic";

export default async function NewBuildingsPage() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "residential-complexes",
    where: { isPublished: { equals: true } },
    sort: "title",
    depth: 1,
    limit: 100,
  });

  const complexes = docs as unknown as ResidentialComplex[];

  return (
    <>
      <PageHero
        eyebrow="Новостройки"
        title="Жилые комплексы, с которыми работаем"
        subtitle="Выберите ЖК, чтобы узнать про планировки, условия покупки и актуальные цены от застройщика."
        layout="split"
        photoSrc="/images/andrey-orange-coat-skyline.jpg"
        photoAlt="Андрей на фоне новостроек"
        photoAspect="4/5"
        photoPosition="50% 15%"
        photoSide="right"
      />

      <Section>
        {complexes.length ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {complexes.map((complex) => (
              <ComplexCard key={complex.id} complex={complex} />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink-secondary">
            Пока ни один ЖК не опубликован — карточки появятся здесь по мере
            наполнения каталога новостроек.
          </p>
        )}
      </Section>
    </>
  );
}
