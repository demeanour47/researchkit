import { Tag } from "@/ui";
import { CHECK_STATUS_LABELS, pairLabel, type CheckStatus, type HypothesisEvaluation, type HypothesisSet } from "@/knowledge/research";
import { steps } from "./copy";

/** Visual emphasis only; every status is also written out in words. */
const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = {
  aligned: "info",
  review: "neutral",
  "worth-checking": "caution",
  missing: "caution",
  clarify: "caution",
};

/** The methodology notes and every check for every pair, each with its reason. */
export function HypothesisEvaluationView({ set, evaluation }: { set: HypothesisSet; evaluation: HypothesisEvaluation }) {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.evaluationIntro}</p>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.methodologyFit}</h3>
        <ul className="grid gap-3">
          {evaluation.methodology.map((note) => (
            <li key={note.choice} className="grid gap-1 rounded-panel border border-border p-4">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{note.choice}</span> <Tag tone={tones[note.status]}>{CHECK_STATUS_LABELS[note.status]}</Tag>
              </p>
              <p>{note.text}</p>
              <p className="text-small text-text-muted">
                <span className="font-medium text-foreground">{steps.why}</span> {note.why}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {evaluation.pairs.map((pair, index) => {
        const relationship = set.pairs.find((candidate) => candidate.id === pair.pairId)!.relationship;
        return (
          <div key={pair.pairId} className="grid gap-3">
            <h3 className="text-subheading font-semibold">{steps.pairHeading(index + 1, pairLabel(relationship))}</h3>
            <ul className="grid gap-2">
              {pair.checks.map((check) => (
                <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
                  </p>
                  <p className="text-small text-text-muted">{check.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
