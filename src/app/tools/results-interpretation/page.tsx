import type { Metadata } from "next";
import { ResultsInterpretation, resultsInterpretationPage } from "@/tools/results-interpretation";

export const metadata: Metadata = {
  title: resultsInterpretationPage.title,
  description: resultsInterpretationPage.metaDescription,
};

export default function Page() {
  return <ResultsInterpretation />;
}
