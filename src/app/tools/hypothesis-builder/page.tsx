import type { Metadata } from "next";
import { HypothesisBuilder, hypothesisBuilderPage } from "@/tools/hypothesis-builder";

export const metadata: Metadata = {
  title: hypothesisBuilderPage.title,
  description: hypothesisBuilderPage.metaDescription,
};

export default function Page() {
  return <HypothesisBuilder />;
}
