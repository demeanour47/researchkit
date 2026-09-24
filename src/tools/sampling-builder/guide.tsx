import { LearnMore } from "@/features/research";
import { SAMPLING_CATEGORY_LABELS, SAMPLING_TECHNIQUES, type SamplingCategory } from "@/knowledge/research";
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

/** Every sampling technique by category, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      {(Object.keys(SAMPLING_CATEGORY_LABELS) as SamplingCategory[]).map((category) => (
        <div key={category} className="grid gap-3">
          <h3 className="text-subheading font-semibold">{SAMPLING_CATEGORY_LABELS[category]}</h3>
          <ul className="grid gap-3">
            {SAMPLING_TECHNIQUES.filter((technique) => technique.category === category).map((technique) => (
              <li key={technique.id} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
                <div className="grid gap-1">
                  <h4 className="font-semibold">{technique.name} sampling</h4>
                  <p>{technique.definition}</p>
                </div>
                <LearnMore label={steps.learnMore(technique.name)}>
                  {(
                    [
                      [steps.whenUsed, [technique.whenUsed]],
                      [steps.strengths, technique.strengths],
                      [steps.limitations, technique.limitations],
                      [steps.assumptionsHeading, technique.assumptions],
                      [steps.sizes, [technique.commonSampleSizes]],
                      [steps.examples, technique.examples],
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
