import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { Explorer } from "./explorer";
import { how, limits, method, page, privacy } from "./copy";
import { TOOL_ID } from "./path";

/** The Literature Explorer page: the shared tool layout around a client search. Cross-family tools are linked explicitly. */
export function LiteratureExplorer() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        {
          id: "how",
          heading: page.howHeading,
          items: how,
          links: [
            { label: "How to search academic literature", href: "/learn/how-to-search-academic-literature" },
            { label: "APA 7 Citation & Reference Builder", href: "/tools/apa-citation-generator" },
            { label: "MLA 9 Citation Generator", href: "/tools/mla-citation-generator" },
            { label: "Reference Checker", href: "/tools/reference-checker" },
          ],
        },
        { id: "method", heading: page.methodHeading, items: method },
        { id: "limits", heading: page.limitsHeading, items: limits },
        { id: "privacy", heading: page.privacyHeading, text: privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <Explorer />
    </ToolPageLayout>
  );
}
