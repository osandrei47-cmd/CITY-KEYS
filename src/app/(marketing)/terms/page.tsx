import type { Metadata } from "next";
import { LegalDocument } from "@/components/ui/legal-document";
import { legalDocs } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: "Пользовательское соглашение — CITY KEYS",
};

export default function TermsPage() {
  return <LegalDocument doc={legalDocs.terms} />;
}
