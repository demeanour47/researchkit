import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { guidePath } from "@/domains/publishing";
import { ToolPageLayout } from "@/features/tool";
import { how, limits, page } from "./copy";
import { PowerAnalysisForm } from "./power-analysis-form";
import { TOOL_ID } from "./path";

/** The guide that explains power, effect sizes and each method. */
export const POWER_GUIDE_SLUG = "power-analysis";

/** The Power Analysis page: the shared tool layout around the calculator and its explanation. */
export function PowerAnalysis() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: how, links: [{ label: page.learnLink, href: guidePath(POWER_GUIDE_SLUG) }, { label: "Choose a statistical test", href: "/tools/statistical-test-finder" }, { label: "Calculate an effect size", href: "/tools/effect-size-calculator" }] },
        { id: "limits", heading: page.limitsHeading, items: limits },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <PowerAnalysisForm />
    </ToolPageLayout>
  );
}
