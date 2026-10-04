/**
 * Matching citations to list entries, whatever the style: by author and year, by
 * author alone, by number, or by the author and short title of a note. Matching is
 * heuristic. A citation that can't be matched is reported with what was looked for,
 * one whose reading is uncertain is reported as uncertain, and an entry no citation
 * matched "may be" uncited. Nothing is changed in the text or the list.
 */

import { comparable } from "./features";
import type { CitationFinding, ParsedReference, RecognizedCitation, ReferenceCheckIssue, ReferenceKey, StyleCapabilities } from "./types";

const finding = (severity: ReferenceCheckIssue["severity"], message: string, explanation: string, action: string, evidence: string): ReferenceCheckIssue => ({
  category: "citation-consistency",
  severity,
  message,
  explanation,
  action,
  evidence,
});

const UNDATED = new Set(["n.d.", "no date"]);

/** Whether a citation's first name, or title, identifies the entry. */
function namesMatch(citation: RecognizedCitation, key: ReferenceKey): boolean {
  if (citation.title) {
    const wanted = comparable(citation.title);
    return comparable(key.title).startsWith(wanted) || comparable(key.names[0] ?? "") === wanted;
  }
  const entryFirst = comparable(key.names[0] ?? "");
  if (!entryFirst) return false;
  const first = comparable(citation.names[0] ?? "");
  // An organization's full name may run past the words next to the year in a narrative citation.
  const firstMatches = first === entryFirst || (citation.context !== undefined && comparable(`${citation.context} ${citation.names[0]}`).endsWith(entryFirst) && entryFirst.endsWith(first));
  if (!firstMatches) return false;
  if (citation.names.length >= 2 && !citation.etAl) return comparable(key.names[1] ?? "") === comparable(citation.names[1]);
  return true;
}

const yearMatches = (year: string, key: ReferenceKey) => (UNDATED.has(year) ? key.year === null : (key.year ?? "").toLowerCase() === year.toLowerCase());

const who = (citation: RecognizedCitation) => (citation.title ? `“${citation.title}”` : `${citation.names.join(" and ")}${citation.etAl ? " et al." : ""}`);

const listed = (references: readonly ParsedReference[]) => references.filter((reference) => !reference.excluded && reference.key);

function unmatched(citation: RecognizedCitation, capabilities: StyleCapabilities, wanted: string): ReferenceCheckIssue {
  const listName = capabilities.list;
  if (citation.uncertain) {
    return finding("information", "Could not confidently identify citation.", "The words before the year may be part of a longer name or an ordinary phrase, so the checker can't tell which entry is meant.", `Check that ${listName === "Works Cited list" ? "the Works Cited list" : `the ${listName}`} has an entry for this citation.`, citation.evidence);
  }
  return finding("warning", `Citation appears without a matching ${listName} entry.`, `No entry for ${wanted} was found. Matching is heuristic: the entry may be missing, or the name, year or spelling may differ between the citation and the entry.`, "Add the missing entry, or correct the citation or entry so they agree.", citation.evidence);
}

/** Matches every citation and marks entries no citation matched. */
export function matchCitations(references: readonly ParsedReference[], citations: readonly RecognizedCitation[], capabilities: StyleCapabilities): CitationFinding[] {
  const entries = listed(references);
  const cited = new Set<number>();
  const findings = citations.map((citation): CitationFinding => {
    const issues: ReferenceCheckIssue[] = [...citation.issues];
    let matches: number[] = [];

    if (capabilities.citations === "numeric") {
      for (const number of citation.numbers) {
        const found = entries.filter((entry) => entry.key?.number === number);
        if (found.length === 0) issues.push(finding("error", `Citation [${number}] has no matching numbered reference.`, "Every number cited in the text must lead to the reference with that number in the list.", "Add the missing reference, or correct the number in the text.", citation.evidence));
        matches.push(...found.map((entry) => entry.index));
      }
    } else if (capabilities.citations === "author-date") {
      const byName = entries.filter((entry) => namesMatch(citation, entry.key as ReferenceKey));
      for (const year of citation.years) {
        const found = byName.filter((entry) => yearMatches(year, entry.key as ReferenceKey));
        if (found.length > 0) matches.push(...found.map((entry) => entry.index));
        else if (byName.length > 0) {
          const other = byName.map((entry) => entry.key?.year ?? "no date").join(", ");
          issues.push(finding("warning", `No entry by ${who(citation)} from ${year} was found.`, `The list has ${who(citation)} from ${other}. The year, or its letter, differs between the citation and the entry.`, "Correct the year in the citation or the entry so they agree.", citation.evidence));
        } else issues.push(unmatched(citation, capabilities, `${who(citation)}, ${year}`));
      }
    } else {
      // Author–page citations and notes identify a work by author, with a title where several entries share the author.
      let found = entries.filter((entry) => namesMatch(citation, entry.key as ReferenceKey));
      const shortTitle = citation.shortTitle ? comparable(citation.shortTitle) : "";
      if (found.length > 1 && shortTitle) {
        const titled = found.filter((entry) => comparable(entry.key?.title ?? "").startsWith(shortTitle));
        if (titled.length > 0) found = titled;
      }
      if (found.length === 0) issues.push(unmatched(citation, capabilities, who(citation)));
      matches = found.map((entry) => entry.index);
    }

    for (const index of matches) cited.add(index);
    return { citation, matches: [...new Set(matches)], issues };
  });

  if (citations.length > 0) {
    for (const entry of entries) {
      if (cited.has(entry.index)) continue;
      const notes = capabilities.citations === "notes";
      entry.issues.push({
        category: "citation-consistency",
        severity: notes ? "information" : "warning",
        message: "Reference may be uncited.",
        explanation: notes
          ? "No note in the text you pasted matches this entry. A Chicago bibliography may also list works you consulted but didn't cite, so this may be intended."
          : `No citation in the text you pasted matches this entry. Matching is heuristic, and the text you pasted may not be the whole document.`,
        action: notes ? "Check that you meant to include this work." : "Check that the work is cited, or remove it from the list if it isn't.",
      });
    }
  }
  return findings;
}
