import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { QUESTIONNAIRE_LIMITATIONS, QUESTIONNAIRE_REVIEW_ITEMS } from "@/knowledge/research";
import { how, page } from "./copy";
import { Guide } from "./guide";
import { TOOL_ID } from "./path";
import { QuestionnaireForm } from "./questionnaire-form";

/** The Questionnaire Builder page: the shared tool layout around the builder, with the guide rendered on the server. */
export function QuestionnaireBuilder() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how },
        { id: "limits", heading: page.limitsHeading, items: QUESTIONNAIRE_LIMITATIONS },
        { id: "review", heading: page.reviewHeading, items: QUESTIONNAIRE_REVIEW_ITEMS },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <QuestionnaireForm guide={<Guide />} />
    </ToolPageLayout>
  );
}
