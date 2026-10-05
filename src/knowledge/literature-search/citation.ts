/**
 * The link from discovery to citation: a found work becomes the SourceRecord the APA 7
 * builder already formats (ADR-0006), so Literature Explorer needs no formatter of its own.
 */

import { formatCitationRequest } from "../citation/workflow";
import { plainText, type Run, type SourceRecord, type ValidationIssue } from "../citation/source";
import type { LiteratureRecord } from "./types";

/**
 * Marked "user-entered", i.e. not externally verified: OpenAlex data is machine-collected,
 * author names are split by rule, and the student hasn't checked either against the work.
 */
export function toSourceRecord(record: LiteratureRecord): SourceRecord {
  return { source: record.source, provenance: "user-entered" };
}

export interface ApaReference {
  runs: Run[];
  text: string;
  /** Problems a student should fix before relying on the reference, such as a missing journal. */
  issues: ValidationIssue[];
  /** False when required parts are missing, so the reference would contain placeholders. */
  complete: boolean;
}

export function apaReference(record: LiteratureRecord): ApaReference {
  const result = formatCitationRequest({ record: toSourceRecord(record), mode: "paraphrase" });
  const runs = result.citation.reference;
  const issues = result.issues.filter((issue) => issue.severity !== "information");
  return { runs, text: plainText(runs), issues, complete: !issues.some((issue) => issue.severity === "error") };
}
