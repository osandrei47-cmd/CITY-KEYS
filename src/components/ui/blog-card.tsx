import Link from "next/link";
import { MeshGradientCard } from "./mesh-gradient-card";
import { getBlogCategoryIcon } from "@/lib/blog-categories";

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
  const { icon, variant } = getBlogCategoryIcon(category);

  return (
    <Link href={`/blog/${slug}`} className="group flex flex-col gap-3">
      <MeshGradientCard
        icon={icon}
        variant={variant}
        iconSize={40}
        className="aspect-[4/3] rounded-[4px]"
      />
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
