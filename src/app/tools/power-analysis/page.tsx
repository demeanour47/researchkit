import type { Metadata } from "next";
import { PowerAnalysis, powerAnalysisPage } from "@/tools/power-analysis";

export const metadata: Metadata = {
  title: powerAnalysisPage.title,
  description: powerAnalysisPage.metaDescription,
};

export default function Page() {
  return <PowerAnalysis />;
}
