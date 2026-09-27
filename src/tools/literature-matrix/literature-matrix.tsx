import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { LITERATURE_LIMITATIONS, LITERATURE_REVIEW_ITEMS } from "@/knowledge/literature";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { MatrixBuilder } from "./matrix-builder";
import { TOOL_ID } from "./path";

/** The Literature Matrix Builder page: the shared tool layout, a client builder for the matrix, and the guide to its columns rendered on the server. */
export function LiteratureMatrix() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: LITERATURE_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: LITERATURE_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <MatrixBuilder guide={<Guide />} />
    </ToolPageLayout>
  );
}
