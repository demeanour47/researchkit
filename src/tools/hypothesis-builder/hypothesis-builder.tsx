import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { HYPOTHESIS_BUILDER_LIMITATIONS, HYPOTHESIS_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { HypothesisBuilderForm } from "./hypothesis-builder-form";
import { TOOL_ID } from "./path";
import { TypeGuide } from "./type-guide";

/** The Hypothesis Builder page: the shared tool layout around the builder, with the type guide rendered on the server. */
export function HypothesisBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: HYPOTHESIS_BUILDER_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: HYPOTHESIS_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <HypothesisBuilderForm typeGuide={<TypeGuide />} />
    </ToolPageLayout>
  );
}
