import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { PRIVACY_NOTICE } from "@/features/text-analysis";
import { ToolPageLayout } from "@/features/tool";
import { guidance, limits, page, rules } from "./copy";
import { ParagraphCounterInput } from "./paragraph-counter-input";
import { TOOL_ID } from "./path";

/** The guide that teaches paragraph structure and how the counter counts. */
export const PARAGRAPH_GUIDE_SLUG = "paragraph-structure-and-counting";

/** The Paragraph Counter page: the shared tool layout around the live counter and its explanation. */
export function ParagraphCounter() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "rules", heading: page.rulesHeading, items: rules, aside: { heading: page.limitsHeading, items: limits } },
        { id: "about", heading: page.guidanceHeading, items: guidance, links: [{ label: page.learnLink, href: guidePath(PARAGRAPH_GUIDE_SLUG) }] },
        { id: "privacy", heading: page.privacyHeading, text: PRIVACY_NOTICE },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ParagraphCounterInput />
    </ToolPageLayout>
  );
}
