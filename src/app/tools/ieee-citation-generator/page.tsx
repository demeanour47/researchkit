import type { Metadata } from "next";
import { IeeeCitationGenerator, ieeeCitationGeneratorPage } from "@/tools/ieee-citation-generator";

export const metadata: Metadata = {
  title: ieeeCitationGeneratorPage.title,
  description: ieeeCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <IeeeCitationGenerator />;
}
