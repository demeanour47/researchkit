/** IEEE style (IEEE Reference Guide, v. 3.28.2025): numbered references and citations over the shared source model (ADR-0006, ADR-0007). */

export { formatIeee, type IeeeSourceCitation } from "./citation";
export { IEEE_MONTHS, ieeeDate } from "./dates";
export { bracketNumbers, formatMultipleCitation, formatSingleCitation, locatorText, namedCitation, type IeeeCitation } from "./in-text";
export { MAX_LISTED_AUTHORS, ieeeName, referenceAuthors, textAuthors } from "./names";
export type { Decision, Note } from "./notes";
export { formatIeeeReference, numberedReference, type IeeeReference } from "./reference";
export type { IeeeLocator, IeeeLocatorKind, IeeeMultipleRequest, IeeeReferenceRequest, RangeStyle } from "./request";
export { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";
