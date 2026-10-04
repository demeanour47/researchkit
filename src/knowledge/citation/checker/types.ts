/**
 * The Reference Checker's contract (ADR-0009). Text is split into entries, each
 * selected style's checker reads them and reports what it finds, a style-neutral
 * analyzer matches citations to entries, and everything is reported as issues. The
 * checker diagnoses; it never rewrites what the writer pasted.
 */

import type { Source, SourceType, ValidationSeverity } from "../source";

/** The citation styles the checker can check, one per citation system. */
export const CHECKER_STYLES = ["apa", "mla", "chicago-author-date", "chicago-notes-bibliography", "ieee", "harvard"] as const;

export type CheckerStyleId = (typeof CHECKER_STYLES)[number];

/** Reads a style from untrusted input, such as a form value. Null if the checker doesn't support it. */
export function parseCheckerStyle(value: unknown): CheckerStyleId | null {
  return CHECKER_STYLES.find((style) => style === value) ?? null;
}

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
  | "numbering"
  | "locator"
  | "citation-format"
  | "citation-consistency"
  | "style-mismatch"
  | "unsupported-structure"
  | "verification-required"
  | "manual-review";

export interface ReferenceCheckIssue {
  category: CheckerIssueCategory;
  severity: ValidationSeverity;
  message: string;
  explanation: string;
  action: string;
  /** The text the issue is about, exactly as pasted. */
  evidence?: string;
}

export type ParseConfidence = "high" | "partial" | "unable";
export type DetectedSourceType = SourceType | "unknown";

/** A number or label in front of an entry: "[3]" or "3.". */
export interface ReferenceLabel {
  raw: string;
  form: "bracket" | "list";
  /** The number, or null when the label isn't a whole number, such as "[3a]". */
  number: number | null;
}

/** One entry as pasted, before any style reads it. */
export interface ReferenceEntry {
  index: number;
  originalText: string;
  /** The entry without its label, with whitespace collapsed. */
  text: string;
  label?: ReferenceLabel;
}

/** How citations name an entry: who, when, what, or which number. */
export interface ReferenceKey {
  /** Family names, or organization names in full, in the order the entry gives them. */
  names: string[];
  /** Whether the entry shortens its author list with et al. */
  etAl: boolean;
  /** The year with any letter, "2024a", or null when there is none. */
  year: string | null;
  title: string;
  number: number | null;
}

export interface ParsedReference {
  index: number;
  originalText: string;
  sourceType: DetectedSourceType;
  confidence: ParseConfidence;
  /** The source the checker could read, in the shared model, for list-wide checks such as duplicates. */
  source?: Source;
  key?: ReferenceKey;
  label?: ReferenceLabel;
  /** True when the entry isn't a list entry at all, such as a note pasted into a bibliography; list-wide checks skip it. */
  excluded?: boolean;
  issues: ReferenceCheckIssue[];
}

/** A citation the selected style's grammar recognised in the writer's text. */
export interface RecognizedCitation {
  /** The citation exactly as written. */
  evidence: string;
  kind: "parenthetical" | "narrative" | "numeric" | "full-note" | "short-note";
  /** Family or organization names, as written. */
  names: string[];
  etAl: boolean;
  /** Years cited for the names, each with any letter; empty for styles without years in citations. */
  years: string[];
  numbers: number[];
  /** A title standing in for an author, as written. */
  title?: string;
  /** A short title given beside the author, as in a shortened note, to tell apart works by the same author. */
  shortTitle?: string;
  /**
   * Text just before a narrative citation, so an organization's full name can be
   * matched even though only its last word sits next to the year.
   */
  context?: string;
  /** True when the names could be part of a longer phrase, so a failed match is reported as uncertain rather than missing. */
  uncertain?: boolean;
  /** Problems with how the citation is written in this style. */
  issues: ReferenceCheckIssue[];
}

export interface CitationScan {
  citations: RecognizedCitation[];
  /** Problems with the text as a whole, such as citations in another style's form. */
  issues: ReferenceCheckIssue[];
}

/** What a style's checker can check, so the interface never claims more. */
export interface StyleCapabilities {
  /** The source types whose structure the checker reads. */
  sourceTypes: readonly SourceType[];
  /** How citations in the text identify a source. */
  citations: "author-date" | "author-page" | "numeric" | "notes";
  /** What the style calls its list. */
  list: "reference list" | "Works Cited list" | "bibliography";
  /** How the list is ordered. */
  ordering: "alphabetical" | "numeric";
  /** Whether the style tells same-author, same-year works apart with letters. */
  yearLetters: boolean;
}

/** One style's checks, behind the shared contract. */
export interface StyleChecker {
  id: CheckerStyleId;
  capabilities: StyleCapabilities;
  /** Notices every report in this style carries, such as a profile it follows. */
  notices: readonly ReferenceCheckIssue[];
  /** Reads one entry and reports problems with it. */
  parseEntry(entry: ReferenceEntry): ParsedReference;
  /** Checks across the list, such as order, numbering and year letters, adding issues to the entries. */
  checkList(references: readonly ParsedReference[]): void;
  /** Recognises citations, or notes, in the writer's text. */
  readCitations(text: string): CitationScan;
}

/** A citation and what matching it to the list found. */
export interface CitationFinding {
  citation: RecognizedCitation;
  /** The entries it matches, by index. */
  matches: number[];
  issues: ReferenceCheckIssue[];
}

export interface ReferenceCheckReport {
  style: CheckerStyleId;
  references: ParsedReference[];
  /** Issues about the report as a whole: notices, and the text's citation form. */
  notices: ReferenceCheckIssue[];
  citations: {
    /** Whether any text with citations was given. */
    checked: boolean;
    findings: CitationFinding[];
    unmatched: number;
    uncited: number;
  };
  total: number;
  referencesWithIssues: number;
  potentialDuplicates: number;
  orderingIssues: number;
  manualReviewItems: number;
  counts: Record<ValidationSeverity, number>;
  empty: boolean;
}
