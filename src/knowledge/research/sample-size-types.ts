/**
 * Sample size methods and inputs: what each is, when it is used, and what it
 * assumes. Formulas are standard; wording and choices await statistical review, and
 * references are left empty until chosen at review. None are invented.
 */

export const SAMPLE_SIZE_METHOD_IDS = [
  "cochran",
  "finite-population-correction",
  "yamane",
  "slovin",
  "krejcie-morgan",
  "power-analysis",
  "unknown-population",
] as const;
export type SampleSizeMethodId = (typeof SAMPLE_SIZE_METHOD_IDS)[number];

export interface SampleSizeMethod {
  id: SampleSizeMethodId;
  name: string;
  definition: string;
  /** The formula in plain text, with symbols explained in `symbols`. */
  formula: string;
  symbols: readonly string[];
  whenUsed: string;
  assumptions: readonly string[];
  strengths: readonly string[];
  limitations: readonly string[];
  /** Whether the method needs a known population size. */
  needsPopulation: boolean;
  /** Whether the calculator can compute it yet. */
  available: boolean;
  /** Reference ids, empty until statistical review. */
  references: readonly string[];
}

export const SAMPLE_SIZE_METHODS: readonly SampleSizeMethod[] = [
  {
    id: "cochran",
    name: "Cochran formula",
    definition: "Estimates the sample needed to measure a proportion with a chosen confidence level and margin of error, for a very large or unknown population.",
    formula: "n₀ = z² × p × (1 − p) ÷ e²",
    symbols: ["z: the z-score for the confidence level", "p: the estimated proportion", "e: the margin of error"],
    whenUsed: "In surveys estimating a percentage, such as the share of people who agree with a statement, when the population is large.",
    assumptions: ["Participants are selected by simple random sampling.", "The outcome of interest is a proportion.", "The population is large enough that its size doesn't matter."],
    strengths: ["Makes every assumption explicit.", "Widely used and easy to report."],
    limitations: ["Doesn't account for the population's size; use the finite population correction for smaller populations.", "Not designed for testing hypotheses or comparing groups."],
    needsPopulation: false,
    available: true,
    references: [],
  },
  {
    id: "finite-population-correction",
    name: "Cochran formula with finite population correction",
    definition: "Adjusts Cochran's sample size downwards when the population is small enough that the sample is a noticeable share of it.",
    formula: "n = n₀ ÷ (1 + (n₀ − 1) ÷ N)",
    symbols: ["n₀: the sample size from Cochran's formula", "N: the population size"],
    whenUsed: "When the population is known and not very large, such as the staff of one organisation.",
    assumptions: ["The population size is known and accurate.", "Participants are selected by simple random sampling.", "The outcome of interest is a proportion."],
    strengths: ["Avoids collecting more data than a small population needs.", "Reduces to Cochran's formula for very large populations."],
    limitations: ["Depends on an accurate population size.", "Not designed for testing hypotheses or comparing groups."],
    needsPopulation: true,
    available: true,
    references: [],
  },
  {
    id: "yamane",
    name: "Yamane formula",
    definition: "A simplified formula that gives a sample size from the population size and margin of error alone.",
    formula: "n = N ÷ (1 + N × e²)",
    symbols: ["N: the population size", "e: the margin of error"],
    whenUsed: "In social science surveys where a quick estimate for a known population is wanted.",
    assumptions: [
      "A 95% confidence level: the formula has no term for confidence, so another level can't be chosen.",
      "An estimated proportion of 50%, the most cautious value.",
      "Simple random sampling from a known population.",
    ],
    strengths: ["Simple to calculate and explain.", "Needs only the population size and margin of error."],
    limitations: ["The confidence level and proportion are fixed, and not visible in the formula.", "Gives slightly larger samples than Cochran's formula with finite population correction for the same inputs."],
    needsPopulation: true,
    available: true,
    references: [],
  },
  {
    id: "slovin",
    name: "Slovin formula",
    definition: "The same calculation as Yamane's formula. It is widely cited under this name, but its origin is unclear.",
    formula: "n = N ÷ (1 + N × e²)",
    symbols: ["N: the population size", "e: the margin of error"],
    whenUsed: "Where a course or department asks for “Slovin's formula”; it gives the same result as Yamane's.",
    assumptions: ["The same as Yamane's formula: 95% confidence, a proportion of 50%, and simple random sampling from a known population."],
    strengths: ["Simple to calculate.", "Needs only the population size and margin of error."],
    limitations: ["Its source is uncertain, which some examiners question.", "The same fixed assumptions as Yamane's formula."],
    needsPopulation: true,
    available: true,
    references: [],
  },
  {
    id: "krejcie-morgan",
    name: "Krejcie and Morgan",
    definition:
      "A formula, published with a widely used table, for the sample needed from a known population. It is algebraically the same as Cochran's formula with finite population correction.",
    formula: "s = X² × N × P × (1 − P) ÷ (d² × (N − 1) + X² × P × (1 − P))",
    symbols: ["X²: the chi-square value for 1 degree of freedom at the confidence level (equal to z²)", "N: the population size", "P: the estimated proportion", "d: the margin of error"],
    whenUsed: "When a known population is sampled and a table-based figure is expected, as in many education and social science theses.",
    assumptions: ["The population size is known.", "Simple random sampling.", "The published table assumes 95% confidence, a proportion of 50% and a 5% margin of error."],
    strengths: ["Matches a table many readers recognise.", "Accounts for the population's size."],
    limitations: ["The published table rounds to the nearest whole number, so it can be one below the rounded-up figure.", "The table only covers its standard assumptions; other values need the formula."],
    needsPopulation: true,
    available: true,
    references: [],
  },
  {
    id: "power-analysis",
    name: "Power analysis",
    definition: "Works out the sample needed to detect an effect of a given size with a chosen probability (power), for a specific statistical test.",
    formula: "Depends on the statistical test, the effect size, the significance level and the power.",
    symbols: ["Effect size: how large an effect you expect or need to detect", "α: the significance level", "1 − β: the power"],
    whenUsed: "When a study tests hypotheses or compares groups, such as in experiments and correlational studies.",
    assumptions: ["The planned statistical test is known.", "A realistic effect size can be justified from previous research or a pilot."],
    strengths: ["Links the sample size directly to the hypothesis test.", "The expected approach in most experimental research."],
    limitations: ["This calculator can't compute it yet; a dedicated tool is planned.", "Results are very sensitive to the effect size assumed."],
    needsPopulation: false,
    available: false,
    references: [],
  },
  {
    id: "unknown-population",
    name: "Unknown population guidance",
    definition: "When the population's size isn't known, Cochran's formula for a very large population gives a cautious sample size, because a finite population would only need fewer.",
    formula: "n₀ = z² × p × (1 − p) ÷ e²",
    symbols: ["z: the z-score for the confidence level", "p: the estimated proportion", "e: the margin of error"],
    whenUsed: "When the population can't be counted, such as all users of a public service.",
    assumptions: ["The population is at least large enough that its size wouldn't reduce the sample much.", "Simple random sampling, or a close approximation."],
    strengths: ["Cautious: never smaller than needed for a finite population.", "Doesn't need a population count."],
    limitations: ["May collect more data than necessary if the population is actually small.", "Random sampling is hard to achieve without a list of the population."],
    needsPopulation: false,
    available: true,
    references: [],
  },
];

export function getSampleSizeMethod(id: SampleSizeMethodId): SampleSizeMethod {
  const method = SAMPLE_SIZE_METHODS.find((candidate) => candidate.id === id);
  if (!method) throw new RangeError(`Unknown sample size method: ${id}`);
  return method;
}

/** Confidence levels the calculator offers, with z-scores from the standard normal distribution to six decimals. */
export const CONFIDENCE_LEVELS = [
  { level: 80, z: 1.281552 },
  { level: 85, z: 1.439531 },
  { level: 90, z: 1.644854 },
  { level: 95, z: 1.959964 },
  { level: 98, z: 2.326348 },
  { level: 99, z: 2.575829 },
  { level: 99.9, z: 3.290527 },
] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]["level"];

export interface SampleSizeInputs {
  /** Whether the population is finite with a known size, or unknown. */
  populationType: "finite" | "unknown";
  /** The number of people or units in the population, when finite. */
  populationSize: number | null;
  /** Confidence level, as a percentage. */
  confidence: ConfidenceLevel;
  /** Margin of error, as a percentage. */
  margin: number;
  /** Estimated proportion, as a percentage. */
  proportion: number;
  /** Expected response rate, as a percentage, or null if not yet estimated. */
  responseRate: number | null;
  /** Design effect: 1 for simple random sampling, higher for clustered samples. */
  designEffect: number;
}

export const DEFAULT_INPUTS: SampleSizeInputs = {
  populationType: "unknown",
  populationSize: null,
  confidence: 95,
  margin: 5,
  proportion: 50,
  responseRate: null,
  designEffect: 1,
};

export type InputId = "populationSize" | "confidence" | "margin" | "proportion" | "responseRate" | "designEffect" | "finite" | "unknown";

export interface InputInfo {
  label: string;
  meaning: string;
  whenMatters: string;
  typicalValues: string;
  limitations: string;
}

export const INPUT_INFO: Readonly<Record<InputId, InputInfo>> = {
  populationSize: {
    label: "Population size",
    meaning: "The number of people or units in the population your findings are about.",
    whenMatters: "Mainly for smaller populations. Above a few tens of thousands, it changes the sample size very little.",
    typicalValues: "Whatever your sampling frame lists, such as 1,200 students in a year group.",
    limitations: "It should come from a reliable count, such as a register. An estimate makes the result an estimate too.",
  },
  confidence: {
    label: "Confidence level",
    meaning: "How confident you want to be that the true value lies within your margin of error.",
    whenMatters: "Always. Higher confidence needs a larger sample.",
    typicalValues: "95% is the most common; 90% and 99% are also used.",
    limitations: "It describes the sampling procedure, not certainty about any one result.",
  },
  margin: {
    label: "Margin of error",
    meaning: "How far above or below the sample's result the population's true value may be, such as ±5 percentage points.",
    whenMatters: "Always. Halving the margin roughly quadruples the sample.",
    typicalValues: "5% is common for surveys; 3% for more precise estimates.",
    limitations: "It only covers random sampling error, not bias from non-response or poor measurement.",
  },
  proportion: {
    label: "Estimated proportion",
    meaning: "Your best estimate of the percentage with the characteristic you are measuring, such as the share who agree.",
    whenMatters: "When you have a reliable prior estimate. Otherwise 50% is used because it gives the largest, most cautious sample.",
    typicalValues: "50% if unknown; otherwise a figure from previous studies or a pilot.",
    limitations: "A wrong estimate gives a sample that is too small or too large for your margin of error.",
  },
  responseRate: {
    label: "Expected response rate",
    meaning: "The percentage of people you invite who you expect to take part.",
    whenMatters: "Whenever some people won't respond. It sets how many to invite.",
    typicalValues: "Varies widely by setting; base it on similar studies or a pilot.",
    limitations: "Inviting more people makes up for numbers, not for bias: non-responders may differ from responders.",
  },
  designEffect: {
    label: "Design effect",
    meaning: "How much larger the sample must be because of the sampling design, compared with simple random sampling.",
    whenMatters: "In cluster and multistage sampling, where people in the same group tend to be alike.",
    typicalValues: "1 for simple random sampling; often 1.5 to 2 for cluster samples, depending on the clustering.",
    limitations: "Needs an estimate of how alike people in the same cluster are, which may come from previous studies.",
  },
  finite: {
    label: "Finite population",
    meaning: "A population whose size you know, such as the staff of one organisation.",
    whenMatters: "When the sample would be a noticeable share of the population, the finite population correction reduces it.",
    typicalValues: "Populations listed in a sampling frame.",
    limitations: "The count must be accurate and match the population your findings are about.",
  },
  unknown: {
    label: "Unknown population",
    meaning: "A population whose size isn't known, or is very large.",
    whenMatters: "When no reliable count exists; the calculation then assumes a very large population.",
    typicalValues: "All users of a public service, or a national population.",
    limitations: "Without a list of the population, random sampling is hard to achieve.",
  },
};
