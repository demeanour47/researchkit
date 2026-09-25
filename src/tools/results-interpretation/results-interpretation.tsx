import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { RESULTS_LIMITATIONS, RESULTS_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { InterpretationForm } from "./interpretation-form";
import { TOOL_ID } from "./path";

/** The Results Interpretation Assistant page: the shared tool layout around a small client form, with the guide rendered on the server. */
export function ResultsInterpretation() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: RESULTS_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: RESULTS_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <InterpretationForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
