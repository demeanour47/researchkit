import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { PRISMA_LIMITATIONS, PRISMA_REVIEW_ITEMS } from "@/knowledge/prisma";
import { how, page } from "./copy";
import { FlowBuilder } from "./flow-builder";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";

/** The PRISMA Flow Diagram Builder page: the shared tool layout, a client builder for the diagram, and the guide rendered on the server. */
export function PrismaFlowBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: PRISMA_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: PRISMA_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <FlowBuilder guide={<Guide />} />
    </ToolPageLayout>
  );
}
