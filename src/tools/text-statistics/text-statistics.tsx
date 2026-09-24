import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { PRIVACY_NOTICE, TextToolPage } from "@/features/text-analysis";
import { announcedResults, limits, method, page, pageNotes, shownResults } from "./copy";
import { TOOL_ID } from "./path";

/** The Text Statistics page: the shared text-tool layout with this tool's results and explanation. */
export function TextStatistics() {
  return (
    <TextToolPage
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      input={{
        label: page.inputLabel,
        hint: page.inputHint,
        resultsHeading: page.resultsHeading,
        fields: shownResults,
        notes: pageNotes,
        announced: announcedResults,
      }}
      sections={[
        { id: "method", heading: page.methodHeading, items: method, aside: { heading: page.limitsHeading, items: limits } },
        { id: "privacy", heading: page.privacyHeading, text: PRIVACY_NOTICE },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    />
  );
}
