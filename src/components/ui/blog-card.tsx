import Link from "next/link";
import { PhotoPlaceholder } from "./photo-placeholder";

export function BlogCard({
  slug,
  category,
  title,
  excerpt,
  readingTime,
}: {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime?: string;
}) {
  return (
    <Link href={`/blog/${slug}`} className="group flex flex-col gap-3">
      <PhotoPlaceholder className="aspect-[4/3] rounded-[4px]" assetHint={`обложка поста «${title}»`} />
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-secondary">
        {category}
        {readingTime ? ` · ${readingTime}` : ""}
      </span>
      <h3 className="text-[16px] font-bold leading-snug group-hover:text-accent">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-ink-secondary">{excerpt}</p>
    </Link>
  );
}
