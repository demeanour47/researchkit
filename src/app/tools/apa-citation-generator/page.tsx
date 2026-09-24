import type { Metadata } from "next";
import { ApaCitationGenerator, apaCitationGeneratorPage } from "@/tools/apa-citation-generator";

export const metadata: Metadata = {
  title: apaCitationGeneratorPage.title,
  description: apaCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <ApaCitationGenerator />;
}
