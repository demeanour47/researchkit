import type { Metadata } from "next";
import { TextStatistics, textStatisticsPage } from "@/tools/text-statistics";

export const metadata: Metadata = {
  title: textStatisticsPage.title,
  description: textStatisticsPage.metaDescription,
};

export default function Page() {
  return <TextStatistics />;
}
