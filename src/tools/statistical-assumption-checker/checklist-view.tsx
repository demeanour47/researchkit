import { Tag } from "@/ui";
import { ASSUMPTIONS, CHECK_STATUS_LABELS, STRENGTH_LABELS, getAnalysisMethod, type AssumptionChecklist, type CheckStatus } from "@/knowledge/research";
import { steps } from "./copy";

const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = { aligned: "info", review: "neutral", "worth-checking": "caution", missing: "caution", clarify: "caution" };

/** The project's checklist: each planned analysis, and each of its assumptions with what the project shows. */
export function ChecklistView({ checklist }: { checklist: AssumptionChecklist }) {
  return (
    <div className="grid gap-6">
      {checklist.methods.map((method) => {
        const name = getAnalysisMethod(method.method).name;
        return (
          <section key={method.method} aria-labelledby={`check-${method.method}`} className="grid gap-3 rounded-panel border border-border p-4">
            <div className="grid gap-1">
              <h3 id={`check-${method.method}`} className="flex flex-wrap items-center gap-2 text-subheading font-semibold">
                {name} <Tag>{STRENGTH_LABELS[method.strength]}</Tag>
              </h3>
              <p className="text-small text-text-muted">{steps.forQuestions(method.questions.join(", "))}</p>
            </div>
            <ul className="grid gap-3">
              {method.items.map((item) => (
                <li key={item.assumption} className="grid gap-1 border-s-2 border-border ps-4">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{ASSUMPTIONS[item.assumption].name}</span> <Tag tone={tones[item.status]}>{CHECK_STATUS_LABELS[item.status]}</Tag>
                  </p>
                  <p className="text-small">{item.note}</p>
                  {item.basedOn.length > 0 && (
                    <p className="text-small text-text-muted">
                      {steps.basedOn}: {item.basedOn.join("; ")}
                    </p>
                  )}
                  <p className="text-small">
                    <a href={`#method-${method.method}`} className="underline focus-ring">
                      {steps.howToCheck(ASSUMPTIONS[item.assumption].name)}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {checklist.notes.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-subheading font-semibold">{steps.notes}</h3>
          <ul className="grid list-disc gap-1 ps-6">
            {checklist.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
