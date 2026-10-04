"use client";

import { CopyButton, Tag, type CopyResult } from "@/ui";
import { Runs, ValidationIssues } from "@/features/citation";
import type { ChicagoNotesBibliographyCitation, NoteContext } from "@/knowledge/citation/chicago/notes-bibliography";
import type { ValidationIssue } from "@/knowledge/citation/source";
import { copySubjects, decisionText, output, type CopyTarget } from "./copy";
import { copyTexts } from "./copy-texts";

export interface NotesBibliographyOutputProps {
  /** Null until something has been entered, so an empty form shows guidance instead of placeholders. */
  citation: ChicagoNotesBibliographyCitation | null;
  /** Which note the writer said this citation needs. */
  context: NoteContext;
  issues: readonly ValidationIssue[];
  onCopy: (target: CopyTarget, result: CopyResult) => void;
}

/** A card for one output; the one this citation needs has a stronger border, and says so in its tag. */
const panel = (selected: boolean) => `grid min-w-0 content-start gap-3 rounded-panel border bg-surface p-4 ${selected ? "border-border-strong" : "border-border"}`;

/** The full note, shortened note and bibliography entry with copy buttons, then what to check and how they were built. */
export function NotesBibliographyOutput({ citation, context, issues, onCopy }: NotesBibliographyOutputProps) {
  if (!citation) {
    return (
      <section aria-labelledby="nb-output-title" className="grid gap-4">
        <h2 id="nb-output-title" className="text-heading font-semibold">
          {output.heading}
        </h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{output.empty}</p>
      </section>
    );
  }

  const texts = copyTexts(citation);
  const card = (target: CopyTarget, heading: string, runs: ChicagoNotesBibliographyCitation["fullNote"], tag: string | null, selected: boolean, hanging: boolean) => (
    <section aria-labelledby={`nb-${target}-title`} className={panel(selected)}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={`nb-${target}-title`} className="text-subheading font-semibold">
          {heading}
        </h3>
        {tag && <Tag tone={selected ? "info" : "neutral"}>{tag}</Tag>}
      </div>
      <p id={`nb-${target}-text`} className={hanging ? "ps-8 -indent-8 wrap-anywhere" : "wrap-anywhere"}>
        <Runs runs={runs} />
      </p>
      <div>
        <CopyButton text={texts[target].text} html={texts[target].html} subject={copySubjects[target]} selectOnFailure={`nb-${target}-text`} onResult={(result) => onCopy(target, result)} />
      </div>
    </section>
  );

  const full = card("fullNote", output.fullNote, citation.fullNote, context === "full-note" ? output.forThisCitation : output.forFirst, context === "full-note", false);
  const short = card("shortNote", output.shortNote, citation.shortNote, context === "short-note" ? output.forThisCitation : output.forLater, context === "short-note", false);

  return (
    <div className="grid min-w-0 gap-8">
      <section aria-labelledby="nb-output-title" className="grid min-w-0 gap-4">
        <h2 id="nb-output-title" className="text-heading font-semibold">
          {output.heading}
        </h2>
        <p className="text-small text-text-muted">{output.noteNumber}</p>
        {context === "full-note" ? (
          <>
            {full}
            {short}
          </>
        ) : (
          <>
            {short}
            {full}
          </>
        )}
        {card("bibliography", output.bibliography, citation.bibliography, null, false, true)}
      </section>

      <ValidationIssues issues={issues} headingId="nb-issues-title" labels={{ heading: output.issuesHeading, severity: output.severity, action: output.action }} />

      <section aria-labelledby="nb-decisions-title" className="grid min-w-0 gap-3">
        <h2 id="nb-decisions-title" className="text-heading font-semibold">
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
