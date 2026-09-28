import type { Metadata } from "next";
import { StatisticalTestFinder, statisticalTestFinderPage } from "@/tools/statistical-test-finder";

export const metadata: Metadata = {
  title: statisticalTestFinderPage.title,
  description: statisticalTestFinderPage.metaDescription,
};

export default function Page() {
  return <StatisticalTestFinder />;
}
