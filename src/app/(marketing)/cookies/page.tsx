import type { Metadata } from "next";
import { LegalDocument } from "@/components/ui/legal-document";
import { legalDocs } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: "Cookie-политика — CITY KEYS",
};

export default function CookiesPage() {
  return <LegalDocument doc={legalDocs.cookies} />;
}
