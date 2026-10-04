import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { PRIVACY_NOTICE } from "@/features/text-analysis";
import { ToolPageLayout } from "@/features/tool";
import { guidance, limits, method, page } from "./copy";
import { ReadabilityCheckerInput } from "./readability-checker-input";
import { TOOL_ID } from "./path";

/** The guide that explains each formula, its sources and its limits. */
export const READABILITY_GUIDE_SLUG = "readability-in-academic-writing";

/** The Readability Checker page: the shared tool layout around the live checker and its explanation. */
export function ReadabilityChecker() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "method", heading: page.methodHeading, items: method, aside: { heading: page.limitsHeading, items: limits } },
        { id: "about", heading: page.guidanceHeading, items: guidance, links: [{ label: page.learnLink, href: guidePath(READABILITY_GUIDE_SLUG) }] },
        { id: "privacy", heading: page.privacyHeading, text: PRIVACY_NOTICE },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ReadabilityCheckerInput />
    </ToolPageLayout>
  );
}
