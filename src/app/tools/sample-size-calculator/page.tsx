import type { Metadata } from "next";
import { SampleSizeCalculator, sampleSizeCalculatorPage } from "@/tools/sample-size-calculator";

export const metadata: Metadata = {
  title: sampleSizeCalculatorPage.title,
  description: sampleSizeCalculatorPage.metaDescription,
};

export default function Page() {
  return <SampleSizeCalculator />;
}
