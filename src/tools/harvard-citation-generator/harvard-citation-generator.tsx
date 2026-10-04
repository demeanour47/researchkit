import { Callout } from "@/ui";
import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath, stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { HarvardGeneratorForm } from "./harvard-generator-form";
import { limits, page, rules } from "./copy";
import { TOOL_ID } from "./path";

/** The guide that explains the rules this tool applies. */
export const HARVARD_GUIDE_SLUG = "harvard-citations-and-references";

/**
 * The Harvard Citation Generator page: the shared tool layout around the generator
 * form. The profile notice is rendered on the server, so it is shown even without JavaScript.
 */
export function HarvardCitationGenerator() {
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
            { label: page.learnLink, href: guidePath(HARVARD_GUIDE_SLUG) },
            { label: page.styleLink, href: stylePath("harvard") },
          ],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <div className="grid min-w-0 gap-8">
        <Callout tone="info" title={page.profileTitle}>
          {page.profileNotice}
        </Callout>
        <HarvardGeneratorForm />
      </div>
    </ToolPageLayout>
  );
}
