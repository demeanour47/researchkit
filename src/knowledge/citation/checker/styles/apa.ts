/**
 * APA 7 checks. The entry reading is the Reference Checker's original APA parser
 * (Sprint 43), unchanged in what it reports, behind the shared checker contract:
 * the author–date boundary "(2024)." locates the authors, title and source details.
 * Sprint 49 adds citation checks and explains entries in another style's form.
 */

import { isWebAddress, normalizeDoi } from "../../apa/identifiers";
import { referenceName, type Contributor } from "../../apa/names";
import type { JournalArticleSource, Source } from "../../apa/reference";
import { orderRecords, type SourceRecord } from "../../workflow";
import { readNarrative, readParenthetical, uncertainCitation, unreadYearGroups, type AuthorDateCitation, type AuthorDateGrammar } from "../author-date";
import { ENTRY_FORM_NAMES, entryForm, numericCitationCount } from "../features";
import { issue } from "../issue";
import type { CitationScan, DetectedSourceType, ParseConfidence, ParsedReference, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const unitalicized = (value: string) => value.replace(/[*_]/g, "");
/** The date in brackets: a year, with any letter, month and day ("2023, May 4"), or n.d. or in press. */
const datePattern = /\((\d{4}[a-z]?|n\.d\.|in press)(?:,\s*\p{Lu}\p{Ll}+(?:\s\d{1,2}(?:\s*[–-]\s*\d{1,2})?)?)?\)/iu;
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

/** Family names for matching citations: APA lists "Family, I., Family, I., & Family, I.". */
function familyNames(text: string): string[] {
  const value = clean(text.replace(/\.$/, ""));
  if (!/[,&]/.test(value)) return value ? [value] : [];
  const tokens = value.replace(/,?\s*&\s*/g, ", ").split(/\s*,\s*/).filter(Boolean);
  const names: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    names.push(tokens[i]);
    if (tokens[i + 1] !== undefined && /^(?:\p{Lu}\.[\s-]?)*\p{Lu}\.?$/u.test(tokens[i + 1])) i += 1;
  }
  return names;
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

function parseDate(text: string): { year?: number; label?: string; start: number; end: number } {
  const match = text.match(datePattern);
  if (!match || match.index === undefined) return { start: -1, end: -1 };
  const label = match[1].toLowerCase();
  return { year: /^\d{4}/.test(label) ? Number(label.slice(0, 4)) : undefined, label, start: match.index, end: match.index + match[0].length };
}

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText } = entry;
  const original = entry.text;
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };
  if (entry.label) {
    issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than APA author–date formatting.", "APA reference lists are alphabetical and unnumbered; a number in front of an entry belongs to numeric styles such as IEEE.", "Remove the numbers if you are using APA, or choose the style your list follows.", entry.label.raw));
  }
  if (!original) return { ...base, sourceType: "unknown", confidence: "unable", issues: [issue("parse-warning", "error", "This reference is empty.", "There is no text to inspect.", "Remove the empty entry or add the complete reference.")] };

  const date = parseDate(original);
  if (date.start < 0) {
    issues.push(issue("parse-warning", "warning", "A publication date could not be identified confidently.", "The checker uses the author-date boundary to inspect source structure.", "Review the reference manually and check its publication date."));
    const form = entryForm(original);
    if (form && form !== "author-year-stop") issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `This entry appears to use ${ENTRY_FORM_NAMES[form]}. APA puts the date in brackets after the authors, followed by a full stop: Smith, J. (2024).`, "Check which style your list should follow, and choose it above or reformat the entry.", original));
    return { ...base, sourceType: "unknown", confidence: "unable", issues };
  }

  const beforeDate = clean(original.slice(0, date.start));
  const closeAt = date.end;
  const afterDate = clean(original.slice(closeAt).replace(/^\.?\s*/, ""));
  if (original[closeAt] !== ".") issues.push(issue("date-format", "warning", "The date isn't followed by a full stop.", "APA ends the date element with a full stop: Smith, J. (2024). A year in brackets without one is the form some Harvard guides use.", "Add a full stop after the closing bracket if you are using APA.", original.slice(date.start, closeAt)));
  const authorResult = contributors(beforeDate);
  const located = extractLocator(afterDate);
  const body = unitalicized(located.body).replace(/[.]$/, "");
  // A title's own question or exclamation mark ends it, as a full stop does.
  const pieces = body.split(/(?<=[?!])\s+|\.\s+/).map(clean).filter(Boolean);
  const title = pieces[0] ?? "";
  const rest = pieces.slice(1).join(". ");
  const hasVolume = /,\s*\d+(?:\s*\([^)]*\))?\s*(?:,|$)/.test(rest);
  const hasPages = /\b\d+\s*[–-]\s*\d+\b/.test(rest) || /\bArticle\s+\w+/i.test(rest);
  const looksWeb = Boolean(located.url) && !hasVolume;
  const looksJournal = hasVolume || hasPages;
  const sourceType: DetectedSourceType = looksWeb ? "webpage" : looksJournal ? "journal-article" : "book";
  const confidence: ParseConfidence = authorResult.confidence === "high" && title && (located.doi || located.url || rest) ? "high" : "partial";

  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every supported reference type needs a title or a title-like author substitute.", "Check the original reference and add the title."));
  if (!authorResult.authors.length) issues.push(issue("author-format", "warning", "No author could be identified confidently.", "Some works legitimately have no named author, but the source should be checked.", "Review the author position against the original source."));
  if (date.label === "n.d.") issues.push(issue("date-format", "warning", "The reference uses n.d. rather than a publication year.", "APA permits no date when the source provides no usable date.", "Check whether the source has a publication or update date."));
  if (date.label === "in press") issues.push(issue("date-format", "information", "The reference is marked in press.", "An in-press work may require manual review of its publication status.", "Confirm the work's status and the instructions that apply."));
  if (!located.doi && !located.url) issues.push(issue("verification-required", "information", "No DOI or URL was supplied.", "A DOI or URL is not required for every source, and absence does not prove an error.", "Check the original record for a persistent identifier when appropriate."));
  if (confidence !== "high") issues.push(issue("manual-review", "warning", "This reference could only be parsed partially.", "The checker cannot safely identify every bibliographic field from the supplied text.", "Review the original reference manually before submission."));
  issues.push(...located.issues);

  let source: Source;
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

  const year = /^\d{4}/.test(date.label ?? "") ? (date.label as string) : null;
  return {
    ...base,
    sourceType,
    confidence,
    source,
    key: { names: authorResult.authors.length > 0 ? familyNames(beforeDate) : [title], etAl: false, year, title, number: null },
    issues,
  };
}

function checkList(references: readonly ParsedReference[]): void {
  const structured = references.filter((entry): entry is ParsedReference & { source: Source } => entry.source !== undefined);
  const records: SourceRecord[] = structured.map((entry) => ({ source: entry.source, provenance: "user-entered" }));
  const ordered = orderRecords(records);
  ordered.forEach((record, sortedPosition) => {
    const originalPosition = records.indexOf(record);
    if (originalPosition !== sortedPosition) {
      structured[originalPosition].issues.push(issue("ordering", "warning", "Reference appears out of alphabetical order.", "APA reference lists are ordered by author or title, then year and title.", "Review the reference-list order; the checker does not reorder your text."));
    }
  });
  const groups = new Map<string, ParsedReference[]>();
  for (const entry of structured) {
    const first = entry.source.authors.map(referenceName)[0] ?? entry.source.title;
    const year = entry.source.date.year;
    if (year !== undefined) {
      const key = `${first.toLocaleLowerCase("en")}|${year}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const letters = group.map((entry) => /[a-z]$/.exec(entry.key?.year ?? "")?.[0]);
    if (letters.every(Boolean) && new Set(letters).size === letters.length) continue;
    for (const entry of group) entry.issues.push(issue("manual-review", "warning", "Multiple works by the same author appear in the same year.", "APA may require year suffixes such as 2024a and 2024b after reference-list ordering is settled.", "Review the group manually; suffix assignment is not automatic."));
  }
}

const GRAMMAR: AuthorDateGrammar = { separator: "comma", joiner: "&", noDate: "n.d.", locatorLabels: true, etAlFrom: 3 };

function diagnose(citation: AuthorDateCitation): AuthorDateCitation {
  const issues: ReferenceCheckIssue[] = [];
  const narrative = citation.kind === "narrative";
  for (const problem of citation.problems) {
    switch (problem) {
      case "separator-missing":
        issues.push(issue("citation-format", "warning", "APA puts a comma between the author and the year.", "APA parenthetical citations are written (Smith, 2024). Without the comma, the citation follows another author–date style.", "Add a comma after the author.", citation.evidence));
        break;
      case "joiner":
        issues.push(narrative
          ? issue("citation-format", "warning", "APA joins two authors with “and” in a narrative citation.", "APA uses “&” inside brackets and “and” in running text: Smith and Jones (2024).", "Replace “&” with “and”.", citation.evidence)
          : issue("citation-format", "warning", "APA joins two authors with “&” in a parenthetical citation.", "APA uses “&” inside brackets: (Smith & Jones, 2024).", "Replace “and” with “&”.", citation.evidence));
        break;
      case "no-date-form":
        issues.push(issue("citation-format", "warning", "APA writes a missing date as n.d.", "APA uses n.d. for works without a date: (Smith, n.d.).", "Write n.d. in place of the year.", citation.evidence));
        break;
      case "locator-label-missing":
        issues.push(issue("locator", "warning", "The page number needs “p.” or “pp.”.", "APA labels locators: (Smith, 2024, p. 5) or pp. 5–7.", "Add p. for one page or pp. for a range.", citation.evidence));
        break;
      case "et-al-missing":
        issues.push(issue("citation-format", "warning", "APA cites three or more authors as the first author and et al.", "From three authors, every APA citation names the first author followed by et al.: (Smith et al., 2024).", "Shorten the names to the first author and et al.", citation.evidence));
        break;
      default:
        break;
    }
  }
  return { ...citation, issues };
}

function readCitations(text: string): CitationScan {
  const citations = [...readParenthetical(text, GRAMMAR), ...readNarrative(text, GRAMMAR)].map(diagnose);
  const issues: ReferenceCheckIssue[] = unreadYearGroups(text, citations).map(uncertainCitation);
  if (numericCitationCount(text) > 0) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than APA author–date formatting.", "Citations such as [1] belong to numeric styles. APA cites the author and year: (Smith, 2024).", "Check which style your document uses, and choose it above.", `${numericCitationCount(text)} numeric citation${numericCitationCount(text) === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const apaChecker: StyleChecker = {
  id: "apa",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "author-date", list: "reference list", ordering: "alphabetical", yearLetters: true },
  notices: [],
  parseEntry,
  checkList,
  readCitations,
};

