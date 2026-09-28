import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { TOOL_PATH as RESULTS_PATH } from "@/tools/results-interpretation/path";
import { TOOL_PATH as TEST_FINDER_PATH } from "@/tools/statistical-test-finder/path";
import { ToolPageLayout } from "@/features/tool";
import { page } from "./copy";
import { CalculatorForm } from "./calculator-form";
import { TOOL_ID } from "./path";

export function EffectSizeCalculator() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      sections={[
        { id: "limits", heading: page.limitationsHeading, items: page.limitations },
        { id: "review", heading: page.reviewHeading, items: page.review },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <CalculatorForm />
      <section aria-labelledby="effect-next-title" className="grid gap-4 border-t border-border py-8">
        <h2 id="effect-next-title" className="text-heading font-semibold">Continue your analysis</h2>
        <ul className="grid gap-2">
          <li><a className="text-action underline underline-offset-4 focus-ring" href={TEST_FINDER_PATH}>Choose a statistical test</a></li>
          <li><a className="text-action underline underline-offset-4 focus-ring" href={RESULTS_PATH}>Interpret results already reported by your software</a></li>
        </ul>
      </section>
    </ToolPageLayout>
  );
}