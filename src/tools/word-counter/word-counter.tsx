import { GUIDES_INDEX_PATH, guidesForTool, relatedTools } from "@/domains/catalogue";
import { TextToolPage } from "@/features/text-analysis";
import { announcedResults, limits, page, rules, shownResults } from "./copy";
import { TOOL_ID } from "./path";

/** The Word Counter page: the shared text-tool layout with this tool's results and explanation. */
export function WordCounter() {
  return (
    <TextToolPage
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      input={{
        label: page.inputLabel,
        hint: page.inputHint,
        resultsHeading: page.countsHeading,
        fields: shownResults,
        announced: announcedResults,
      }}
      sections={[{ id: "rules", heading: page.rulesHeading, items: rules, aside: { heading: page.limitsHeading, items: limits } }]}
      relatedGuides={guidesForTool(TOOL_ID)}
      browseGuides={{ ...page.browseGuides, href: GUIDES_INDEX_PATH }}
      relatedTools={relatedTools(TOOL_ID)}
    />
  );
}
