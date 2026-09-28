import type { Metadata } from "next";
import { ResearchObjectivesGenerator, researchObjectivesGeneratorPage } from "@/tools/research-objectives-generator";

export const metadata: Metadata = {
  title: researchObjectivesGeneratorPage.title,
  description: researchObjectivesGeneratorPage.metaDescription,
};

export default function Page() {
  return <ResearchObjectivesGenerator />;
}
