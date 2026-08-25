import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { BlogCard } from "@/components/ui/blog-card";
import { getPayloadClient } from "@/lib/payload-client";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";
import type { BlogPost } from "@/lib/blog-types";

const TITLE = "Блог — CITY KEYS";
const DESCRIPTION = "Кейсы сделок, разбор рисков и практические гиды от CITY KEYS — простым языком.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/blog",
    image: {
      url: "/images/andrey-desk-laptop.JPG",
      width: 4176,
      height: 2784,
      alt: "Андрей за рабочим столом с ноутбуком",
    },
  }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  alternates: buildCanonical("/blog"),
};

export const dynamic = "force-dynamic";

const categories = [
  "Кейсы сделок",
  "Юридические вопросы и риски",
  "Рынок недвижимости",
  "Ипотека",
  "Гид покупателя/продавца",
];

async function getPosts() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "blog-posts",
    where: { isPublished: { equals: true } },
    sort: "-publishedAt",
    depth: 1,
    limit: 100,
  });
  return docs as unknown as BlogPost[];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageBannerHero
        title="Блог"
        subtitle="Кейсы сделок, разбор рисков и практические гиды — простым языком."
        photoSrc="/images/andrey-desk-laptop.JPG"
        photoAlt="Андрей за рабочим столом с ноутбуком"
        photoPosition="50% 15%"
      />
      <Section className="pt-0">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-secondary"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>
      <Section>
        {posts.length ? (
          <div className="grid gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                category={post.category}
                title={post.title}
                excerpt={post.excerpt}
                readTime={post.readTime}
                coverPhoto={post.coverPhoto}
              />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink-secondary">Статьи скоро появятся — следите за обновлениями.</p>
        )}
      </Section>
    </>
  );
}
