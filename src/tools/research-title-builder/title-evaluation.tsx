import { Badge, Card, Callout } from "@/ui";
import { ReferenceList } from "@/features/research/reference-list";
import { getReference } from "@/knowledge/research/references";
import { CRITERION_STATUS_LABELS, TITLE_CATEGORY_LABELS, TITLE_CATEGORY_MEANINGS, type TitleEvaluation } from "@/knowledge/research/title";
import { steps } from "./copy";
import { CATEGORY_STYLE, CRITERION_STYLE } from "./status-style";

/** The working title's rating, its pattern, and every criterion with its reasons. */
export function TitleEvaluationView({ evaluation }: { evaluation: TitleEvaluation }) {
  const category = CATEGORY_STYLE[evaluation.category];
  const references = [...new Set(evaluation.criteria.flatMap((criterion) => criterion.references))].map(getReference).sort((a, b) => a.apa.localeCompare(b.apa));
  const others = evaluation.analysis.patterns.filter((match) => match !== evaluation.pattern);

  return (
    <div className="grid gap-6">
      <Card tone="raised" padding="lg" className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-heading-sm font-semibold">{steps.category}</h3>
          <Badge tone={category.tone} icon={category.icon} className="text-small">
            {TITLE_CATEGORY_LABELS[evaluation.category]}
          </Badge>
        </div>
        <p>{evaluation.categoryReason}</p>
        <p className="text-small text-text-muted">{TITLE_CATEGORY_MEANINGS[evaluation.category]}</p>
      </Card>

      <section aria-labelledby="title-pattern-title" className="grid gap-2">
        <h3 id="title-pattern-title" className="text-subheading font-semibold">
          {steps.pattern}
        </h3>
        {evaluation.pattern ? (
          <>
            <p>
              <span className="font-semibold">{evaluation.pattern.pattern.name}</span> (“{evaluation.pattern.wording}”). {evaluation.pattern.pattern.explanation}
            </p>
            {others.length > 0 && (
              <p className="text-small text-text-muted">
                {steps.alsoFollows}: {others.map((match) => `${match.pattern.name} (“${match.wording}”)`).join("; ")}.
              </p>
            )}
          </>
        ) : (
          <Callout tone="note">{steps.noPattern}</Callout>
        )}
      </section>

      <section aria-labelledby="title-criteria-title" className="grid gap-3">
        <h3 id="title-criteria-title" className="text-subheading font-semibold">
          {steps.criteria}
        </h3>
        <ul className="grid gap-3">
          {evaluation.criteria.map((criterion) => {
            const style = CRITERION_STYLE[criterion.status];
            return (
              <li key={criterion.id} className="grid gap-1.5 rounded-panel border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-heading-sm font-semibold">{criterion.label}</h4>
                  <Badge tone={style.tone} icon={style.icon}>
                    {CRITERION_STATUS_LABELS[criterion.status]}
                  </Badge>
                </div>
                <p>{criterion.finding}</p>
                <p className="text-small text-text-muted">
                  <span className="font-medium text-text">{steps.why}:</span> {criterion.why}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="title-references-title" className="grid gap-3">
        <h3 id="title-references-title" className="text-subheading font-semibold">
          {steps.references}
        </h3>
        <ReferenceList references={references} />
      </section>
    </div>
  );
}
