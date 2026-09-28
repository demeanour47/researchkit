import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { TEST_FINDER_LIMITATIONS } from "@/knowledge/research/test-finder";
import { how, page } from "./copy";
import { FinderReference } from "./finder-reference";
import { TestFinderForm } from "./finder-form";
import { TOOL_ID } from "./path";

/** The Statistical Test Finder page: the shared tool layout around the finder and its reference material. */
export function StatisticalTestFinder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: TEST_FINDER_LIMITATIONS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <TestFinderForm />
      <FinderReference />
    </ToolPageLayout>
  );
}
