import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageBannerHero } from "@/components/ui/page-banner-hero";
import { BlogCard } from "@/components/ui/blog-card";
import { blogPosts } from "@/lib/blog-posts";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";

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

const categories = [
  "Кейсы сделок",
  "Ипотека",
  "Юридические вопросы и риски",
  "Рынок недвижимости Кингисеппа и Ленобласти",
  "Гид покупателя/продавца",
];

export default function BlogPage() {
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
        <div className="grid gap-8 md:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      </Section>
    </>
  );
}
