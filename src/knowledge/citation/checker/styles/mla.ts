/**
 * MLA 9 checks, against the forms ResearchKit's MLA generator produces:
 *
 *   Lodge, David. Changing Places: A Tale of Two Campuses. Penguin Books, 1979.
 *   LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.
 *   Burns, Shauntee. “Finding Wonder Women at the Library …” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/….
 *
 * In-text citations name the author and page with no punctuation between: (LeCun et
 * al. 437). MLA has no year in its citations, so citations are matched by author, or
 * by a title when there is no author.
 */

import { MLA_MONTHS } from "../../mla/dates";
import type { Source } from "../../source";
import { ENTRY_FORM_NAMES, authorBoundary, clean, entryForm, invertedFirstNames, lastYear, numericCitationCount, quotedTitle, roundGroups } from "../features";
import { issue } from "../issue";
import { checkLinks } from "../links";
import { checkAlphabeticalOrder } from "../list";
import type { CitationScan, DetectedSourceType, ParsedReference, RecognizedCitation, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";
import { APA_JOURNAL_NUMBERS, LATER_AUTHOR_INVERTED } from "./chicago-author-date";

const STYLE = "MLA";
/** Three hyphens in place of a repeated author's name. */
const SAME_AUTHOR = /^-{3}\.\s*/u;
const FULL_MONTHS = ["January", "February", "March", "April", "August", "September", "October", "November", "December"];

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText } = entry;
  const repeated = SAME_AUTHOR.test(entry.text);
  const text = entry.text.replace(SAME_AUTHOR, "");
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };
  if (entry.label) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than MLA formatting.", "A Works Cited list is alphabetical and unnumbered; a number in front of an entry belongs to numeric styles such as IEEE.", "Remove the numbers if you are using MLA, or choose the style your list follows.", entry.label.raw));

  const form = entryForm(text);
  if (form && form !== "initials-first") issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `This entry appears to use ${ENTRY_FORM_NAMES[form]}. MLA gives the date with the publication details, not after the author: Lodge, David. Changing Places. Penguin Books, 1979.`, "Check which style your list should follow, and choose it above or reformat the entry.", text));

  const quotedFirst = /^[“"]/u.test(text);
  const boundary = quotedFirst || repeated ? null : authorBoundary(text);
  const lead = boundary?.lead ?? "";
  const rest = repeated || quotedFirst || !boundary ? text : boundary.rest;
  const names = boundary ? invertedFirstNames(lead) : { names: [] as string[], etAl: false };
  if (lead) {
    if (/\s&\s/u.test(lead)) issues.push(issue("author-format", "warning", "Authors are joined with “&”.", "MLA joins two authors with “and”: Dorris, Michael, and Louise Erdrich.", "Replace “&” with “and”.", lead));
    if (LATER_AUTHOR_INVERTED.test(lead)) issues.push(issue("author-format", "warning", "The second author's name appears inverted.", "MLA inverts only the first author's name; the second keeps normal order: Dorris, Michael, and Louise Erdrich.", "Write the second author given name first.", lead));
    if (!names.etAl && names.names.length >= 3) issues.push(issue("author-format", "warning", "Three or more authors are all listed.", "MLA lists one or two authors; with three or more, it gives the first author followed by et al.: LeCun, Yann, et al.", "Keep the first author and replace the others with et al.", lead));
  }

  const links = checkLinks(rest, { style: STYLE, doi: "link", bareUrls: true });
  issues.push(...links.issues);
  const quoted = quotedTitle(rest);
  const articleLike = quoted !== null && quoted.index === 0;
  const title = articleLike ? quoted.title : clean((/^(.+?[.?!])(?=\s|$)/u.exec(rest)?.[1] ?? rest).replace(/\.$/u, ""));
  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every Works Cited entry identifies the work by its title.", "Check the entry and add the title."));
  const journal = /\bvol\.\s*\d/u.test(rest) || APA_JOURNAL_NUMBERS.test(rest);
  if (journal && !articleLike) issues.push(issue("title-format", "warning", "The article title isn't in quotation marks.", "MLA puts the title of a part of a larger work, such as an article, in quotation marks, and italicizes the container: “Deep Learning.” Nature.", "Put the article title in quotation marks.", title));
  if (APA_JOURNAL_NUMBERS.test(rest)) issues.push(issue("journal-structure", "warning", "Journal numbers aren't labelled.", "MLA labels the volume and issue: vol. 521, no. 7553.", "Write vol. before the volume and no. before the issue.", APA_JOURNAL_NUMBERS.exec(rest)?.[0]));
  const range = /(?:^|[,\s])(pp?\.\s*)?(\d+\s*[–-]\s*\d+)(?=[,.]|$)/u.exec(rest.replace(/\b(?:1[5-9]|20)\d\d\s*[–-]\s*(?:1[5-9]|20)\d\d\b/gu, ""));
  if (range && !range[1] && journal) issues.push(issue("journal-structure", "warning", "The page range has no “pp.”.", "MLA writes a range of pages with pp.: pp. 436–44.", "Add pp. before the page range.", range[2]));
  if (range?.[1]?.startsWith("p. ")) issues.push(issue("journal-structure", "warning", "A page range is labelled “p.”.", "MLA uses pp. for a range of pages and p. for one page.", "Write pp. before the range.", range[0].trim()));
  const fullMonth = new RegExp(String.raw`\b\d{1,2}\s(${FULL_MONTHS.join("|")})\s\d{4}`, "u").exec(rest);
  if (fullMonth) issues.push(issue("date-format", "information", "A month is written in full.", `In the Works Cited list, MLA abbreviates months longer than four letters: ${MLA_MONTHS.join(", ")}.`, "Abbreviate the month.", fullMonth[0]));
  const monthFirst = new RegExp(String.raw`\b(?:${[...FULL_MONTHS, ...MLA_MONTHS.map((month) => month.replace(".", "\\."))].join("|")})\s\d{1,2},\s\d{4}`, "u").exec(rest);
  if (monthFirst) issues.push(issue("date-format", "warning", "A date is written month first.", "MLA writes dates day, month, year: 2 Mar. 2016.", "Put the day before the month.", monthFirst[0]));
  const year = lastYear(rest);
  if (links.url?.valid && !year && !/\bAccessed\s/u.test(rest)) issues.push(issue("date-format", "information", "An undated web source has no access date.", "When a web source shows no date, MLA recommends adding the date you accessed it: Accessed 4 Oct. 2026.", "Add Accessed and the date at the end.", links.url.raw));

  const sourceType: DetectedSourceType = journal ? "journal-article" : articleLike && links.url ? "webpage" : "book";
  const date = { year: year ? Number(year) : undefined };
  const authors = names.names.map((name) => ({ kind: "organization" as const, name }));
  const source: Source =
    sourceType === "journal-article"
      ? { type: "journal-article", authors, date, title, journal: "", doi: links.doi?.normalized ?? undefined, url: links.url?.raw }
      : sourceType === "webpage"
        ? { type: "webpage", authors, date, title, url: links.url?.raw ?? "" }
        : { type: "book", authors, date, title, doi: links.doi?.normalized ?? undefined, url: links.url?.raw };
  return {
    ...base,
    sourceType,
    confidence: title && (boundary || quotedFirst || repeated) ? "high" : "partial",
    source,
    // "---" stands for the author of the entry above; the list check fills in the name.
    key: { names: repeated ? ["---"] : names.names.length > 0 ? names.names : [title], etAl: names.etAl, year, title, number: null },
    issues,
  };
}

function checkList(references: readonly ParsedReference[]): void {
  let previous: ParsedReference | undefined;
  for (const reference of references) {
    if (reference.key?.names[0] === "---") {
      if (previous?.key) reference.key = { ...reference.key, names: previous.key.names, etAl: previous.key.etAl };
      else reference.issues.push(issue("author-format", "warning", "Three hyphens appear with no author above them.", "MLA uses three hyphens in place of a name repeated from the entry above.", "Write the author's name in full.", "---."));
    }
    if (!reference.excluded) previous = reference;
  }
  checkAlphabeticalOrder(references, { explanation: "A Works Cited list is in alphabetical order by the first word of each entry: the author's family name, or the title, ignoring A, An and The.", sameAuthorByYear: false });
}

/** Words that open bracketed text but aren't authors, such as (Figure 2). */
const NOT_AUTHORS = new Set(["Figure", "Fig", "Table", "Chapter", "Ch", "Section", "Appendix", "Page", "Part", "Vol", "Volume", "Note", "Line", "Lines", "Act", "Scene", "Book", "Eq", "Equation", "See", "Ibid"]);

function readCitations(text: string): CitationScan {
  const citations: RecognizedCitation[] = [];
  const issues: ReferenceCheckIssue[] = [];
  let authorDate = 0;
  for (const group of roundGroups(text)) {
    for (const part of group.inner.split(/\s*;\s*/u)) {
      const evidence = group.inner.includes(";") ? part : group.text;
      // A year after a comma reads as author–date; without the comma it could be an MLA page number.
      if (/^\p{Lu}[^()]*?,\s(?:1[5-9]|20)\d\d[a-z]?(?:,|$)/u.test(part)) {
        authorDate += 1;
        continue;
      }
      const match = /^(“[^”]+”|\p{Lu}[^\d“”]*?)(,)?(?:\s+(pp?\.\s*)?(\d[\d\s,–-]*))?$/u.exec(part);
      if (!match) continue;
      const [, who, comma, label, locator] = match;
      const quoted = /^“(.+?)[,.]?”$/u.exec(who);
      const words = who.split(/\s+/u);
      if (!quoted && (words.length > 6 || NOT_AUTHORS.has(words[0].replace(/\.$/u, "")))) continue;
      if (!quoted && !locator && words.length > 3) continue;
      const shortTitle = !quoted && who.includes(",") ? clean(who.slice(who.indexOf(",") + 1)) : undefined;
      const people = quoted ? [] : clean(who.split(",")[0]).replace(/\s+et al\.$/u, "").split(/\s+and\s+/u);
      const citationIssues: ReferenceCheckIssue[] = [];
      if (comma && locator) citationIssues.push(issue("citation-format", "warning", "There is a comma between the author and the page.", "MLA puts no punctuation between the author and the page: (LeCun et al. 437).", "Remove the comma.", evidence));
      if (label) citationIssues.push(issue("locator", "warning", "The page number has “p.” or “pp.”.", "MLA gives page numbers in citations without p. or pp.: (LeCun et al. 437).", "Remove p. or pp.", evidence));
      if (!quoted && people.length >= 3) citationIssues.push(issue("citation-format", "warning", "Three or more authors are all named.", "MLA cites three or more authors as the first author and et al.: (LeCun et al. 437).", "Shorten the names to the first author and et al.", evidence));
      citations.push({
        evidence,
        kind: "parenthetical",
        names: people,
        etAl: /\set al\.$/u.test(who.split(",")[0]),
        years: [],
        numbers: [],
        ...(quoted ? { title: quoted[1] } : {}),
        ...(shortTitle ? { shortTitle } : {}),
        // A single capitalised word without a page may be an ordinary aside rather than a citation.
        uncertain: !quoted && !locator,
        issues: citationIssues,
      });
    }
  }
  if (authorDate > 0) issues.push(issue("style-mismatch", "warning", "This citation pattern appears author–date rather than MLA author–page.", "Citations such as (Smith, 2024) belong to author–date styles. MLA cites the author and page, with no year: (Smith 24).", "Check which style your document uses, and choose it above.", `${authorDate} author–date citation${authorDate === 1 ? "" : "s"}`));
  const numeric = numericCitationCount(text);
  if (numeric > 0) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than MLA formatting.", "Citations such as [1] belong to numeric styles such as IEEE.", "Check which style your document uses, and choose it above.", `${numeric} numeric citation${numeric === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const mlaChecker: StyleChecker = {
  id: "mla",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "author-page", list: "Works Cited list", ordering: "alphabetical", yearLetters: false },
  notices: [],
  parseEntry,
  checkList,
  readCitations,
};
