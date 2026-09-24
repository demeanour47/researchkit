import { PageContainer, Section, VisuallyHidden } from "@/ui";
import { parseAnswers, recommendStyle } from "@/knowledge/citation/style-finder";
import { missingLabels, page, statusText } from "./copy";
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

  return (
    <PageContainer width="reading">
      <Section labelledBy="tool-title" spacing="compact">
        <div className="grid gap-4">
          <h1 id="tool-title" className="font-display text-title font-semibold text-balance">
            {page.title}
          </h1>
          <p className="text-lead text-text-muted">{page.intro}</p>
        </div>
      </Section>

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
        <div className="rounded-panel border border-border-control bg-surface p-4">
          <p className="font-semibold">{page.missingIntro}</p>
          <ul className="mt-2 list-disc ps-6">
            {missing.map((key) => (
              <li key={key}>{missingLabels[key]}</li>
            ))}
          </ul>
        </div>
      )}

      <Section labelledBy="form-title" spacing="compact">
        <h2 id="form-title" className="mb-6 text-heading font-semibold">
          {recommendation ? page.changeHeading : page.formHeading}
        </h2>
        <StyleFinderForm answers={answers ?? {}} />
      </Section>
    </PageContainer>
  );
}
