import { formatPages, normalizeDoi } from "./apa/identifiers";
import { referenceName } from "./apa/names";
import { formatCitation, type Citation, type Note } from "./apa/reference";
import { plain, type Run } from "./apa/runs";
import type { CitationLocator, CitationRequest, SourceRecord, ValidationIssue, ValidationSeverity } from "./source/record";

/** The record, request, locator and validation shapes are shared by every style (ADR-0006). */
export type {
  CitationLocator,
  CitationMode,
  CitationRequest,
  LocatorKind,
  SourceRecord,
  ValidationIssue,
  ValidationSeverity,
} from "./source/record";

export interface FormattedReference {
  citation: Citation;
  issues: readonly ValidationIssue[];
  locator?: CitationLocator;
}

const noteSeverity = (note: Note): ValidationSeverity => {
  switch (note.code) {
    case "missing":
    case "invalid-doi":
    case "invalid-url":
      return "error";
    default:
      return "warning";
  }
};

const noteMessage = (note: Note): string => {
  switch (note.code) {
    case "missing": return `Required metadata is missing: ${note.field}.`;
    case "invalid-doi": return "The DOI is not in a valid form and was not used.";
    case "invalid-url": return "The URL is not a valid HTTP or HTTPS address and was not used.";
    case "no-author": return "No author was supplied; the title is used in the author position.";
    case "author-incomplete": return `Author ${note.position} is incomplete and was left out of the output.`;
    case "over-twenty-authors": return `APA's 21-author ellipsis rule was applied to ${note.count} authors.`;
    case "no-date": return "No date was supplied, so APA's n.d. form was used.";
    case "invalid-date": return "The date is invalid; check it against the source.";
    case "day-without-month": return "A day was supplied without a month, so only the year was used.";
    case "publisher-omitted": return "The publisher matches the organization author and was omitted.";
    case "site-name-omitted": return "The site name matches the organization author and was omitted.";
    case "first-edition-omitted": return "The first edition is not shown in an APA reference.";
    case "check-sentence-case": return "Check the title's sentence case and proper nouns against the source.";
  }
};

export function validateSource(record: SourceRecord): ValidationIssue[] {
  const citation = formatCitation(record.source);
  const issues: ValidationIssue[] = citation.notes.map((note) => ({ code: note.code, severity: noteSeverity(note), message: noteMessage(note) }));
  issues.push({
    code: record.provenance,
    severity: "information",
    message: record.provenance === "verified" ? "The metadata is marked as externally verified." : "The metadata was entered by the researcher and has not been externally verified.",
  });
  return issues;
}

const locatorText = (locator: CitationLocator): string => {
  const value = locator.value.trim();
  if (locator.kind === "page") return `p. ${value}`;
  if (locator.kind === "page-range") return `pp. ${formatPages(value)}`;
  if (locator.kind === "paragraph") return `para. ${value}`;
  return `Section ${value}`;
};

const addLocator = (runs: readonly Run[], locator: CitationLocator | undefined): Run[] => {
  if (!locator || !locator.value.trim()) return [...runs];
  const text = runs.map((run) => run.text).join("");
  const closing = text.endsWith(")") ? runs.length - 1 : -1;
  if (closing < 0) return [...runs, plain(`, ${locatorText(locator)}`)];
  const last = runs[closing];
  return [...runs.slice(0, closing), plain(last.text.slice(0, -1) + `, ${locatorText(locator)})`), ...runs.slice(closing + 1)];
};

export function formatCitationRequest(request: CitationRequest): FormattedReference {
  const citation = formatCitation(request.record.source);
  const issues = [...validateSource(request.record)];
  if (request.mode === "direct-quotation" && !request.locator?.value.trim()) {
    issues.push({ code: "missing-locator", severity: "warning", message: "A direct quotation needs a page, paragraph or section locator when the source provides one." });
  }
  return {
    citation: {
      ...citation,
      parenthetical: addLocator(citation.parenthetical, request.locator),
      narrative: addLocator(citation.narrative, request.locator),
    },
    issues,
    locator: request.locator,
  };
}

export function sourceIdentity(record: SourceRecord): string {
  const doi = record.source.type === "book" || record.source.type === "journal-article" ? normalizeDoi(record.source.doi ?? "") : null;
  if (doi) return doi.toLowerCase();
  const title = record.source.title.trim().toLocaleLowerCase("en").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
  const year = record.source.date.year === undefined ? "n.d." : String(record.source.date.year);
  return `${title}|${year}`;
}

export function orderRecords(records: readonly SourceRecord[]): SourceRecord[] {
  const key = (record: SourceRecord) => {
    const names = record.source.authors.map(referenceName).filter((name): name is string => name !== null);
    const author = (names[0] ?? record.source.title).toLocaleLowerCase("en");
    const year = record.source.date.year ?? Number.POSITIVE_INFINITY;
    return { author, year, title: record.source.title.toLocaleLowerCase("en") };
  };
  return [...records].sort((left, right) => {
    const a = key(left);
    const b = key(right);
    return a.author.localeCompare(b.author, "en") || a.year - b.year || a.title.localeCompare(b.title, "en");
  });
}

export function duplicateReason(record: SourceRecord, existing: readonly SourceRecord[]): string | null {
  const identity = sourceIdentity(record);
  if (existing.some((candidate) => sourceIdentity(candidate) === identity)) return identity.startsWith("https://doi.org/") ? "matching DOI" : "matching normalized title and year";
  return null;
}
