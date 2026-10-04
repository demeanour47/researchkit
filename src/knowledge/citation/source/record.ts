/**
 * A source as a citation workflow handles it, and the shape every style uses to
 * report problems. None of this depends on a citation style.
 */

import type { Source } from "./source";

export type CitationMode = "paraphrase" | "direct-quotation";
export type LocatorKind = "page" | "page-range" | "paragraph" | "section";

export interface CitationLocator {
  kind: LocatorKind;
  value: string;
}

export interface SourceRecord {
  source: Source;
  /** Metadata supplied by the researcher has not been checked against an external source. */
  provenance: "user-entered" | "verified";
}

export interface CitationRequest {
  record: SourceRecord;
  mode: CitationMode;
  locator?: CitationLocator;
}

export type ValidationSeverity = "error" | "warning" | "information";

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  /** What is wrong, or what was decided. */
  message: string;
  /** Why it matters. */
  explanation?: string;
  /** What the researcher can do about it. */
  action?: string;
}
