import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/ui/page-hero";
import { Quote } from "@/components/ui/quote";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/blog-posts";
import { contacts } from "@/lib/nav";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${post.category} · ${post.readingTime} чтения`}
        title={post.title}
        subtitle={post.excerpt}
      />
      <Section>
        <Container className="px-0">
          <article className="mx-auto flex max-w-[680px] flex-col gap-5">
            {post.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2 key={i} className="mt-2 text-[20px] font-extrabold">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul key={i} className="flex flex-col gap-2">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[14.5px] leading-relaxed text-ink-secondary"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "bold") {
                return (
                  <p key={i} className="text-[16px] font-bold leading-relaxed">
                    {block.text}
                  </p>
                );
              }
              return (
                <p key={i} className="text-[14.5px] leading-relaxed text-ink-secondary">
                  {block.text}
                </p>
              );
            })}

            {post.closingQuote ? (
              <div className="mt-2">
                <Quote author={post.closingQuote.author} source={post.closingQuote.source}>
                  {post.closingQuote.text}
                </Quote>
                <Button href="/otzyvy" variant="ghost" className="mt-4">
                  Смотреть все отзывы
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <Button href="/kontakty">{post.ctaLabel}</Button>
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
