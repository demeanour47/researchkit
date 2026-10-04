"use client";

import { CopyButton, type CopyResult } from "@/ui";
import { Runs, ValidationIssues } from "@/features/citation";
import type { IeeeSourceCitation } from "@/knowledge/citation/ieee";
import type { Run, ValidationIssue } from "@/knowledge/citation/source";
import { copySubjects, decisionText, output, type CopyTarget } from "./copy";
import { copyText } from "./copy-texts";

export interface IeeeOutputProps {
  /** Null until something has been entered, so an empty form shows guidance instead of placeholders. */
  result: IeeeSourceCitation | null;
  issues: readonly ValidationIssue[];
  onCopy: (target: CopyTarget, result: CopyResult) => void;
}

const panel = "grid min-w-0 content-start gap-2 rounded-panel border border-border bg-surface p-4";

/** One copyable output, or a note on why there isn't one yet. */
function Output({ target, runs, onCopy, className }: { target: CopyTarget; runs: readonly Run[] | null; onCopy: IeeeOutputProps["onCopy"]; className?: string }) {
  if (!runs) return <p className="text-text-muted">{output.noNumber}</p>;
  const texts = copyText(runs);
  return (
    <>
      <p id={`ieee-${target}-text`} className={className ?? "wrap-anywhere"}>
        <Runs runs={runs} />
      </p>
      <div>
        <CopyButton text={texts.text} html={texts.html} subject={copySubjects[target]} selectOnFailure={`ieee-${target}-text`} onResult={(result) => onCopy(target, result)} />
      </div>
    </>
  );
}

/** The citation, the numbered reference entry, what to check, and how they were built. */
export function IeeeOutput({ result, issues, onCopy }: IeeeOutputProps) {
  if (!result) {
    return (
      <section aria-labelledby="ieee-citations-title" className="grid gap-4">
        <h2 id="ieee-citations-title" className="text-heading font-semibold">
          {output.citationsHeading}
        </h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{output.empty}</p>
      </section>
    );
  }

  return (
    <div className="grid min-w-0 gap-8">
      <section aria-labelledby="ieee-citations-title" className="grid min-w-0 gap-4">
        <h2 id="ieee-citations-title" className="text-heading font-semibold">
          {output.citationsHeading}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={panel}>
            <h3 className="text-small text-text-muted">{output.citation}</h3>
            <Output target="citation" runs={result.citation} onCopy={onCopy} className="wrap-anywhere text-heading" />
          </div>
          {result.namedCitation && (
            <div className={panel}>
              <h3 className="text-small text-text-muted">{output.namedCitation}</h3>
              <Output target="namedCitation" runs={result.namedCitation} onCopy={onCopy} />
              <p className="text-small text-text-muted">{output.namedHint}</p>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="ieee-reference-title" className="grid min-w-0 gap-4">
        <h2 id="ieee-reference-title" className="text-heading font-semibold">
          {output.referenceHeading}
        </h2>
        <div className="grid min-w-0 gap-3 rounded-panel border border-border bg-surface p-4">
          <Output target="entry" runs={result.entry} onCopy={onCopy} className="ps-10 -indent-10 wrap-anywhere" />
        </div>
      </section>

      <ValidationIssues issues={issues} headingId="ieee-issues-title" labels={{ heading: output.issuesHeading, severity: output.severity, action: output.action }} />

      <section aria-labelledby="ieee-decisions-title" className="grid min-w-0 gap-3">
        <h2 id="ieee-decisions-title" className="text-heading font-semibold">
          {output.decisionsHeading}
        </h2>
        <ul className="grid list-disc gap-2 ps-6">
          {[...new Set(result.decisions.map(decisionText))].map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <p className="text-small text-text-muted">{output.provenance}</p>
      </section>
    </div>
  );
}
