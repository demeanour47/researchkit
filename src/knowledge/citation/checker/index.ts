/** The Reference Checker (ADR-0009): style-specific checkers behind one contract, with style-neutral splitting, duplicate detection and citation matching. */

export { STYLE_CHECKERS, checkReferences, type CheckRequest } from "./report";
export { segment, splitReferenceEntries } from "./segment";
export {
  CHECKER_STYLES,
  parseCheckerStyle,
  type CheckerIssueCategory,
  type CheckerStyleId,
  type CitationFinding,
  type DetectedSourceType,
  type ParseConfidence,
  type ParsedReference,
  type RecognizedCitation,
  type ReferenceCheckIssue,
  type ReferenceCheckReport,
  type StyleCapabilities,
  type StyleChecker,
} from "./types";
