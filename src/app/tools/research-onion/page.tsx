import type { Metadata } from "next";
import { ResearchOnion, researchOnionPage } from "@/tools/research-onion";

export const metadata: Metadata = {
  title: researchOnionPage.title,
  description: researchOnionPage.metaDescription,
};

export default function Page() {
  return <ResearchOnion />;
}
