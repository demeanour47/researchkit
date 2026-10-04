/**
 * The Reference Checker, end to end: split the pasted list, let the selected
 * style's checker read each entry and the list, find likely duplicates, match any
 * citations to entries, and count what was found. The selected style decides every
 * style rule; nothing here assumes one.
 */

import { sourceIdentity } from "../workflow";
import { matchCitations } from "./consistency";
import { comparable } from "./features";
import { issue } from "./issue";
import { segment } from "./segment";
import { apaChecker } from "./styles/apa";
import { chicagoAuthorDateChecker } from "./styles/chicago-author-date";
import { chicagoNotesBibliographyChecker } from "./styles/chicago-notes-bibliography";
import { harvardChecker } from "./styles/harvard";
import { ieeeChecker } from "./styles/ieee";
import { mlaChecker } from "./styles/mla";
import type { CheckerStyleId, CitationFinding, ParsedReference, ReferenceCheckIssue, ReferenceCheckReport, StyleChecker } from "./types";

/** Every style's checker, by style. */
export const STYLE_CHECKERS: Record<CheckerStyleId, StyleChecker> = {
  apa: apaChecker,
  mla: mlaChecker,
  "chicago-author-date": chicagoAuthorDateChecker,
  "chicago-notes-bibliography": chicagoNotesBibliographyChecker,
  ieee: ieeeChecker,
  harvard: harvardChecker,
};

export interface CheckRequest {
  style: CheckerStyleId;
  /** The reference list, works cited list or bibliography, as pasted. */
  references: string;
  /** Text with in-text citations, or notes, as pasted. Optional. */
  citations?: string;
}

/** Marks entries that are probably the same work: the same DOI, the same normalized title and year, or the same URL. */
function checkDuplicates(references: readonly ParsedReference[]): void {
  const seen = new Map<string, number>();
  for (const reference of references) {
    if (reference.excluded || !reference.source) continue;
    const identity = sourceIdentity({ source: reference.source, provenance: "user-entered" });
    // Without a DOI, identity is the title and year; an entry whose title couldn't be read has none.
    const keys = identity.startsWith("|") ? [] : [identity];
    const url = "url" in reference.source ? reference.source.url : undefined;
    if (url) keys.push(`url|${comparable(url.replace(/^(?:https?:\/\/)?(?:www\.)?/iu, ""))}`);
    const previous = keys.map((key) => seen.get(key)).find((index) => index !== undefined);
    if (previous !== undefined) {
      reference.issues.push(issue("duplicate", "warning", "Possible duplicate reference.", "This entry has the same DOI, the same title and year, or the same URL as another entry.", `Compare references ${previous} and ${reference.index}, and keep both only if they are different works. The checker doesn't merge or delete entries.`, `Matches reference ${previous}`));
    } else for (const key of keys) seen.set(key, reference.index);
  }
}

const HEURISTIC: ReferenceCheckIssue = issue(
  "citation-consistency",
  "information",
  "Citation matching is heuristic.",
  "The checker matches citations to entries by the patterns of the selected style. It can miss citations written in unusual ways, and the text you paste may not be your whole document.",
  "Treat unmatched and uncited items as prompts to check, not proof of an error.",
);

export function checkReferences({ style, references, citations = "" }: CheckRequest): ReferenceCheckReport {
  const checker = STYLE_CHECKERS[style];
  const parsed = segment(references).map((entry) => checker.parseEntry(entry));
  checker.checkList(parsed);
  checkDuplicates(parsed);

  const notices: ReferenceCheckIssue[] = [...checker.notices];
  let findings: CitationFinding[] = [];
  const checked = citations.trim() !== "";
  if (checked) {
    const scan = checker.readCitations(citations);
    notices.push(HEURISTIC, ...scan.issues);
    if (scan.citations.length === 0) {
      notices.push(issue("citation-consistency", "information", checker.capabilities.citations === "notes" ? "No notes were recognised." : "No citations were recognised.", "None of the text you pasted reads as a citation in the selected style, so citations couldn't be matched to the list.", "Check that the style is right and that the text includes citations."));
    }
    findings = matchCitations(parsed, scan.citations, checker.capabilities);
  } else if (checker.capabilities.ordering === "numeric" && parsed.length > 0) {
    notices.push(issue("numbering", "information", "Citation order wasn't checked.", "IEEE numbers references in the order they are first cited. Without your text, the checker can only check the numbers in the list.", "Paste the text with your citations to check them against the list."));
  }

  const all = [...parsed.flatMap((reference) => reference.issues), ...notices, ...findings.flatMap((item) => item.issues)];
  const count = (severity: ReferenceCheckIssue["severity"]) => all.filter((item) => item.severity === severity).length;
  return {
    style,
    references: parsed,
    notices,
    citations: {
      checked,
      findings,
      unmatched: findings.filter((item) => item.matches.length === 0 && item.issues.some((found) => found.category === "citation-consistency")).length,
      uncited: parsed.filter((reference) => reference.issues.some((found) => found.message === "Reference may be uncited.")).length,
    },
    total: parsed.length,
    referencesWithIssues: parsed.filter((reference) => reference.issues.length > 0).length,
    potentialDuplicates: parsed.filter((reference) => reference.issues.some((found) => found.category === "duplicate")).length,
    orderingIssues: parsed.filter((reference) => reference.issues.some((found) => found.category === "ordering" || found.category === "numbering")).length,
    manualReviewItems: parsed.filter((reference) => reference.issues.some((found) => found.category === "manual-review" || found.category === "parse-warning")).length,
    counts: { error: count("error"), warning: count("warning"), information: count("information") },
    empty: parsed.length === 0,
  };
}
