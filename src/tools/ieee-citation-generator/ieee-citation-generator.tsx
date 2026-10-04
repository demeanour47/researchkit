import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath, stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { limits, page, rules } from "./copy";
import { IeeeGeneratorForm } from "./ieee-generator-form";
import { TOOL_ID } from "./path";

/** The guide that explains the rules this tool applies. */
export const IEEE_GUIDE_SLUG = "ieee-citations-and-references";

/** The IEEE Citation Generator page: the shared tool layout around the generator form. */
export function IeeeCitationGenerator() {
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
          links: [
            { label: page.learnLink, href: guidePath(IEEE_GUIDE_SLUG) },
            { label: page.styleLink, href: stylePath("ieee") },
          ],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <IeeeGeneratorForm />
    </ToolPageLayout>
  );
}
