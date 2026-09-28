/**
 * The questions the Statistical Test Finder asks, and which of them apply given the
 * answers so far. Questions appear one layer at a time: nothing is asked until an
 * earlier answer makes it relevant, and an answer to a question that no longer applies
 * is set aside rather than used.
 *
 * Measurement levels are the project's own (see variable-types.ts); the finder offers
 * the four classic levels and reuses their definitions.
 */

import { MEASUREMENT_LEVEL_INFO, type MeasurementLevel } from "../variable-types";

export const FINDER_PURPOSES = ["describe", "compare", "relationship", "predict", "association"] as const;
export type FinderPurpose = (typeof FINDER_PURPOSES)[number];

export const FINDER_LEVELS = ["nominal", "ordinal", "interval", "ratio"] as const satisfies readonly MeasurementLevel[];
export type FinderLevel = (typeof FINDER_LEVELS)[number];

export const COMPARISONS = ["value", "independent", "paired"] as const;
export type Comparison = (typeof COMPARISONS)[number];

export type Count = "two" | "three-plus";
export type YesNo = "yes" | "no";
export type Normality = "yes" | "no" | "unknown";

/** The researcher's answers. Every field is optional, because questions are answered one at a time. */
export interface FinderAnswers {
  purpose?: FinderPurpose;
  comparison?: Comparison;
  /** The outcome, or for a relationship the first variable. */
  outcomeLevel?: FinderLevel;
  outcomeName?: string;
  /** The predictor, or for a relationship the second variable. */
  predictorLevel?: FinderLevel;
  predictorName?: string;
  /** How many independent groups are compared. */
  groups?: Count;
  /** How many times the same participants are measured. */
  measurements?: Count;
  /** How many categories a categorical outcome has, when predicting it. */
  outcomeCategories?: Count;
  /** How many categories a categorical predictor has. */
  predictorCategories?: Count;
  predictors?: "one" | "several";
  categoricalVariables?: "one" | "two";
  /** Whether a second grouping variable is compared at the same time. */
  secondFactor?: YesNo;
  /** Whether a numeric variable is controlled for. */
  covariate?: YesNo;
  normality?: Normality;
}

export const FINDER_QUESTION_IDS = [
  "purpose",
  "comparison",
  "outcomeLevel",
  "groups",
  "measurements",
  "secondFactor",
  "covariate",
  "outcomeCategories",
  "predictors",
  "predictorLevel",
  "predictorCategories",
  "categoricalVariables",
  "normality",
] as const;
export type FinderQuestionId = (typeof FINDER_QUESTION_IDS)[number];

export interface FinderOption {
  value: string;
  label: string;
  hint?: string;
}

export interface FinderQuestion {
  id: FinderQuestionId;
  prompt: string;
  hint: string;
  options: readonly FinderOption[];
  /** Why the answer matters, shown when it is still missing. */
  why: string;
}

export const isNumeric = (level: FinderLevel | undefined): boolean => level === "interval" || level === "ratio";

const levelOptions: readonly FinderOption[] = FINDER_LEVELS.map((level) => ({
  value: level,
  label: MEASUREMENT_LEVEL_INFO[level].label,
  hint: MEASUREMENT_LEVEL_INFO[level].definition,
}));
const countOptions = (two: string, more: string): readonly FinderOption[] => [
  { value: "two", label: two },
  { value: "three-plus", label: more },
];
const yesNo = (yes: string, no: string): readonly FinderOption[] => [
  { value: "yes", label: yes },
  { value: "no", label: no },
];

export const PURPOSE_OPTIONS: readonly FinderOption[] = [
  { value: "describe", label: "Describe a variable", hint: "Summarise its typical value and how spread out it is, without testing anything." },
  { value: "compare", label: "Compare groups, times or a target value", hint: "Ask whether an outcome differs between groups, changes over time in the same people, or differs from a known value." },
  { value: "relationship", label: "Examine a relationship between two variables", hint: "Ask whether two measured variables go together, and how strongly." },
  { value: "predict", label: "Predict or explain an outcome", hint: "Estimate an outcome from one or more other variables." },
  { value: "association", label: "Examine categories", hint: "Ask whether two categorical variables are associated, or whether one variable's categories match expected shares." },
];

/** A question as it should be asked, given the answers so far: some prompts depend on the purpose. */
export function getQuestion(id: FinderQuestionId, answers: FinderAnswers): FinderQuestion {
  const { purpose, comparison } = answers;
  switch (id) {
    case "purpose":
      return {
        id,
        prompt: "What are you trying to find out?",
        hint: "Start from your research question or objective. The purpose narrows the family of tests before anything about the data does.",
        options: PURPOSE_OPTIONS,
        why: "The purpose of the analysis decides which family of tests to consider.",
      };
    case "comparison":
      return {
        id,
        prompt: "What are you comparing?",
        hint: "Whether the same people appear in more than one set of measurements is one of the most important choices in test selection.",
        options: [
          { value: "value", label: "One group with a known or target value", hint: "Such as a sample's mean score against a published average." },
          { value: "independent", label: "Separate groups of different people", hint: "Each participant belongs to one group only, such as public and private bank employees." },
          { value: "paired", label: "The same people measured more than once", hint: "Such as scores before and after training, or matched pairs." },
        ],
        why: "Whether groups are independent or paired decides between tests such as the independent-samples and paired-samples t-tests.",
      };
    case "outcomeLevel":
      return {
        id,
        prompt:
          purpose === "relationship"
            ? "How is the first variable measured?"
            : purpose === "describe"
              ? "How is the variable measured?"
              : "How is the outcome (dependent variable) measured?",
        hint: "Use the measurement level from your variables list. Scale scores made from several rating items are commonly treated as interval.",
        options: levelOptions,
        why: "The measurement level decides whether means, ranks or counts can be analysed.",
      };
    case "groups":
      return { id, prompt: "How many groups are you comparing?", hint: "Count the categories of the grouping variable, such as three teaching methods.", options: countOptions("Two groups", "Three or more groups"), why: "Two groups and three or more groups are compared with different tests." };
    case "measurements":
      return { id, prompt: "How many times is each participant measured?", hint: "Such as before and after (two), or at three time points.", options: countOptions("Twice", "Three or more times"), why: "Two paired measurements and three or more are compared with different tests." };
    case "secondFactor":
      return {
        id,
        prompt: "Are you also comparing a second grouping variable at the same time?",
        hint: "Such as teaching method and gender together, to see whether the effect of one depends on the other.",
        options: yesNo("Yes, two grouping variables", "No, one grouping variable"),
        why: "Two grouping variables at once call for a factorial analysis such as two-way ANOVA.",
      };
    case "covariate":
      return {
        id,
        prompt: "Do you need to control for a numeric variable?",
        hint: "Such as prior achievement or a pretest score that differs between participants before the comparison.",
        options: yesNo("Yes, adjust for a covariate", "No"),
        why: "Adjusting group comparisons for a numeric covariate calls for ANCOVA.",
      };
    case "outcomeCategories":
      return { id, prompt: "How many categories does the outcome have?", hint: "Such as yes and no (two), or three job levels.", options: countOptions("Two categories", "Three or more categories"), why: "Two-category and multi-category outcomes are modelled differently." };
    case "predictors":
      return { id, prompt: "How many predictors?", hint: "Predictors are the variables you use to estimate the outcome.", options: [{ value: "one", label: "One predictor" }, { value: "several", label: "Two or more predictors" }], why: "One predictor and several predictors call for simple and multiple versions of a model." };
    case "predictorLevel":
      return {
        id,
        prompt: purpose === "relationship" ? "How is the second variable measured?" : "How is the predictor (independent variable) measured?",
        hint: "Use the measurement level from your variables list.",
        options: levelOptions,
        why: "The predictor's measurement level decides which relationship or model fits.",
      };
    case "predictorCategories":
      return { id, prompt: "How many categories does the predictor have?", hint: "Such as two sectors, or three regions.", options: countOptions("Two categories", "Three or more categories"), why: "A categorical predictor with two groups and one with more are analysed differently." };
    case "categoricalVariables":
      return {
        id,
        prompt: "How many categorical variables are involved?",
        hint: "One variable compared with expected shares, or two variables examined together.",
        options: [
          { value: "one", label: "One variable, compared with expected shares", hint: "Such as whether customers choose four branches equally often." },
          { value: "two", label: "Two variables, examined together", hint: "Such as whether employment status is associated with gender." },
        ],
        why: "One categorical variable and two are tested differently.",
      };
    case "normality":
      return {
        id,
        prompt:
          purpose === "describe"
            ? "Is the distribution roughly symmetric, without extreme values?"
            : comparison === "paired"
              ? "Are the differences between the paired measurements roughly normal?"
              : purpose === "relationship"
                ? "Are both variables roughly normally distributed?"
                : comparison === "independent"
                  ? "Is the outcome roughly normal within each group?"
                  : "Is the outcome roughly normally distributed?",
        hint: "Often unknown before data are collected. Choose “Not known yet” if so; the Statistical Assumption Checker explains how to check it.",
        options: [
          { value: "yes", label: "Yes, roughly normal" },
          { value: "no", label: "No, clearly skewed or with extreme values" },
          { value: "unknown", label: "Not known yet" },
        ],
        why: "Normality decides whether a test that assumes it, or a rank-based alternative, is the more usual choice.",
      };
  }
}

/** The questions that apply to these answers, in the order they are asked. */
export function visibleQuestions(answers: FinderAnswers): FinderQuestionId[] {
  const questions: FinderQuestionId[] = ["purpose"];
  const { purpose, comparison, outcomeLevel, predictorLevel } = answers;
  switch (purpose) {
    case undefined:
      break;
    case "describe":
      questions.push("outcomeLevel");
      if (isNumeric(outcomeLevel)) questions.push("normality");
      break;
    case "compare":
      questions.push("comparison");
      if (!comparison) break;
      questions.push("outcomeLevel");
      if (comparison === "independent") {
        questions.push("groups");
        if (isNumeric(outcomeLevel)) questions.push("secondFactor", "covariate");
      }
      if (comparison === "paired") questions.push("measurements");
      if (isNumeric(outcomeLevel)) questions.push("normality");
      break;
    case "relationship":
      questions.push("outcomeLevel", "predictorLevel");
      if (isNumeric(outcomeLevel) && isNumeric(predictorLevel)) questions.push("normality");
      break;
    case "predict":
      questions.push("outcomeLevel");
      if (outcomeLevel === "nominal") questions.push("outcomeCategories");
      questions.push("predictors");
      if (answers.predictors === "one") {
        questions.push("predictorLevel");
        if (predictorLevel === "nominal") questions.push("predictorCategories");
      }
      break;
    case "association":
      questions.push("categoricalVariables");
      break;
  }
  return questions;
}

/** Whether a variable's name is asked for alongside these answers. */
export const namesOutcome = (answers: FinderAnswers) => visibleQuestions(answers).includes("outcomeLevel");
export const namesPredictor = (answers: FinderAnswers) => visibleQuestions(answers).includes("predictorLevel") || visibleQuestions(answers).includes("groups");

/** The answers that still apply: anything given to a question that is no longer asked is dropped. */
export function activeAnswers(answers: FinderAnswers): FinderAnswers {
  const visible = visibleQuestions(answers);
  const active: FinderAnswers = {};
  const record = active as Record<string, unknown>;
  for (const id of visible) if (answers[id] !== undefined) record[id] = answers[id];
  const outcomeName = answers.outcomeName?.trim();
  const predictorName = answers.predictorName?.trim();
  if (outcomeName && namesOutcome(answers)) active.outcomeName = outcomeName;
  if (predictorName && namesPredictor(answers)) active.predictorName = predictorName;
  return active;
}

/** The questions that apply but haven't been answered yet, in order. */
export const unansweredQuestions = (answers: FinderAnswers): FinderQuestionId[] => visibleQuestions(answers).filter((id) => answers[id] === undefined);
