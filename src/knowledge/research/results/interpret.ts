/**
 * What each kind of result means. The interpreters only read the numbers the researcher
 * entered; the few values derived here, such as a percentage from a count or r² from r,
 * restate what was entered and are labelled as such.
 */

import { getAnalysisMethod } from "../data-analysis-types";
import { alphaMagnitude, correlationMagnitude, cramersVMagnitude, dMagnitude, etaMagnitude, fitIndices, kmoMagnitude, plsR2Magnitude, r2Magnitude, type Magnitude } from "./effect-size";
import { formatBounded, formatP, formatPValue, formatPlain, formatStat } from "./format";
import { COMMON_MISTAKES } from "./mistakes";
import { significance, type Significance } from "./significance";
import type { ResultInput, ResultKind } from "./types";

export type Direction = "positive" | "negative" | "none";

export interface StatisticLine {
  symbol: string;
  value: string;
  meaning: string;
}

export interface CoreInterpretation {
  kind: ResultKind;
  name: string;
  /** What the statistic is and what it measures. */
  meaning: string;
  statistics: StatisticLine[];
  significance: Significance;
  magnitude: Magnitude | null;
  /** The direction of a relationship or difference, when the result has one. */
  direction: Direction | null;
  plain: string;
  /** A sentence in the style of a results section. */
  academic: string;
  implication: string;
  /** Numbers that look inconsistent or call for care. */
  warnings: string[];
  mistakes: readonly string[];
  /** Whether the result can support or not support a hypothesis. */
  testsHypothesis: boolean;
}

interface Names {
  subject: string;
  predictor: string;
  outcome: string;
}

const names = (variables: readonly string[]): Names => ({ subject: variables[0] ?? "the variable", predictor: variables[0] ?? "the predictor", outcome: variables[1] ?? "the outcome" });
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const signOf = (value: number): Direction => (value > 0 ? "positive" : value < 0 ? "negative" : "none");

type Parts = Omit<CoreInterpretation, "kind" | "name" | "mistakes">;
type Interpreter = (values: Readonly<Record<string, number>>, input: ResultInput, names: Names) => Parts;

const noTest = significance(undefined, 0.05);
const describeOnly = "Descriptive results describe this sample. They don't test a hypothesis, but they set the context readers need for every other result.";

function scalePosition(value: number, values: Readonly<Record<string, number>>, what: string): string | null {
  if (values.scaleMin === undefined || values.scaleMax === undefined) return null;
  const midpoint = (values.scaleMin + values.scaleMax) / 2;
  const where = value > midpoint ? "above" : value < midpoint ? "below" : "at";
  return `On a scale from ${formatPlain(values.scaleMin)} to ${formatPlain(values.scaleMax)}, a ${what} of ${formatPlain(value)} is ${where} the midpoint of ${formatPlain(midpoint)}.`;
}

const smallSample = (n: number | undefined) => (n !== undefined && n < 30 ? [`With only ${n} participants, the estimate is imprecise; treat it with caution.`] : []);

// Descriptive results.

const descriptive: Interpreter = (v, _input, { subject }) => {
  const warnings = [...smallSample(v.n)];
  let shape = "";
  if (v.sd === 0) shape = " Everyone had the same value, so there is no variation to analyse.";
  else if (v.median !== undefined && Math.abs(v.mean - v.median) > 0.2 * v.sd) {
    shape = v.mean > v.median ? " The mean is above the median, which suggests a few high values pull the average up (a right skew); the median may describe the typical participant better." : " The mean is below the median, which suggests a few low values pull the average down (a left skew); the median may describe the typical participant better.";
    warnings.push("The mean and median differ noticeably, so check the distribution before using tests that assume normality.");
  }
  const range = v.min !== undefined && v.max !== undefined ? `, range ${formatPlain(v.min)} to ${formatPlain(v.max)}` : "";
  return {
    meaning: "Descriptive statistics summarise a variable: the mean is its average, the standard deviation how far values typically lie from that average, and the median its middle value.",
    statistics: [
      { symbol: "N", value: String(v.n), meaning: "Participants with a value" },
      { symbol: "M", value: formatStat(v.mean), meaning: "The average" },
      { symbol: "SD", value: formatStat(v.sd), meaning: "The typical distance of values from the mean" },
      ...(v.median !== undefined ? [{ symbol: "Mdn", value: formatStat(v.median), meaning: "The middle value" }] : []),
    ],
    significance: noTest,
    magnitude: null,
    direction: null,
    plain: `Across ${v.n} participants, ${subject} averaged ${formatPlain(v.mean)}, and values typically lay about ${formatPlain(v.sd)} from that average${range}.${shape}`,
    academic: `${capital(subject)} had a mean of ${formatStat(v.mean)} (SD = ${formatStat(v.sd)}, N = ${v.n})${v.median !== undefined ? ` and a median of ${formatStat(v.median)}` : ""}.`,
    implication: describeOnly,
    warnings,
    testsHypothesis: false,
  };
};

const frequency: Interpreter = (v, _input, { subject }) => {
  const percentage = (v.count / v.total) * 100;
  return {
    meaning: "A frequency counts how many participants fall in a category; the percentage (derived here from the count and total) shows that count as a share of everyone who answered.",
    statistics: [
      { symbol: "n", value: String(v.count), meaning: "Participants in the category" },
      { symbol: "N", value: String(v.total), meaning: "Everyone who answered" },
      { symbol: "%", value: `${formatStat(percentage, 1)}%`, meaning: "The count as a share of the total, derived from the two" },
    ],
    significance: noTest,
    magnitude: null,
    direction: null,
    plain: `${v.count} of ${v.total} participants (${formatStat(percentage, 1)}%) were in this category of ${subject}.`,
    academic: `For ${subject}, ${v.count} of ${v.total} participants (${formatStat(percentage, 1)}%) were in this category.`,
    implication: describeOnly,
    warnings: v.total < 30 ? [`With a total of ${v.total}, each participant changes the percentage by ${formatStat(100 / v.total, 1)} points, so small differences mean little.`] : [],
    testsHypothesis: false,
  };
};

const percentage: Interpreter = (v, _input, { subject }) => ({
  meaning: "A percentage is the share of participants in a category, out of 100.",
  statistics: [{ symbol: "%", value: `${formatStat(v.percentage, 1)}%`, meaning: "The share in the category" }, ...(v.total !== undefined ? [{ symbol: "N", value: String(v.total), meaning: "The total it is a share of" }] : [])],
  significance: noTest,
  magnitude: null,
  direction: null,
  plain: `${formatStat(v.percentage, 1)}% of ${v.total !== undefined ? `the ${v.total} participants` : "participants"} were in this category of ${subject}.`,
  academic: `${formatStat(v.percentage, 1)}% of participants${v.total !== undefined ? ` (N = ${v.total})` : ""} were in this category of ${subject}.`,
  implication: describeOnly,
  warnings: [...(v.total === undefined ? ["Report the number the percentage is of; readers can't judge a percentage without it."] : []), ...(v.total !== undefined && v.total < 30 ? [`With a total of ${v.total}, each participant changes the percentage by ${formatStat(100 / v.total, 1)} points.`] : [])],
  testsHypothesis: false,
});

const mean: Interpreter = (v, _input, { subject }) => {
  const position = scalePosition(v.mean, v, "mean");
  return {
    meaning: "The mean is the average: the sum of the values divided by how many there are.",
    statistics: [{ symbol: "M", value: formatStat(v.mean), meaning: "The average" }, ...(v.sd !== undefined ? [{ symbol: "SD", value: formatStat(v.sd), meaning: "The typical distance from the mean" }] : [])],
    significance: noTest,
    magnitude: null,
    direction: null,
    plain: `On average, ${subject} was ${formatPlain(v.mean)}.${position ? ` ${position}` : ""}`,
    academic: `The mean ${subject} was ${formatStat(v.mean)}${v.sd !== undefined ? ` (SD = ${formatStat(v.sd)}${v.n !== undefined ? `, N = ${v.n}` : ""})` : v.n !== undefined ? ` (N = ${v.n})` : ""}.`,
    implication: describeOnly,
    warnings: [...(v.sd === undefined ? ["Report the standard deviation with the mean, so readers know how much participants varied."] : []), ...smallSample(v.n)],
    testsHypothesis: false,
  };
};

const median: Interpreter = (v, _input, { subject }) => {
  const position = scalePosition(v.median, v, "median");
  return {
    meaning: "The median is the middle value when all values are put in order: half the participants are above it and half below.",
    statistics: [{ symbol: "Mdn", value: formatStat(v.median), meaning: "The middle value" }],
    significance: noTest,
    magnitude: null,
    direction: null,
    plain: `Half the participants had a ${subject} of ${formatPlain(v.median)} or less, and half had more.${position ? ` ${position}` : ""}`,
    academic: `The median ${subject} was ${formatStat(v.median)}${v.n !== undefined ? ` (N = ${v.n})` : ""}.`,
    implication: describeOnly,
    warnings: smallSample(v.n),
    testsHypothesis: false,
  };
};

const standardDeviation: Interpreter = (v, _input, { subject }) => {
  const parts: string[] = [];
  if (v.sd === 0) parts.push("Everyone had the same value, so there is no variation.");
  if (v.scaleMin !== undefined && v.scaleMax !== undefined && v.sd > 0) parts.push(`That is ${formatStat((v.sd / (v.scaleMax - v.scaleMin)) * 100, 0)}% of the scale's range of ${formatPlain(v.scaleMax - v.scaleMin)}.`);
  if (v.mean !== undefined && v.mean > 0 && v.sd > 0) parts.push(`Relative to the mean of ${formatPlain(v.mean)}, the spread is ${formatStat((v.sd / v.mean) * 100, 0)}% (the coefficient of variation, derived from the two).`);
  return {
    meaning: "The standard deviation shows how spread out values are: roughly the typical distance of a value from the mean.",
    statistics: [{ symbol: "SD", value: formatStat(v.sd), meaning: "The typical distance from the mean" }],
    significance: noTest,
    magnitude: null,
    direction: null,
    plain: `Values of ${subject} typically lay about ${formatPlain(v.sd)} from the mean.${parts.length > 0 ? ` ${parts.join(" ")}` : ""}`,
    academic: `${capital(subject)} had a standard deviation of ${formatStat(v.sd)}${v.mean !== undefined ? ` around a mean of ${formatStat(v.mean)}` : ""}.`,
    implication: describeOnly,
    warnings: v.mean === undefined ? ["Report the mean with the standard deviation; the spread means little without it."] : [],
    testsHypothesis: false,
  };
};

// Reliability.

const cronbach: Interpreter = (v, _input, { subject }) => {
  const magnitude = alphaMagnitude(v.alpha);
  const warnings: string[] = [];
  if (v.alpha < 0) warnings.push("A negative alpha usually means a reverse-worded item wasn't reverse-scored, or the items don't measure one construct. Check the scoring first.");
  if (v.alpha > 0.95) warnings.push("An alpha above .95 can mean some items repeat each other; consider whether all are needed.");
  if (v.items === 2) warnings.push("With only two items, alpha is limited; a correlation-based reliability coefficient is often reported instead.");
  return {
    meaning: "Cronbach's alpha estimates internal consistency: how closely the items of a scale agree with each other. It usually lies between 0 and 1; higher means more consistent.",
    statistics: [{ symbol: "α", value: formatBounded(v.alpha), meaning: "Internal consistency" }, ...(v.items !== undefined ? [{ symbol: "k", value: String(v.items), meaning: "Items in the scale" }] : [])],
    significance: noTest,
    magnitude,
    direction: null,
    plain: `The items measuring ${subject} are ${magnitude.label === "unacceptable" ? "not consistent enough with each other to combine into one score" : `${magnitude.label} in how consistently they agree with each other`}, by common conventions.`,
    academic: `The ${subject} scale showed ${magnitude.label} internal consistency (Cronbach's α = ${formatBounded(v.alpha)}${v.items !== undefined ? `, k = ${v.items}` : ""}).`,
    implication: v.alpha >= 0.7 ? `The items can reasonably be combined into one score for ${subject}.` : `Combining these items into one score for ${subject} needs justifying; check each item's contribution before using the score.`,
    warnings,
    testsHypothesis: false,
  };
};

// Relationships.

function correlationInterpreter(symbol: string, rank: boolean): Interpreter {
  return (v, input, { predictor, outcome }) => {
    const sig = significance(v.p, input.alpha);
    const magnitude = correlationMagnitude(v.r);
    const direction = signOf(v.r);
    const df = v.n !== undefined ? `(${v.n - 2})` : "";
    const warnings = [...smallSample(v.n)];
    if (Math.abs(v.r) >= 0.9) warnings.push("A correlation this strong can mean the two measures overlap or measure the same thing; check they are distinct.");
    if (sig.status === "significant" && magnitude.label === "negligible") warnings.push("The result is significant but the relationship is negligible: with a large sample, tiny relationships reach significance.");
    const trend = direction === "positive" ? `higher ${predictor} tended to go with higher ${outcome}` : direction === "negative" ? `higher ${predictor} tended to go with lower ${outcome}` : `${predictor} and ${outcome} showed no tendency to move together`;
    return {
      meaning: rank
        ? "Spearman's rho measures how consistently two variables rise or fall together, using their ranks. It runs from −1 (perfectly opposite order) to 1 (perfectly the same order)."
        : `The correlation coefficient measures how strongly two variables move together in a straight line. It runs from −1 (perfect negative) through 0 (none) to 1 (perfect positive).`,
      statistics: [
        { symbol, value: formatBounded(v.r), meaning: `A ${magnitude.label} ${direction === "none" ? "" : `${direction} `}relationship` },
        ...(rank ? [] : [{ symbol: "r²", value: formatBounded(v.r * v.r), meaning: `About ${formatStat(v.r * v.r * 100, 0)}% of the variation in one is shared with the other (r squared, derived from r)` }]),
        { symbol: "p", value: formatPValue(v.p), meaning: "How surprising the result would be if there were no relationship" },
      ],
      significance: sig,
      magnitude,
      direction,
      plain: sig.status === "significant" ? `In this sample, ${trend}. The relationship is ${magnitude.label}.` : `This sample doesn't show a reliable relationship between ${predictor} and ${outcome}; the ${magnitude.label} ${direction === "none" ? "" : `${direction} `}pattern could be chance.`,
      academic: `${sig.status === "significant" ? `There was a statistically significant ${magnitude.label} ${direction} correlation` : "There was no statistically significant correlation"} between ${predictor} and ${outcome}, ${symbol}${df} = ${formatBounded(v.r)}, ${formatP(v.p)}.`,
      implication:
        sig.status === "significant"
          ? `${capital(predictor)} and ${outcome} are related in this population, if the sample represents it. A correlation doesn't show that either one causes the other.`
          : `This study doesn't give evidence that ${predictor} and ${outcome} are related. A larger sample might detect a smaller relationship.`,
      warnings,
      testsHypothesis: true,
    };
  };
}

const simpleRegression: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.p, input.alpha);
  const magnitude = v.r2 !== undefined ? r2Magnitude(v.r2) : v.beta !== undefined ? correlationMagnitude(v.beta) : null;
  const direction = signOf(v.b);
  const warnings = [...smallSample(v.n)];
  if (v.beta !== undefined && Math.sign(v.beta) !== Math.sign(v.b) && v.beta !== 0 && v.b !== 0) warnings.push("The standardised and unstandardised coefficients have opposite signs, which can't both be right; check the output.");
  return {
    meaning: "Simple regression predicts an outcome from one predictor. B is the change in the outcome for each one-unit increase in the predictor; β is the same in standard-deviation units; R² is the share of the outcome's variation the predictor explains.",
    statistics: [
      { symbol: "B", value: formatStat(v.b), meaning: `Change in ${outcome} for each one-unit increase in ${predictor}` },
      ...(v.beta !== undefined ? [{ symbol: "β", value: formatBounded(v.beta), meaning: "The same change in standard-deviation units" }] : []),
      ...(v.r2 !== undefined ? [{ symbol: "R²", value: formatBounded(v.r2), meaning: `${formatStat(v.r2 * 100, 0)}% of the variation in ${outcome} explained` }] : []),
    ],
    significance: sig,
    magnitude,
    direction,
    plain:
      sig.status === "significant"
        ? `Each one-unit increase in ${predictor} went with a ${formatPlain(Math.abs(v.b))}-unit ${direction === "negative" ? "decrease" : "increase"} in ${outcome}${v.r2 !== undefined ? `, and ${predictor} explains ${formatStat(v.r2 * 100, 0)}% of the variation in ${outcome}` : ""}.`
        : `${capital(predictor)} didn't reliably predict ${outcome} in this sample.`,
    academic: `${capital(predictor)} ${sig.status === "significant" ? "significantly predicted" : "did not significantly predict"} ${outcome}, B = ${formatStat(v.b)}${v.beta !== undefined ? `, β = ${formatBounded(v.beta)}` : ""}, ${formatP(v.p)}${v.r2 !== undefined ? `, R² = ${formatBounded(v.r2)}` : ""}.`,
    implication: sig.status === "significant" ? `Knowing ${predictor} helps predict ${outcome}. Whether it causes changes in ${outcome} depends on the design, not the regression.` : `This study doesn't give evidence that ${predictor} predicts ${outcome}.`,
    warnings,
    testsHypothesis: true,
  };
};

const multipleRegression: Interpreter = (v, input, { predictor, outcome }) => {
  const model = significance(v.p, input.alpha);
  const focal = v.predictorP !== undefined ? significance(v.predictorP, input.alpha) : null;
  const magnitude = r2Magnitude(v.r2);
  const warnings: string[] = [...smallSample(v.n)];
  if (v.adjustedR2 !== undefined && v.r2 - v.adjustedR2 > 0.05) warnings.push("Adjusted R² is noticeably below R², which suggests some predictors add little; with few participants per predictor, R² overstates the fit.");
  if (v.beta !== undefined && focal === null) warnings.push("Enter the predictor's p-value to judge the predictor on its own; the model's p-value tests all predictors together.");
  const focalText = focal && v.beta !== undefined ? ` Holding the other predictors constant, ${predictor} ${focal.status === "significant" ? "was a significant predictor" : "was not a significant predictor"} (β = ${formatBounded(v.beta)}, ${formatP(v.predictorP!)}).` : "";
  return {
    meaning: "Multiple regression predicts an outcome from several predictors at once. R² is the share of the outcome's variation the whole model explains; each predictor's β shows its own contribution with the others held constant.",
    statistics: [
      { symbol: "R²", value: formatBounded(v.r2), meaning: `${formatStat(v.r2 * 100, 0)}% of the variation in ${outcome} explained by the model` },
      ...(v.adjustedR2 !== undefined ? [{ symbol: "adj. R²", value: formatBounded(v.adjustedR2), meaning: "R² adjusted for the number of predictors" }] : []),
      ...(v.f !== undefined ? [{ symbol: "F", value: formatStat(v.f), meaning: "The test of the whole model" }] : []),
      ...(v.beta !== undefined ? [{ symbol: "β", value: formatBounded(v.beta), meaning: `${capital(predictor)}'s own contribution, in standard-deviation units` }] : []),
    ],
    significance: focal ?? model,
    magnitude,
    direction: v.beta !== undefined ? signOf(v.beta) : null,
    plain: `${model.status === "significant" ? `Together, the predictors explain ${formatStat(v.r2 * 100, 0)}% of the variation in ${outcome}, more than chance would.` : `Together, the predictors don't reliably explain ${outcome} in this sample.`}${focalText}`,
    academic: `The model ${model.status === "significant" ? "significantly predicted" : "did not significantly predict"} ${outcome}${v.f !== undefined ? `, F = ${formatStat(v.f)}` : ""}, ${formatP(v.p)}, R² = ${formatBounded(v.r2)}${v.adjustedR2 !== undefined ? `, adjusted R² = ${formatBounded(v.adjustedR2)}` : ""}.${focalText}`,
    implication:
      focal && v.beta !== undefined
        ? focal.status === "significant"
          ? `${capital(predictor)} adds to the prediction of ${outcome} beyond the other predictors.`
          : `${capital(predictor)} doesn't add reliably to the prediction of ${outcome} once the other predictors are known.`
        : `The model's predictors, taken together, ${model.status === "significant" ? "help" : "don't reliably help"} predict ${outcome}. Look at each predictor's coefficient to see which ones matter.`,
    warnings,
    testsHypothesis: true,
  };
};

const hierarchical: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.pChange, input.alpha);
  const full = v.r2 ?? v.r2Change;
  const f2 = full >= 1 ? Number.POSITIVE_INFINITY : v.r2Change / (1 - full);
  const magnitude = { ...r2Magnitude(f2 / (1 + f2)), convention: "Cohen's conventions for f² (ΔR² / (1 − R²)): .02 small, .15 medium, .35 large" };
  return {
    meaning: "Hierarchical regression adds predictors in steps. The change in R² (ΔR²) is how much more of the outcome's variation the last step explains beyond the earlier steps, such as control variables.",
    statistics: [
      { symbol: "ΔR²", value: formatBounded(v.r2Change), meaning: `An extra ${formatStat(v.r2Change * 100, 1)}% of the variation in ${outcome} explained by the final step` },
      ...(v.r2 !== undefined ? [{ symbol: "R²", value: formatBounded(v.r2), meaning: "Explained by the final model" }] : []),
      ...(v.fChange !== undefined ? [{ symbol: "ΔF", value: formatStat(v.fChange), meaning: "The test of the change" }] : []),
    ],
    significance: sig,
    magnitude,
    direction: null,
    plain: sig.status === "significant" ? `Adding ${predictor} explained an extra ${formatStat(v.r2Change * 100, 1)}% of the variation in ${outcome} beyond the earlier steps.` : `Adding ${predictor} didn't reliably explain more of ${outcome} beyond the earlier steps.`,
    academic: `Adding ${predictor} in the final step ${sig.status === "significant" ? "significantly" : "did not significantly"} ${sig.status === "significant" ? "increased" : "increase"} the variance explained in ${outcome}, ΔR² = ${formatBounded(v.r2Change)}${v.fChange !== undefined ? `, ΔF = ${formatStat(v.fChange)}` : ""}, ${formatP(v.pChange)}.`,
    implication: sig.status === "significant" ? `${capital(predictor)} matters for ${outcome} over and above what was controlled for.` : `Once the earlier steps are accounted for, ${predictor} adds little to explaining ${outcome}.`,
    warnings: [],
    testsHypothesis: true,
  };
};

const logistic: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.p, input.alpha);
  const direction: Direction = v.oddsRatio > 1 ? "positive" : v.oddsRatio < 1 ? "negative" : "none";
  const change = direction === "positive" ? `${formatStat((v.oddsRatio - 1) * 100, 0)}% higher` : direction === "negative" ? `${formatStat((1 - v.oddsRatio) * 100, 0)}% lower` : "unchanged";
  const warnings: string[] = [];
  const hasCi = v.ciLower !== undefined && v.ciUpper !== undefined;
  if (hasCi && input.alpha === 0.05) {
    const includesOne = v.ciLower <= 1 && v.ciUpper >= 1;
    if (includesOne === (sig.status === "significant")) warnings.push("The 95% confidence interval and the p-value disagree: an interval that includes 1 should go with p of .05 or more, and one that excludes 1 with p below .05. Check the output.");
  }
  if (hasCi && v.ciUpper / v.ciLower > 10) warnings.push("The confidence interval is very wide, so the odds ratio is imprecise; this often means few cases in one outcome group.");
  return {
    meaning: "Logistic regression predicts a two-category outcome. The odds ratio (OR) is how the odds of the outcome change for each one-unit increase in the predictor: above 1 means higher odds, below 1 lower, and 1 no change.",
    statistics: [
      { symbol: "OR", value: formatStat(v.oddsRatio), meaning: `The odds of ${outcome} are ${change} for each one-unit increase in ${predictor}` },
      ...(hasCi ? [{ symbol: "95% CI", value: `${formatStat(v.ciLower)} to ${formatStat(v.ciUpper)}`, meaning: "The range of odds ratios compatible with the data" }] : []),
      ...(v.pseudoR2 !== undefined ? [{ symbol: "R²N", value: formatBounded(v.pseudoR2), meaning: "A rough guide to the model's fit; not the same as linear regression's R²" }] : []),
    ],
    significance: sig,
    magnitude: null,
    direction,
    plain: sig.status === "significant" ? `For each one-unit increase in ${predictor}, the odds of ${outcome} were ${change}.` : `${capital(predictor)} didn't reliably change the odds of ${outcome} in this sample.`,
    academic: `${capital(predictor)} was ${sig.status === "significant" ? "" : "not "}a significant predictor of ${outcome}, OR = ${formatStat(v.oddsRatio)}${hasCi ? `, 95% CI [${formatStat(v.ciLower)}, ${formatStat(v.ciUpper)}]` : ""}, ${formatP(v.p)}.`,
    implication: sig.status === "significant" ? `${capital(predictor)} is associated with the chance of ${outcome}. Odds aren't probabilities: an odds ratio of 2 doesn't mean twice as likely unless the outcome is rare.` : `This study doesn't give evidence that ${predictor} changes the chance of ${outcome}.`,
    warnings: [...warnings, ...(!hasCi ? ["Report the odds ratio's confidence interval, so readers can judge its precision."] : [])],
    testsHypothesis: true,
  };
};

// Differences.

function tTestInterpreter(paired: boolean): Interpreter {
  return (v, input, { predictor, outcome }) => {
    const sig = significance(v.p, input.alpha);
    const magnitude = v.d !== undefined ? dMagnitude(v.d) : null;
    const hasMeans = v.mean1 !== undefined && v.mean2 !== undefined;
    const direction = hasMeans ? signOf(v.mean1 - v.mean2) : signOf(v.t);
    const warnings: string[] = [];
    if (hasMeans && v.t !== 0 && v.mean1 !== v.mean2 && Math.sign(v.t) !== Math.sign(v.mean1 - v.mean2)) warnings.push("The sign of t doesn't match the order of the means; your software may subtract them the other way round. Check which group, or time, is first.");
    if (v.d === undefined) warnings.push("Report Cohen's d with the t-test, so readers can judge the size of the difference.");
    if (sig.status === "significant" && magnitude?.label === "negligible") warnings.push("The difference is significant but negligible in size; with a large sample, tiny differences reach significance.");
    const first = paired ? "at the first time" : `in the first ${predictor} group`;
    const second = paired ? "at the second time" : "in the second group";
    const which = !hasMeans
      ? `${outcome} differed ${paired ? "between the two times" : `between the ${predictor} groups`}`
      : v.mean1 === v.mean2
        ? `the two means of ${outcome} were equal`
        : v.mean1 > v.mean2
          ? `${outcome} was higher ${first} (M = ${formatStat(v.mean1)}) than ${second} (M = ${formatStat(v.mean2)})`
          : `${outcome} was lower ${first} (M = ${formatStat(v.mean1)}) than ${second} (M = ${formatStat(v.mean2)})`;
    return {
      meaning: paired
        ? "The paired t-test checks whether the mean of the same participants' scores changed between two times or conditions. t is the size of the change relative to its variability; Cohen's d is the change in standard-deviation units."
        : "The independent t-test checks whether two separate groups have different means. t is the size of the difference relative to its variability; Cohen's d is the difference in standard-deviation units.",
      statistics: [
        { symbol: "t", value: formatStat(v.t), meaning: "The difference relative to its variability" },
        { symbol: "df", value: formatPlain(v.df), meaning: paired ? "The number of pairs minus one" : "Based on the group sizes" },
        ...(v.d !== undefined ? [{ symbol: "d", value: formatStat(v.d), meaning: `A ${magnitude!.label} difference` }] : []),
      ],
      significance: sig,
      magnitude,
      direction,
      plain: sig.status === "significant" ? `${capital(which)}; the difference is unlikely to be chance${magnitude ? ` and is ${magnitude.label} in size` : ""}.` : `This sample doesn't show a reliable difference in ${outcome} between ${paired ? "the two times" : `the ${predictor} groups`}.`,
      academic: `${sig.status === "significant" ? "There was a statistically significant difference" : "There was no statistically significant difference"} in ${outcome} ${paired ? "between the two times" : `between the ${predictor} groups`}, t(${formatPlain(v.df)}) = ${formatStat(v.t)}, ${formatP(v.p)}${v.d !== undefined ? `, d = ${formatStat(v.d)}` : ""}.`,
      implication: sig.status === "significant" ? `${paired ? `${capital(outcome)} changed between the two times` : `The ${predictor} groups differ in ${outcome}`}. ${paired ? "Without a comparison group, the change can't be put down to an intervention alone." : "Whether the groups' difference is caused by group membership depends on the design."}` : `This study doesn't give evidence of a difference; it doesn't show the ${paired ? "times" : "groups"} are the same.`,
      warnings,
      testsHypothesis: true,
    };
  };
}

const oneWayAnova: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.p, input.alpha);
  const magnitude = v.etaSquared !== undefined ? etaMagnitude(v.etaSquared) : null;
  const warnings: string[] = [];
  if (sig.status === "significant") warnings.push("A significant F shows that at least one group differs, not which; report post hoc tests, such as Tukey's, to show which groups differ.");
  if (v.df1 === 1) warnings.push("With two groups, one-way ANOVA gives the same answer as an independent t-test (F = t²).");
  if (v.etaSquared === undefined) warnings.push("Report an effect size such as eta squared with F.");
  return {
    meaning: "One-way ANOVA checks whether the means of three or more groups differ. F compares the variation between groups with the variation within them; eta squared is the share of the outcome's variation explained by group membership.",
    statistics: [
      { symbol: "F", value: formatStat(v.f), meaning: "Variation between groups relative to within them" },
      { symbol: "df", value: `${v.df1}, ${formatPlain(v.df2)}`, meaning: "Between groups, and within groups" },
      ...(v.etaSquared !== undefined ? [{ symbol: "η²", value: formatBounded(v.etaSquared), meaning: `${formatStat(v.etaSquared * 100, 0)}% of the variation explained by the groups` }] : []),
    ],
    significance: sig,
    magnitude,
    direction: null,
    plain: sig.status === "significant" ? `The ${predictor} groups don't all have the same average ${outcome}: at least one differs${magnitude ? `, and the difference is ${magnitude.label}` : ""}.` : `This sample doesn't show that the ${predictor} groups differ in ${outcome}.`,
    academic: `There was ${sig.status === "significant" ? "a statistically significant" : "no statistically significant"} effect of ${predictor} on ${outcome}, F(${v.df1}, ${formatPlain(v.df2)}) = ${formatStat(v.f)}, ${formatP(v.p)}${v.etaSquared !== undefined ? `, η² = ${formatBounded(v.etaSquared)}` : ""}.`,
    implication: sig.status === "significant" ? `Group membership matters for ${outcome}; the post hoc tests show which groups drive the difference.` : `This study doesn't give evidence that the groups differ in ${outcome}.`,
    warnings,
    testsHypothesis: true,
  };
};

const twoWayAnova: Interpreter = (v, input, { predictor, outcome }) => {
  const interaction = significance(v.pInteraction, input.alpha);
  const magnitude = v.partialEta !== undefined ? { ...etaMagnitude(v.partialEta), convention: "Cohen's conventions for eta squared, commonly applied to partial eta squared: .01 small, .06 medium, .14 large" } : null;
  const mains = (
    [
      ["first factor", v.fA, v.pA],
      ["second factor", v.fB, v.pB],
    ] as const
  ).filter(([, f, p]) => f !== undefined && p !== undefined);
  const mainText = mains.map(([label, f, p]) => `The main effect of the ${label} was ${significance(p, input.alpha).status === "significant" ? "significant" : "not significant"}, F = ${formatStat(f!)}, ${formatP(p!)}.`).join(" ");
  const warnings: string[] = [];
  if (interaction.status === "significant" && mains.length > 0) warnings.push("With a significant interaction, main effects can mislead; interpret the effect of each factor at each level of the other (simple effects).");
  return {
    meaning: "Two-way ANOVA checks the effect of two grouping factors on an outcome, and whether they interact: whether the effect of one factor depends on the level of the other.",
    statistics: [
      { symbol: "F", value: formatStat(v.fInteraction), meaning: "The interaction test" },
      ...(v.partialEta !== undefined ? [{ symbol: "ηp²", value: formatBounded(v.partialEta), meaning: "The interaction's share of the variation, other effects set aside" }] : []),
      ...mains.map(([label, f]) => ({ symbol: "F", value: formatStat(f!), meaning: `Main effect of the ${label}` })),
    ],
    significance: interaction,
    magnitude,
    direction: null,
    plain: `${interaction.status === "significant" ? `The effect of ${predictor} on ${outcome} depends on the other factor.` : `The effect of ${predictor} on ${outcome} doesn't depend on the other factor in this sample.`}${mainText ? ` ${mainText}` : ""}`,
    academic: `The interaction was ${interaction.status === "significant" ? "statistically significant" : "not statistically significant"}, F = ${formatStat(v.fInteraction)}, ${formatP(v.pInteraction)}${v.partialEta !== undefined ? `, ηp² = ${formatBounded(v.partialEta)}` : ""}.${mainText ? ` ${mainText}` : ""}`,
    implication: interaction.status === "significant" ? `No single statement about ${predictor}'s effect on ${outcome} holds for everyone; it has to be described for each level of the other factor.` : "Each factor's effect can be described on its own, through its main effect.",
    warnings,
    testsHypothesis: true,
  };
};

// Associations between categories.

const chiSquare: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.p, input.alpha);
  const k = v.smallerSide ?? (v.df === 1 ? 1 : undefined);
  const magnitude = v.cramersV !== undefined && k !== undefined ? cramersVMagnitude(v.cramersV, k) : null;
  const warnings: string[] = [];
  if (v.minExpected !== undefined && v.minExpected < 5) warnings.push(`The smallest expected count is ${formatPlain(v.minExpected)}, below 5, so the chi-square approximation may be poor; Fisher's exact test is safer.`);
  if (v.cramersV !== undefined && k === undefined) warnings.push("Enter the smaller of rows − 1 and columns − 1 to judge Cramér's V; its size depends on the table's shape.");
  if (v.cramersV === undefined) warnings.push("Report an effect size such as Cramér's V; chi-square's size depends on the sample, not only the strength of the association.");
  return {
    meaning: "The chi-square test of independence checks whether two categorical variables are associated: whether the pattern of one differs across the categories of the other. Cramér's V measures the strength of the association from 0 to 1.",
    statistics: [
      { symbol: "χ²", value: formatStat(v.chi2), meaning: "How far the observed counts are from those expected with no association" },
      { symbol: "df", value: String(v.df), meaning: "(rows − 1) × (columns − 1)" },
      ...(v.cramersV !== undefined ? [{ symbol: "V", value: formatBounded(v.cramersV), meaning: magnitude ? `A ${magnitude.label} association` : "The strength of the association" }] : []),
    ],
    significance: sig,
    magnitude,
    direction: null,
    plain: sig.status === "significant" ? `${capital(predictor)} and ${outcome} are associated: the pattern of ${outcome} differs across the categories of ${predictor}${magnitude ? `, and the association is ${magnitude.label}` : ""}.` : `This sample doesn't show an association between ${predictor} and ${outcome}.`,
    academic: `${sig.status === "significant" ? "There was a statistically significant association" : "There was no statistically significant association"} between ${predictor} and ${outcome}, χ²(${v.df}${v.n !== undefined ? `, N = ${v.n}` : ""}) = ${formatStat(v.chi2)}, ${formatP(v.p)}${v.cramersV !== undefined ? `, V = ${formatBounded(v.cramersV)}` : ""}.`,
    implication: sig.status === "significant" ? "Look at the cross-tabulation's percentages to describe which categories go together; the test alone doesn't say." : `This study doesn't give evidence that ${predictor} and ${outcome} are associated.`,
    warnings,
    testsHypothesis: true,
  };
};

// Measurement models.

const factorAnalysis: Interpreter = (v, input, { subject }) => {
  const kmo = kmoMagnitude(v.kmo);
  const bartlett = significance(v.bartlettP, input.alpha);
  const suitable = v.kmo >= 0.6 && bartlett.status === "significant";
  const warnings: string[] = [];
  if (v.kmo < 0.6) warnings.push(`A KMO of ${formatBounded(v.kmo)} suggests the items share too little variance for a clear factor structure; many researchers look for .60 or more.`);
  if (bartlett.status !== "significant") warnings.push("Bartlett's test isn't significant, so the items may not be correlated enough for factor analysis.");
  if (v.lowestLoading !== undefined && Math.abs(v.lowestLoading) < 0.4) warnings.push(`The weakest main loading is ${formatBounded(v.lowestLoading)}; items loading below about .40 are commonly reviewed or removed, though cut-offs of .30 to .50 are all used.`);
  if (v.variance !== undefined && v.variance < 50) warnings.push(`The factors explain ${formatPlain(v.variance)}% of the variance, leaving over half unexplained.`);
  return {
    meaning: "Factor analysis groups items that measure the same underlying construct. KMO checks whether the items share enough variance for factors to be meaningful; Bartlett's test checks they are correlated at all.",
    statistics: [
      { symbol: "KMO", value: formatBounded(v.kmo), meaning: `Sampling adequacy: ${kmo.label}` },
      { symbol: "Bartlett's p", value: formatPValue(v.bartlettP), meaning: bartlett.status === "significant" ? "The items are correlated" : "The items may not be correlated enough" },
      ...(v.factors !== undefined ? [{ symbol: "Factors", value: String(v.factors), meaning: "Factors kept" }] : []),
      ...(v.variance !== undefined ? [{ symbol: "%", value: `${formatPlain(v.variance)}%`, meaning: "Variance explained by the factors kept" }] : []),
    ],
    significance: { ...bartlett, statement: `Bartlett's test: ${bartlett.statement}`, meaning: bartlett.status === "significant" ? "The items are correlated, so looking for factors makes sense." : "The items may not be correlated enough for factors to emerge." },
    magnitude: kmo,
    direction: null,
    plain: `${suitable ? `The items for ${subject} are suitable for factor analysis` : `The items for ${subject} may not be suitable for factor analysis`}${v.factors !== undefined ? `, and they grouped into ${v.factors} ${v.factors === 1 ? "factor" : "factors"}` : ""}${v.variance !== undefined ? ` explaining ${formatPlain(v.variance)}% of the variance` : ""}.`,
    academic: `The Kaiser–Meyer–Olkin measure was ${formatBounded(v.kmo)} (${kmo.label}), and Bartlett's test of sphericity was ${bartlett.status === "significant" ? "significant" : "not significant"}, ${formatP(v.bartlettP)}${v.factors !== undefined ? `. ${v.factors} ${v.factors === 1 ? "factor was" : "factors were"} retained` : ""}${v.variance !== undefined ? `, explaining ${formatPlain(v.variance)}% of the variance` : ""}.`,
    implication: suitable ? "The factor structure gives evidence about whether your items measure the constructs you intended; compare it with the structure your theory predicts." : "Reconsider the items, or the sample size, before relying on a factor structure.",
    warnings,
    testsHypothesis: false,
  };
};

const sem: Interpreter = (v, input) => {
  const indices = fitIndices({ cfi: v.cfi, rmsea: v.rmsea, srmr: v.srmr, tli: v.tli });
  const poor = indices.filter((index) => index.verdict === "poor");
  const allGood = indices.every((index) => index.verdict === "good");
  const chi = v.chi2P !== undefined ? significance(v.chi2P, input.alpha) : null;
  const verdict = allGood ? "fits the data well" : poor.length === 0 ? "fits the data acceptably" : "doesn't fit the data well by some indices";
  return {
    meaning: "In structural equation modelling, fit indices show how well the whole model reproduces the relationships in the data. CFI and TLI compare it with a model of no relationships (higher is better); RMSEA and SRMR measure misfit (lower is better).",
    statistics: indices.map((index) => ({ symbol: index.index, value: formatBounded(index.value, 3), meaning: `${index.verdict === "good" ? "Good" : index.verdict === "acceptable" ? "Acceptable" : "Poor"} (${index.convention})` })),
    significance: chi
      ? {
          status: chi.status,
          statement: `Model chi-square test: ${chi.statement}`,
          meaning:
            chi.status === "significant"
              ? "A significant chi-square means the model's implied relationships differ from the data's. With large samples this happens even for good models, which is why fit indices are weighed too."
              : "The model's implied relationships don't differ significantly from the data's, which supports the model's fit.",
        }
      : noTest,
    magnitude: null,
    direction: null,
    plain: `By commonly cited cut-offs, the model ${verdict}.${poor.length > 0 ? ` ${poor.map((index) => index.index).join(" and ")} ${poor.length === 1 ? "falls" : "fall"} short.` : ""}`,
    academic: `The model ${verdict} (${indices.map((index) => `${index.index} = ${formatBounded(index.value, 3)}`).join(", ")}${v.chi2P !== undefined ? `; χ² test ${formatP(v.chi2P)}` : ""}).`,
    implication: poor.length === 0 ? "The model is a plausible account of the data, so its paths can be interpreted. Good fit doesn't rule out other models that fit as well." : "Interpret the paths with caution. Revise the model only where theory supports the change, and report every change.",
    warnings: new Set(indices.map((index) => index.verdict)).size > 1 ? ["The fit indices disagree; report them all, and say which you rely on and why."] : [],
    testsHypothesis: false,
  };
};

const plsSem: Interpreter = (v, input, { predictor, outcome }) => {
  const sig = significance(v.p, input.alpha);
  const direction = signOf(v.path);
  const magnitude = v.r2 !== undefined ? plsR2Magnitude(v.r2) : null;
  const warnings: string[] = [];
  if (v.ave !== undefined && v.ave < 0.5) warnings.push(`AVE is ${formatBounded(v.ave)}, below the commonly used .50, so the construct explains less than half its items' variance (a convergent validity concern).`);
  if (v.cr !== undefined && v.cr < 0.7) warnings.push(`Composite reliability is ${formatBounded(v.cr)}, below the commonly used .70.`);
  if (v.cr !== undefined && v.cr > 0.95) warnings.push(`Composite reliability of ${formatBounded(v.cr)} is very high, which can mean redundant items.`);
  if (v.htmt !== undefined && v.htmt >= 0.9) warnings.push(`An HTMT of ${formatStat(v.htmt)} suggests two constructs may not be distinct (a discriminant validity concern); .85 or .90 are common thresholds.`);
  else if (v.htmt !== undefined && v.htmt >= 0.85) warnings.push(`An HTMT of ${formatStat(v.htmt)} passes the .90 threshold but not the stricter .85.`);
  return {
    meaning: "In PLS-SEM, a path coefficient is the standardised effect of one construct on another, usually tested by bootstrapping. R² is the share of the outcome construct's variance the model explains.",
    statistics: [
      { symbol: "β", value: formatBounded(v.path), meaning: `The ${direction === "none" ? "" : `${direction} `}path from ${predictor} to ${outcome}` },
      ...(v.r2 !== undefined ? [{ symbol: "R²", value: formatBounded(v.r2), meaning: `${capital(magnitude!.label)} explanatory power` }] : []),
      ...(v.ave !== undefined ? [{ symbol: "AVE", value: formatBounded(v.ave), meaning: "Convergent validity" }] : []),
      ...(v.cr !== undefined ? [{ symbol: "CR", value: formatBounded(v.cr), meaning: "Composite reliability" }] : []),
    ],
    significance: sig,
    magnitude,
    direction,
    plain: sig.status === "significant" ? `${capital(predictor)} has a ${direction} effect on ${outcome} in the model.${v.r2 !== undefined ? ` The model explains ${formatStat(v.r2 * 100, 0)}% of ${outcome}'s variance.` : ""}` : `The path from ${predictor} to ${outcome} isn't reliable in this sample.`,
    academic: `The path from ${predictor} to ${outcome} was ${sig.status === "significant" ? "significant" : "not significant"}, β = ${formatBounded(v.path)}, ${formatP(v.p)}${v.r2 !== undefined ? `; R² for ${outcome} = ${formatBounded(v.r2)}` : ""}.`,
    implication: sig.status === "significant" ? `${capital(predictor)} contributes to ${outcome} within the model. Check the measurement model's reliability and validity before relying on the path.` : `The model doesn't give evidence that ${predictor} affects ${outcome}.`,
    warnings,
    testsHypothesis: true,
  };
};

const INTERPRETERS: Readonly<Record<ResultKind, Interpreter>> = {
  "descriptive-statistics": descriptive,
  frequency,
  percentage,
  mean,
  median,
  "standard-deviation": standardDeviation,
  "cronbach-alpha": cronbach,
  correlation: correlationInterpreter("r", false),
  pearson: correlationInterpreter("r", false),
  spearman: correlationInterpreter("rₛ", true),
  "simple-regression": simpleRegression,
  "multiple-regression": multipleRegression,
  "hierarchical-regression": hierarchical,
  "logistic-regression": logistic,
  "independent-t-test": tTestInterpreter(false),
  "paired-t-test": tTestInterpreter(true),
  "one-way-anova": oneWayAnova,
  "two-way-anova": twoWayAnova,
  "chi-square": chiSquare,
  "factor-analysis": factorAnalysis,
  sem,
  "pls-sem": plsSem,
};

/** The interpretation of a result's own numbers. The input must already have passed resultProblems. */
export function interpretNumbers(input: ResultInput): CoreInterpretation {
  const parts = INTERPRETERS[input.kind](input.values, input, names(input.variables));
  return { kind: input.kind, name: getAnalysisMethod(input.kind).name, mistakes: COMMON_MISTAKES[input.kind], ...parts };
}
