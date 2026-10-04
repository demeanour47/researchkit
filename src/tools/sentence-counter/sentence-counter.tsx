import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { PRIVACY_NOTICE } from "@/features/text-analysis";
import { ToolPageLayout } from "@/features/tool";
import { guidance, limits, page, rules } from "./copy";
import { SentenceCounterInput } from "./sentence-counter-input";
import { TOOL_ID } from "./path";

/** The guide that teaches sentence structure and how the counter finds sentences. */
export const SENTENCE_GUIDE_SLUG = "sentence-structure-and-counting";

/** The Sentence Counter page: the shared tool layout around the live counter and its explanation. */
export function SentenceCounter() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "rules", heading: page.rulesHeading, items: rules, aside: { heading: page.limitsHeading, items: limits } },
        { id: "about", heading: page.guidanceHeading, items: guidance, links: [{ label: page.learnLink, href: guidePath(SENTENCE_GUIDE_SLUG) }] },
        { id: "privacy", heading: page.privacyHeading, text: PRIVACY_NOTICE },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <SentenceCounterInput />
    </ToolPageLayout>
  );
}
