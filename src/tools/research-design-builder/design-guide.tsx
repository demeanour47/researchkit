import { LearnMore } from "@/features/research";
import { DESIGN_FAMILY_LABELS, RESEARCH_DESIGNS, type DesignFamily } from "@/knowledge/research";
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

/** Every research design by family, rendered on the server so it reads without JavaScript. */
export function DesignGuide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      {(Object.keys(DESIGN_FAMILY_LABELS) as DesignFamily[]).map((family) => (
        <div key={family} className="grid gap-3">
          <h3 className="text-subheading font-semibold">{DESIGN_FAMILY_LABELS[family]}</h3>
          <ul className="grid gap-3">
            {RESEARCH_DESIGNS.filter((design) => design.family === family).map((design) => (
              <li key={design.id} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
                <div className="grid gap-1">
                  <h4 className="font-semibold">{design.name}</h4>
                  <p>{design.definition}</p>
                </div>
                <LearnMore label={steps.learnMore(design.name)}>
                  {(
                    [
                      [steps.purpose, [design.purpose]],
                      [steps.whenUsed, [design.whenUsed]],
                      [steps.strengths, design.strengths],
                      [steps.limitations, design.limitations],
                      [steps.typicalData, design.typicalData],
                      [steps.analysis, design.analysisMethods],
                      [steps.examples, design.examples],
                    ] as const
                  ).map(([heading, items]) => (
                    <div key={heading} className="grid gap-1">
                      <h5 className="font-semibold">{heading}</h5>
                      {items.length === 1 ? <p>{items[0]}</p> : <List items={items} />}
                    </div>
                  ))}
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.references}</h5>
                    <p className="text-text-muted">{steps.referencesPending}</p>
                  </div>
                </LearnMore>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
