import type { Metadata } from "next";
import { ParagraphCounter, paragraphCounterPage } from "@/tools/paragraph-counter";

export const metadata: Metadata = {
  title: paragraphCounterPage.title,
  description: paragraphCounterPage.metaDescription,
};

export default function Page() {
  return <ParagraphCounter />;
}
