import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { DATA_ANALYSIS_LIMITATIONS, DATA_ANALYSIS_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";
import { RecommenderForm } from "./recommender-form";

/** The Data Analysis Recommender page: the shared tool layout around a small client form, with the guide rendered on the server. */
export function DataAnalysisRecommender() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: DATA_ANALYSIS_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: DATA_ANALYSIS_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <RecommenderForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
