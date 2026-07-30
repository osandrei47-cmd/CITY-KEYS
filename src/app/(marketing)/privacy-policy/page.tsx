import type { Metadata } from "next";
import { LegalDocument } from "@/components/ui/legal-document";
import { legalDocs } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — CITY KEYS",
};

export default function PrivacyPolicyPage() {
  return <LegalDocument doc={legalDocs["privacy-policy"]} />;
}
