"use client";

import { useState } from "react";
import { Button, Card, CopyButton, Link, TextField, VisuallyHidden } from "@/ui";
import { checkReferenceList, type ParsedReference, type ReferenceCheckIssue, type ReferenceListReport } from "@/knowledge/citation/reference-checker";
import { page, severityLabel } from "./copy";

const sourceTypeLabel = (reference: ParsedReference) => reference.sourceType === "journal-article" ? "Journal article" : reference.sourceType === "webpage" ? "Web page" : reference.sourceType === "book" ? "Book" : "Unknown";
const confidenceLabel = (reference: ParsedReference) => reference.confidence === "high" ? page.high : reference.confidence === "partial" ? page.partial : page.unable;

function Issue({ item }: { item: ReferenceCheckIssue }) {
  return (
    <li className="grid gap-1 rounded-panel border border-border bg-sunken p-3">
      <p><span className="font-semibold">{severityLabel[item.severity]}:</span> {item.message}</p>
      <p className="text-small text-text-muted">{item.explanation}</p>
      <p className="text-small"><span className="font-semibold">{page.action}:</span> {item.action}</p>
      {item.evidence && <p className="break-words font-mono text-small text-text-muted">{item.evidence}</p>}
    </li>
  );
}

function ReviewCard({ reference }: { reference: ParsedReference }) {
  const summary = [reference.originalText, ...reference.issues.map((item) => `${severityLabel[item.severity]}: ${item.message} ${item.action}`)].join("\n");
  return (
    <Card as="section" aria-labelledby={`reference-${reference.index}-title`} padding="lg" className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 id={`reference-${reference.index}-title`} className="text-subheading font-semibold">{page.reference(reference.index)}</h3>
        <CopyButton text={reference.originalText} subject={page.copyReference} onResult={() => {}} />
      </div>
      <p className="break-words rounded-panel border border-border bg-surface p-4 whitespace-pre-line">{reference.originalText}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div><dt className="font-semibold">{page.sourceType}</dt><dd>{sourceTypeLabel(reference)}</dd></div>
        <div><dt className="font-semibold">{page.confidence}</dt><dd>{confidenceLabel(reference)}</dd></div>
      </dl>
      {reference.issues.length > 0 ? <div className="grid gap-2"><h4 className="font-semibold">{page.issues}</h4><ul className="grid gap-2"><li className="sr-only">{reference.issues.length} issues</li>{reference.issues.map((item, index) => <Issue key={`${item.category}-${index}`} item={item} />)}</ul></div> : <p className="rounded-panel border border-border bg-sunken p-3 text-small">{page.noDetected}</p>}
      <div><CopyButton text={summary} subject={page.copySummary} onResult={() => {}} /></div>
    </Card>
  );
}

function reportText(report: ReferenceListReport): string {
  return [page.referenceCount(report.total), page.issueCount(report.referencesWithIssues), page.duplicateCount(report.potentialDuplicates), page.orderingCount(report.orderingIssues), page.manualCount(report.manualReviewItems)].join("\n");
}

export function ReferenceCheckerForm() {
  const [text, setText] = useState("");
  const [report, setReport] = useState<ReferenceListReport | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const check = () => {
    const next = checkReferenceList(text);
    setReport(next);
    setAnnouncement(next.empty ? page.empty : `${page.referenceCount(next.total)}. ${page.issueCount(next.referencesWithIssues)}.`);
  };
  const clear = () => {
    setText("");
    setReport(null);
    setAnnouncement("Reference list cleared.");
  };

  return (
    <div className="grid min-w-0 gap-10">
      <section aria-labelledby="checker-input-title" className="grid gap-4">
        <h2 id="checker-input-title" className="text-heading font-semibold">{page.inputHeading}</h2>
        <TextField id="reference-list" label={page.inputLabel} hint={page.inputHint} placeholder={page.placeholder} multiline rows={12} value={text} onChange={(event) => setText(event.target.value)} />
        <div className="flex flex-wrap gap-3"><Button onClick={check}>{page.check}</Button><Button variant="subtle" onClick={clear}>{page.clear}</Button></div>
      </section>
      {!report && <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{page.empty}</p>}
      {report && !report.empty && (
        <section aria-labelledby="review-summary-title" className="grid gap-4 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><h2 id="review-summary-title" className="text-heading font-semibold">{page.resultsHeading}</h2><CopyButton text={reportText(report)} subject={page.copySummary} onResult={() => {}} /></div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label={page.resultsHeading}><li>{page.referenceCount(report.total)}</li><li>{page.issueCount(report.referencesWithIssues)}</li><li>{page.duplicateCount(report.potentialDuplicates)}</li><li>{page.orderingCount(report.orderingIssues)}</li><li>{page.manualCount(report.manualReviewItems)}</li></ul>
          <div className="grid gap-5">{report.references.map((reference) => <ReviewCard key={reference.index} reference={reference} />)}</div>
        </section>
      )}
      {report?.empty && <p className="rounded-panel border border-border bg-sunken p-4">{page.empty}</p>}
      <p className="flex flex-wrap gap-4 text-small"><Link href="/learn/apa-7-citations-and-references#reference-list">{page.learnLink}</Link><Link href="/tools/apa-citation-generator">{page.builderLink}</Link></p>
      <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
    </div>
  );
}
