import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { about, fitGuide, limits, page } from "./copy";
import { OnionExplorer } from "./onion-explorer";
import { TOOL_ID } from "./path";

/** The Research Onion Explorer page: the shared tool layout around the explorer. */
export function ResearchOnion() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "about", heading: page.aboutHeading, items: about },
        { id: "fits", heading: page.fitsHeading, items: fitGuide, aside: { heading: page.limitsHeading, items: limits } },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <OnionExplorer />
    </ToolPageLayout>
  );
}
