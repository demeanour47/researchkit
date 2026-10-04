/** MLA Style, 9th edition: works-cited entries and in-text citations over the shared source model (ADR-0006). */

export { formatMla, type MlaCitation } from "./citation";
export { MLA_MONTHS, formatMlaDate, type MlaDate } from "./dates";
export { formatInText, type MlaInText, type MlaNarrative } from "./in-text";
export { parentheticalAuthors, proseAuthors, worksCitedAuthors } from "./names";
export type { Container, Decision, Note, RecommendedField, RequiredField } from "./notes";
export { formatMlaPages } from "./numbers";
export { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";
export { formatWorksCited, type Lead, type WorksCitedEntry } from "./works-cited";
