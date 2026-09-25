import type { Metadata } from "next";
import { QuestionnaireBuilder, questionnaireBuilderPage } from "@/tools/questionnaire-builder";

export const metadata: Metadata = {
  title: questionnaireBuilderPage.title,
  description: questionnaireBuilderPage.metaDescription,
};

export default function Page() {
  return <QuestionnaireBuilder />;
}
