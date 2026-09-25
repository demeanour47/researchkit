import type { Metadata } from "next";
import { StatisticalAssumptionChecker, statisticalAssumptionCheckerPage } from "@/tools/statistical-assumption-checker";

export const metadata: Metadata = {
  title: statisticalAssumptionCheckerPage.title,
  description: statisticalAssumptionCheckerPage.metaDescription,
};

export default function Page() {
  return <StatisticalAssumptionChecker />;
}
