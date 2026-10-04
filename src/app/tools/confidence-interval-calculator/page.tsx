import type { Metadata } from "next";
import { ConfidenceIntervalCalculator, confidenceIntervalCalculatorPage } from "@/tools/confidence-interval-calculator";

export const metadata: Metadata = {
  title: confidenceIntervalCalculatorPage.title,
  description: confidenceIntervalCalculatorPage.metaDescription,
};

export default function Page() {
  return <ConfidenceIntervalCalculator />;
}
