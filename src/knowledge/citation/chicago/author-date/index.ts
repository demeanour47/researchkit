/** Chicago author-date (CMOS 18): reference list entries and text citations over the shared source model (ADR-0006). */

export { formatChicagoAuthorDate, type ChicagoAuthorDateCitation } from "./citation";
export { formatChicagoTextCitations, type ChicagoTextCitations } from "./in-text";
export type { Decision, Note } from "./notes";
export { formatChicagoReference, type ChicagoReference, type Lead } from "./reference";
export { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";
