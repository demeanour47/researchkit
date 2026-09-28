import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { OBJECTIVES_GENERATOR_LIMITATIONS } from "@/knowledge/research";
import { how, page } from "./copy";
import { ObjectivesGeneratorForm } from "./objectives-generator-form";
import { TOOL_ID } from "./path";

/** The Research Objectives Generator page: the shared tool layout around the generator. */
export function ResearchObjectivesGenerator() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: OBJECTIVES_GENERATOR_LIMITATIONS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ObjectivesGeneratorForm />
    </ToolPageLayout>
  );
}
