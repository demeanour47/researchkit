"use client";

import { CopyButton, Button } from "@/ui";
import { plainText } from "@/knowledge/citation/apa";
import { formatCitationRequest, orderRecords, type SourceRecord } from "@/knowledge/citation/workflow";
import { collection } from "./copy";

export interface TemporaryReferenceCollectionProps {
  records: readonly SourceRecord[];
  onRemove: (record: SourceRecord) => void;
  onClear: () => void;
}

export function TemporaryReferenceCollection({ records, onRemove, onClear }: TemporaryReferenceCollectionProps) {
  const ordered = orderRecords(records);
  const references = ordered.map((record) => plainText(formatCitationRequest({ record, mode: "paraphrase" }).citation.reference));
  if (records.length === 0) {
    return (
      <section aria-labelledby="temporary-references-title" className="grid gap-4 border-t border-border pt-8">
        <h2 id="temporary-references-title" className="text-heading font-semibold">{collection.heading}</h2>
        <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{collection.empty}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="temporary-references-title" className="grid gap-4 border-t border-border pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 id="temporary-references-title" className="text-heading font-semibold">{collection.heading}</h2>
          <p className="text-small text-text-muted">{collection.provenance}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={references.join("\n\n")} subject={collection.copyAll} onResult={() => {}} />
          <Button variant="subtle" size="sm" onClick={onClear}>{collection.clear}</Button>
        </div>
      </div>
      <ol className="grid gap-4">
        {ordered.map((record, index) => {
          const formatted = formatCitationRequest({ record, mode: "paraphrase" });
          return (
            <li key={`${index}-${plainText(formatted.citation.reference)}`} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="ps-6 -indent-6 break-words">{index + 1}. {plainText(formatted.citation.reference)}</p>
                <Button variant="subtle" size="sm" onClick={() => onRemove(record)}>{collection.remove}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={plainText(formatted.citation.reference)} subject={collection.copyReference} onResult={() => {}} />
                <CopyButton text={plainText(formatted.citation.parenthetical)} subject={collection.copyParenthetical} onResult={() => {}} />
                <CopyButton text={plainText(formatted.citation.narrative)} subject={collection.copyNarrative} onResult={() => {}} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
