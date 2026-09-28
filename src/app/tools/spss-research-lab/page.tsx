import type { Metadata } from "next";
import { SpssResearchLab, spssResearchLabPage } from "@/tools/spss-research-lab";

export const metadata: Metadata = {
  title: spssResearchLabPage.title,
  description: spssResearchLabPage.metaDescription,
};

export default function Page() {
  return <SpssResearchLab />;
}