export {
  COLOUR_TAGS,
  COLOUR_TAG_LABELS,
  COLUMN_PRESETS,
  COLUMN_PRESET_LABELS,
  EMPTY_FIELDS,
  FIELD_GROUPS,
  FIELD_GROUP_LABELS,
  FIELD_INFO,
  MATRIX_FIELDS,
  PRIORITIES,
  PRIORITY_LABELS,
  READING_STATUSES,
  READING_STATUS_LABELS,
  getField,
  type ColourTag,
  type ColumnPreset,
  type FieldGroup,
  type FieldInfo,
  type Matrix,
  type MatrixField,
  type Priority,
  type ReadingStatus,
  type Study,
  type StudyFields,
} from "./types";
export { addStudy, cleanFields, createStudy, deleteStudy, duplicateStudy, listItems, moveStudy, nextId, setFavourite, setPriority, setStatus, setTag, shiftStudy, studyLabel, updateField } from "./matrix";
export { filterStudies, fold, searchStudies, sortStudies, viewStudies, visibleFields, type MatrixView, type SortDirection, type StudyFilter } from "./query";
export { matrixIssues, studyIssues, type MatrixIssue } from "./validate";
export { coveredVariables, isEmptyLens, projectLens, type ProjectLens } from "./project";
export { MIN_STUDIES_FOR_PATTERNS, PATTERN_GROUPS, PATTERN_TITLES, detectPatterns, itemStudyLabels, type PatternGroup, type PatternItem, type PatternReport } from "./patterns";
export { GAP_KINDS, GAP_KIND_LABELS, GAP_THRESHOLDS, potentialGaps, statedGaps, type GapKind, type PotentialGap, type StatedGap } from "./gaps";
export { compareStudies, type Comparison, type ComparisonRow } from "./compare";
export { synthesis, synthesisMarkdown, synthesisText, type SynthesisSection } from "./summary";
export { IMPORT_FORMATS, IMPORT_FORMAT_LABELS, MAX_IMPORT, importStudies, type ImportFormat, type ImportResult } from "./import";
export { lookupDoi, parseDoi, studyFromCsl, type CslItem, type DoiLookup, type DoiMetadataSource } from "./doi";
export { EXPORT_FORMATS, PRINTABLE_COLUMNS, exportMatrix, matrixTable, type ExportFormat, type MatrixFile } from "./export";
export { LITERATURE_LIMITATIONS, LITERATURE_REVIEW_ITEMS } from "./limits";
