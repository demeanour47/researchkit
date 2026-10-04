import { isWebAddress, normalizeDoi } from "./apa/identifiers";
import { referenceName, type Contributor } from "./apa/names";
import { type JournalArticleSource, type Source, type SourceType } from "./apa/reference";
import { orderRecords, sourceIdentity, type SourceRecord, type ValidationSeverity } from "./workflow";

export type CheckerIssueCategory =
  | "parse-warning"
  | "missing-metadata"
  | "invalid-metadata"
  | "author-format"
  | "date-format"
  | "title-format"
  | "journal-structure"
  | "publisher-structure"
  | "doi"
  | "url"
  | "duplicate"
  | "ordering"
  | "verification-required"
  | "manual-review";

export interface ReferenceCheckIssue {
  category: CheckerIssueCategory;
  severity: ValidationSeverity;
  message: string;
  explanation: string;
  action: string;
  evidence?: string;
}

export type ParseConfidence = "high" | "partial" | "unable";
export type DetectedSourceType = SourceType | "unknown";

export interface ParsedReference {
  index: number;
  originalText: string;
  sourceType: DetectedSourceType;
  confidence: ParseConfidence;
  source?: Source;
  issues: ReferenceCheckIssue[];
}

export interface ReferenceListReport {
  references: ParsedReference[];
  total: number;
  referencesWithIssues: number;
  potentialDuplicates: number;
  orderingIssues: number;
  manualReviewItems: number;
  empty: boolean;
}

const issue = (
  category: CheckerIssueCategory,
  severity: ValidationSeverity,
  message: string,
  explanation: string,
  action: string,
  evidence?: string,
): ReferenceCheckIssue => ({ category, severity, message, explanation, action, ...(evidence ? { evidence } : {}) });

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const unitalicized = (value: string) => value.replace(/[*_]/g, "");
const datePattern = /\((\d{4}|n\.d\.|in press)\)/i;
const locatorPattern = /https?:\/\/\S+$/i;
const doiPattern = /(?:https?:\/\/(?:dx\.|www\.)?doi\.org\/|doi:\s*)(10\.\d{4,9}\/\S+)/i;

function contributors(text: string): { authors: Contributor[]; confidence: ParseConfidence } {
  const value = clean(text.replace(/\.$/, ""));
  if (!value) return { authors: [], confidence: "partial" };
  if (!/[,&]/.test(value) && !/\b(?:et al\.?|and)\b/i.test(value)) return { authors: [{ kind: "organization", name: value }], confidence: "high" };
  const parts = value.split(/\s*,\s*&\s*|\s*,\s+and\s+/i).map(clean).filter(Boolean);
  if (parts.length === 0) return { authors: [], confidence: "partial" };
  if (parts.length === 1 && value.includes(",")) {
    const comma = value.indexOf(",");
    const family = clean(value.slice(0, comma));
    const given = clean(value.slice(comma + 1));
    if (family && given) return { authors: [{ kind: "person", family, given }], confidence: "high" };
  }
  const authors: Contributor[] = [];
  for (const part of parts) {
    const comma = part.indexOf(",");
    if (comma < 0) {
      authors.push({ kind: "organization", name: part });
      continue;
    }
    const family = clean(part.slice(0, comma));
    const given = clean(part.slice(comma + 1));
    if (!family) return { authors: [], confidence: "partial" };
    authors.push({ kind: "person", family, given });
  }
  return { authors, confidence: parts.length > 1 ? "high" : "partial" };
}

function extractLocator(text: string): { doi?: string; url?: string; body: string; issues: ReferenceCheckIssue[] } {
  const issues: ReferenceCheckIssue[] = [];
  const doiMatch = text.match(doiPattern);
  if (doiMatch) {
    const doi = normalizeDoi(doiMatch[1]);
    if (!doi) issues.push(issue("doi", "error", "DOI syntax appears invalid.", "A DOI can be normalized only when it has the expected DOI structure.", "Check the DOI against the original source.", doiMatch[1]));
    return { doi: doiMatch[1], body: clean(text.slice(0, doiMatch.index).replace(/[ .,;]+$/, "")), issues };
  }
  const malformedDoi = text.match(/\bdoi:\s*([^\s]+)/i);
  if (malformedDoi) {
    issues.push(issue("doi", "error", "DOI syntax appears invalid.", "The supplied DOI prefix is not followed by a valid DOI.", "Check the DOI against the original source.", malformedDoi[1]));
    return { body: clean(text.replace(malformedDoi[0], "").replace(/[ .,;]+$/, "")), issues };
  }
  const urlMatch = text.match(locatorPattern);
  if (urlMatch) {
    const url = urlMatch[0].replace(/[).,;]+$/, "");
    if (!isWebAddress(url)) issues.push(issue("url", "error", "URL syntax appears invalid.", "Only HTTP and HTTPS web addresses are supported by the existing URL utility.", "Check the URL against the original source.", url));
    return { url, body: clean(text.slice(0, text.lastIndexOf(url)).replace(/[ .,;]+$/, "")), issues };
  }
  return { body: clean(text), issues };
}

function parseDate(text: string): { year?: number; label?: string; start: number } {
  const match = text.match(datePattern);
  if (!match || match.index === undefined) return { start: -1 };
  const label = match[1].toLowerCase();
  return { year: /^\d{4}$/.test(label) ? Number(label) : undefined, label, start: match.index };
}

function parseReference(originalText: string, index: number): ParsedReference {
  const original = clean(originalText);
  const issues: ReferenceCheckIssue[] = [];
  if (!original) return { index, originalText, sourceType: "unknown", confidence: "unable", issues: [issue("parse-warning", "error", "This reference is empty.", "There is no text to inspect.", "Remove the empty entry or add the complete reference.")] };

  const date = parseDate(original);
  if (date.start < 0) {
    return {
      index,
      originalText,
      sourceType: "unknown",
      confidence: "unable",
      issues: [issue("parse-warning", "warning", "A publication date could not be identified confidently.", "The checker uses the author-date boundary to inspect source structure.", "Review the reference manually and check its publication date.")],
    };
  }

  const beforeDate = clean(original.slice(0, date.start));
  const afterDate = clean(original.slice(date.start + date.label!.length + 2).replace(/^\.?\s*/, ""));
  const authorResult = contributors(beforeDate);
  const located = extractLocator(afterDate);
  const body = unitalicized(located.body).replace(/[.]$/, "");
  const pieces = body.split(/\.\s+/).map(clean).filter(Boolean);
  const title = pieces[0] ?? "";
  const rest = pieces.slice(1).join(". ");
  const hasVolume = /,\s*\d+(?:\s*\([^)]*\))?\s*(?:,|$)/.test(rest);
  const hasPages = /\b\d+\s*[–-]\s*\d+\b/.test(rest) || /\bArticle\s+\w+/i.test(rest);
  const looksWeb = Boolean(located.url) && !hasVolume;
  const looksJournal = hasVolume || hasPages;
  const sourceType: DetectedSourceType = looksWeb ? "webpage" : looksJournal ? "journal-article" : "book";
  const confidence: ParseConfidence = authorResult.confidence === "high" && title && (located.doi || located.url || rest) ? "high" : "partial";

  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every supported reference type needs a title or a title-like author substitute.", "Check the original reference and add the title.") );
  if (!authorResult.authors.length) issues.push(issue("author-format", "warning", "No author could be identified confidently.", "Some works legitimately have no named author, but the source should be checked.", "Review the author position against the original source."));
  if (date.label === "n.d.") issues.push(issue("date-format", "warning", "The reference uses n.d. rather than a publication year.", "APA permits no date when the source provides no usable date.", "Check whether the source has a publication or update date."));
  if (date.label === "in press") issues.push(issue("date-format", "information", "The reference is marked in press.", "An in-press work may require manual review of its publication status.", "Confirm the work's status and the instructions that apply."));
  if (!located.doi && !located.url) issues.push(issue("verification-required", "information", "No DOI or URL was supplied.", "A DOI or URL is not required for every source, and absence does not prove an error.", "Check the original record for a persistent identifier when appropriate."));
  if (confidence !== "high") issues.push(issue("manual-review", "warning", "This reference could only be parsed partially.", "The checker cannot safely identify every bibliographic field from the supplied text.", "Review the original reference manually before submission."));
  issues.push(...located.issues);

  let source: Source | undefined;
  if (sourceType === "journal-article") {
    const journalMatch = rest.match(/^(.+?),\s*(\d+)(?:\(([^)]+)\))?(?:,\s*([^,]+))?$/);
    const journal = clean(journalMatch?.[1] ?? rest);
    const volume = journalMatch?.[2];
    const issueNumber = journalMatch?.[3];
    const pages = journalMatch?.[4]?.trim();
    if (!journal) issues.push(issue("journal-structure", "error", "Journal title may be missing.", "Journal articles need a journal title when the source is identifiable as an article.", "Check the original journal record."));
    if (!volume) issues.push(issue("journal-structure", "warning", "Journal volume may be missing.", "APA journal references normally include the volume when one exists.", "Check the original journal record and add the volume if applicable."));
    if (!pages) issues.push(issue("journal-structure", "warning", "Page range or article number may be missing.", "An article may use pages or an article number, depending on the publication.", "Check the original journal record."));
    source = { type: "journal-article", authors: authorResult.authors, date: { year: date.year }, title, journal, volume, issue: issueNumber, pages, doi: located.doi, url: located.url } as JournalArticleSource;
  } else if (sourceType === "webpage") {
    const siteName = pieces[1] ?? "";
    source = { type: "webpage", authors: authorResult.authors, date: { year: date.year }, title, siteName, url: located.url ?? "" };
    if (!located.url) issues.push(issue("url", "error", "Web page URL is missing.", "A web page reference needs the page address to identify the source.", "Check the original page and add its URL."));
  } else {
    const editionMatch = rest.match(/\(([^)]*ed\.)\)/i);
    const publisher = rest.replace(editionMatch?.[0] ?? "", "").replace(/[.]$/, "").trim();
    source = { type: "book", authors: authorResult.authors, date: { year: date.year }, title, edition: editionMatch?.[1], publisher, doi: located.doi, url: located.url };
    if (!publisher) issues.push(issue("publisher-structure", "warning", "Publisher may be missing.", "Books normally include the publisher when it is available.", "Check the original book record."));
  }

  return { index, originalText, sourceType, confidence, source, issues };
}

export function splitReferenceEntries(text: string): string[] {
  return text.replace(/\r\n?/g, "\n").split(/\n\s*\n+/).map((entry) => entry.trim()).filter(Boolean);
}

export function checkReferenceList(text: string): ReferenceListReport {
  const entries = splitReferenceEntries(text).map((entry, index) => parseReference(entry, index + 1));
  const structured = entries.filter((entry): entry is ParsedReference & { source: Source } => entry.source !== undefined);
  const records: SourceRecord[] = structured.map((entry) => ({ source: entry.source, provenance: "user-entered" }));
  const seen = new Map<string, number>();
  for (const entry of structured) {
    const identity = sourceIdentity({ source: entry.source, provenance: "user-entered" });
    const previous = seen.get(identity);
    if (previous !== undefined) entry.issues.push(issue("duplicate", "warning", "Potential duplicate reference detected.", "This reference has the same DOI or normalized title and year as another entry.", `Compare references ${previous} and ${entry.index} and decide whether both are needed.`));
    else seen.set(identity, entry.index);
  }
  const ordered = orderRecords(records);
  const orderedIndexes = ordered.map((record) => records.indexOf(record));
  orderedIndexes.forEach((originalPosition, sortedPosition) => {
    if (originalPosition !== sortedPosition) {
      const entry = structured[originalPosition];
      entry.issues.push(issue("ordering", "warning", "Reference appears out of alphabetical order.", "APA reference lists are ordered by author or title, then year and title.", "Review the reference-list order; the checker does not reorder your text."));
    }
  });
  const groups = new Map<string, ParsedReference[]>();
  for (const entry of structured) {
    const first = entry.source.authors.map(referenceName)[0] ?? entry.source.title;
    const year = entry.source.date.year;
    if (year !== undefined) {
      const key = `${first.toLocaleLowerCase("en")}|${year}`;
      const group = groups.get(key) ?? [];
      group.push(entry);
      groups.set(key, group);
    }
  }
  for (const group of groups.values()) if (group.length > 1) for (const entry of group) entry.issues.push(issue("manual-review", "warning", "Multiple works by the same author appear in the same year.", "APA may require year suffixes such as 2024a and 2024b after reference-list ordering is settled.", "Review the group manually; suffix assignment is not automatic."));

  return {
    references: entries,
    total: entries.length,
    referencesWithIssues: entries.filter((entry) => entry.issues.length > 0).length,
    potentialDuplicates: entries.filter((entry) => entry.issues.some((item) => item.category === "duplicate")).length,
    orderingIssues: entries.filter((entry) => entry.issues.some((item) => item.category === "ordering")).length,
    manualReviewItems: entries.filter((entry) => entry.issues.some((item) => item.category === "manual-review" || item.category === "parse-warning")).length,
    empty: entries.length === 0,
  };
}
