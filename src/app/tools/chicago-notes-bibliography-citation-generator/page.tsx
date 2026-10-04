import type { Metadata } from "next";
import { ChicagoNotesBibliographyCitationGenerator, chicagoNotesBibliographyCitationGeneratorPage } from "@/tools/chicago-notes-bibliography-citation-generator";

export const metadata: Metadata = {
  title: chicagoNotesBibliographyCitationGeneratorPage.title,
  description: chicagoNotesBibliographyCitationGeneratorPage.metaDescription,
};

export default function Page() {
  return <ChicagoNotesBibliographyCitationGenerator />;
}
