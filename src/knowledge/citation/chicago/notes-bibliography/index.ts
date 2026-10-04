/** Chicago notes and bibliography (CMOS 18): full notes, shortened notes and bibliography entries over the shared source model (ADR-0006). */

export { analyse, type Analysis } from "./analysis";
export { formatChicagoBibliography, type ChicagoBibliographyEntry } from "./bibliography";
export { formatChicagoNotesBibliography, type ChicagoNotesBibliographyCitation } from "./citation";
export { formatChicagoNote, type ChicagoNote } from "./note";
export type { Decision, Note } from "./notes";
export type { NoteContext, NoteLocator, NoteLocatorKind, NotesBibliographyRequest } from "./request";
export { chicagoShortTitle, type ShortTitle } from "./short-title";
export { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";
