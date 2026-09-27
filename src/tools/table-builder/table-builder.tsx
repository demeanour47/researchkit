import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { TABLE_LIMITATIONS, TABLE_REVIEW_ITEMS } from "@/knowledge/tables";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";
import { TableBuilderForm } from "./table-builder-form";

/** The Research Table Builder page: the shared tool layout, a client form that builds the table, and the guide to every table type rendered on the server. */
export function TableBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: TABLE_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: TABLE_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <TableBuilderForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
