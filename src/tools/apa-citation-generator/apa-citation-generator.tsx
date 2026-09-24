import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { ApaGeneratorForm } from "./apa-generator-form";
import { limits, page, rules } from "./copy";
import { TOOL_ID } from "./path";

/** The APA Citation Generator page: the shared tool layout around the generator form. */
export function ApaCitationGenerator() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        {
          id: "rules",
          heading: page.rulesHeading,
          items: rules,
          aside: { heading: page.limitsHeading, items: limits },
          links: [{ label: page.styleLink, href: stylePath("apa") }],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ApaGeneratorForm />
    </ToolPageLayout>
  );
}
