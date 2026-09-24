import type { Metadata } from "next";
import { ResearchDesignBuilder, researchDesignBuilderPage } from "@/tools/research-design-builder";

export const metadata: Metadata = {
  title: researchDesignBuilderPage.title,
  description: researchDesignBuilderPage.metaDescription,
};

export default function Page() {
  return <ResearchDesignBuilder />;
}
