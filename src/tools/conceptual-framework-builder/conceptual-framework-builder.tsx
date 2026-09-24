import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { FRAMEWORK_LIMITATIONS, FRAMEWORK_REVIEW_ITEMS } from "@/knowledge/research";
import { how, layoutRules, page } from "./copy";
import { FrameworkBuilderForm } from "./framework-builder-form";
import { TOOL_ID } from "./path";

/** The Conceptual Framework Builder page: the shared tool layout around the builder. */
export function ConceptualFrameworkBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "layout", heading: page.layoutHeading, items: layoutRules },
        { id: "limits", heading: page.limitsHeading, items: FRAMEWORK_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: FRAMEWORK_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <FrameworkBuilderForm />
    </ToolPageLayout>
  );
}
