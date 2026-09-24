import type { Metadata } from "next";
import { ConceptualFrameworkBuilder, conceptualFrameworkBuilderPage } from "@/tools/conceptual-framework-builder";

export const metadata: Metadata = {
  title: conceptualFrameworkBuilderPage.title,
  description: conceptualFrameworkBuilderPage.metaDescription,
};

export default function Page() {
  return <ConceptualFrameworkBuilder />;
}
