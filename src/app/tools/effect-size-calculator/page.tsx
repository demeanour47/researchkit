import type { Metadata } from "next";
import { EffectSizeCalculator, effectSizeCalculatorPage } from "@/tools/effect-size-calculator";

export const metadata: Metadata = {
  title: effectSizeCalculatorPage.title,
  description: effectSizeCalculatorPage.metaDescription,
};

export default function Page() {
  return <EffectSizeCalculator />;
}