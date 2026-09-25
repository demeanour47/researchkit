import { Tag } from "@/ui";
import { LearnMore } from "@/features/research";
import { STRENGTH_LABELS, getAnalysisMethod, type AnalysisPlan, type Recommendation, type RecommendationStrength } from "@/knowledge/research";
import { steps } from "./copy";

const tones: Record<RecommendationStrength, "info" | "neutral" | "caution"> = { strong: "info", possible: "neutral", justify: "caution" };

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-1 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** One method: its verdict in words, and behind a disclosure, why it suits and what to check. */
function RecommendationItem({ recommendation }: { recommendation: Recommendation }) {
  const method = getAnalysisMethod(recommendation.method);
  return (
    <li className="grid gap-2 border-s-2 border-border ps-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{method.name}</span> <Tag tone={tones[recommendation.strength]}>{STRENGTH_LABELS[recommendation.strength]}</Tag>
      </p>
      <p className="text-small">{recommendation.reasons[0]}</p>
      {recommendation.strength === "justify" && recommendation.justify && (
        <p className="text-small">
          <span className="font-medium">{steps.justify}:</span> {recommendation.justify}
        </p>
      )}
      <LearnMore label={steps.details(method.name)}>
        <div className="grid gap-1">
          <h5 className="font-semibold">{steps.why}</h5>
          <List items={recommendation.reasons} />
        </div>
        {recommendation.basedOn.length > 0 && (
          <div className="grid gap-1">
            <h5 className="font-semibold">{steps.basedOn}</h5>
            <List items={recommendation.basedOn} />
          </div>
        )}
        {recommendation.justify && recommendation.strength !== "justify" && (
          <div className="grid gap-1">
            <h5 className="font-semibold">{steps.justify}</h5>
            <p>{recommendation.justify}</p>
          </div>
        )}
        {recommendation.fallback && (
          <div className="grid gap-1">
            <h5 className="font-semibold">{steps.fallback}</h5>
            <p>{getAnalysisMethod(recommendation.fallback).name}</p>
          </div>
        )}
        <div className="grid gap-1">
          <h5 className="font-semibold">{steps.assumptions}</h5>
          <List items={method.assumptions} />
        </div>
      </LearnMore>
    </li>
  );
}

/** The analysis plan: what it rests on, the methods at a glance, each stage's questions, and notes. */
export function PlanView({ plan }: { plan: AnalysisPlan }) {
  const { profile } = plan;
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h3 className="text-subheading font-semibold">{steps.basedOnHeading}</h3>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {[
            [steps.choiceLabel, profile.choice === "unknown" ? steps.notRecorded : profile.choice],
            [steps.designLabel, profile.design?.name ?? steps.notRecorded],
            [steps.repeatedLabel, profile.repeated ? `${steps.yes} (${profile.repeatedSource})` : steps.no],
            [steps.sampleLabel, profile.sampleSize === null ? steps.notRecorded : String(profile.sampleSize)],
            ...profile.variables.map((variable) => [`${variable.name} (${variable.kind})`, variable.source]),
          ].map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="font-medium">{term}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {plan.overview.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-subheading font-semibold">{steps.overview}</h3>
          <p className="text-small text-text-muted">{steps.overviewIntro}</p>
          <ul className="flex flex-wrap gap-2">
            {plan.overview.map((entry) => (
              <li key={entry.method}>
                <Tag tone={tones[entry.strength]}>{`${getAnalysisMethod(entry.method).name}: ${STRENGTH_LABELS[entry.strength]}`}</Tag>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.stages.map((stage, index) => (
        <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="grid gap-4">
          <h3 id={`stage-${stage.id}`} className="text-subheading font-semibold">
            {`${index + 1}. ${stage.title}`}
          </h3>
          {stage.notes.map((note) => (
            <p key={note} className="text-text-muted">
              {note}
            </p>
          ))}
          {stage.questions.map((question) => (
            <div key={question.id} className="grid gap-3 rounded-panel border border-border p-4">
              <h4 className="font-semibold">{question.title}</h4>
              {question.hypothesis && <p className="italic">{question.hypothesis}</p>}
              {question.notes.map((note) => (
                <p key={note} className="text-small text-text-muted">
                  {note}
                </p>
              ))}
              {question.recommendations.length > 0 && (
                <ul className="grid gap-4">
                  {question.recommendations.map((recommendation) => (
                    <RecommendationItem key={recommendation.method} recommendation={recommendation} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}

      {plan.notes.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-subheading font-semibold">{steps.notes}</h3>
          <List items={plan.notes} />
        </div>
      )}
    </div>
  );
}
