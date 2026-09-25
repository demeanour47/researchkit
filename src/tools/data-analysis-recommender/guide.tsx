import { LearnMore } from "@/features/research";
import { ANALYSIS_FAMILY_LABELS, ANALYSIS_METHODS, type AnalysisFamily } from "@/knowledge/research";
import { steps } from "./copy";

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-1 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Every analysis method by what it is for, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      {(Object.keys(ANALYSIS_FAMILY_LABELS) as AnalysisFamily[]).map((family) => (
        <div key={family} className="grid gap-3">
          <h3 className="text-subheading font-semibold">{ANALYSIS_FAMILY_LABELS[family]}</h3>
          <ul className="grid gap-3">
            {ANALYSIS_METHODS.filter((method) => method.family === family).map((method) => (
              <li key={method.id} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
                <div className="grid gap-1">
                  <h4 className="font-semibold">{method.name}</h4>
                  <p>{method.purpose}</p>
                </div>
                <LearnMore label={steps.learnMore(method.name)}>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.suitableWhen}</h5>
                    <p>{method.suitableWhen}</p>
                  </div>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.assumptions}</h5>
                    <List items={method.assumptions} />
                  </div>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.limitations}</h5>
                    <List items={method.limitations} />
                  </div>
                  <p className="text-small text-text-muted">{steps.referencesPending}</p>
                </LearnMore>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
