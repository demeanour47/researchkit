"use client";

import { useMemo } from "react";
import { runsHtml } from "@/features/citation";
import { Runs } from "@/features/citation";
import { apaReference } from "@/knowledge/literature-search/citation";
import { toBibtex } from "@/knowledge/literature-search/bibtex";
import { authorLine, doiOf, excerpt, venueOf } from "@/knowledge/literature-search/display";
import type { LiteratureRecord } from "@/knowledge/literature-search/types";
import { Badge, CopyButton, Link, type CopyResult } from "@/ui";
import { ui } from "./copy";

export interface ResultCardProps {
  record: LiteratureRecord;
  onCopy: (subject: string, result: CopyResult) => void;
}

/** One found work. Fields the provider didn't supply are left out, never shown empty. */
export function ResultCard({ record, onCopy }: ResultCardProps) {
  const reference = useMemo(() => apaReference(record), [record]);
  const bibtex = useMemo(() => toBibtex([record]), [record]);
  const authors = authorLine(record);
  const venue = venueOf(record);
  const year = record.source.date.year;
  const summary = excerpt(record.abstract);
  const doi = doiOf(record);
  const headingId = `result-${record.id.replace(/[^A-Za-z0-9]/g, "-")}`;
  const meta = [authors, year !== undefined ? String(year) : undefined, venue].filter((part): part is string => Boolean(part));
  const topic = record.topics[0]?.name;
  const links = { rel: "noopener noreferrer", target: "_blank" } as const;

  return (
    <li>
      <article aria-labelledby={headingId} className="grid animate-fade-in gap-3 rounded-panel border border-border bg-surface p-4">
        <div className="grid gap-1">
          <h3 id={headingId} className="text-subheading font-semibold break-words">
            {record.source.title}
          </h3>
          {meta.length > 0 && <p className="text-small text-text-muted break-words">{meta.join(" · ")}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {record.openAccess?.isOpen && <Badge tone="success" icon="circle-check">{ui.openAccessBadge}</Badge>}
          {record.retracted && <Badge tone="danger" icon="alert">{ui.retractedBadge}</Badge>}
          {record.relevance && (
            <Badge tone="outline" title={ui.scoreExplained}>
              {ui.score(record.relevance.score)}
            </Badge>
          )}
          {topic && <Badge tone="neutral">{`${ui.topic}: ${topic}`}</Badge>}
        </div>

        {summary && <p className="break-words">{summary}</p>}

        {record.matchedKeywords.length > 0 && (
          <p className="text-small text-text-muted">
            <span className="font-medium">{ui.matched}:</span> {record.matchedKeywords.join(", ")}
          </p>
        )}

        {doi && <p className="text-small break-all text-text-muted">{doi}</p>}

        {record.metadataConfidence !== "complete" && record.missingFields.length > 0 && (
          <p className="text-small text-text-muted">
            <span className="font-medium">{ui.incomplete}.</span> {ui.incompleteHelp(record.missingFields)}
          </p>
        )}

        {(record.notes.length > 0 || !reference.complete) && (
          <details className="text-small">
            <summary className="cursor-pointer font-medium focus-ring">{ui.checkBeforeCiting}</summary>
            <ul className="mt-2 grid list-disc gap-1 ps-6 text-text-muted">
              {!reference.complete && <li>{ui.referenceIncomplete}</li>}
              {record.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
        )}

        <details className="text-small">
          <summary className="cursor-pointer font-medium focus-ring">{ui.apaSubject}</summary>
          <p className="mt-2 ps-8 -indent-8 break-words">
            <Runs runs={reference.runs} />
          </p>
        </details>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {record.landingPageUrl && record.landingPageUrl !== doi && (
            <Link href={record.landingPageUrl} variant="standalone" {...links}>
              {ui.open}
            </Link>
          )}
          {doi && (
            <Link href={doi} variant="standalone" {...links}>
              {ui.doi}
            </Link>
          )}
          {(record.fullTextUrl ?? record.pdfUrl) && (
            <Link href={(record.fullTextUrl ?? record.pdfUrl) as string} variant="standalone" {...links}>
              {ui.fullText}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={reference.text} html={runsHtml(reference.runs)} subject={`${ui.apaSubject} for ${record.source.title}`} copyLabel="Copy APA 7" onResult={(result) => onCopy(ui.apaSubject, result)} />
          <CopyButton text={bibtex} subject={`${ui.bibtexSubject} for ${record.source.title}`} copyLabel="Copy BibTeX" onResult={(result) => onCopy(ui.bibtexSubject, result)} />
        </div>
      </article>
    </li>
  );
}
