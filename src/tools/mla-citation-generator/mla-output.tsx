"use client";

import { CopyButton, type CopyResult } from "@/ui";
import { Runs } from "@/features/citation";
import type { MlaCitation } from "@/knowledge/citation/mla";
import type { ValidationIssue } from "@/knowledge/citation/source";
import { copySubjects, decisionText, output, type CopyTarget } from "./copy";
import { copyTexts } from "./copy-texts";

export interface MlaOutputProps {
  /** Null until something has been entered, so an empty form shows guidance instead of placeholders. */
  citation: MlaCitation | null;
  issues: readonly ValidationIssue[];
  onCopy: (target: CopyTarget, result: CopyResult) => void;
}

const panel = "grid min-w-0 content-start gap-2 rounded-panel border border-border bg-surface p-4";

function IssueItem({ issue }: { issue: ValidationIssue }) {
  return (
    <li className="grid gap-1 rounded-panel border border-border bg-sunken p-3">
      <p>
        <span className="font-semibold">{output.severity[issue.severity]}:</span> {issue.message}
      </p>
      {issue.explanation && <p className="text-small text-text-muted">{issue.explanation}</p>}
      {issue.action && (
        <p className="text-small">
          <span className="font-semibold">{output.action}:</span> {issue.action}
        </p>
      )}
    </li>
  );
}

/** The Works Cited entry, its in-text citations with copy buttons, how they were built, and what to check. */
export function MlaOutput({ citation, issues, onCopy }: MlaOutputProps) {
  if (!citation) {
    return (
      <section aria-labelledby="works-cited-title" className="grid gap-4">
        <h2 id="works-cited-title" className="text-heading font-semibold">
          {output.worksCitedHeading}
        </h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{output.empty}</p>
      </section>
    );
  }

  const texts = copyTexts(citation);
  const copyButton = (target: CopyTarget, elementId: string) => (
    <CopyButton
      text={texts[target].text}
      html={texts[target].html}
      subject={copySubjects[target]}
      selectOnFailure={elementId}
      onResult={(result) => onCopy(target, result)}
    />
  );
  const { narrative } = citation;
  // The order matters to the reader: problems first, then the decisions that need no action.
  const ordered = [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);

  return (
    <div className="grid min-w-0 gap-8">
      <section aria-labelledby="works-cited-title" className="grid min-w-0 gap-4">
        <h2 id="works-cited-title" className="text-heading font-semibold">
          {output.worksCitedHeading}
        </h2>
        <div className="grid min-w-0 gap-3 rounded-panel border border-border bg-surface p-4">
          <p id="works-cited-text" className="ps-8 -indent-8 wrap-anywhere">
            <Runs runs={citation.worksCited} />
          </p>
          <div>{copyButton("worksCited", "works-cited-text")}</div>
        </div>
      </section>

      <section aria-labelledby="in-text-title" className="grid min-w-0 gap-4">
        <h2 id="in-text-title" className="text-heading font-semibold">
          {output.inTextHeading}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={panel}>
            <h3 className="text-small text-text-muted">{output.parenthetical}</h3>
            <p id="parenthetical-text" className="wrap-anywhere">
              <Runs runs={citation.parenthetical} />
            </p>
            <div>{copyButton("parenthetical", "parenthetical-text")}</div>
          </div>
          <div className={panel}>
            <h3 className="text-small text-text-muted">{output.narrative}</h3>
            <dl className="grid gap-2">
              <div>
                <dt className="text-small text-text-muted">{output.narrativeFirst}</dt>
                <dd id="narrative-text" className="wrap-anywhere">
                  <Runs runs={narrative.firstMention} />
                </dd>
              </div>
              <div>
                <dt className="text-small text-text-muted">{output.narrativeLater}</dt>
                <dd className="wrap-anywhere">
                  <Runs runs={narrative.laterMentions} />
                </dd>
              </div>
              <div>
                <dt className="text-small text-text-muted">{output.narrativeEnd}</dt>
                <dd>{narrative.locator ? <Runs runs={narrative.locator} /> : <span className="text-text-muted">{output.narrativeEndNone}</span>}</dd>
              </div>
            </dl>
            <div>{copyButton("narrative", "narrative-text")}</div>
          </div>
        </div>
      </section>

      {ordered.length > 0 && (
        <section aria-labelledby="issues-title" className="grid min-w-0 gap-3">
          <h2 id="issues-title" className="text-heading font-semibold">
            {output.issuesHeading}
          </h2>
          <ul className="grid gap-2">
            {ordered.map((issue, index) => (
              <IssueItem key={`${issue.code}-${index}`} issue={issue} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="decisions-title" className="grid min-w-0 gap-3">
        <h2 id="decisions-title" className="text-heading font-semibold">
          {output.decisionsHeading}
        </h2>
        <ul className="grid list-disc gap-2 ps-6">
          {unique(citation.decisions.map(decisionText)).map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <p className="text-small text-text-muted">{output.provenance}</p>
      </section>
    </div>
  );
}

const rank: Record<ValidationIssue["severity"], number> = { error: 0, warning: 1, information: 2 };

const unique = (texts: readonly string[]) => [...new Set(texts)];
