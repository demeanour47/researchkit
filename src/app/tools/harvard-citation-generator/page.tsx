import type { Metadata } from "next";
import { HarvardCitationGenerator, harvardCitationGeneratorPage } from "@/tools/harvard-citation-generator";

export const metadata: Metadata = {
  title: harvardCitationGeneratorPage.title,
  description: harvardCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <HarvardCitationGenerator />;
}
