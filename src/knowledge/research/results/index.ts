export { RESULT_FIELDS, RESULT_KINDS, SIGNIFICANCE_LEVELS, getFields, type FieldSpec, type ResultInput, type ResultKind, type SignificanceLevel } from "./types";
export { resultProblems, type ResultProblem } from "./validate";
export { formatAlpha, formatBounded, formatP, formatPValue, formatPlain, formatStat, levelPercent, statisticText } from "./format";
export { significance, type Significance, type SignificanceStatus } from "./significance";
export { alphaMagnitude, correlationMagnitude, cramersVMagnitude, dMagnitude, etaMagnitude, fMagnitude, fitIndices, hMagnitude, kmoMagnitude, plsR2Magnitude, r2Magnitude, wMagnitude, type FitIndex, type FitVerdict, type Magnitude } from "./effect-size";
export { calculateEffectSize, EFFECT_SIZE_METHOD_IDS, type CalculationStep, type EffectSizeCalculation, type EffectSizeInput, type EffectSizeMethodId } from "./effect-size-calculate";
export { COMMON_MISTAKES } from "./mistakes";
export { interpretNumbers, type CoreInterpretation, type Direction as ResultDirection, type StatisticLine } from "./interpret";
export {
  HYPOTHESIS_STATUS_LABELS,
  contextLimitations,
  hypothesisConnection,
  interpretResult,
  linkedHypothesis,
  objectiveConnections,
  planConnection,
  researchQuestionConnection,
  type HypothesisConnection,
  type HypothesisStatus,
  type InterpretationOutcome,
  type ResultInterpretation,
} from "./context";
export { RESULTS_LIMITATIONS, RESULTS_REVIEW_ITEMS, interpretationText } from "./summary";
