/**
 * Hypothesis types, and the structured data every hypothesis carries.
 *
 * A hypothesis has three independent properties: its role (null or alternative), its
 * form (difference, relationship or prediction) and its direction (non-directional,
 * positive or negative). The seven named types describe those properties.
 *
 * Every hypothesis also carries its relationship as structured data (independent,
 * dependent, moderator, mediator and control variables, population and context) so
 * later tools can use it without reading the wording.
 */

export const HYPOTHESIS_ROLES = ["null", "alternative"] as const;
export type HypothesisRole = (typeof HYPOTHESIS_ROLES)[number];

export const HYPOTHESIS_FORMS = ["difference", "relationship", "prediction"] as const;
export type HypothesisForm = (typeof HYPOTHESIS_FORMS)[number];

export const DIRECTIONS = ["non-directional", "positive", "negative"] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** The kind of relationship: a main effect, or one involving a moderator or mediator. */
export const RELATIONSHIP_KINDS = ["main", "moderation", "mediation"] as const;
export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number];

/** A hypothesised relationship, stated explicitly. Every value comes from the project draft. */
export interface HypothesisRelationship {
  kind: RelationshipKind;
  form: HypothesisForm;
  direction: Direction;
  independentVariables: readonly string[];
  dependentVariables: readonly string[];
  moderators: readonly string[];
  mediators: readonly string[];
  controls: readonly string[];
  /** Null when the project doesn't name one. */
  population: string | null;
  /** The location and time frame, as entered. Null when the project names neither. */
  context: string | null;
}

/** A hypothesis as stored in the project draft. */
export interface ProjectHypothesis {
  id: string;
  role: HypothesisRole;
  /** The wording, as the researcher last left it. */
  text: string;
  relationship: HypothesisRelationship;
}

export const HYPOTHESIS_TYPE_IDS = ["null", "alternative", "directional", "non-directional", "difference", "relationship", "prediction"] as const;
export type HypothesisTypeId = (typeof HYPOTHESIS_TYPE_IDS)[number];

export interface HypothesisType {
  id: HypothesisTypeId;
  name: string;
  /** The conventional symbol, for the null and alternative hypotheses. */
  symbol: "H₀" | "H₁" | null;
  /** Which property of a hypothesis this type describes. */
  describes: "role" | "direction" | "form";
  definition: string;
  whenAppropriate: string;
  strengths: readonly string[];
  limitations: readonly string[];
  examples: readonly string[];
  /** Reference ids. Empty until references are chosen at academic review; none are invented. */
  references: readonly string[];
}

/** Content awaiting review by a named methodology specialist before launch. */
export const HYPOTHESIS_REVIEW_NOTE = "References and wording for this hypothesis type are awaiting academic review.";

export const HYPOTHESIS_TYPES: readonly HypothesisType[] = [
  {
    id: "null",
    name: "Null hypothesis",
    symbol: "H₀",
    describes: "role",
    definition: "States that there is no effect, difference or relationship in the population. It is the statement a statistical test evaluates.",
    whenAppropriate: "In quantitative studies that use inferential statistical tests.",
    strengths: [
      "Gives a precise statement that a statistical test can assess.",
      "Guards against claiming an effect without evidence for it.",
    ],
    limitations: [
      "Failing to reject it doesn't show that there is no effect: the study may have been too small to detect one.",
      "On its own it says little; it matters as the counterpart of the alternative hypothesis.",
    ],
    examples: [
      "There is no difference in mean reading scores between pupils taught with and without phonics.",
      "There is no relationship between hours of sleep and exam performance among first-year students.",
    ],
    references: [],
  },
  {
    id: "alternative",
    name: "Alternative hypothesis",
    symbol: "H₁",
    describes: "role",
    definition: "States that there is an effect, difference or relationship: the expectation the study sets against the null hypothesis.",
    whenAppropriate: "Whenever a null hypothesis is tested, to state what the study expects to find.",
    strengths: [
      "States the expectation clearly, linking the study to theory or previous findings.",
      "Together with the null hypothesis, defines what the analysis decides between.",
    ],
    limitations: [
      "Results can support it but never prove it.",
      "It must be stated before the data are analysed, or it loses its meaning.",
    ],
    examples: [
      "There is a difference in mean reading scores between pupils taught with and without phonics.",
      "Hours of sleep are related to exam performance among first-year students.",
    ],
    references: [],
  },
  {
    id: "directional",
    name: "Directional hypothesis",
    symbol: null,
    describes: "direction",
    definition: "An alternative hypothesis that states which way the effect goes, such as higher or lower, positive or negative.",
    whenAppropriate: "When theory or previous evidence gives a clear reason to expect a particular direction.",
    strengths: ["Makes a more precise claim.", "Shows how the study builds on existing theory or evidence."],
    limitations: [
      "An effect in the opposite direction doesn't support it.",
      "The direction must be justified from the literature before data are collected, not chosen after seeing the results.",
    ],
    examples: [
      "Students who sleep at least seven hours a night achieve higher exam scores than students who sleep less.",
      "Screen time is negatively related to sleep quality among teenagers.",
    ],
    references: [],
  },
  {
    id: "non-directional",
    name: "Non-directional hypothesis",
    symbol: null,
    describes: "direction",
    definition: "An alternative hypothesis that states that an effect exists without saying which way it goes.",
    whenAppropriate: "When there is no strong basis for predicting a direction, or previous findings disagree.",
    strengths: ["Doesn't commit to a direction the evidence can't support.", "Allows an effect in either direction to be detected."],
    limitations: [
      "Less precise than a directional hypothesis.",
      "If the literature does suggest a direction, a non-directional hypothesis may undersell the study's grounding.",
    ],
    examples: [
      "There is a difference in job satisfaction between remote and office-based staff.",
      "There is a relationship between class size and pupil attainment.",
    ],
    references: [],
  },
  {
    id: "difference",
    name: "Difference hypothesis",
    symbol: null,
    describes: "form",
    definition: "States that groups differ, or as a null hypothesis that they don't, on an outcome.",
    whenAppropriate: "When the independent variable defines groups, such as treatment and control, or two schools.",
    strengths: ["Matches studies that compare groups, such as experiments.", "Makes the comparison explicit."],
    limitations: [
      "The groups must be clearly defined.",
      "A difference alone doesn't show what caused it, unless the design rules out other explanations.",
    ],
    examples: [
      "Patients who receive the new physiotherapy programme report less pain than patients who receive usual care.",
      "There is no difference in voter turnout between urban and rural wards.",
    ],
    references: [],
  },
  {
    id: "relationship",
    name: "Relationship hypothesis",
    symbol: null,
    describes: "form",
    definition: "States that variables are related, or as a null hypothesis that they aren't.",
    whenAppropriate: "When the variables vary along a scale, such as hours of study and exam marks.",
    strengths: ["Suits variables measured on a scale.", "Can describe the strength and direction of a relationship."],
    limitations: [
      "A relationship doesn't show cause and effect.",
      "A third variable may explain why the two are related.",
    ],
    examples: [
      "Hours of paid work are negatively related to exam performance among full-time students.",
      "There is no relationship between age and use of online banking.",
    ],
    references: [],
  },
  {
    id: "prediction",
    name: "Prediction hypothesis",
    symbol: null,
    describes: "form",
    definition: "States that one or more variables predict an outcome, or as a null hypothesis that they don't.",
    whenAppropriate: "When the aim is to forecast an outcome from measures taken earlier.",
    strengths: ["Suits studies that forecast outcomes.", "Makes clear which variables are predictors and which is the outcome."],
    limitations: [
      "The predictors must be measured before the outcome.",
      "Prediction doesn't by itself show cause.",
    ],
    examples: [
      "First-year grades predict final degree classification.",
      "Higher attendance in the first term predicts lower dropout by the end of the year.",
    ],
    references: [],
  },
];

export function getHypothesisType(id: HypothesisTypeId): HypothesisType {
  const type = HYPOTHESIS_TYPES.find((candidate) => candidate.id === id);
  if (!type) throw new RangeError(`Unknown hypothesis type: ${id}`);
  return type;
}

/** The named types a hypothesis belongs to, given its properties. */
export function typesOf(role: HypothesisRole, form: HypothesisForm, direction: Direction): HypothesisTypeId[] {
  const types: HypothesisTypeId[] = [role, form];
  if (role === "alternative") types.push(direction === "non-directional" ? "non-directional" : "directional");
  return types;
}
