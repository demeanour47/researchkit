import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { ASSUMPTION_LIMITATIONS, ASSUMPTION_REVIEW_ITEMS } from "@/knowledge/research";
import { ChecklistForm } from "./checklist-form";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";

/** The Statistical Assumption Checker page: the shared tool layout, a small client form for the project's checklist, and the full guide rendered on the server. */
export function StatisticalAssumptionChecker() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: ASSUMPTION_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: ASSUMPTION_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ChecklistForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
