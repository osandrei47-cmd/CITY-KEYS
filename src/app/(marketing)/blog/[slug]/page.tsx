import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Quote } from "@/components/ui/quote";
import { Button } from "@/components/ui/button";
import { getPayloadClient } from "@/lib/payload-client";
import { contacts } from "@/lib/nav";
import { buildBlogMetaDescription, buildBlogMetaTitle, isMediaDoc, type BlogPost } from "@/lib/blog-types";
import { buildCanonical, buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";

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

  return (
    <>
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
            <div className="prose-listing text-[14.5px] leading-relaxed text-ink-secondary">
              <RichText data={post.content} />
            </div>

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
