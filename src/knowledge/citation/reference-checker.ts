/**
 * The APA reference-list check, as the Reference Checker first offered it (Sprint
 * 43). The checker now supports several styles (ADR-0009); this keeps the original
 * entry point, which checks a list in APA 7.
 */

import { checkReferences, type ReferenceCheckReport } from "./checker";

export {
  splitReferenceEntries,
  type CheckerIssueCategory,
  type DetectedSourceType,
  type ParseConfidence,
  type ParsedReference,
  type ReferenceCheckIssue,
} from "./checker";

export type ReferenceListReport = ReferenceCheckReport;

/** Checks an APA 7 reference list. */
export function checkReferenceList(text: string): ReferenceListReport {
  return checkReferences({ style: "apa", references: text });
}
