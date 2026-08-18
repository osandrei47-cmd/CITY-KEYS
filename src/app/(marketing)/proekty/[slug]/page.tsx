import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getPayloadClient } from "@/lib/payload-client";
import { isMediaDoc } from "@/lib/listing-types";
import {
  buildProjectMetaDescription,
  buildProjectMetaTitle,
  projectStatusLabels,
  type Project,
} from "@/lib/project-types";
import { hasHandBuiltProjectPage } from "@/lib/project-pages";
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, type OgImage } from "@/lib/seo";

// Next.js отдаёт приоритет статическому маршруту (proekty/ust-luga-izhs)
// перед этим динамическим — сюда попадают только те slug'и, для которых
// вручную свёрстанной страницы ещё нет. См. src/lib/project-pages.ts.
export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug }, isPublished: { equals: true } },
    depth: 1,
    limit: 1,
  });
  return (docs[0] as unknown as Project | undefined) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return { title: "Проект не найден — CITY KEYS" };
  }

  const title = buildProjectMetaTitle(project);
  const description = buildProjectMetaDescription(project);
  const cover = isMediaDoc(project.coverPhoto) ? project.coverPhoto : null;
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
    openGraph: buildOpenGraph({ title, description, path: `/proekty/${project.slug}`, image }),
    twitter: buildTwitter({ title, description, image }),
    // Пока у проекта нет своей вручную свёрстанной страницы, здесь только
    // временная заглушка — не даём поисковику индексировать тонкий контент,
    // который скоро заменится (см. docs/seo-audit-2026-08-18.md, п.1 и п.6).
    // OG/Twitter теги при этом всё равно нужны — мессенджеры их читают
    // независимо от robots.
    robots: { index: false, follow: true },
  };
}

export default async function ProjectPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Slug реально существующего hand-built маршрута сюда дойти не должен —
  // Next.js отдаст его статической странице раньше. Но если он всё же
  // здесь (например, папку удалили, а список забыли обновить) — не будем
  // показывать "страница готовится" поверх того, что должно быть готово.
  if (hasHandBuiltProjectPage(slug)) {
    notFound();
  }

  const project = await getProject(slug);
  if (!project) {
    notFound();
  }

  const cover = isMediaDoc(project.coverPhoto) ? project.coverPhoto : null;

  return (
    <>
      <PageHero
        eyebrow={projectStatusLabels[project.status]}
        title={project.title}
        subtitle={project.shortDescription}
        photoSrc={cover?.url ?? undefined}
        photoAlt={cover?.alt || project.title}
        layout="split"
        photoAspect="4/3"
      />

      <Section className="pb-24 pt-0">
        <div className="flex flex-col gap-5 rounded-[4px] border border-line bg-surface p-8">
          <Eyebrow>Страница готовится</Eyebrow>
          <h2 className="text-[20px] font-extrabold">
            Подробная страница об этом проекте скоро появится
          </h2>
          <p className="max-w-[56ch] text-[14px] leading-relaxed text-ink-secondary">
            Мы уже добавили проект «{project.title}» в каталог, но детальная
            страница с презентацией и полными условиями ещё в работе. Если
            хотите узнать подробности прямо сейчас — напишите нам, ответим
            лично.
          </p>
          {project.metric ? (
            <p className="text-[13px] font-bold text-accent">{project.metric}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/kontakty">Узнать подробности</Button>
            <Button href="/proekty" variant="ghost">
              Ко всем проектам
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
