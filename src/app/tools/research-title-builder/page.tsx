import type { Metadata } from "next";
import { ResearchTitleBuilder, researchTitleBuilderPage } from "@/tools/research-title-builder";

export const metadata: Metadata = {
  title: researchTitleBuilderPage.title,
  description: researchTitleBuilderPage.metaDescription,
};

export default function Page() {
  return <ResearchTitleBuilder />;
}
