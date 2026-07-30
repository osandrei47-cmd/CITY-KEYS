import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { getPayloadClient } from "@/lib/payload-client";
import { isMediaDoc } from "@/lib/listing-types";
import type { ResidentialComplex } from "@/payload-types";

export const metadata: Metadata = {
  title: "Новостройки — CITY KEYS",
};

export const dynamic = "force-dynamic";

export default async function NewBuildingsPage() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "residential-complexes",
    where: { isPublished: { equals: true } },
    sort: "name",
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
            {complexes.map((complex) => {
              const cover = isMediaDoc(complex.coverPhoto) ? complex.coverPhoto : null;
              return (
                <Link
                  key={complex.id}
                  href={`/zhk/${complex.slug}`}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
                    {cover?.url ? (
                      <Image
                        src={cover.url}
                        alt={cover.alt || complex.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    ) : (
                      <PhotoPlaceholder
                        className="h-full w-full"
                        assetHint={`фото ЖК «${complex.name}»`}
                      />
                    )}
                  </div>
                  <span className="text-[16px] font-bold group-hover:text-accent">
                    {complex.name}
                  </span>
                </Link>
              );
            })}
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
