import Image from "next/image";
import Link from "next/link";
import { MeshGradientCard } from "./mesh-gradient-card";
import { getBlogCategoryIcon } from "@/lib/blog-categories";
import { isMediaDoc } from "@/lib/blog-types";
import type { Media } from "@/payload-types";

export function BlogCard({
  slug,
  category,
  title,
  excerpt,
  readTime,
  coverPhoto,
}: {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime?: string | null;
  coverPhoto?: number | Media | null;
}) {
  const { icon, variant } = getBlogCategoryIcon(category);
  const cover = isMediaDoc(coverPhoto) ? coverPhoto : null;

  return (
    <Link href={`/blog/${slug}`} className="group flex flex-col gap-3">
      {cover?.url ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
          <Image
            src={cover.url}
            alt={cover.alt || title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <MeshGradientCard
          icon={icon}
          variant={variant}
          iconSize={40}
          className="aspect-[4/3] rounded-[4px]"
        />
      )}
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-secondary">
        {category}
        {readTime ? ` · ${readTime}` : ""}
      </span>
      <h3 className="text-[16px] font-bold leading-snug group-hover:text-accent">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-ink-secondary">{excerpt}</p>
    </Link>
  );
}
