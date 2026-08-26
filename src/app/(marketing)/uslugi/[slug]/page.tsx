import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { getPayloadClient } from "@/lib/payload-client";
import { contacts } from "@/lib/nav";
import { buildServiceMetaDescription, buildServiceMetaTitle, type Service } from "@/lib/service-types";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { SITE_URL } from "@/lib/feed/constants";
import { buildServiceJsonLd, buildFaqPageJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

async function getService(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 0,
    limit: 1,
  });
  return (docs[0] as unknown as Service) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) {
    return { title: "Услуга — CITY KEYS" };
  }

  const title = buildServiceMetaTitle(service);
  const description = buildServiceMetaDescription(service);

  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: `/uslugi/${service.slug}` }),
    twitter: buildTwitter({ title, description }),
    alternates: buildCanonical(`/uslugi/${service.slug}`),
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const faq = service.faq ?? [];
  const url = `${SITE_URL}/uslugi/${service.slug}`;

  return (
    <>
      <JsonLd data={buildServiceJsonLd({ service, url })} />
      {faq.length ? <JsonLd data={buildFaqPageJsonLd(faq)} /> : null}

      <PageHero
        eyebrow="Услуга"
        title={`${service.title} в Кингисеппе`}
        subtitle={service.shortDescription}
      />

      <Section>
        <Container className="px-0">
          <article className="mx-auto flex max-w-[680px] flex-col gap-5">
            <div className="prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={service.content} />
            </div>

            {faq.length ? (
              <div className="mt-4 flex flex-col gap-3">
                <h2 className="text-[20px] font-extrabold text-ink">Частые вопросы</h2>
                {faq.map((item) => (
                  <details
                    key={item.id ?? item.question}
                    className="group rounded-[4px] border border-line bg-surface p-5"
                  >
                    <summary className="cursor-pointer list-none text-[14.5px] font-bold marker:content-none">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">{item.answer}</p>
                  </details>
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <Button href="/kontakty">{service.ctaLabel || "Обсудить свою ситуацию"}</Button>
            </div>
          </article>
        </Container>
      </Section>

      <Section className="pb-24">
        <div className="flex flex-wrap gap-3">
          <Button href="/kontakty">Оставить заявку</Button>
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
      </Section>
    </>
  );
}
