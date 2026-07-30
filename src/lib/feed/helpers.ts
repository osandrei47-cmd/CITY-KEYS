import type { Where } from "payload";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { isMediaDoc, type Listing, type Media } from "@/lib/listing-types";
import { SITE_URL } from "./constants";

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

// Простой обход Lexical JSON в plain text — параграфы разделяются пустой
// строкой, как в подтверждённом рабочем фиде (см. reference-feed.xml).
export function richTextToPlainText(
  data: Listing["description"] | null | undefined,
): string {
  if (!data) return "";
  const root = (data as SerializedEditorState).root;
  if (!root?.children) return "";

  function collectText(node: SerializedLexicalNode & { [k: string]: unknown }): string {
    const text = (node as unknown as { text?: unknown }).text;
    if (typeof text === "string") return text;
    const children = (node as unknown as { children?: SerializedLexicalNode[] }).children;
    if (Array.isArray(children)) {
      return children.map((child) => collectText(child as never)).join("");
    }
    return "";
  }

  return root.children
    .map((node) => collectText(node as never))
    .filter((text) => text.trim().length > 0)
    .join("\n\n")
    .trim();
}

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}
