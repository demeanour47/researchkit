import type { Metadata } from "next";
import { ReadingTime, readingTimePage } from "@/tools/reading-time";

export const metadata: Metadata = {
  title: readingTimePage.title,
  description: readingTimePage.metaDescription,
};

export default function Page() {
  return <ReadingTime />;
}
