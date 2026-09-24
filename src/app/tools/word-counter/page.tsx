import type { Metadata } from "next";
import { WordCounter, wordCounterPage } from "@/tools/word-counter";

export const metadata: Metadata = {
  title: wordCounterPage.title,
  description: wordCounterPage.metaDescription,
};

export default function Page() {
  return <WordCounter />;
}
