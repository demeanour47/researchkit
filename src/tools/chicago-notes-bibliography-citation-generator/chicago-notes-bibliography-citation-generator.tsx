import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath, stylePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { limits, page, rules } from "./copy";
import { NotesBibliographyForm } from "./notes-bibliography-form";
import { TOOL_ID } from "./path";

/** The guide that explains the rules this tool applies. */
export const CHICAGO_NOTES_BIBLIOGRAPHY_GUIDE_SLUG = "chicago-notes-bibliography";

/** The Chicago Notes and Bibliography Citation Generator page: the shared tool layout around the generator form. */
export function ChicagoNotesBibliographyCitationGenerator() {
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
            { label: page.learnLink, href: guidePath(CHICAGO_NOTES_BIBLIOGRAPHY_GUIDE_SLUG) },
            { label: page.styleLink, href: stylePath("chicago") },
          ],
        },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <NotesBibliographyForm />
    </ToolPageLayout>
  );
}
