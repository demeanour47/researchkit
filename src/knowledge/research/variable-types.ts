/**
 * The variable model every research tool shares: variable kinds, measurement levels,
 * indicators and where each variable came from.
 *
 * Definitions here are standard textbook material awaiting review by a methodology
 * specialist. References are left empty until chosen at review; none are invented.
 */

export const VARIABLE_KINDS = ["independent", "dependent", "mediator", "moderator", "control", "extraneous", "confounding"] as const;
export type VariableKind = (typeof VARIABLE_KINDS)[number];

export interface VariableKindInfo {
  label: string;
  definition: string;
  example: string;
  /** Reference ids, empty until academic review. */
  references: readonly string[];
}

export const VARIABLE_KIND_INFO: Readonly<Record<VariableKind, VariableKindInfo>> = {
  independent: {
    label: "Independent variable",
    definition: "The variable expected to influence or explain another, or that defines the groups being compared.",
    example: "Hours of screen time, when studying its effect on sleep.",
    references: [],
  },
  dependent: {
    label: "Dependent variable",
    definition: "The outcome the study measures, expected to change with the independent variable.",
    example: "Sleep quality, when studying the effect of screen time on it.",
    references: [],
  },
  mediator: {
    label: "Mediator variable",
    definition: "A variable through which the independent variable is expected to affect the dependent variable.",
    example: "Bedtime, if screen time affects sleep quality by delaying bedtime.",
    references: [],
  },
  moderator: {
    label: "Moderator variable",
    definition: "A variable expected to change the strength or direction of the relationship between two others.",
    example: "Age, if screen time affects sleep more in younger students.",
    references: [],
  },
  control: {
    label: "Control variable",
    definition: "A variable held constant or adjusted for, so that it doesn't distort the relationship being studied.",
    example: "Caffeine intake, recorded and adjusted for in the analysis.",
    references: [],
  },
  extraneous: {
    label: "Extraneous variable",
    definition: "Any variable other than those being studied that could affect the outcome if it isn't controlled.",
    example: "Room noise during a sleep study.",
    references: [],
  },
  confounding: {
    label: "Confounding variable",
    definition: "A variable related to both the independent and the dependent variable, which can make a relationship appear that isn't there, or hide one that is.",
    example: "Stress, if it both increases screen time and reduces sleep quality.",
    references: [],
  },
};

export const MEASUREMENT_LEVELS = [
  "nominal",
  "ordinal",
  "interval",
  "ratio",
  "binary",
  "likert",
  "continuous",
  "categorical",
  "multiple-response",
  "open-ended",
] as const;
export type MeasurementLevel = (typeof MEASUREMENT_LEVELS)[number];

/** Levels whose values can be compared with each other without converting the data. */
export type MeasurementFamily = "categories" | "ordered" | "numeric" | "text";

export interface MeasurementLevelInfo {
  label: string;
  family: MeasurementFamily;
  definition: string;
  examples: readonly string[];
  strengths: readonly string[];
  limitations: readonly string[];
  /** Reference ids, empty until academic review. */
  references: readonly string[];
}

export const MEASUREMENT_LEVEL_INFO: Readonly<Record<MeasurementLevel, MeasurementLevelInfo>> = {
  nominal: {
    label: "Nominal",
    family: "categories",
    definition: "Values are named categories with no order, such as types or groups.",
    examples: ["Country of birth", "Blood group"],
    strengths: ["Simple to record and to understand.", "Suits counts and percentages of each category."],
    limitations: ["Categories can't be ranked or averaged.", "Only a limited range of statistics applies."],
    references: [],
  },
  ordinal: {
    label: "Ordinal",
    family: "ordered",
    definition: "Values are categories in a meaningful order, but the distances between them aren't known to be equal.",
    examples: ["Highest level of education", "Pain rated as mild, moderate or severe"],
    strengths: ["Captures order as well as category.", "Easy for respondents to answer."],
    limitations: ["The size of the gap between categories is unknown.", "Averages can mislead, because categories may not be evenly spaced."],
    references: [],
  },
  interval: {
    label: "Interval",
    family: "numeric",
    definition: "Numbers with equal distances between values, but no true zero point.",
    examples: ["Temperature in degrees Celsius", "Calendar year"],
    strengths: ["Differences between values are meaningful.", "Suits a wide range of statistics, including means."],
    limitations: ["Ratios aren't meaningful: 20 °C isn't twice as warm as 10 °C.", "True interval data are less common in social research than often assumed."],
    references: [],
  },
  ratio: {
    label: "Ratio",
    family: "numeric",
    definition: "Numbers with equal distances between values and a true zero, so ratios are meaningful.",
    examples: ["Monthly income", "Number of hours slept"],
    strengths: ["Allows every arithmetic comparison, including “twice as much”.", "Supports the widest range of statistics."],
    limitations: ["Often needs precise measurement instruments.", "Values are often unevenly spread, with a few very large ones."],
    references: [],
  },
  binary: {
    label: "Binary",
    family: "categories",
    definition: "A variable with exactly two possible values.",
    examples: ["Passed or failed", "Employed or not employed"],
    strengths: ["Simple and unambiguous to record.", "Easy to compare between groups."],
    limitations: ["Loses any detail between the two values.", "Many experiences don't divide neatly into two."],
    references: [],
  },
  likert: {
    label: "Likert",
    family: "ordered",
    definition:
      "Answers on a rating scale, such as from “strongly disagree” to “strongly agree”. A single item is ordinal; several items are often combined into a scale score, which some researchers analyse as interval data.",
    examples: ["Agreement with “I feel supported by my manager”, on five points", "A job satisfaction scale made of ten rated statements"],
    strengths: ["Captures attitudes and opinions in a standard way.", "Combining several items gives a more reliable measure."],
    limitations: [
      "Whether combined scores can be treated as interval data is debated.",
      "Answers can be affected by response styles, such as always agreeing or avoiding the extremes.",
    ],
    references: [],
  },
  continuous: {
    label: "Continuous",
    family: "numeric",
    definition: "A numerical variable that can take any value within a range, limited only by the precision of measurement.",
    examples: ["Height", "Reaction time"],
    strengths: ["Keeps the full detail of the measurement.", "Suits many statistical techniques."],
    limitations: ["Measurement error can be hard to see.", "Grouping it into categories later loses information."],
    references: [],
  },
  categorical: {
    label: "Categorical",
    family: "categories",
    definition: "A general term for variables whose values are categories. Nominal and ordinal variables are both categorical.",
    examples: ["Type of school", "Preferred mode of transport"],
    strengths: ["Suits characteristics that are naturally grouped.", "Easy to summarise in tables."],
    limitations: ["The term doesn't say whether the categories are ordered; state which.", "Categories with few members can be hard to analyse."],
    references: [],
  },
  "multiple-response": {
    label: "Multiple response",
    family: "categories",
    definition: "A question where respondents may choose more than one answer, such as “tick all that apply”.",
    examples: ["Which social media platforms do you use?", "Which support services have you contacted?"],
    strengths: ["Captures situations where several answers are true.", "Quick for respondents to answer."],
    limitations: ["Each option usually has to be analysed as a separate yes/no variable.", "Percentages across options don't add up to 100."],
    references: [],
  },
  "open-ended": {
    label: "Open-ended",
    family: "text",
    definition: "Answers in the respondent's own words, without set options.",
    examples: ["What made you choose this course?", "Describe a typical working day."],
    strengths: ["Captures answers the researcher didn't anticipate.", "Gives rich detail and context."],
    limitations: ["Answers must be coded or analysed qualitatively, which takes time.", "Some respondents write little or nothing."],
    references: [],
  },
};

/** How well two measurement levels fit together. */
export type LevelFit = "consistent" | "review" | "inconsistent";

/**
 * Whether an indicator measured at one level fits a variable measured at another.
 * Levels in the same family fit. Rated scales and numbers may fit, depending on how
 * scores are combined, so that pairing is left for review. Awaiting measurement review.
 */
export function levelFit(variable: MeasurementLevel, indicator: MeasurementLevel): LevelFit {
  const a = MEASUREMENT_LEVEL_INFO[variable].family;
  const b = MEASUREMENT_LEVEL_INFO[indicator].family;
  if (a === b) return "consistent";
  const pair = new Set([a, b]);
  if (pair.has("ordered") && pair.has("numeric")) return "review";
  return "inconsistent";
}

/** Where a variable came from in the project. */
export interface VariableSource {
  kind: "list" | "hypothesis" | "framework" | "user";
  /** The kind the variable had there, if any. */
  asKind: VariableKind | null;
  /** Hypothesis or framework ids, when it came from those. */
  references: readonly string[];
}

export interface VariableIndicator {
  id: string;
  name: string;
  description: string;
  /** How the indicator is measured, such as “hours reported in a sleep diary”. */
  measurement: string;
  /** The scale or answer format, such as “0 to 24 hours”. */
  scale: string;
  level: MeasurementLevel | null;
}

/** A research variable, as stored in the project draft. Empty text means “not known yet”. */
export interface ProjectVariable {
  id: string;
  name: string;
  shortName: string;
  description: string;
  variableType: VariableKind;
  measurementLevel: MeasurementLevel | null;
  measurementScale: string;
  conceptualDefinition: string;
  operationalDefinition: string;
  possibleIndicators: readonly VariableIndicator[];
  /** Draft questionnaire items, in the researcher's words. */
  questionnaireItems: readonly string[];
  notes: string;
  sources: readonly VariableSource[];
}

/** Shown wherever information is still unknown. Never replaced with invented content. */
export const VARIABLE_PLACEHOLDERS = {
  conceptualDefinition: "[conceptual definition]",
  operationalDefinition: "[operational definition]",
  indicator: "[indicator]",
  measurement: "[measurement]",
  scale: "[scale]",
  item: "[questionnaire item]",
} as const;
