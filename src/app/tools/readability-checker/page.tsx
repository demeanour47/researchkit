import type { Metadata } from "next";
import { ReadabilityChecker, readabilityCheckerPage } from "@/tools/readability-checker";

export const metadata: Metadata = {
  title: readabilityCheckerPage.title,
  description: readabilityCheckerPage.metaDescription,
};

export default function Page() {
  return <ReadabilityChecker />;
}
