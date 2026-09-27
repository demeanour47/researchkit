import { Badge, Callout } from "@/ui";
import { ALIGNMENT_STATUS_LABELS, type TitleAlignment } from "@/knowledge/research/title";
import { steps } from "./copy";
import { ALIGNMENT_STYLE } from "./status-style";

/** The title set beside each part of the project, then the issues found between them. */
export function AlignmentPanel({ alignment }: { alignment: TitleAlignment }) {
  return (
    <div className="grid gap-6">
      <ul className="grid gap-3 sm:grid-cols-2">
        {alignment.sources.map((source) => {
          const style = ALIGNMENT_STYLE[source.status];
          return (
            <li key={source.source} className="grid content-start gap-1.5 rounded-panel border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-heading-sm font-semibold">{source.label}</h3>
                <Badge tone={style.tone} icon={style.icon}>
                  {ALIGNMENT_STATUS_LABELS[source.status]}
                </Badge>
              </div>
              <p className="text-small">{source.explanation}</p>
            </li>
          );
        })}
      </ul>
      <section aria-labelledby="alignment-issues-title" className="grid gap-3">
        <h3 id="alignment-issues-title" className="text-subheading font-semibold">
          {steps.issues}
        </h3>
        {alignment.issues.length === 0 ? (
          <p className="text-small text-text-muted">{steps.noIssues}</p>
        ) : (
          <ul className="grid gap-3">
            {alignment.issues.map((issue) => (
              <li key={issue.id}>
                <Callout tone="caution" title={issue.label}>
                  <p>{issue.explanation}</p>
                  <p className="mt-1 text-text-muted">{issue.why}</p>
                </Callout>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
