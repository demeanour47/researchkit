import type { Metadata } from "next";
import { SentenceCounter, sentenceCounterPage } from "@/tools/sentence-counter";

export const metadata: Metadata = {
  title: sentenceCounterPage.title,
  description: sentenceCounterPage.metaDescription,
};

export default function Page() {
  return <SentenceCounter />;
}
