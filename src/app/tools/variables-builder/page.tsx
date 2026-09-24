import type { Metadata } from "next";
import { VariablesBuilder, variablesBuilderPage } from "@/tools/variables-builder";

export const metadata: Metadata = {
  title: variablesBuilderPage.title,
  description: variablesBuilderPage.metaDescription,
};

export default function Page() {
  return <VariablesBuilder />;
}
