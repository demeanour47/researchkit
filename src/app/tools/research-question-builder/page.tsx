import type { Metadata } from "next";
import { ResearchQuestionBuilder, researchQuestionBuilderPage } from "@/tools/research-question-builder";

export const metadata: Metadata = {
  title: researchQuestionBuilderPage.title,
  description: researchQuestionBuilderPage.metaDescription,
};

export default function Page() {
  return <ResearchQuestionBuilder />;
}
