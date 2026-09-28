import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { TITLE_LIMITATIONS } from "@/knowledge/research/title";
import { categoriesAbout, how, page } from "./copy";
import { TOOL_ID } from "./path";
import { TitleBuilderForm } from "./title-builder-form";

/** The Research Title Builder page: the shared tool layout around the builder. */
export function ResearchTitleBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "rules", heading: page.categoriesHeading, items: categoriesAbout },
        { id: "limits", heading: page.limitsHeading, items: TITLE_LIMITATIONS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <TitleBuilderForm />
    </ToolPageLayout>
  );
}
