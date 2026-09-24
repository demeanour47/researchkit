import { LearnMore } from "@/features/research";
import { SAMPLE_SIZE_METHODS } from "@/knowledge/research";
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

/** Every sample size method, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-6">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <ul className="grid gap-3">
        {SAMPLE_SIZE_METHODS.map((method) => (
          <li key={method.id} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
            <div className="grid gap-1">
              <h3 className="font-semibold">{method.name}</h3>
              <p>{method.definition}</p>
            </div>
            <LearnMore label={steps.learnMore(method.name)}>
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.formulaHeading}</h4>
                <p className="font-mono break-words">{method.formula}</p>
                <List items={method.symbols} />
              </div>
              {(
                [
                  [steps.whenUsed, [method.whenUsed]],
                  [steps.assumptionsHeading, method.assumptions],
                  [steps.strengths, method.strengths],
                  [steps.limitations, method.limitations],
                ] as const
              ).map(([heading, items]) => (
                <div key={heading} className="grid gap-1">
                  <h4 className="font-semibold">{heading}</h4>
                  {items.length === 1 ? <p>{items[0]}</p> : <List items={items} />}
                </div>
              ))}
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.references}</h4>
                <p className="text-text-muted">{steps.referencesPending}</p>
              </div>
            </LearnMore>
          </li>
        ))}
      </ul>
    </div>
  );
}
