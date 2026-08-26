import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Quote } from "@/components/ui/quote";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { getPayloadClient } from "@/lib/payload-client";
import { contacts } from "@/lib/nav";
import {
  buildBlogMetaDescription,
  buildBlogMetaTitle,
  formatBlogDate,
  isMediaDoc,
  type BlogPost,
} from "@/lib/blog-types";
import { buildCanonical, buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/feed/constants";
import { buildBlogArticleJsonLd, buildFaqPageJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 1,
    limit: 1,
  });
  return (docs[0] as unknown as BlogPost) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Статья — CITY KEYS" };
  }

  const title = buildBlogMetaTitle(post);
  const description = buildBlogMetaDescription(post);
  const cover = isMediaDoc(post.coverPhoto) ? post.coverPhoto : null;
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
    openGraph: buildOpenGraph({ title, description, path: `/blog/${post.slug}`, image }),
    twitter: buildTwitter({ title, description, image }),
    alternates: buildCanonical(`/blog/${post.slug}`),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cover = isMediaDoc(post.coverPhoto) ? post.coverPhoto : null;
  const hasClosingQuote = Boolean(post.closingQuoteText && post.closingQuoteAuthor);
  const keyStats = post.keyStats ?? [];
  const comparisonTable = post.comparisonTable ?? [];
  const faq = post.faq ?? [];
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = cover?.url ? `${SITE_URL}${cover.url}` : `${SITE_URL}${DEFAULT_OG_IMAGE.url}`;

  return (
    <>
      <JsonLd data={buildBlogArticleJsonLd({ post, url, imageUrl })} />
      {faq.length ? <JsonLd data={buildFaqPageJsonLd(faq)} /> : null}

      <PageHero
        eyebrow={[post.category, post.readTime ? `${post.readTime} чтения` : null].filter(Boolean).join(" · ")}
        title={post.title}
        subtitle={post.excerpt}
        photoSrc={cover?.url || undefined}
        photoAlt={cover?.alt || post.title}
        layout="split"
        photoAspect="4/3"
      />
      <Section>
        <Container className="px-0">
          <article className="mx-auto flex max-w-[680px] flex-col gap-5">
            <p className="text-[13px] text-ink-secondary">
              {formatBlogDate(post.publishedAt)}
              {post.author ? (
                <>
                  {" · "}
                  <Link href="/andrey-osipov" className="text-ink-secondary underline hover:text-accent">
                    {post.author}
                  </Link>
                </>
              ) : null}
            </p>

            {post.tldr ? (
              <p className="text-[15px] font-medium leading-relaxed text-ink">{post.tldr}</p>
            ) : null}

            {keyStats.length ? (
              <dl className="grid gap-px overflow-hidden rounded-[4px] bg-line sm:grid-cols-3">
                {keyStats.map((stat) => (
                  <div key={stat.id ?? stat.label} className="flex flex-col gap-1 bg-surface px-4 py-3">
                    <dt className="text-[13px] text-ink-secondary">{stat.label}</dt>
                    <dd className="text-[16px] font-bold text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {comparisonTable.length ? (
              <div className="overflow-x-auto rounded-[4px] border border-line">
                <table className="w-full border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-line bg-surface">
                      <th className="px-4 py-2.5 text-left font-bold text-ink">Тип квартиры</th>
                      <th className="px-4 py-2.5 text-left font-bold text-ink">Диапазон аренды</th>
                      <th className="px-4 py-2.5 text-left font-bold text-ink">Рыночный ориентир</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonTable.map((row) => (
                      <tr key={row.id ?? row.label} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 text-ink-secondary">{row.label}</td>
                        <td className="px-4 py-2.5 text-ink-secondary">{row.range}</td>
                        <td className="px-4 py-2.5 font-bold text-ink">{row.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={post.content} />
            </div>

            {faq.length ? (
              <div className="mt-2 flex flex-col gap-5">
                <h2 className="text-[20px] font-extrabold text-ink">Частые вопросы</h2>
                {faq.map((item) => (
                  <div key={item.id ?? item.question} className="flex flex-col gap-1.5">
                    <p className="text-[15px] font-bold text-ink">{item.question}</p>
                    <p className="text-[14.5px] leading-relaxed text-ink-secondary">{item.answer}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {hasClosingQuote ? (
              <div className="mt-2">
                <Quote author={post.closingQuoteAuthor!} source={post.closingQuoteSource || ""}>
                  {post.closingQuoteText!}
                </Quote>
                <Button href="/otzyvy" variant="ghost" className="mt-4">
                  Смотреть все отзывы
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <Button href="/kontakty">{post.ctaLabel || "Обсудить свою ситуацию"}</Button>
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
