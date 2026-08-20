import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { MeshGradientCard, MESH_GRADIENT_VARIANT_COUNT } from "./mesh-gradient-card";
import { isMediaDoc } from "@/lib/listing-types";
import { complexStatusLabels, type ResidentialComplex } from "@/lib/complex-types";

const statusBadgeClass: Record<ResidentialComplex["status"], string> = {
  planned: "bg-bg/80 text-ink-secondary backdrop-blur-sm",
  "under-construction": "bg-accent text-accent-ink",
  completed: "bg-bg/80 text-ink-secondary backdrop-blur-sm",
  frozen: "bg-bg/80 text-ink-secondary backdrop-blur-sm",
};

export function ComplexCard({ complex }: { complex: ResidentialComplex }) {
  const cover = isMediaDoc(complex.coverPhoto) ? complex.coverPhoto : null;

  return (
    <Link href={`/zhk/${complex.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt || complex.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <MeshGradientCard
            icon={Building2}
            variant={complex.id % MESH_GRADIENT_VARIANT_COUNT}
            iconSize={36}
            className="h-full w-full"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span
            className={`rounded-[3px] px-2 py-1 text-[10.5px] font-bold ${statusBadgeClass[complex.status]}`}
          >
            {complexStatusLabels[complex.status]}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[17px] font-extrabold group-hover:text-accent">{complex.title}</span>
        {complex.shortDescription ? (
          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-secondary">
            {complex.shortDescription}
          </p>
        ) : null}
        <span className="mt-2 inline-flex w-fit items-center rounded-[3px] bg-accent px-4 py-2 text-[13px] font-bold text-accent-ink transition-colors group-hover:bg-[#e3ac6c]">
          Подробнее
        </span>
      </div>
    </Link>
  );
}
