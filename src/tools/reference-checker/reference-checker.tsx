"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Card, CopyButton, RadioGroup, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { MoreDetails } from "@/features/citation";
import { CHECKER_STYLES, checkReferences, type CheckerStyleId, type ParsedReference, type ReferenceCheckIssue, type ReferenceCheckReport } from "@/knowledge/citation/checker";
import { announcements, categoryLabels, form, listLabels, report as copy, severityLabel, styleChecks, styleNames, summaryText } from "./copy";
import { examples } from "./examples";

const styleOptions = CHECKER_STYLES.map((value) => ({ value, label: styleNames[value] }));

/** One finding: severity and category in words, then what is wrong, why, the evidence and what to do. */
function IssueCard({ item }: { item: ReferenceCheckIssue }) {
  return (
    <li className="grid min-w-0 gap-1 rounded-panel border border-border bg-sunken p-3">
      <p>
        <span className="font-semibold">{severityLabel[item.severity]}</span>
        <span className="text-text-muted"> · {categoryLabels[item.category]}:</span> {item.message}
      </p>
      <p className="text-small text-text-muted">{item.explanation}</p>
      {item.evidence && (
        <p className="text-small wrap-anywhere">
          <span className="font-semibold">{copy.evidence}:</span> <span className="font-mono">{item.evidence}</span>
        </p>
      )}
      <p className="text-small">
        <span className="font-semibold">{copy.action}:</span> {item.action}
      </p>
    </li>
  );
}

const rank = { error: 0, warning: 1, information: 2 } as const;
const ordered = (issues: readonly ReferenceCheckIssue[]) => [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);

function ReferenceCard({ reference, onCopy }: { reference: ParsedReference; onCopy: (result: CopyResult) => void }) {
  const titleId = `reference-${reference.index}-title`;
  return (
    <Card as="section" aria-labelledby={titleId} padding="lg" className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 id={titleId} className="text-subheading font-semibold">
          {copy.reference(reference.index)}
        </h4>
        <CopyButton text={reference.originalText} subject={copy.copyReference} onResult={onCopy} />
      </div>
      <p className="rounded-panel border border-border bg-surface p-4 whitespace-pre-line wrap-anywhere">{reference.originalText}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-semibold">{copy.sourceType}</dt>
          <dd>{copy.sourceTypes[reference.sourceType]}</dd>
        </div>
        <div>
          <dt className="font-semibold">{copy.confidence}</dt>
          <dd>{copy.confidenceLabels[reference.confidence]}</dd>
        </div>
      </dl>
      {reference.issues.length > 0 ? (
        <div className="grid gap-2">
          <p className="font-semibold">{copy.issueCount(reference.issues.length)}</p>
          <ul className="grid gap-2">
            {ordered(reference.issues).map((item, index) => (
              <IssueCard key={`${item.category}-${index}`} item={item} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-panel border border-border bg-sunken p-3 text-small">{copy.noDetected}</p>
      )}
    </Card>
  );
}

function summaryLines(result: ReferenceCheckReport): [string, string | number][] {
  return [
    [copy.style, styleNames[result.style]],
    [copy.references, result.total],
    [copy.errors, result.counts.error],
    [copy.warnings, result.counts.warning],
    [copy.information, result.counts.information],
    [copy.duplicates, result.potentialDuplicates],
    [copy.order, result.orderingIssues],
    ...(result.citations.checked
      ? ([
          [copy.citations, result.citations.findings.length],
          [copy.unmatched, result.citations.unmatched],
          [copy.uncited, result.citations.uncited],
        ] as [string, number][])
      : []),
  ];
}

function Report({ result, onCopy }: { result: ReferenceCheckReport; onCopy: (result: CopyResult) => void }) {
  const lines = summaryLines(result);
  const citationProblems = result.citations.findings.filter((finding) => finding.issues.length > 0);
  const matched = result.citations.findings.filter((finding) => finding.matches.length > 0).length;
  return (
    <section aria-labelledby="review-summary-title" className="grid min-w-0 gap-8 border-t border-border pt-8">
      <div className="grid min-w-0 gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="review-summary-title" className="text-heading font-semibold">
            {copy.summaryHeading}
          </h2>
          <CopyButton text={summaryText(lines)} subject={copy.copySummary} onResult={onCopy} />
        </div>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-border py-1">
              <dt>{label}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result.notices.length > 0 && (
        <section aria-labelledby="checker-notices-title" className="grid min-w-0 gap-3">
          <h3 id="checker-notices-title" className="text-subheading font-semibold">
            {copy.noticesHeading}
          </h3>
          <ul className="grid gap-2">
            {ordered(result.notices).map((item, index) => (
              <IssueCard key={`${item.category}-${index}`} item={item} />
            ))}
          </ul>
        </section>
      )}

      {result.citations.checked && (
        <section aria-labelledby="checker-citations-title" className="grid min-w-0 gap-3">
          <h3 id="checker-citations-title" className="text-subheading font-semibold">
            {copy.citationsHeading}
          </h3>
          <p>{copy.matched(matched)}</p>
          {citationProblems.length > 0 ? (
            <ul className="grid gap-2">
              {citationProblems.flatMap((finding, findingIndex) => ordered(finding.issues).map((item, index) => <IssueCard key={`${findingIndex}-${index}`} item={{ ...item, evidence: item.evidence ?? finding.citation.evidence }} />))}
            </ul>
          ) : (
            result.citations.findings.length > 0 && <p className="text-small text-text-muted">{copy.citationsClean}</p>
          )}
        </section>
      )}

      <section aria-labelledby="checker-references-title" className="grid min-w-0 gap-5">
        <h3 id="checker-references-title" className="text-subheading font-semibold">
          {copy.referencesHeading}
        </h3>
        {result.references.map((reference) => (
          <ReferenceCard key={reference.index} reference={reference} onCopy={onCopy} />
        ))}
      </section>
    </section>
  );
}

/** The checker: a style, a list, optional citations, and the report. Everything runs in the browser. */
export function ReferenceCheckerForm() {
  const [style, setStyle] = useState<CheckerStyleId | null>(null);
  const [references, setReferences] = useState("");
  const [citations, setCitations] = useState("");
  const [result, setResult] = useState<ReferenceCheckReport | null>(null);
  const [styleError, setStyleError] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const styleGroup = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };

  const run = (chosen: CheckerStyleId, list: string, text: string) => {
    const next = checkReferences({ style: chosen, references: list, citations: text });
    setResult(next);
    announce(next.empty ? form.nothingPasted : announcements.checked(next.total, styleNames[chosen], next.counts));
  };

  const check = () => {
    if (!style) {
      setStyleError(true);
      styleGroup.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
      announce(form.styleRequired);
      return;
    }
    run(style, references, citations);
  };

  const chooseStyle = (value: CheckerStyleId) => {
    setStyle(value);
    setStyleError(false);
    // A report always reflects the selected style, so an existing report is checked again.
    if (result) run(value, references, citations);
  };

  const loadExample = () => {
    if (!style) {
      setStyleError(true);
      styleGroup.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
      announce(form.styleRequired);
      return;
    }
    setReferences(examples[style].references);
    setCitations(examples[style].citations);
    setResult(null);
    announce(announcements.exampleLoaded(styleNames[style]));
  };

  const clear = () => {
    setReferences("");
    setCitations("");
    setResult(null);
    announce(announcements.cleared);
  };

  const handleCopy = (copied: CopyResult) => announce(copied === "copied" ? "Copied." : "Couldn't copy automatically. Select the text and copy it.");
  const checks = useMemo(() => (style ? styleChecks[style] : []), [style]);
  const notes = style === "chicago-notes-bibliography";

  return (
    <div className="grid min-w-0 gap-10">
      <div ref={styleGroup} className="grid gap-2">
        <RadioGroup name="checker-style" legend={form.styleLegend} hint={form.styleHint} options={styleOptions} value={style ?? undefined} onChange={chooseStyle} />
        {styleError && (
          <p id="checker-style-error" className="font-semibold text-danger" role="alert">
            {form.styleRequired}
          </p>
        )}
        {style && (
          <MoreDetails label={form.checksHeading(styleNames[style])}>
            <ul className="grid list-disc gap-1 ps-6 text-small">
              {checks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </MoreDetails>
        )}
      </div>

      <section aria-labelledby="checker-input-title" className="grid min-w-0 gap-4">
        <h2 id="checker-input-title" className="text-heading font-semibold">
          {form.inputHeading}
        </h2>
        <TextField id="reference-list" label={style ? listLabels[style] : form.listLabel} hint={form.listHint} multiline rows={10} value={references} onChange={(event) => setReferences(event.target.value)} />
        <TextField id="citation-text" label={notes ? form.notesLabel : form.citationsLabel} hint={notes ? form.notesHint : form.citationsHint} multiline rows={6} value={citations} onChange={(event) => setCitations(event.target.value)} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={check}>{form.check}</Button>
          <Button variant="secondary" onClick={loadExample}>
            {form.loadExample}
          </Button>
          <Button variant="subtle" onClick={clear}>
            {form.clear}
          </Button>
        </div>
      </section>

      {!result && <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{form.empty}</p>}
      {result?.empty && <p className="rounded-panel border border-border bg-sunken p-4">{form.nothingPasted}</p>}
      {result && !result.empty && <Report result={result} onCopy={handleCopy} />}

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
