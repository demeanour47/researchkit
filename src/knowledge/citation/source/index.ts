/**
 * The style-neutral citation layer (ADR-0006): the source model, contributors,
 * dates, identifiers, formatted runs and the validation shape. Every citation style
 * builds on this; nothing here depends on a style.
 */

export { isBlank, type Contributor } from "./contributor";
export { MONTHS, daysInMonth, isLeapYear, isWholeNumberIn, type PublicationDate } from "./date";
export { formatPages, isWebAddress, normalizeDoi, ordinal } from "./identifiers";
export {
  type CitationLocator,
  type CitationMode,
  type CitationRequest,
  type LocatorKind,
  type SourceRecord,
  type ValidationIssue,
  type ValidationSeverity,
} from "./record";
export { endsWithTerminalPunctuation, italic, mergeRuns, placeholder, plain, plainText, type Run } from "./runs";
export {
  SOURCE_TYPES,
  parseSourceType,
  type BookSource,
  type JournalArticleSource,
  type Source,
  type SourceType,
  type WebpageSource,
} from "./source";
