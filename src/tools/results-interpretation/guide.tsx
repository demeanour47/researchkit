import { LearnMore } from "@/features/research";
import { COMMON_MISTAKES, RESULT_FIELDS, RESULT_KINDS, getAnalysisMethod } from "@/knowledge/research";
import { steps } from "./copy";

/** Every kind of result the assistant interprets, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-6">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <ul className="grid gap-3">
        {RESULT_KINDS.map((kind) => {
          const method = getAnalysisMethod(kind);
          return (
            <li key={kind} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
              <div className="grid gap-1">
                <h3 className="font-semibold">{method.name}</h3>
                <p>{method.purpose}</p>
              </div>
              <LearnMore label={steps.learnMore(method.name)}>
                <div className="grid gap-1">
                  <h4 className="font-semibold">{steps.enter}</h4>
                  <ul className="grid list-disc gap-1 ps-6">
                    {RESULT_FIELDS[kind].map((field) => (
                      <li key={field.key}>
                        {field.label} ({field.symbol}){field.required ? `, ${steps.required}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-1">
                  <h4 className="font-semibold">{steps.mistakes}</h4>
                  <ul className="grid list-disc gap-1 ps-6">
                    {COMMON_MISTAKES[kind].map((mistake) => (
                      <li key={mistake}>{mistake}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-small text-text-muted">{steps.referencesPending}</p>
              </LearnMore>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
