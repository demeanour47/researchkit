import { LearnMore } from "@/features/research";
import { MEASUREMENT_LEVELS, MEASUREMENT_LEVEL_INFO, VARIABLE_KINDS, VARIABLE_KIND_INFO } from "@/knowledge/research";
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

/** Variable types and measurement levels, rendered on the server so they read without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.kindsHeading}</h3>
        <ul className="grid gap-3">
          {VARIABLE_KINDS.map((kind) => (
            <li key={kind} className="grid gap-1 rounded-panel border border-border bg-surface p-4">
              <h4 className="font-semibold">{VARIABLE_KIND_INFO[kind].label}</h4>
              <p>{VARIABLE_KIND_INFO[kind].definition}</p>
              <p className="text-small text-text-muted">
                {steps.example2}: {VARIABLE_KIND_INFO[kind].example}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.levelsHeading}</h3>
        <ul className="grid gap-3">
          {MEASUREMENT_LEVELS.map((level) => {
            const info = MEASUREMENT_LEVEL_INFO[level];
            return (
              <li key={level} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
                <div className="grid gap-1">
                  <h4 className="font-semibold">{info.label}</h4>
                  <p>{info.definition}</p>
                </div>
                <LearnMore label={steps.learnMore(info.label)}>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.examples}</h5>
                    <List items={info.examples} />
                  </div>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.strengths}</h5>
                    <List items={info.strengths} />
                  </div>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.limitations}</h5>
                    <List items={info.limitations} />
                  </div>
                  <div className="grid gap-1">
                    <h5 className="font-semibold">{steps.references}</h5>
                    <p className="text-text-muted">{steps.referencesPending}</p>
                  </div>
                </LearnMore>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
