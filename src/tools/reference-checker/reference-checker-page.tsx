import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { page } from "./copy";
import { ReferenceCheckerForm } from "./reference-checker";
import { TOOL_ID } from "./path";

/** The guide that explains what the checker checks in each style. */
export const REFERENCE_CHECKER_GUIDE_SLUG = "reference-checker";

export function ReferenceChecker() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        {
          id: "how",
          heading: page.howHeading,
          items: page.how,
          links: [
            { label: page.learnLink, href: guidePath(REFERENCE_CHECKER_GUIDE_SLUG) },
            { label: page.finderLink, href: "/tools/citation-style-finder" },
          ],
        },
        { id: "limits", heading: page.limitsHeading, items: page.limits },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ReferenceCheckerForm />
    </ToolPageLayout>
  );
}
