import type { Metadata } from "next";
import { LiteratureExplorer, literatureExplorerPage } from "@/tools/literature-explorer";

export const metadata: Metadata = {
  title: literatureExplorerPage.title,
  description: literatureExplorerPage.metaDescription,
};

export default function Page() {
  return <LiteratureExplorer />;
}
