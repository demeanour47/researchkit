import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { SAMPLING_LIMITATIONS, SAMPLING_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";
import { SamplingBuilderForm } from "./sampling-builder-form";

/** The Sampling Technique Builder page: the shared tool layout around the builder, with the guide rendered on the server. */
export function SamplingBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: SAMPLING_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: SAMPLING_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <SamplingBuilderForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
