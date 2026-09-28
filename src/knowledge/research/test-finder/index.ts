export {
  COMPARISONS,
  FINDER_LEVELS,
  FINDER_PURPOSES,
  FINDER_QUESTION_IDS,
  PURPOSE_OPTIONS,
  activeAnswers,
  getQuestion,
  isNumeric,
  namesOutcome,
  namesPredictor,
  unansweredQuestions,
  visibleQuestions,
  type Comparison,
  type Count,
  type FinderAnswers,
  type FinderLevel,
  type FinderOption,
  type FinderPurpose,
  type FinderQuestion,
  type FinderQuestionId,
  type Normality,
  type YesNo,
} from "./questions";
export {
  FINDER_FITS,
  FIT_LABELS,
  alternativesFor,
  answerProblems,
  assumptionCheckerCovers,
  assumptionsFor,
  describeSituation,
  findTests,
  interpreterCovers,
  type CandidateAlternative,
  type CandidateAssumption,
  type CandidateTest,
  type FinderFit,
  type FinderResult,
  type MissingAnswer,
} from "./finder";
export { PROFILED_TESTS, TEST_PROFILES, isProfiledTest, whyItFits, type DataStructure, type ProfiledTest, type TestProfile } from "./profiles";
export { WORKED_EXAMPLES, WORKED_EXAMPLE_IDS, getWorkedExample, type ExampleDataset, type ExampleVariable, type WorkedExample, type WorkedExampleId } from "./examples";
export { FORMULAS, FORMULA_IDS, getFormula, type Formula, type FormulaId } from "./formulas";
export {
  FIGURE_IDS,
  INDEPENDENCE_FIGURE,
  NORMALITY_FIGURE,
  PAIRING_FIGURE,
  STRUCTURE_DIAGRAMS,
  STRUCTURE_DIAGRAM_IDS,
  VARIANCE_FIGURE,
  type DiagramBox,
  type DiagramLink,
  type DotPanel,
  type FigureId,
  type HistogramPanel,
  type IndependenceFigure,
  type NormalityFigure,
  type PairingFigure,
  type StructureDiagram,
  type StructureDiagramId,
  type VarianceFigure,
} from "./figures";
export { DECISION_TREE, treeLeaves, type TreeLeaf, type TreeNode } from "./tree";
export { COMPARISON_MATRIX, MATRIX_COLUMNS, type MatrixRow } from "./matrix";
export { DEPARTMENTS, TRAINING_DAYS, median as medianOf, modes, trainingSummary, type DescriptiveSummary } from "./descriptive";
export { projectStarts, type ProjectStart } from "./project";
export { TEST_FINDER_LIMITATIONS } from "./limits";
