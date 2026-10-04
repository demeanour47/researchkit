import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath, stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { ChicagoGeneratorForm } from "./chicago-generator-form";
import { limits, page, rules } from "./copy";
import { TOOL_ID } from "./path";

/** The guide that explains the rules this tool applies. */
export const CHICAGO_AUTHOR_DATE_GUIDE_SLUG = "chicago-author-date-citations";

/** The Chicago Author-Date Citation Generator page: the shared tool layout around the generator form. */
export function ChicagoAuthorDateCitationGenerator() {
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
            { label: page.learnLink, href: guidePath(CHICAGO_AUTHOR_DATE_GUIDE_SLUG) },
            { label: page.styleLink, href: stylePath("chicago") },
          ],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ChicagoGeneratorForm />
    </ToolPageLayout>
  );
}
