import { Tag } from "@/ui";
import { CHECK_STATUS_LABELS, type CheckStatus, type ObjectiveCheck, type ObjectiveEvaluation } from "@/knowledge/research";
import { evaluation } from "./copy";

/** Visual emphasis only; every status is also written out in words. */
const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = {
  aligned: "info",
  review: "neutral",
  "worth-checking": "caution",
  missing: "caution",
  clarify: "caution",
};

function CheckList({ checks }: { checks: readonly ObjectiveCheck[] }) {
  return (
    <ul className="grid gap-2">
      {checks.map((check) => (
        <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
          </p>
          <p className="text-small text-text-muted">{check.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

/** Every check for the general objective, the specific objectives as a set, and each specific objective on its own. */
export function ObjectivesEvaluationView({ result }: { result: ObjectiveEvaluation }) {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{evaluation.intro}</p>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{evaluation.generalHeading}</h3>
        <CheckList checks={result.general} />
      </div>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{evaluation.specificOverallHeading}</h3>
        <CheckList checks={result.specificOverall} />
      </div>
      {result.specific.map((entry, index) => (
        <div key={index} className="grid gap-3">
          <h3 className="text-subheading font-semibold">{evaluation.specificHeading(index + 1)}</h3>
          <CheckList checks={entry.checks} />
        </div>
      ))}
    </div>
  );
}
