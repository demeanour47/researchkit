export { analyseTitle, type GrammarIndicator, type TitleAnalysis } from "./analyse";
export {
  ALIGNMENT_ISSUE_IDS,
  ALIGNMENT_ISSUE_LABELS,
  ALIGNMENT_SOURCES,
  ALIGNMENT_SOURCE_LABELS,
  ALIGNMENT_STATUS_LABELS,
  alignTitle,
  type AlignmentIssue,
  type AlignmentIssueId,
  type AlignmentSource,
  type AlignmentStatus,
  type SourceAlignment,
  type TitleAlignment,
} from "./alignment";
export {
  CORE_CRITERIA,
  CRITERION_IDS,
  CRITERION_LABELS,
  CRITERION_STATUS_LABELS,
  LENGTH_BANDS,
  TITLE_CATEGORIES,
  TITLE_CATEGORY_LABELS,
  TITLE_CATEGORY_MEANINGS,
  TITLE_LIMITATIONS,
  categorise,
  evaluateTitle,
  type CriterionId,
  type CriterionResult,
  type CriterionStatus,
  type TitleCategory,
  type TitleEvaluation,
} from "./evaluate";
export { TITLE_EXAMPLES, type TitleExample } from "./examples";
export { KEYWORD_ELEMENTS, KEYWORD_LABELS, extractKeywords, projectDesign, projectPopulation, projectVariables, titleNames, type Keyword, type KeywordElement, type KeywordPanel } from "./keywords";
export { TITLE_PATTERNS, TITLE_PATTERN_IDS, classifyTitle, getTitlePattern, primaryPattern, type PatternMatch, type TitlePattern, type TitlePatternId } from "./patterns";
export { REPORT_TITLE, titleReport } from "./report";
export {
  EMPTY_TITLE_SET,
  HISTORY_LIMIT,
  addTitle,
  editTitle,
  removeTitle,
  restoreVersion,
  setWorkingTitle,
  titleSetFrom,
  toggleFavourite,
  workingTitle,
  type CandidateTitle,
  type TitleSet,
  type TitleVersion,
} from "./titles";
