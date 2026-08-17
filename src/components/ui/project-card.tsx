import Image from "next/image";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { MeshGradientCard, MESH_GRADIENT_VARIANT_COUNT } from "./mesh-gradient-card";
import { isMediaDoc } from "@/lib/listing-types";
import { projectStatusLabels, type Project } from "@/lib/project-types";

const statusBadgeClass: Record<Project["status"], string> = {
  sale: "bg-accent text-accent-ink",
  development: "bg-bg/80 text-ink-secondary backdrop-blur-sm",
  completed: "bg-bg/80 text-ink-secondary backdrop-blur-sm",
};

export function ProjectCard({ project }: { project: Project }) {
  const cover = isMediaDoc(project.coverPhoto) ? project.coverPhoto : null;

  return (
    <Link href={`/proekty/${project.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt || project.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <MeshGradientCard
            icon={Landmark}
            variant={project.id % MESH_GRADIENT_VARIANT_COUNT}
            iconSize={36}
            className="h-full w-full"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span
            className={`rounded-[3px] px-2 py-1 text-[10.5px] font-bold ${statusBadgeClass[project.status]}`}
          >
            {projectStatusLabels[project.status]}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[17px] font-extrabold group-hover:text-accent">{project.title}</span>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-secondary">
          {project.shortDescription}
        </p>
        {project.metric ? (
          <span className="text-[12.5px] font-bold text-accent">{project.metric}</span>
        ) : null}
        <span className="mt-2 inline-flex w-fit items-center rounded-[3px] bg-accent px-4 py-2 text-[13px] font-bold text-accent-ink transition-colors group-hover:bg-[#e3ac6c]">
          Подробнее
        </span>
      </div>
    </Link>
  );
}
