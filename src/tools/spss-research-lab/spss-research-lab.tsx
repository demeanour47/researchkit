import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { page } from "./copy";
import { LabFlow } from "./lab-flow";
import { TOOL_ID } from "./path";

export function SpssResearchLab() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "started", heading: page.installHeading, text: page.installText },
        { id: "preparation", heading: page.foundationsHeading, items: page.foundations },
        { id: "interpretation", heading: page.outputHeading, text: page.outputText },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <LabFlow />
    </ToolPageLayout>
  );
}