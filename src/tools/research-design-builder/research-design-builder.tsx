import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { DESIGN_LIMITATIONS, DESIGN_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { DesignBuilderForm } from "./design-builder-form";
import { DesignGuide } from "./design-guide";
import { TOOL_ID } from "./path";

/** The Research Design Builder page: the shared tool layout around the builder, with the design guide rendered on the server. */
export function ResearchDesignBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: DESIGN_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: DESIGN_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <DesignBuilderForm guide={<DesignGuide />} />
    </ToolPageLayout>
  );
}
