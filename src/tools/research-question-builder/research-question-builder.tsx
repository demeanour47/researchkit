import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { QUESTION_BUILDER_LIMITATIONS } from "@/knowledge/research";
import { finerAbout, how, page } from "./copy";
import { QuestionBuilderForm } from "./question-builder-form";
import { TOOL_ID } from "./path";

/** The Research Question Builder page: the shared tool layout around the builder. */
export function ResearchQuestionBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: QUESTION_BUILDER_LIMITATIONS },
        { id: "finer", heading: page.finerHeading, items: finerAbout },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <QuestionBuilderForm />
    </ToolPageLayout>
  );
}
