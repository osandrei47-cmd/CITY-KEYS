import type { Where } from "payload";
import { isMediaDoc, richTextToPlainText, type Listing, type Media } from "@/lib/listing-types";
import { SITE_URL } from "./constants";

export { richTextToPlainText };

export const activeListingsWhere: Where = {
  status: { equals: "for-sale" },
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function cdata(value: string): string {
  return `<![CDATA[${value.split("]]>").join("]]]]><![CDATA[>")}]]>`;
}

export function absoluteUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function listingUrl(listing: Listing): string {
  return `${SITE_URL}/katalog/obyekt/${listing.id}`;
}

export function listingPhotoUrls(listing: Listing): string[] {
  const photos = listing.photos ?? [];
  return photos.filter(isMediaDoc).map((media: Media) => absoluteUrl(media.url ?? ""));
}

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}
