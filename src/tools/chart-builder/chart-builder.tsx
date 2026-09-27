import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { CHART_LIMITATIONS, CHART_REVIEW_ITEMS } from "@/knowledge/charts";
import { ChartBuilderForm } from "./chart-builder-form";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";

/** The Research Chart Builder page: the shared tool layout, a client form that draws the chart, and the chart guide rendered on the server. */
export function ChartBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: CHART_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: CHART_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ChartBuilderForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
