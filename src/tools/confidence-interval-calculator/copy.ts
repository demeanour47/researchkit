/**
 * All wording for the Confidence Interval Calculator. Each method's text describes
 * the calculation in src/knowledge/statistics/confidence-interval.ts, and the
 * working shown is built from the same numbers the calculation used, so the
 * explanation cannot disagree with the result.
 */

// Relative and type-only imports, so the test runner can load this module (see TESTING.md).
import type { CiMethod, ConfidenceInterval, FisherInterval, NewcombeInterval, SymmetricInterval, WilsonInterval } from "../../knowledge/statistics/confidence-interval";
import type { CiCalculation, CiFieldId } from "../../knowledge/statistics/confidence-interval-request";

export const page = {
  title: "Confidence Interval Calculator",
  /** One sentence, for listings such as the tools index. */
  summary: "Calculates confidence intervals for means, proportions, their differences and correlations, showing the standard error, critical value and every step.",
  metaDescription:
    "Free confidence interval calculator for a mean, a paired mean difference, two independent means (Welch), a proportion (Wilson), two proportions (Newcombe) and a Pearson correlation (Fisher's z), with the working shown and the interval explained.",
  intro:
    "Estimate a population value from your sample, and show how uncertain that estimate is. Choose what you want an interval for, enter your summary statistics, and the calculator gives the interval with its standard error, critical value and the working behind it.",
  noScript: "The Confidence Interval Calculator calculates in your browser, which needs JavaScript. Turn on JavaScript to use it.",
  howHeading: "How to use it",
  limitsHeading: "What it doesn't cover",
  privacyHeading: "Privacy",
  privacy: "Calculations run entirely in your browser. The values you enter are not sent to ResearchKit or anyone else, and they aren't stored.",
  learnLink: "Learn about confidence intervals",
} as const;

export const how: readonly string[] = [
  "Choose what you want a confidence interval for: a mean, a difference between means, a proportion, a difference between proportions, or a correlation. The calculator chooses the method.",
  "Enter the summary statistics from your sample, and choose the confidence level, usually 95%.",
  "Read the interval with its estimate: the estimate is the single best guess, and the interval shows the range of population values the data are compatible with.",
  "Report the estimate, the confidence level and the interval together, and describe how the data were collected.",
];

export const limits: readonly string[] = [
  "Regression coefficients, odds ratios, risk ratios, hazard ratios, ANOVA contrasts, medians, and Spearman or other non-Pearson correlations.",
  "Bootstrap intervals, Bayesian credible intervals, prediction intervals and tolerance intervals: they answer different questions.",
  "Intervals from raw data: enter summary statistics, such as a mean, standard deviation and sample size.",
  "Whether your data meet the method's assumptions, or whether the sample represents the population you want to describe.",
];

export const form = {
  methodLabel: "What do you want a confidence interval for?",
  methodHint: "The calculator chooses the method for each.",
  confidenceLegend: "Confidence level",
  confidenceHint: "95% is the most common choice.",
  calculate: "Calculate",
  reset: "Reset",
  errorsHeading: "Check these values",
} as const;

/** The confidence levels offered, with the value each sends. */
export const confidenceOptions = [
  { value: "0.90", label: "90%" },
  { value: "0.95", label: "95%" },
  { value: "0.99", label: "99%" },
] as const;

export interface MethodCopy {
  label: string;
  /** What the interval is for, after "95% confidence interval for". */
  parameter: string;
  /** The interval method's name, as a reporting sentence gives it. */
  methodName: string;
  /** The method's name after "Using", with its article where it needs one. */
  using: string;
  description: string;
  /** Where each field comes from, in the method's own words. */
  fields: Partial<Record<CiFieldId, { label: string; hint: string }>>;
  method: string;
  assumptions: readonly string[];
}

const groupFields = (group: 1 | 2) => ({
  [`mean${group}`]: { label: `Mean of group ${group}`, hint: group === 1 ? "The difference is group 1 − group 2." : "The group you compare against." },
  [`sd${group}`]: { label: `Standard deviation of group ${group}`, hint: "The sample standard deviation." },
  [`n${group}`]: { label: `Sample size of group ${group}`, hint: "At least 2." },
});

export const methods: Record<CiMethod, MethodCopy> = {
  "one-mean": {
    label: "One mean",
    parameter: "the population mean (μ)",
    methodName: "t interval",
    using: "the t interval",
    description: "The mean of one sample, such as average test scores.",
    fields: {
      mean: { label: "Sample mean", hint: "For example, 72.4." },
      sd: { label: "Sample standard deviation", hint: "The standard deviation of your sample (s), not a known population value." },
      n: { label: "Sample size", hint: "The number of observations, at least 2." },
    },
    method: "The t interval: mean ± t × s ÷ √n, with n − 1 degrees of freedom. The t distribution is used because the population standard deviation is unknown and estimated from the sample, which adds uncertainty that a z interval would ignore.",
    assumptions: [
      "Independent observations, such as a random sample.",
      "A quantitative outcome, measured on an interval or ratio scale.",
      "Values drawn from a roughly normal population. With larger samples the interval is robust to moderate departures, but strong skew or outliers in a small sample can make it misleading.",
      "The sample represents the population you want to describe; the interval reflects sampling variability only, not bias.",
    ],
  },
  "two-means": {
    label: "Difference between two independent means",
    parameter: "the difference between the population means (μ₁ − μ₂)",
    methodName: "Welch's method",
    using: "Welch's method",
    description: "Two separate groups, such as a treatment and a control group.",
    fields: { ...groupFields(1), ...groupFields(2) },
    method: "Welch's interval: (mean₁ − mean₂) ± t × √(s₁²/n₁ + s₂²/n₂), with the Welch–Satterthwaite degrees of freedom. It doesn't assume the two groups have equal variances, so it stays accurate when their spreads or sizes differ.",
    assumptions: [
      "Two independent groups: no one is in both, and the groups aren't matched.",
      "A quantitative outcome.",
      "Roughly normal values in each group, or large enough groups.",
      "Equal variances are not assumed.",
      "The direction is fixed: the difference is group 1 − group 2.",
    ],
  },
  "paired-mean": {
    label: "Paired mean difference",
    parameter: "the population mean difference",
    methodName: "paired t interval",
    using: "the paired t interval",
    description: "The same people measured twice, or matched pairs, such as before and after.",
    fields: {
      meanDifference: { label: "Mean difference", hint: "The mean of the differences within each pair, such as after − before." },
      sdDifference: { label: "Standard deviation of the differences", hint: "Not the standard deviation of either measurement." },
      pairs: { label: "Number of pairs", hint: "At least 2." },
    },
    method: "The t interval applied to the differences within each pair: mean difference ± t × (SD of the differences) ÷ √n, with n − 1 degrees of freedom. The analysis is performed on the paired differences, never on the two measurements as if they were independent groups.",
    assumptions: [
      "Meaningful pairs: the same participants measured twice, or deliberately matched pairs.",
      "The differences are the unit of analysis, calculated the same way (such as after − before) for every pair.",
      "Independent pairs.",
      "Roughly normal differences, or enough pairs.",
    ],
  },
  "one-proportion": {
    label: "One proportion",
    parameter: "the population proportion (p)",
    methodName: "Wilson score interval",
    using: "the Wilson score interval",
    description: "The share of a sample with an outcome, such as the proportion who agree.",
    fields: {
      successes: { label: "Number with the outcome", hint: "The count of “successes”: participants with the outcome, from 0 to the sample size." },
      n: { label: "Sample size", hint: "The number of participants, at least 1." },
    },
    method: "The Wilson score interval, centred on (x + z²/2) ÷ (n + z²) with half-width z√(x(n − x)/n + z²/4) ÷ (n + z²). It is preferred to the simple estimate ± z × √(p̂(1 − p̂)/n), which can fall outside 0 to 1 and covers the true proportion less often than it claims, especially in small samples or near 0% or 100%.",
    assumptions: [
      "A binary outcome: each participant has the outcome or doesn't.",
      "Independent observations, such as a simple random sample.",
      "A normal approximation to the binomial; the Wilson interval keeps close to its stated confidence even in small samples, but it is still approximate.",
    ],
  },
  "two-proportions": {
    label: "Difference between two proportions",
    parameter: "the difference between the population proportions (p₁ − p₂)",
    methodName: "Newcombe's hybrid score interval",
    using: "Newcombe's hybrid score interval",
    description: "Two separate groups with a binary outcome, such as recovery rates under two treatments.",
    fields: {
      successes1: { label: "Number with the outcome in group 1", hint: "The difference is group 1 − group 2." },
      n1: { label: "Sample size of group 1", hint: "At least 1." },
      successes2: { label: "Number with the outcome in group 2", hint: "The group you compare against." },
      n2: { label: "Sample size of group 2", hint: "At least 1." },
    },
    method: "Newcombe's hybrid score interval, which combines the Wilson interval of each proportion. It stays within −1 to 1 and works when a group has 0% or 100%. It is an interval for the difference p₁ − p₂, not for a risk ratio, relative risk or odds ratio.",
    assumptions: [
      "Two independent groups with a binary outcome.",
      "Independent observations within each group.",
      "An approximate method: its coverage is close to the stated level, but not exact, in small samples.",
      "The direction is fixed: the difference is group 1 − group 2, shown as a proportion and in percentage points.",
    ],
  },
  correlation: {
    label: "Pearson correlation",
    parameter: "the population correlation (ρ)",
    methodName: "Fisher's z transformation",
    using: "Fisher's z transformation",
    description: "The strength of a linear relationship between two quantitative variables.",
    fields: {
      r: { label: "Correlation r", hint: "Pearson's r, between -1 and 1, such as 0.45." },
      n: { label: "Sample size", hint: "The number of pairs of observations, at least 4." },
    },
    method: "Fisher's z transformation: r is transformed to z = artanh r, whose sampling distribution is close to normal with standard error 1 ÷ √(n − 3). The interval is built on the z scale and transformed back to the correlation scale with tanh, so it isn't symmetric around r. This method is for Pearson's correlation.",
    assumptions: [
      "Paired observations of two quantitative variables.",
      "A linear relationship: Pearson's r describes straight-line association only.",
      "Independent pairs, with the two variables roughly bivariate normal.",
      "An approximation that is less accurate in very small samples. It is not for Spearman's or other rank correlations.",
    ],
  },
};

export const results = {
  heading: "Confidence interval",
  intervalHeading: (calculation: Okay) => `${percentLevel(calculation.interval.confidence)} confidence interval for ${methods[calculation.method].parameter}`,
  estimate: "Estimate",
  standardError: "Standard error",
  standardErrorZ: "Standard error of z",
  criticalValue: "Critical value",
  margin: "Margin of error",
  interval: "Confidence interval",
  belowAbove: "Below and above the estimate",
  asymmetric: {
    wilson: "The Wilson interval isn't centred on the sample proportion, so it has no single margin of error.",
    newcombe: "Newcombe's interval isn't centred on the difference, so it has no single margin of error.",
    fisher: "The interval is symmetric on Fisher's z scale but not on the correlation scale, so it has no single margin of error for r.",
  },
  interpretationHeading: "Interpretation",
  includesZeroTitle: "The interval includes 0",
  reportingHeading: "Reporting the result",
  reportingHint: "Adapt this sentence, and describe the study design and how the data were collected.",
  copyReporting: "reporting sentence",
  assumptionsSummary: "Assumptions and limitations",
  methodSummary: "How this was calculated",
  /** Limits that apply to every method, listed after the method's own assumptions. */
  generalLimits: [
    "The interval reflects random sampling variation only. It doesn't account for bias, measurement error or a sample that doesn't represent the population.",
    "It is an interval for a population value, not a prediction interval for an individual observation.",
  ],
  unstable: "These values are outside the range the calculation can handle reliably, so no interval is shown. Check the values; extremely large or small numbers can lose the precision the calculation needs.",
  empty: "Choose what you want an interval for, enter the values, and press Calculate.",
  resetDone: "Form reset.",
} as const;

type Okay = Extract<CiCalculation, { ok: true }>;

const percentLevel = (confidence: number) => `${Number((confidence * 100).toPrecision(10))}%`;

// Rounding. Values keep full precision in the calculation; these only format them.

/** Decimal places that show at least `figures` significant figures of a non-zero value. */
export function decimalsFor(value: number, figures: number): number {
  if (value === 0 || !Number.isFinite(value)) return 0;
  return Math.max(0, figures - 1 - Math.floor(Math.log10(Math.abs(value))));
}

/** A number to fixed decimals, with no "-0.00". */
export function fixed(value: number, decimals: number): string {
  const text = value.toFixed(decimals);
  return /^-0\.?0*$/u.test(text) ? text.slice(1) : text;
}

/**
 * A bound that lies strictly inside [min, max] never displays as min or max: more
 * decimals are shown until it is distinguishable, so 0.99999982 isn't shown as 1.000.
 */
export function fixedWithin(value: number, decimals: number, min: number, max: number): string {
  let places = decimals;
  const atLimit = (text: string) => Number(text) === min || Number(text) === max;
  while (places < 15 && value !== min && value !== max && atLimit(fixed(value, places))) places += 1;
  return fixed(value, places);
}

/** The decimals for a symmetric interval on a mean: those entered (at least 2), or more if the margin needs them. */
function meanDecimals(calculation: Okay, interval: SymmetricInterval): number {
  return Math.min(10, Math.max(calculation.decimals ?? 2, decimalsFor(interval.margin, 2), decimalsFor(interval.standardError, 2)));
}

/** The decimals for proportions: 3, or more for intervals too narrow to show at 3. */
const proportionDecimals = (width: number) => Math.min(10, Math.max(3, decimalsFor(width, 2)));

const asPercent = (value: number, decimals: number, min: number, max: number) => `${fixedWithin(value * 100, Math.max(1, decimals - 2), min * 100, max * 100)}%`;

const criticalText = (interval: ConfidenceInterval) => {
  const quantile = fixed(1 - interval.alpha / 2, 4).replace(/0+$/u, "");
  if (interval.critical.distribution === "z") return `z(${quantile}) = ${fixed(interval.critical.value, 3)}`;
  return `t(${quantile}, ${formatDf(interval.critical.df)}) = ${fixed(interval.critical.value, 3)}`;
};

/** Decimals for values on Fisher's z scale: 4, or enough for 2 significant figures of the standard error. */
const zDecimals = (interval: FisherInterval) => Math.max(4, decimalsFor(interval.standardError, 2));

/** Degrees of freedom: whole numbers as they are, Welch's to two decimals. */
export const formatDf = (df: number) => (Number.isInteger(df) ? df.toLocaleString("en") : fixed(df, 2));

/** The numbers a result shows, formatted consistently: the bounds never contradict each other or the estimate. */
export interface DisplayedResult {
  estimate: string;
  lower: string;
  upper: string;
  interval: string;
  rows: [string, string][];
  note: string | null;
}

/**
 * More decimals, until the lower and upper bounds display differently: they always
 * differ, and an interval shown as [0.99999999, 0.99999999] would contradict itself.
 */
function distinguishing(lower: number, upper: number, decimals: number): number {
  let places = decimals;
  while (places < 15 && fixed(lower, places) === fixed(upper, places)) places += 1;
  return places;
}

/** A distance below or above an estimate, with its sign, and no sign when it is 0 at this precision. */
const signed = (sign: "−" | "+", value: number, decimals: number) => {
  const text = fixed(value, decimals);
  return Number(text) === 0 ? text : `${sign}${text}`;
};

export function display(calculation: Okay): DisplayedResult {
  const { interval } = calculation;
  const critical: [string, string] = [results.criticalValue, criticalText(interval)];
  if (interval.kind === "symmetric") {
    const d = distinguishing(interval.lower, interval.upper, meanDecimals(calculation, interval));
    const [estimate, lower, upper] = [fixed(interval.estimate, d), fixed(interval.lower, d), fixed(interval.upper, d)];
    return {
      estimate,
      lower,
      upper,
      interval: `[${lower}, ${upper}]`,
      rows: [[results.estimate, estimate], [results.standardError, fixed(interval.standardError, d)], critical, [results.margin, fixed(interval.margin, d)], [results.interval, `[${lower}, ${upper}]`]],
      note: null,
    };
  }
  if (interval.kind === "wilson") {
    const d = distinguishing(interval.lower, interval.upper, proportionDecimals(interval.upper - interval.lower));
    const [estimate, lower, upper] = [proportion(interval.estimate, d), proportion(interval.lower, d), proportion(interval.upper, d)];
    return {
      estimate,
      lower,
      upper,
      interval: `[${lower}, ${upper}]`,
      rows: [[results.estimate, estimate], critical, [results.interval, `[${lower}, ${upper}]`], [results.belowAbove, `${signed("−", interval.estimate - interval.lower, d)}, ${signed("+", interval.upper - interval.estimate, d)}`]],
      note: results.asymmetric.wilson,
    };
  }
  if (interval.kind === "newcombe") {
    const d = distinguishing(interval.lower, interval.upper, proportionDecimals(interval.upper - interval.lower));
    const [estimate, lower, upper] = [difference(interval.estimate, d), difference(interval.lower, d), difference(interval.upper, d)];
    return {
      estimate,
      lower,
      upper,
      interval: `[${lower}, ${upper}]`,
      rows: [[results.estimate, estimate], critical, [results.interval, `[${lower}, ${upper}]`], [results.belowAbove, `${signed("−", interval.below, d)}, ${signed("+", interval.above, d)}`]],
      note: results.asymmetric.newcombe,
    };
  }
  const d = distinguishing(interval.lower, interval.upper, Math.min(10, Math.max(3, decimalsFor(interval.upper - interval.lower, 2))));
  const [estimate, lower, upper] = [fixedWithin(interval.estimate, d, -1, 1), fixedWithin(interval.lower, d, -1, 1), fixedWithin(interval.upper, d, -1, 1)];
  return {
    estimate,
    lower,
    upper,
    interval: `[${lower}, ${upper}]`,
    rows: [[results.estimate, `r = ${estimate}`], [results.standardErrorZ, fixed(interval.standardError, zDecimals(interval))], critical, [results.interval, `[${lower}, ${upper}]`]],
    note: results.asymmetric.fisher,
  };
}

/** A proportion with its percentage, such as "0.642 (64.2%)". Bounds strictly inside [0, 1] never show as 0 or 1. */
const proportion = (value: number, d: number) => `${fixedWithin(value, d, 0, 1)} (${asPercent(value, d, 0, 1)})`;
/** A difference of proportions with its percentage points. */
const difference = (value: number, d: number) => `${fixedWithin(value, d, -1, 1)} (${fixedWithin(value * 100, Math.max(1, d - 2), -100, 100)} percentage points)`;

// Interpretation.

const COVERAGE = (calculation: Okay) =>
  `If this sampling procedure were repeated many times, intervals constructed in this way would contain the true value in about ${percentLevel(calculation.interval.confidence)} of samples. Any one interval either contains it or doesn't: the ${percentLevel(calculation.interval.confidence)} describes the method, not the probability for this particular interval.`;

const ESTIMATE_PHRASE: Record<CiMethod, string> = {
  "one-mean": "the estimated population mean",
  "two-means": "the estimated difference between the population means (group 1 − group 2)",
  "paired-mean": "the estimated mean difference",
  "one-proportion": "the estimated population proportion",
  "two-proportions": "the estimated difference between the population proportions (group 1 − group 2)",
  correlation: "the estimated population correlation",
};

/** The plain-language reading of a result, which never presents the confidence level as a probability for this interval. */
export function interpretation(calculation: Okay): string[] {
  const shown = display(calculation);
  const copy = methods[calculation.method];
  const estimate = calculation.interval.kind === "fisher" ? `r = ${shown.estimate}` : shown.estimate;
  const sentences = [
    `Using ${copy.using}, ${ESTIMATE_PHRASE[calculation.method]} is ${estimate}, and the ${percentLevel(calculation.interval.confidence)} confidence interval extends from ${shown.lower} to ${shown.upper}.`,
    COVERAGE(calculation),
  ];
  return sentences;
}

/** What an interval that includes 0 does, and doesn't, show. Null when 0 isn't in it or isn't a meaningful comparison. */
export function zeroNote(calculation: Okay): string | null {
  if (!calculation.includesZero) return null;
  if (calculation.method === "correlation") {
    return "The interval includes 0, so the data are compatible with a negative correlation, no correlation and a positive correlation under this interval estimate. That isn't evidence that there is no relationship: the interval shows how imprecise the estimate is.";
  }
  return "The interval includes 0, so the data are compatible with both a negative and a positive difference under this interval estimate. That isn't evidence that there is no difference: the interval shows how imprecise the estimate is.";
}

/** APA style drops the leading zero for values that can't exceed 1 in size, such as correlations. */
const withoutLeadingZero = (text: string) => text.replace(/^(-?)0\./u, "$1.");

/** A sentence for reporting the result in APA style, with the method named where it isn't the usual t interval. */
export function reportingSentence(calculation: Okay): string {
  const shown = display(calculation);
  const { interval } = calculation;
  const level = percentLevel(interval.confidence);
  const ci = (lower: string, upper: string) => `${level} CI [${lower}, ${upper}]`;
  switch (calculation.method) {
    case "one-mean":
      return `The mean was ${shown.estimate} (${ci(shown.lower, shown.upper)}).`;
    case "paired-mean":
      return `The mean difference was ${shown.estimate} (${ci(shown.lower, shown.upper)}).`;
    case "two-means":
      return `The difference between the means (group 1 − group 2) was ${shown.estimate} (${ci(shown.lower, shown.upper)}; Welch's method).`;
    case "one-proportion": {
      const w = interval as WilsonInterval;
      const d = distinguishing(w.lower, w.upper, proportionDecimals(w.upper - w.lower));
      return `The estimated proportion was ${asPercent(w.estimate, d, 0, 1)} (${ci(asPercent(w.lower, d, 0, 1), asPercent(w.upper, d, 0, 1))}; Wilson score interval).`;
    }
    case "two-proportions": {
      const n = interval as NewcombeInterval;
      const d = Math.max(1, distinguishing(n.lower, n.upper, proportionDecimals(n.upper - n.lower)) - 2);
      const points = (value: number) => fixedWithin(value * 100, d, -100, 100);
      return `The difference in proportions (group 1 − group 2) was ${points(n.estimate)} percentage points (${ci(points(n.lower), points(n.upper))}; Newcombe's hybrid score interval).`;
    }
    case "correlation": {
      const f = interval as FisherInterval;
      // APA reports correlations to two decimals; more are shown only where two would reach ±1.
      const places = distinguishing(f.lower, f.upper, 2);
      const r = (value: number) => withoutLeadingZero(fixedWithin(value, places, -1, 1));
      return `The correlation was r = ${r(f.estimate)} (${ci(r(f.lower), r(f.upper))}; Fisher's z transformation).`;
    }
  }
}

// Working.

export interface WorkingStep {
  label: string;
  /** The formula with the numbers substituted. */
  working: string;
}

/** Every step from inputs to bounds, with the numbers used, for the "How this was calculated" disclosure. */
export function working(calculation: Okay): WorkingStep[] {
  const { interval } = calculation;
  const shown = display(calculation);
  const critical = { label: "Critical value", working: criticalText(interval) };
  if (interval.kind === "symmetric") {
    const d = meanDecimals(calculation, interval);
    const f = (value: number) => fixed(value, d);
    const se = interval.standardError;
    const standardError =
      calculation.method === "two-means"
        ? { label: "Standard error", working: `√(s₁²/n₁ + s₂²/n₂) = ${f(se)}` }
        : { label: "Standard error", working: `${calculation.method === "paired-mean" ? "SD of the differences" : "s"} ÷ √n = ${f(se)}` };
    const df =
      interval.critical.distribution === "t"
        ? { label: "Degrees of freedom", working: calculation.method === "two-means" ? `Welch–Satterthwaite: (s₁²/n₁ + s₂²/n₂)² ÷ ((s₁²/n₁)²/(n₁ − 1) + (s₂²/n₂)²/(n₂ − 1)) = ${formatDf(interval.critical.df)}` : `n − 1 = ${formatDf(interval.critical.df)}` }
        : null;
    return [
      { label: "Estimate", working: `${calculation.method === "two-means" ? "mean₁ − mean₂" : calculation.method === "paired-mean" ? "mean of the differences" : "sample mean"} = ${shown.estimate}` },
      standardError,
      ...(df ? [df] : []),
      critical,
      { label: "Margin of error", working: `${fixed(interval.critical.value, 3)} × ${f(se)} = ${f(interval.margin)}` },
      { label: "Lower bound", working: `${shown.estimate} − ${f(interval.margin)} = ${shown.lower}` },
      { label: "Upper bound", working: `${shown.estimate} + ${f(interval.margin)} = ${shown.upper}` },
    ];
  }
  if (interval.kind === "wilson") {
    const [estimate, ...rest] = wilsonSteps(interval);
    return [estimate, critical, ...rest];
  }
  if (interval.kind === "newcombe") {
    const d = proportionDecimals(interval.upper - interval.lower);
    const f = (value: number) => fixed(value, d);
    // A proportion strictly between 0 and 1 never displays as 0 or 1.
    const p = (value: number) => fixedWithin(value, d, 0, 1);
    const [first, second] = interval.groups;
    return [
      { label: "Estimate", working: `p̂₁ − p̂₂ = ${p(first.estimate)} − ${p(second.estimate)} = ${fixedWithin(interval.estimate, d, -1, 1)}` },
      critical,
      { label: "Wilson interval, group 1", working: `[l₁, u₁] = [${p(first.lower)}, ${p(first.upper)}]` },
      { label: "Wilson interval, group 2", working: `[l₂, u₂] = [${p(second.lower)}, ${p(second.upper)}]` },
      { label: "Distance below", working: `√((p̂₁ − l₁)² + (u₂ − p̂₂)²) = ${f(interval.below)}` },
      { label: "Distance above", working: `√((u₁ − p̂₁)² + (p̂₂ − l₂)²) = ${f(interval.above)}` },
      { label: "Lower bound", working: `${f(interval.estimate)} − ${f(interval.below)} = ${fixedWithin(interval.lower, d, -1, 1)}` },
      { label: "Upper bound", working: `${f(interval.estimate)} + ${f(interval.above)} = ${fixedWithin(interval.upper, d, -1, 1)}` },
    ];
  }
  const zd = zDecimals(interval);
  return [
    { label: "Estimate", working: `r = ${shown.estimate}` },
    { label: "Fisher's z", working: `z = artanh r = ${fixed(interval.z, zd)}` },
    { label: "Standard error of z", working: `1 ÷ √(n − 3) = 1 ÷ √${interval.n - 3} = ${fixed(interval.standardError, zd)}` },
    critical,
    { label: "Margin on the z scale", working: `${fixed(interval.critical.value, 3)} × ${fixed(interval.standardError, zd)} = ${fixed(interval.margin, zd)}` },
    { label: "Interval on the z scale", working: `[${fixed(interval.zLower, zd)}, ${fixed(interval.zUpper, zd)}]` },
    { label: "Back to the correlation scale", working: `[tanh(${fixed(interval.zLower, zd)}), tanh(${fixed(interval.zUpper, zd)})] = [${shown.lower}, ${shown.upper}]` },
  ];
}

/** The Wilson interval's working, from the estimate to its bounds. */
function wilsonSteps(interval: WilsonInterval): WorkingStep[] {
  const d = proportionDecimals(interval.upper - interval.lower);
  const f = (value: number) => fixedWithin(value, Math.max(4, d), 0, 1);
  return [
    { label: "Estimate", working: `p̂ = x ÷ n = ${interval.successes.toLocaleString("en")} ÷ ${interval.n.toLocaleString("en")} = ${fixed(interval.estimate, Math.max(4, d))}` },
    { label: "Centre", working: `(x + z²/2) ÷ (n + z²) = ${f(interval.centre)}` },
    { label: "Half-width", working: `z√(x(n − x)/n + z²/4) ÷ (n + z²) = ${f(interval.halfWidth)}` },
    { label: "Lower bound", working: interval.successes === 0 ? "0, exactly: with no successes the lower limit is 0" : `centre − half-width = ${f(interval.lower)}` },
    { label: "Upper bound", working: interval.successes === interval.n ? "1, exactly: with every observation a success the upper limit is 1" : `centre + half-width = ${f(interval.upper)}` },
  ];
}

export const announcements = {
  calculated: (calculation: Okay) => {
    const shown = display(calculation);
    return `${percentLevel(calculation.interval.confidence)} confidence interval: ${shown.lower} to ${shown.upper}. Estimate: ${shown.estimate}.`;
  },
  errors: (count: number) => `${count} ${count === 1 ? "value needs" : "values need"} checking.`,
} as const;
