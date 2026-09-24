import type { Metadata } from "next";
import { SamplingBuilder, samplingBuilderPage } from "@/tools/sampling-builder";

export const metadata: Metadata = {
  title: samplingBuilderPage.title,
  description: samplingBuilderPage.metaDescription,
};

export default function Page() {
  return <SamplingBuilder />;
}
