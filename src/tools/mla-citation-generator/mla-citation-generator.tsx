import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath, stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { limits, page, rules } from "./copy";
import { MlaGeneratorForm } from "./mla-generator-form";
import { TOOL_ID } from "./path";

/** The guide that explains the rules this tool applies. */
export const MLA_GUIDE_SLUG = "mla-9-citations-and-works-cited";

/** The MLA Citation Generator page: the shared tool layout around the generator form. */
export function MlaCitationGenerator() {
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
            { label: page.learnLink, href: guidePath(MLA_GUIDE_SLUG) },
            { label: page.styleLink, href: stylePath("mla") },
          ],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <MlaGeneratorForm />
    </ToolPageLayout>
  );
}
