import type { Metadata } from "next";
import { CitationStyleFinder, citationStyleFinderPage } from "@/tools/citation-style-finder";

export const metadata: Metadata = {
  title: citationStyleFinderPage.title,
  description: citationStyleFinderPage.description,
};

export default async function CitationStyleFinderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CitationStyleFinder params={await searchParams} />;
}
