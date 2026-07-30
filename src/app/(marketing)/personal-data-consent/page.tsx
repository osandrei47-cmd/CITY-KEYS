import type { Metadata } from "next";
import { LegalDocument } from "@/components/ui/legal-document";
import { legalDocs } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных — CITY KEYS",
};

export default function PersonalDataConsentPage() {
  return <LegalDocument doc={legalDocs["personal-data-consent"]} />;
}
