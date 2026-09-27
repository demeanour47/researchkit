import { Callout, Section, VisuallyHidden } from "@/ui";
import { parseAnswers, recommendStyle } from "@/knowledge/citation/style-finder";
import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { missingLabels, page, statusText } from "./copy";
import { TOOL_ID } from "./path";
import { StyleFinderForm } from "./style-finder-form";
import { StyleRecommendationView } from "./style-recommendation";

export interface CitationStyleFinderProps {
  /** Raw, untrusted URL search parameters. */
  params: Record<string, string | string[] | undefined>;
}

/**
 * The complete tool. Once answers are submitted the result comes first, followed
 * by the form, pre-filled, so answers can be changed.
 */
export function CitationStyleFinder({ params }: CitationStyleFinderProps) {
  const { answers, missing, submitted } = parseAnswers(params);
  const recommendation = answers ? recommendStyle(answers) : null;
  const relatedGuides = guidesForTool(TOOL_ID);
  const tools = relatedTools(TOOL_ID);

  return (
    <ToolPageLayout title={page.title} intro={page.intro} relatedGuides={relatedGuides} relatedTools={tools}>
      <VisuallyHidden role="status">
        {recommendation
          ? statusText(recommendation)
          : missing.length > 0 && `${page.missingIntro} ${missing.map((key) => missingLabels[key]).join(" ")}`}
      </VisuallyHidden>

      {recommendation && (
        <Section labelledBy="result-title" spacing="compact">
          <StyleRecommendationView
            recommendation={recommendation}
            headingId="result-title"
            heading={page.resultHeading}
          />
          <p className="mt-6 text-small text-text-muted">
            {page.precedence} {page.reviewStatus}
          </p>
        </Section>
      )}

      {submitted && missing.length > 0 && (
        <Callout tone="caution" title={page.missingIntro}>
          <ul className="list-disc ps-6">
            {missing.map((key) => (
              <li key={key}>{missingLabels[key]}</li>
            ))}
          </ul>
        </Callout>
      )}

      <Section labelledBy="form-title" spacing="compact">
        <h2 id="form-title" className="mb-6 text-heading font-semibold">
          {recommendation ? page.changeHeading : page.formHeading}
        </h2>
        <StyleFinderForm answers={answers ?? {}} />
      </Section>
    </ToolPageLayout>
  );
}
