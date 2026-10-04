import type { ValidationIssue, ValidationSeverity } from "@/knowledge/citation/source";

export interface ValidationIssueLabels {
  heading: string;
  severity: Record<ValidationSeverity, string>;
  action: string;
}

const rank: Record<ValidationSeverity, number> = { error: 0, warning: 1, information: 2 };

/**
 * A citation's validation issues, problems first. Severity is always a word, never
 * colour alone, and each issue says why it matters and what to do.
 */
export function ValidationIssues({ issues, labels, headingId, headingLevel = 2 }: { issues: readonly ValidationIssue[]; labels: ValidationIssueLabels; headingId: string; headingLevel?: 2 | 3 }) {
  if (issues.length === 0) return null;
  const ordered = [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);
  return (
    <section aria-labelledby={headingId} className="grid min-w-0 gap-3">
      {headingLevel === 2 ? (
        <h2 id={headingId} className="text-heading font-semibold">
          {labels.heading}
        </h2>
      ) : (
        <h3 id={headingId} className="text-subheading font-semibold">
          {labels.heading}
        </h3>
      )}
      <ul className="grid gap-2">
        {ordered.map((issue, index) => (
          <li key={`${issue.code}-${index}`} className="grid gap-1 rounded-panel border border-border bg-sunken p-3">
            <p>
              <span className="font-semibold">{labels.severity[issue.severity]}:</span> {issue.message}
            </p>
            {issue.explanation && <p className="text-small text-text-muted">{issue.explanation}</p>}
            {issue.action && (
              <p className="text-small">
                <span className="font-semibold">{labels.action}:</span> {issue.action}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
