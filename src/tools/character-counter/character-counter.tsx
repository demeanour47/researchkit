import { GUIDES_INDEX_PATH, guidesForTool, relatedTools } from "@/domains/catalogue";
import { PRIVACY_NOTICE, TextToolPage } from "@/features/text-analysis";
import { announcedResults, guidance, limits, page, rules, shownResults } from "./copy";
import { TOOL_ID } from "./path";

/** The Character Counter page: the shared text-tool layout with this tool's results and explanation. */
export function CharacterCounter() {
  return (
    <TextToolPage
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      input={{
        label: page.inputLabel,
        hint: page.inputHint,
        placeholder: page.inputPlaceholder,
        resultsHeading: page.countsHeading,
        fields: shownResults,
        announced: announcedResults,
        emptyState: { icon: "keyboard", title: page.emptyTitle, description: page.emptyDescription },
        actions: { copySubject: page.copySubject, clearLabel: page.clearLabel },
      }}
      sections={[
        { id: "rules", heading: page.rulesHeading, items: rules, aside: { heading: page.limitsHeading, items: limits } },
        { id: "guidance", heading: page.guidanceHeading, items: guidance },
        { id: "privacy", heading: page.privacyHeading, text: PRIVACY_NOTICE },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      browseGuides={{ ...page.browseGuides, href: GUIDES_INDEX_PATH }}
      relatedTools={relatedTools(TOOL_ID)}
    />
  );
}
