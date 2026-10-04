/**
 * Harvard checks against ResearchKit's Harvard profile (Cite Them Right, 13th
 * edition; ADR-0008), the profile the Harvard generator formats:
 *
 *   Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press.
 *   Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’,
 *     Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574
 *   Sneed, A. (2019) The reason Antarctica is melting. Available at: https://… (Accessed: 23 July 2020).
 *
 * Where institutions' Harvard guides commonly differ from the profile, the checker
 * explains the difference as information rather than calling it an error.
 */

import type { Source } from "../../source";
import { readNarrative, readParenthetical, uncertainCitation, unreadYearGroups, type AuthorDateCitation, type AuthorDateGrammar } from "../author-date";
import { ENTRY_FORM_NAMES, clean, entryForm, familyInitialNames, numericCitationCount, quotedTitle } from "../features";
import { issue } from "../issue";
import { checkLinks } from "../links";
import { checkAlphabeticalOrder, checkYearLetters } from "../list";
import type { CitationScan, DetectedSourceType, ParsedReference, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";

const PROFILE = "ResearchKit's Harvard profile";
const LEAD = /^(.+?)\s\(((?:1[5-9]|20)\d\d[a-z]?|no date|n\.d\.)\)(\.?)\s+(.+)$/u;

/** Whether a "Family, Given" list gives any given names in full, such as "Smith, John" rather than "Smith, J.". */
function fullGivenNames(lead: string): boolean {
  const tokens = lead.replace(/,?\s+(?:&|and)\s+/gu, ", ").split(/\s*,\s*/u).filter(Boolean);
  if (tokens.length < 2 || tokens.length % 2 !== 0) return false;
  return tokens.some((token, position) => position % 2 === 1 && /\p{Lu}\p{Ll}{2,}/u.test(token));
}

/**
 * The title and what follows it. The title comes first when there is no author, and
 * after the year otherwise: in quotation marks for an article, or up to the full
 * stop that ends it. A title's own question or exclamation mark ends it too.
 */
function readTitle(lead: string, rest: string, titleFirst: boolean): { title: string; afterTitle: string; quotes: "single" | "double" | null } {
  if (titleFirst) {
    const quoted = quotedTitle(lead);
    return { title: quoted?.title ?? clean(lead), afterTitle: ` ${rest}`, quotes: quoted?.quotes ?? null };
  }
  // A web page with no author begins with its title, so "Available at:" follows the year directly.
  if (/^Available at:/u.test(rest)) return { title: clean(lead), afterTitle: rest, quotes: null };
  const quoted = quotedTitle(rest);
  if (quoted && quoted.index === 0) return { title: quoted.title, afterTitle: rest.slice(quoted.end), quotes: quoted.quotes };
  const ending = /^(.+?)([.?!])(?=\s|$)/u.exec(rest);
  const title = ending ? `${ending[1]}${ending[2] === "." ? "" : ending[2]}` : clean(rest);
  return { title: clean(title), afterTitle: ending ? rest.slice(ending[0].length) : "", quotes: null };
}

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText, text } = entry;
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };
  if (entry.label) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than Harvard author–date formatting.", "A Harvard reference list is alphabetical and unnumbered; a number in front of an entry belongs to numeric styles such as IEEE.", "Remove the numbers if you are using Harvard, or choose the style your list follows.", entry.label.raw));

  const match = LEAD.exec(text);
  if (!match) {
    issues.push(issue("parse-warning", "warning", "The year in brackets after the author could not be found.", `${PROFILE} begins each entry with the author, or the title when there is none, followed by the year in round brackets: Cottrell, S. (2019).`, "Check the entry's opening against the source and the profile."));
    const form = entryForm(text);
    if (form && form !== "author-year" && form !== "author-year-stop") issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `This entry appears to use ${ENTRY_FORM_NAMES[form]}.`, "Check which style your list should follow, and choose it above or reformat the entry.", text));
    return { ...base, sourceType: "unknown", confidence: "unable", issues };
  }

  const [, lead, yearText, stop, rest] = match;
  if (stop) issues.push(issue("date-format", "warning", "The year in brackets is followed by a full stop.", `${PROFILE} writes the year in brackets with no full stop after it: Cottrell, S. (2019) The study … A full stop there is APA's form.`, "Remove the full stop after the closing bracket.", `(${yearText}).`));
  if (yearText === "n.d.") issues.push(issue("date-format", "warning", "A missing date is written n.d.", `${PROFILE} writes “no date” in place of the year: Cool Antarctica (no date).`, "Replace n.d. with no date, in the entry and its citations.", "(n.d.)"));

  const titleFirst = /^[‘“'"]/u.test(lead);
  const names = titleFirst ? { names: [clean(lead.replace(/^[‘“'"]|[’”'"]$/gu, ""))], etAl: false } : familyInitialNames(lead);
  if (!titleFirst) {
    if (/\s&\s/u.test(lead)) issues.push(issue("author-format", "warning", "Authors are joined with “&”.", `${PROFILE} joins the last two authors with “and”: Pears, R. and Shields, G.`, "Replace “&” with “and”.", lead));
    if (fullGivenNames(lead)) issues.push(issue("author-format", "warning", "Given names appear to be written in full.", `${PROFILE} gives each author's family name and initials: Cottrell, S.`, "Reduce given names to initials with full stops.", lead));
    else if (/\p{Lu}\.\s\p{Lu}\./u.test(lead)) issues.push(issue("author-format", "information", "Initials are separated by spaces.", `${PROFILE} writes initials without spaces between them, as in Speight, J.G. Some institutions space them.`, "Close up the initials if you follow the profile.", lead));
    if (names.etAl) issues.push(issue("author-format", "information", "The author list is shortened with et al.", "Cite Them Right lists every author in the reference list and uses et al. only in the text. Some institutions allow et al. in the reference list as well.", "List every author unless your institution's guide allows et al. here.", lead));
  }

  const links = checkLinks(rest, { style: PROFILE, doi: "link", bareUrls: false });
  issues.push(...links.issues);
  const reading = readTitle(lead, rest, titleFirst);
  const { title, afterTitle, quotes } = reading;
  const articleLike = quotes !== null;
  const journalNumbers = /,\s*(\d+)(?:\(([^)]+)\))?,\s/u.exec(afterTitle);
  const sourceType: DetectedSourceType = articleLike || journalNumbers ? "journal-article" : /^\.?\s*Available at:/u.test(afterTitle) ? "webpage" : "book";

  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every Harvard reference identifies the work by its title.", "Check the entry against the source and add the title."));
  if (quotes === "double") issues.push(issue("title-format", "information", "The article title is in double quotation marks.", `${PROFILE} puts article titles in single quotation marks: ‘Global warming risk perceptions in India’.`, "Use single quotation marks unless your institution's guide uses double.", `“${title}”`));

  if (sourceType === "journal-article") {
    if (!journalNumbers) issues.push(issue("journal-structure", "warning", "Journal volume may be missing.", "Harvard locates an article by its journal's volume and issue: Risk Analysis, 40(12).", "Check the journal record and add the volume if it has one."));
    const range = /,\s*(pp?\.\s*)?(\d+\s*[–-]\s*\d+)/u.exec(afterTitle);
    if (range && !range[1]) issues.push(issue("journal-structure", "warning", "The page range has no “pp.”.", `${PROFILE} writes article pages with pp.: pp. 2481–2497.`, "Add pp. before the page range.", range[2]));
    if (range?.[1] === "p. ") issues.push(issue("journal-structure", "warning", "A page range is labelled “p.”.", "A range of pages takes pp.; p. is for a single page.", "Write pp. before the range.", range[0].replace(/^,\s*/u, "")));
    if (!range && !/,\s*pp?\.\s*\d/u.test(afterTitle) && !/\barticle\s+\S/iu.test(afterTitle)) issues.push(issue("journal-structure", "warning", "Page range or article number may be missing.", "Harvard gives an article's pages, or an article number when the journal doesn't use pages.", "Check the journal record."));
  }
  if (sourceType === "book") {
    const details = clean(afterTitle.split(/\s?Available at:/u)[0]).replace(/^\.\s*/u, "");
    const withoutEdition = details.replace(/^\S+\s+edn?\.\s*/u, "");
    if (/\bed\.(?:\s|$)/u.test(details)) issues.push(issue("publisher-structure", "information", "The edition is abbreviated “ed.”.", `${PROFILE} abbreviates edition as “edn”: 5th edn.`, "Write edn if you follow the profile.", details));
    if (!withoutEdition.replace(/\.$/u, "")) issues.push(issue("publisher-structure", "warning", "Publisher may be missing.", "A Harvard book reference names the publisher.", "Add the publisher from the title page or copyright page."));
    else if (/^[\p{Lu}][\p{L}\s.]+:\s\p{Lu}/u.test(withoutEdition)) issues.push(issue("publisher-structure", "information", "A place of publication is given.", "Cite Them Right's 13th edition gives the publisher only; earlier editions and some institutions still give the place.", "Remove the place if you follow the profile.", withoutEdition));
  }

  const link = links.doi?.normalized ? links.doi : links.url?.valid ? links.url : null;
  if (link && !/Available at:\s*$/u.test(rest.slice(0, rest.indexOf(link.raw)))) issues.push(issue(links.doi?.normalized ? "doi" : "url", "information", "The link isn't introduced with “Available at:”.", `${PROFILE} gives a DOI or URL after “Available at:”. Some institutions leave it out before a DOI.`, "Add Available at: before the link if you follow the profile.", link.raw));
  const accessed = /\(Accessed:?\s*([^)]+)\)/u.exec(rest);
  if (links.url?.valid && !links.doi?.normalized && !accessed) issues.push(issue("date-format", "warning", "The URL has no access date.", "Harvard follows a URL with the date you accessed it, because web content changes: (Accessed: 23 July 2020).", "Add the date you accessed the source after the URL.", links.url.raw));
  if (links.doi?.normalized && accessed) issues.push(issue("date-format", "information", "An access date is given with a DOI.", "A DOI doesn't change, so the profile gives an access date only with a URL.", "Remove the access date unless your institution asks for it.", accessed[0]));
  if (!names.names.length) issues.push(issue("author-format", "warning", "No author could be identified confidently.", "Some works have no named author, but an organization responsible for the work is usually the author.", "Check the source for an author or responsible organization."));

  const year = /^\d/u.test(yearText) ? yearText : null;
  const date = { year: year ? Number(year.slice(0, 4)) : undefined };
  const authors = titleFirst ? [] : names.names.map((name) => ({ kind: "organization" as const, name }));
  const source: Source =
    sourceType === "journal-article"
      ? { type: "journal-article", authors, date, title, journal: "", doi: links.doi?.normalized ?? undefined, url: links.url?.raw }
      : sourceType === "webpage"
        ? { type: "webpage", authors, date, title, url: links.url?.raw ?? "" }
        : { type: "book", authors, date, title, doi: links.doi?.normalized ?? undefined, url: links.url?.raw };

  return { ...base, sourceType, confidence: title && names.names.length ? "high" : "partial", source, key: { names: names.names, etAl: names.etAl, year, title, number: null }, issues };
}

function checkList(references: readonly ParsedReference[]): void {
  checkAlphabeticalOrder(references, { explanation: "A Harvard reference list is in alphabetical order by author, or by title when there is no author; one author's works go by year, earliest first.", sameAuthorByYear: true });
  checkYearLetters(references, "Harvard tells apart works by the same author in the same year with a letter after the year, such as 2024a and 2024b, in the reference and every citation.");
}

const GRAMMAR: AuthorDateGrammar = { separator: "comma", joiner: "and", noDate: "no date", locatorLabels: true, etAlFrom: 4 };

function diagnose(citation: AuthorDateCitation): AuthorDateCitation {
  const issues: ReferenceCheckIssue[] = [];
  for (const problem of citation.problems) {
    if (problem === "separator-missing") issues.push(issue("citation-format", "information", "There is no comma between the author and the year.", `${PROFILE} writes (Smith, 2015). Some institutions' Harvard omits the comma: (Smith 2015).`, "Add a comma if you follow the profile.", citation.evidence));
    if (problem === "joiner") issues.push(issue("citation-format", "warning", "Authors are joined with “&”.", `${PROFILE} joins two or three authors with “and”: (Hughes and Ali, 2022).`, "Replace “&” with “and”.", citation.evidence));
    if (problem === "no-date-form") issues.push(issue("citation-format", "warning", "A missing date is written n.d.", `${PROFILE} writes “no date”: (Cool Antarctica, no date).`, "Replace n.d. with no date.", citation.evidence));
    if (problem === "locator-label-missing") issues.push(issue("locator", "warning", "The page number needs “p.” or “pp.”.", "Harvard labels page numbers: (Smith, 2015, p. 23).", "Add p. for one page or pp. for a range.", citation.evidence));
    if (problem === "et-al-missing") issues.push(issue("citation-format", "warning", "Four or more authors are all named in the citation.", `${PROFILE} cites four or more authors as the first author and et al.: (Gerrard et al., 2005).`, "Shorten the names to the first author and et al.", citation.evidence));
  }
  return { ...citation, issues };
}

function readCitations(text: string): CitationScan {
  const citations = [...readParenthetical(text, GRAMMAR), ...readNarrative(text, GRAMMAR)].map(diagnose);
  const issues: ReferenceCheckIssue[] = unreadYearGroups(text, citations).map(uncertainCitation);
  const numeric = numericCitationCount(text);
  if (numeric > 0) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than Harvard author–date formatting.", "Citations such as [1] belong to numeric styles. Harvard cites the author and year: (Smith, 2015).", "Check which style your document uses, and choose it above.", `${numeric} numeric citation${numeric === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const harvardChecker: StyleChecker = {
  id: "harvard",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "author-date", list: "reference list", ordering: "alphabetical", yearLetters: true },
  notices: [
    issue("manual-review", "information", "Harvard validation follows the ResearchKit Harvard profile and may differ from institutional Harvard requirements.", "Harvard has no single official version. The checker follows ResearchKit's defined profile, based on Cite Them Right, 13th edition, and explains common institutional differences as information.", "Check your university's referencing requirements, and follow them where they differ."),
  ],
  parseEntry,
  checkList,
  readCitations,
};
