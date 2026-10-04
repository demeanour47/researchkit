import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { TOOL_PATH as EFFECT_SIZE_CALCULATOR_PATH } from "@/tools/effect-size-calculator/path";
import { TOOL_PATH as POWER_ANALYSIS_PATH } from "@/tools/power-analysis/path";
import { how, limits, page } from "./copy";
import { ConfidenceIntervalForm } from "./confidence-interval-form";
import { TOOL_ID } from "./path";

/** The guide that explains confidence intervals and each method. */
export const CONFIDENCE_INTERVALS_GUIDE_SLUG = "confidence-intervals";

/** The Confidence Interval Calculator page: the shared tool layout around the calculator and its explanation. */
export function ConfidenceIntervalCalculator() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        {
          id: "how",
          heading: page.howHeading,
          items: how,
          links: [
            { label: page.learnLink, href: guidePath(CONFIDENCE_INTERVALS_GUIDE_SLUG) },
            { label: "Measure the size of an effect", href: EFFECT_SIZE_CALCULATOR_PATH },
            { label: "Plan a sample size before collecting data", href: POWER_ANALYSIS_PATH },
          ],
        },
        { id: "limits", heading: page.limitsHeading, items: limits },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ConfidenceIntervalForm />
    </ToolPageLayout>
  );
}
