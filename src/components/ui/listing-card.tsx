import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { MeshGradientCard, MESH_GRADIENT_VARIANT_COUNT } from "./mesh-gradient-card";
import {
  formatPrice,
  isMediaDoc,
  roomsLabels,
  type Listing,
} from "@/lib/listing-types";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.photos?.find(isMediaDoc);
  const roomsLabel = listing.rooms ? roomsLabels[listing.rooms] : null;

  return (
    <Link href={`/katalog/obyekt/${listing.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt || listing.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : (
          <MeshGradientCard
            icon={Building2}
            variant={listing.id % MESH_GRADIENT_VARIANT_COUNT}
            iconSize={36}
            className="h-full w-full"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {listing.status === "reserved" ? (
            <span className="rounded-[3px] bg-bg/80 px-2 py-1 text-[10.5px] font-bold text-ink-secondary backdrop-blur-sm">
              Забронирован
            </span>
          ) : null}
          {listing.mortgageAvailable ? (
            <span className="rounded-[3px] bg-accent px-2 py-1 text-[10.5px] font-bold text-accent-ink">
              Можно в ипотеку
            </span>
          ) : null}
          {listing.droneVideo ? (
            <span className="rounded-[3px] bg-bg/80 px-2 py-1 text-[10.5px] font-bold text-ink backdrop-blur-sm">
              Видео
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[17px] font-extrabold group-hover:text-accent">
          {formatPrice(listing.price)}
        </span>
        <span className="text-[13.5px] text-ink-secondary">{listing.address}</span>
        <span className="text-[12.5px] text-ink-secondary">
          {[roomsLabel, listing.areaTotal ? `${listing.areaTotal} м²` : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    </Link>
  );
}
