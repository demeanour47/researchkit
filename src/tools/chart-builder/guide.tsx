import { CHART_TYPES, CHART_TYPE_INFO } from "@/knowledge/charts";
import { steps } from "./copy";

/** Every chart type, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <nav aria-labelledby="chart-contents">
        <h3 id="chart-contents" className="text-subheading font-semibold">
          {steps.contents}
        </h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {CHART_TYPES.map((type) => (
            <li key={type}>
              <a href={`#chart-${type}`} className="underline focus-ring">
                {CHART_TYPE_INFO[type].label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-4 md:grid-cols-2">
        {CHART_TYPES.map((type) => {
          const info = CHART_TYPE_INFO[type];
          return (
            <section key={type} id={`chart-${type}`} aria-labelledby={`chart-${type}-title`} className="grid scroll-mt-4 content-start gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
              <h3 id={`chart-${type}-title`} className="text-subheading font-semibold">
                {info.label}
              </h3>
              <p>{info.description}</p>
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.whenToUse}</h4>
                <p>{info.bestFor}</p>
              </div>
              <div className="grid gap-1">
                <h4 className="font-semibold">{steps.layout}</h4>
                <p>{info.layout}</p>
              </div>
              <details className="group">
                <summary className="cursor-pointer rounded-control font-medium underline focus-ring">{steps.example}</summary>
                <pre className="mt-2 overflow-x-auto rounded-control border border-border bg-background p-3 text-small">{info.example}</pre>
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
