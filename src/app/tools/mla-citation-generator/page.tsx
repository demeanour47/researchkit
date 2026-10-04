import type { Metadata } from "next";
import { MlaCitationGenerator, mlaCitationGeneratorPage } from "@/tools/mla-citation-generator";

export const metadata: Metadata = {
  title: mlaCitationGeneratorPage.title,
  description: mlaCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <MlaCitationGenerator />;
}
