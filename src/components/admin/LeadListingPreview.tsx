import type { UIFieldServerComponent } from "payload";
import type { Listing } from "@/payload-types";
import { formatPrice, isMediaDoc, statusLabels } from "@/lib/listing-types";

export const LeadListingPreview: UIFieldServerComponent = async ({ data, payload }) => {
  const listingRef = data?.listing as number | Listing | null | undefined;
  if (!listingRef) return null;

  const listingId = typeof listingRef === "object" ? listingRef.id : listingRef;

  const listing = await payload
    .findByID({ collection: "listings", id: listingId, depth: 1 })
    .catch(() => null);

  if (!listing) return null;

  const photo = (listing.photos ?? []).find(isMediaDoc);

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        borderRadius: 4,
        border: "1px solid var(--theme-elevation-150)",
        padding: 12,
        maxWidth: 480,
      }}
    >
      {photo?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.alt || listing.title}
          width={72}
          height={54}
          style={{ objectFit: "cover", borderRadius: 3, width: 72, height: 54, flexShrink: 0 }}
        />
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <a href={`/staff-x7k2/collections/listings/${listing.id}`} style={{ fontWeight: 600 }}>
          {listing.title}
        </a>
        <span>{formatPrice(listing.price)}</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{statusLabels[listing.status]}</span>
      </div>
    </div>
  );
};
