import type { Metadata } from "next";
import { ChartBuilder, chartBuilderPage } from "@/tools/chart-builder";

export const metadata: Metadata = {
  title: chartBuilderPage.title,
  description: chartBuilderPage.metaDescription,
};

export default function Page() {
  return <ChartBuilder />;
}
