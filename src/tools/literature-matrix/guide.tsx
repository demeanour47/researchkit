import { FIELD_GROUPS, FIELD_GROUP_LABELS, FIELD_INFO, MATRIX_FIELDS } from "@/knowledge/literature";
import { steps } from "./copy";

/** What each column holds and how patterns and gaps are found, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <section aria-labelledby="guide-columns" className="grid gap-4">
        <h3 id="guide-columns" className="text-subheading font-semibold">
          {steps.guideColumns}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {FIELD_GROUPS.map((group) => (
            <section key={group} aria-labelledby={`guide-group-${group}`} className="grid content-start gap-2 rounded-panel border border-border bg-surface p-4">
              <h4 id={`guide-group-${group}`} className="font-semibold">
                {FIELD_GROUP_LABELS[group]}
              </h4>
              <dl className="grid gap-2">
                {MATRIX_FIELDS.filter((field) => FIELD_INFO[field].group === group).map((field) => (
                  <div key={field}>
                    <dt className="font-medium">{FIELD_INFO[field].label}</dt>
                    <dd className="text-small text-text-muted">{FIELD_INFO[field].hint}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
      <section aria-labelledby="guide-patterns" className="grid gap-3">
        <h3 id="guide-patterns" className="text-subheading font-semibold">
          {steps.guidePatterns}
        </h3>
        <ul className="grid list-disc gap-2 ps-6">
          {steps.guidePatternItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
