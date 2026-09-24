"use client";

import { Fragment } from "react";
import { CopyButton, type CopyResult } from "@/ui";
import type { Citation, Run } from "@/knowledge/citation/apa";
import { copySubjects } from "./announcements";
import { noteText, output } from "./copy";
import { copyTexts, type CopyTarget } from "./copy-texts";

/** Formatted runs: italics as italics, and missing information shown as bracketed placeholders. */
function Runs({ runs }: { runs: readonly Run[] }) {
  return runs.map((run, index) =>
    run.italic ? (
      <i key={index}>{run.text}</i>
    ) : run.placeholder ? (
      <span key={index} className="text-text-muted">
        {run.text}
      </span>
    ) : (
      <Fragment key={index}>{run.text}</Fragment>
    ),
  );
}

export interface CitationOutputProps {
  /** Null until something has been entered, so an empty form shows guidance instead of placeholders. */
  citation: Citation | null;
  onCopy: (target: CopyTarget, result: CopyResult) => void;
}

/** The reference, its in-text citations with copy buttons, and every note explaining how it was formatted. */
export function CitationOutput({ citation, onCopy }: CitationOutputProps) {
  if (!citation) {
    return (
      <section aria-labelledby="reference-title" className="grid gap-4">
        <h2 id="reference-title" className="text-heading font-semibold">
          {output.heading}
        </h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{output.empty}</p>
      </section>
    );
  }

  const texts = copyTexts(citation);
  const copyButton = (target: CopyTarget, elementId: string) => (
    <CopyButton
      text={texts[target]}
      subject={copySubjects[target]}
      selectOnFailure={elementId}
      onResult={(result) => onCopy(target, result)}
    />
  );

  return (
    <section aria-labelledby="reference-title" className="grid gap-4">
      <h2 id="reference-title" className="text-heading font-semibold">
        {output.heading}
      </h2>
      <div className="grid gap-3 rounded-panel border border-border bg-surface p-4">
        <p id="reference-text" className="ps-8 -indent-8 break-words">
          <Runs runs={citation.reference} />
        </p>
        <div>{copyButton("reference", "reference-text")}</div>
      </div>

      <h3 className="text-subheading font-semibold">{output.inTextHeading}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="grid content-start gap-2 rounded-panel border border-border bg-surface p-4">
          <dt className="text-small text-text-muted">{output.parenthetical}</dt>
          <dd id="parenthetical-text">
            <Runs runs={citation.parenthetical} />
          </dd>
          <dd>{copyButton("parenthetical", "parenthetical-text")}</dd>
        </div>
        <div className="grid content-start gap-2 rounded-panel border border-border bg-surface p-4">
          <dt className="text-small text-text-muted">{output.narrative}</dt>
          <dd id="narrative-text">
            <Runs runs={citation.narrative} />
          </dd>
          <dd>{copyButton("narrative", "narrative-text")}</dd>
        </div>
      </dl>

      {citation.notes.length > 0 && (
        <>
          <h3 className="text-subheading font-semibold">{output.notesHeading}</h3>
          <ul className="grid list-disc gap-2 ps-6">
            {citation.notes.map((note, index) => (
              <li key={index}>{noteText(note)}</li>
            ))}
          </ul>
        </>
      )}

      <p className="text-small text-text-muted">{output.provenance}</p>
    </section>
  );
}
