import type { Metadata } from "next";
import { ChicagoAuthorDateCitationGenerator, chicagoAuthorDateCitationGeneratorPage } from "@/tools/chicago-author-date-citation-generator";

export const metadata: Metadata = {
  title: chicagoAuthorDateCitationGeneratorPage.title,
  description: chicagoAuthorDateCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <ChicagoAuthorDateCitationGenerator />;
}
