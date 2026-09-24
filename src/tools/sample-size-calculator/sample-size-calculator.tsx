import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { SAMPLE_SIZE_LIMITATIONS, SAMPLE_SIZE_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";
import { SampleSizeForm } from "./sample-size-form";

/** The Sample Size Calculator page: the shared tool layout around the calculator, with the guide rendered on the server. */
export function SampleSizeCalculator() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: SAMPLE_SIZE_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: SAMPLE_SIZE_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <SampleSizeForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
