import type { Metadata } from "next";
import { LiteratureMatrix, literatureMatrixPage } from "@/tools/literature-matrix";

export const metadata: Metadata = {
  title: literatureMatrixPage.title,
  description: literatureMatrixPage.metaDescription,
};

export default function Page() {
  return <LiteratureMatrix />;
}
