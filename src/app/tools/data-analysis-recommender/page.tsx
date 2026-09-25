import type { Metadata } from "next";
import { DataAnalysisRecommender, dataAnalysisRecommenderPage } from "@/tools/data-analysis-recommender";

export const metadata: Metadata = {
  title: dataAnalysisRecommenderPage.title,
  description: dataAnalysisRecommenderPage.metaDescription,
};

export default function Page() {
  return <DataAnalysisRecommender />;
}
