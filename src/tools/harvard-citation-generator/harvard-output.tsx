"use client";

import { CopyButton, type CopyResult } from "@/ui";
import { Runs, ValidationIssues } from "@/features/citation";
import type { HarvardCitation } from "@/knowledge/citation/harvard";
import type { ValidationIssue } from "@/knowledge/citation/source";
import { copySubjects, decisionText, output, type CopyTarget } from "./copy";
import { copyTexts } from "./copy-texts";

export interface HarvardOutputProps {
  /** Null until something has been entered, so an empty form shows guidance instead of placeholders. */
  citation: HarvardCitation | null;
  issues: readonly ValidationIssue[];
  onCopy: (target: CopyTarget, result: CopyResult) => void;
}

const panel = "grid min-w-0 content-start gap-2 rounded-panel border border-border bg-surface p-4";

/** The reference, its text citations with copy buttons, what to check, and how it was built. */
export function HarvardOutput({ citation, issues, onCopy }: HarvardOutputProps) {
  if (!citation) {
    return (
      <section aria-labelledby="harvard-reference-title" className="grid gap-4">
        <h2 id="harvard-reference-title" className="text-heading font-semibold">
          {output.referenceHeading}
        </h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{output.empty}</p>
      </section>
    );
  }

  const texts = copyTexts(citation);
  const copyButton = (target: CopyTarget, elementId: string) => (
    <CopyButton text={texts[target].text} html={texts[target].html} subject={copySubjects[target]} selectOnFailure={elementId} onResult={(result) => onCopy(target, result)} />
  );

  return (
    <div className="grid min-w-0 gap-8">
      <section aria-labelledby="harvard-reference-title" className="grid min-w-0 gap-4">
        <h2 id="harvard-reference-title" className="text-heading font-semibold">
          {output.referenceHeading}
        </h2>
        <div className="grid min-w-0 gap-3 rounded-panel border border-border bg-surface p-4">
          <p id="harvard-reference-text" className="ps-8 -indent-8 wrap-anywhere">
            <Runs runs={citation.reference} />
          </p>
          <div>{copyButton("reference", "harvard-reference-text")}</div>
        </div>
      </section>

      <section aria-labelledby="harvard-citations-title" className="grid min-w-0 gap-4">
        <h2 id="harvard-citations-title" className="text-heading font-semibold">
          {output.citationsHeading}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={panel}>
            <h3 className="text-small text-text-muted">{output.parenthetical}</h3>
            <p id="harvard-parenthetical-text" className="wrap-anywhere">
              <Runs runs={citation.parenthetical} />
            </p>
            <div>{copyButton("parenthetical", "harvard-parenthetical-text")}</div>
          </div>
          <div className={panel}>
            <h3 className="text-small text-text-muted">{output.narrative}</h3>
            <p id="harvard-narrative-text" className="wrap-anywhere">
              <Runs runs={citation.narrative} />
            </p>
            <p className="text-small text-text-muted">{output.narrativeHint}</p>
            <div>{copyButton("narrative", "harvard-narrative-text")}</div>
          </div>
        </div>
      </section>

      <ValidationIssues issues={issues} headingId="harvard-issues-title" labels={{ heading: output.issuesHeading, severity: output.severity, action: output.action }} />

      <section aria-labelledby="harvard-decisions-title" className="grid min-w-0 gap-3">
        <h2 id="harvard-decisions-title" className="text-heading font-semibold">
          {output.decisionsHeading}
        </h2>
        <ul className="grid list-disc gap-2 ps-6">
          {[...new Set(citation.decisions.map(decisionText))].map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <p className="text-small text-text-muted">{output.provenance}</p>
      </section>
    </div>
  );
}
