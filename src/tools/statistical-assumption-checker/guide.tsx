import { LearnMore } from "@/features/research";
import { ASSUMPTIONS, ASSUMPTION_METHODS, METHOD_GUIDES, getAnalysisMethod, type Alternative } from "@/knowledge/research";
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

const alternativeItems = (alternatives: readonly Alternative[]) => alternatives.map((alternative) => `${alternative.name}: ${alternative.when}`);

/** Every supported analysis and its assumptions, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <nav aria-labelledby="assumption-contents">
        <h3 id="assumption-contents" className="text-subheading font-semibold">
          {steps.contents}
        </h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {ASSUMPTION_METHODS.map((method) => (
            <li key={method}>
              <a href={`#method-${method}`} className="underline focus-ring">
                {getAnalysisMethod(method).name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {ASSUMPTION_METHODS.map((method) => {
        const guide = METHOD_GUIDES[method];
        const analysis = getAnalysisMethod(method);
        return (
          <section key={method} id={`method-${method}`} aria-labelledby={`method-${method}-title`} className="grid scroll-mt-4 gap-4 rounded-panel border border-border bg-surface p-4 sm:p-6">
            <div className="grid gap-1">
              <h3 id={`method-${method}-title`} className="text-subheading font-semibold">
                {analysis.name}
              </h3>
              <p>{analysis.purpose}</p>
            </div>
            <div className="grid gap-2">
              <h4 className="font-semibold">{steps.assumptions}</h4>
              <ul className="grid gap-2">
                {guide.assumptions.map((id) => {
                  const assumption = ASSUMPTIONS[id];
                  return (
                    <li key={id} className="grid gap-2">
                      <LearnMore label={assumption.name}>
                        <p>{assumption.statement}</p>
                        {(
                          [
                            [steps.why, [assumption.why]],
                            [steps.check, assumption.howToCheck],
                            [steps.thresholds, assumption.thresholds],
                            [steps.violated, [assumption.ifViolated]],
                            [steps.remedies, assumption.remedies],
                          ] as const
                        ).map(([heading, items]) => (
                          <div key={heading} className="grid gap-1">
                            <h5 className="font-semibold">{heading}</h5>
                            {items.length === 1 ? <p>{items[0]}</p> : <List items={items} />}
                          </div>
                        ))}
                      </LearnMore>
                    </li>
                  );
                })}
              </ul>
            </div>
            {guide.alternatives.length > 0 && (
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.alternatives}</h4>
                <List items={alternativeItems(guide.alternatives)} />
              </div>
            )}
            {guide.nonParametric.length > 0 && (
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.nonParametric}</h4>
                <List items={alternativeItems(guide.nonParametric)} />
              </div>
            )}
            <div className="grid gap-1">
              <h4 className="font-semibold">{steps.reporting}</h4>
              <p className="rounded-panel border border-border bg-background p-3">{guide.reporting.replace(/^Example: /, "")}</p>
              <p className="text-small text-text-muted">{steps.reportingNote}</p>
            </div>
            <div className="grid gap-1">
              <h4 className="font-semibold">{steps.mistakes}</h4>
              <List items={guide.mistakes} />
            </div>
            <p className="text-small text-text-muted">{steps.referencesPending}</p>
          </section>
        );
      })}
    </div>
  );
}
