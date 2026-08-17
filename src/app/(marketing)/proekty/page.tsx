import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectCard } from "@/components/ui/project-card";
import { getPayloadClient } from "@/lib/payload-client";
import type { Project } from "@/payload-types";

export const metadata: Metadata = {
  title: "Проекты — CITY KEYS",
  description:
    "Крупные проекты CITY KEYS: инвестиционные и девелоперские кластеры за пределами обычного каталога объектов.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { isPublished: { equals: true } },
    sort: "createdAt",
    depth: 1,
    limit: 100,
  });

  const projects = docs as unknown as Project[];

  return (
    <>
      <PageHero
        eyebrow="Проекты"
        title="Крупные проекты CITY KEYS"
        subtitle="Инвестиционные и девелоперские проекты, которые ведёт агентство — от загородных кластеров до комплексного освоения территорий."
      />

      <Section className="pt-0">
        {projects.length ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink-secondary">
            Пока ни один проект не опубликован — карточки появятся здесь по мере
            наполнения раздела.
          </p>
        )}
      </Section>
    </>
  );
}
