/**
 * All wording for Power Analysis. Each design's method text describes the
 * calculation in src/knowledge/statistics/power.ts, and its limits are stated with
 * it, so the explanation cannot claim more than the calculation does.
 */

// Relative and type-only imports, so the test runner can load this module (see TESTING.md).
import type { Design, Mode, Tails } from "../../knowledge/statistics/power";
import type { EffectSpec, PowerCalculation } from "../../knowledge/statistics/power-request";

export const page = {
  title: "Power Analysis",
  /** One sentence, for listings such as the tools index. */
  summary: "Plans the sample size a study needs, or the power it will have, for seven common designs, with every assumption stated.",
  metaDescription:
    "Free a priori power analysis: required sample size, power for a planned sample, or the smallest detectable effect for t tests, proportions, correlation and one-way ANOVA, with methods checked against G*Power and the R pwr package.",
  intro:
    "Plan how many participants a study needs before you collect data. Choose your analysis, the effect you want to be able to detect, α and the power you want, and the tool calculates the sample size, with its assumptions and a sentence you can adapt for your report.",
  noScript: "Power Analysis calculates in your browser, which needs JavaScript. Turn on JavaScript to use it.",
  howHeading: "How to use it",
  limitsHeading: "What it doesn't cover",
  privacyHeading: "Privacy",
  privacy: "Calculations run entirely in your browser. The values you enter are not sent to ResearchKit or anyone else, and they aren't stored.",
  learnLink: "Learn about power analysis",
} as const;

export const how: readonly string[] = [
  "Choose the analysis you plan to run. If you aren't sure, the Statistical Test Finder can help you choose.",
  "Specify the smallest effect worth detecting, from previous research, a pilot study or what would matter in practice. The Effect Size Calculator can turn means and standard deviations into an effect size.",
  "Choose α, the Type I error rate you will test at, and the power you want, usually 0.80 or 0.90.",
  "Calculate the sample size before collecting data. That is an a priori power analysis, the use power analysis is designed for.",
];

export const limits: readonly string[] = [
  "Unequal group sizes, factorial or repeated-measures ANOVA, regression, non-parametric tests, survival analysis, mixed models, cluster designs and sequential or adaptive designs.",
  "Attrition, non-response or missing data: add to the calculated sample size for the participants you expect to lose.",
  "Whether the effect size you entered is realistic. The result is only as good as that assumption.",
  "Power calculated from the effect observed in your own data (observed or post hoc power), which this tool doesn't offer; report confidence intervals instead.",
];

export const form = {
  designLabel: "What analysis are you planning?",
  designHint: "Each option names the test the calculation is for.",
  modeLegend: "What do you want to calculate?",
  modeHint: "Required sample size is an a priori power analysis: use it to plan a study before collecting data.",
  modes: { "sample-size": "Required sample size", power: "Power for a planned sample size", effect: "Smallest detectable effect" } satisfies Record<Mode, string>,
  tailsLegend: "Test direction",
  tailsHint: "Decide before analysing your data. A one-sided test is in the direction of the effect you specify.",
  tails: { "two-sided": "Two-sided", "one-sided": "One-sided" } satisfies Record<Tails, string>,
  alpha: "Significance level (α)",
  alphaHint: "The Type I error rate you will test at, as a decimal. Common choices: 0.05, 0.01, 0.10.",
  power: "Target power (1 − β)",
  powerHint: "The probability of detecting the effect if it exists, as a decimal. Common choices: 0.80, 0.90, 0.95.",
  groups: "Number of groups",
  groupsHint: "Each group is assumed to have the same size.",
  calculate: "Calculate",
  reset: "Reset",
  errorsHeading: "Check these values",
} as const;

export interface DesignCopy {
  label: string;
  test: string;
  /** The sentence describing what is compared. */
  description: string;
  effect: { label: string; hint: string; symbol: string; definition: string };
  sample: { label: string; hint: string; unit: (n: number) => string };
  method: string;
  assumptions: readonly string[];
}

const people = (n: number) => `${n.toLocaleString("en")} ${n === 1 ? "participant" : "participants"}`;

export const designs: Record<Design, DesignCopy> = {
  "one-sample-mean": {
    label: "One-sample mean",
    test: "one-sample t test",
    description: "Compares one group's mean with a fixed reference value, such as a published norm.",
    effect: { label: "Effect size d", hint: "(μ − μ₀) ÷ σ: how far the mean is from the reference value, in standard deviations. For example, 0.5.", symbol: "d", definition: "Cohen's d: the difference between the population mean and the reference value, divided by the standard deviation." },
    sample: { label: "Sample size", hint: "The number of participants.", unit: people },
    method: "Exact power from the noncentral t distribution with N − 1 degrees of freedom and noncentrality δ = d√N, as G*Power calculates it.",
    assumptions: ["Independent observations.", "An outcome measured on an interval or ratio scale, roughly normally distributed.", "A standard deviation that is known well enough to state d."],
  },
  "two-means": {
    label: "Two independent means",
    test: "independent-samples t test",
    description: "Compares the means of two separate groups, such as a treatment and a control group.",
    effect: { label: "Effect size d", hint: "(μ₁ − μ₂) ÷ σ: the difference between the group means, in standard deviations. For example, 0.5.", symbol: "d", definition: "Cohen's d: the difference between the two population means, divided by their common standard deviation." },
    sample: { label: "Sample size per group", hint: "The number of participants in each group; both groups are the same size.", unit: people },
    method: "Exact power from the noncentral t distribution with N − 2 degrees of freedom and δ = d√(n₁n₂ ÷ (n₁ + n₂)), with equal groups, as G*Power calculates it.",
    assumptions: ["Two independent groups of equal size: unequal allocation isn't supported.", "Independent observations.", "A roughly normally distributed outcome with equal variances in the two groups."],
  },
  "paired-means": {
    label: "Paired means",
    test: "paired-samples t test",
    description: "Compares two measurements on the same participants, or on matched pairs, such as before and after.",
    effect: { label: "Effect size dz", hint: "Mean difference ÷ standard deviation of the differences. For example, 0.5.", symbol: "dz", definition: "dz: the mean of the paired differences divided by their standard deviation. It isn't the same as d: it grows as the two measurements become more strongly correlated." },
    sample: { label: "Number of pairs", hint: "The number of participants measured twice, or of matched pairs.", unit: (n) => `${n.toLocaleString("en")} ${n === 1 ? "pair" : "pairs"}` },
    method: "Exact power from the noncentral t distribution with N − 1 degrees of freedom and δ = dz√N, where N is the number of pairs, as G*Power calculates it. A paired design is analysed through its differences, not as two independent groups.",
    assumptions: ["Meaningful pairs: the same participants measured twice, or deliberately matched pairs.", "Independent pairs.", "Roughly normally distributed differences."],
  },
  "one-proportion": {
    label: "One-sample proportion",
    test: "test of one proportion",
    description: "Compares the proportion of a group with an outcome against a fixed value.",
    effect: { label: "", hint: "", symbol: "h", definition: "Cohen's h: 2 arcsin √p₁ − 2 arcsin √p₀, the difference between the arcsine-transformed proportions." },
    sample: { label: "Sample size", hint: "The number of participants.", unit: people },
    method: "Cohen's arcsine method, a normal approximation: the test statistic has mean h√N. The same method as the R pwr package's pwr.p.test.",
    assumptions: ["Independent observations, each with a yes-or-no outcome.", "A sample large enough for a normal approximation: as a rule of thumb, at least 10 expected successes and 10 expected failures."],
  },
  "two-proportions": {
    label: "Two independent proportions",
    test: "comparison of two independent proportions",
    description: "Compares the proportion with an outcome in two separate groups.",
    effect: { label: "", hint: "", symbol: "h", definition: "Cohen's h: 2 arcsin √p₂ − 2 arcsin √p₁, the difference between the arcsine-transformed proportions." },
    sample: { label: "Sample size per group", hint: "The number of participants in each group; both groups are the same size.", unit: people },
    method: "Cohen's arcsine method, a normal approximation: the test statistic has mean h√(n ÷ 2) with n in each group. The same method as the R pwr package's pwr.2p.test.",
    assumptions: ["Two independent groups of equal size.", "Independent observations, each with a yes-or-no outcome.", "Groups large enough for a normal approximation: as a rule of thumb, at least 10 expected successes and 10 expected failures in each."],
  },
  correlation: {
    label: "Correlation",
    test: "test of a Pearson correlation",
    description: "Tests whether two variables measured on the same participants are correlated.",
    effect: { label: "", hint: "", symbol: "r", definition: "The population correlation r you expect, tested against a null value, usually 0. A correlation of 0.30 is not the same as d = 0.30." },
    sample: { label: "Sample size", hint: "The number of participants, each measured on both variables.", unit: people },
    method: "Fisher's z approximation: the test statistic is normal with mean (z(r) − z(r₀))√(N − 3), where z(r) = ½ ln((1 + r) ÷ (1 − r)). G*Power's manual describes this large-sample approximation; for small samples, its exact method can give a noticeably different power.",
    assumptions: ["Pairs of observations on independent participants.", "A linear relationship, with both variables roughly normally distributed.", "A large enough sample for Fisher's approximation."],
  },
  anova: {
    label: "One-way ANOVA",
    test: "one-way between-groups ANOVA (F test)",
    description: "Compares the means of three or more separate groups.",
    effect: { label: "Effect size f", hint: "Standard deviation of the group means ÷ standard deviation within groups. For example, 0.25.", symbol: "f", definition: "Cohen's f: the standard deviation of the group means divided by the common standard deviation within groups." },
    sample: { label: "Sample size per group", hint: "The number of participants in each group; every group is the same size.", unit: people },
    method: "Exact power of the overall F test from the noncentral F distribution with k − 1 and N − k degrees of freedom and λ = f²N, as G*Power calculates it. It covers the omnibus test only, not follow-up comparisons.",
    assumptions: ["Groups of equal size.", "Independent observations in separate groups.", "A roughly normally distributed outcome with equal variances across groups.", "One factor only: not factorial or repeated-measures ANOVA."],
  },
};

export const proportionFields = {
  p0: { label: "Proportion under the null hypothesis", hint: "The reference value, as a decimal from 0 to 1, such as 0.50." },
  p1OneSample: { label: "Expected proportion", hint: "The proportion you expect if the effect exists, as a decimal, such as 0.65." },
  p1: { label: "Proportion in group 1", hint: "As a decimal from 0 to 1, such as 0.50." },
  p2: { label: "Expected proportion in group 2", hint: "As a decimal from 0 to 1, such as 0.65." },
} as const;

export const correlationFields = {
  r: { label: "Expected correlation r", hint: "Between −1 and 1, such as 0.30." },
  r0: { label: "Correlation under the null hypothesis", hint: "Usually 0." },
} as const;

export const results = {
  heading: "Result",
  analysis: "Analysis",
  effect: "Effect size",
  alpha: "α",
  targetPower: "Target power",
  direction: "Test direction",
  groups: "Groups",
  requiredHeading: "Required sample size",
  powerHeading: "Power for this sample",
  effectHeading: "Smallest detectable effect",
  achieved: (power: number) => `Calculated power at this size: ${formatPower(power)}.`,
  meaningHeading: "What this means",
  sensitivityHeading: "Required sample size at other power levels",
  sensitivityCaption: "Required sample size for the same effect and α, at three common target powers",
  reportingHeading: "Reporting the analysis",
  reportingHint: "Adapt this sentence for your methods section, and name the software or tool you used.",
  copyReporting: "reporting sentence",
  assumptionsSummary: "Assumptions and limitations",
  methodSummary: "How this is calculated",
  effectBenchmark: "Cohen's conventional benchmarks",
  benchmarkNote: "These are rough conventions from Cohen (1988), not rules: a meaningful effect depends on your field, your measures and the practical consequences.",
  normalApproximation: "Some expected counts are small (below 10 successes or failures), where a normal approximation can be inaccurate. Consider an exact method, such as G*Power's exact tests for proportions.",
  observedPower: "This is the power a study of this size would have for the effect you specified. It isn't the power of a completed study, and it shouldn't be calculated from the effect observed in your data: report the effect size with a confidence interval instead.",
  tooLarge: "The required sample size is more than 10,000,000. The effect is too small to detect with a study of practical size; check the effect size you entered.",
  notReachable: "No effect within the range the tool searches reaches this power with this sample size. Check the sample size and target power.",
  attrition: "Add to this number for participants you expect to lose to dropout or missing data.",
  empty: "Choose an analysis, enter the values, and press Calculate.",
  resetDone: "Form reset.",
} as const;

/** Power as a percentage, rounded down so it is never overstated. */
const percent = (power: number) => `${(Math.floor(power * 1000) / 10).toFixed(1)}%`;
/** Power as a decimal and a percentage, rounded down so it is never overstated. */
export const formatPower = (power: number) => `${(Math.floor(power * 1000) / 1000).toFixed(3)} (${(Math.floor(power * 1000) / 10).toFixed(1)}%)`;
/** An effect size as given, with up to three decimal places. */
const formatEffectValue = (value: number) => String(Math.round(value * 1000) / 1000);
/** A minimum detectable effect, rounded up so the stated effect still reaches the target power. */
export const formatDetectable = (value: number) => (Math.ceil(value * 1000 - 1e-9) / 1000).toFixed(3);
const formatAlpha = (alpha: number) => String(alpha).replace(/^0\./, ".");

export function describeEffect(effect: EffectSpec): string {
  if (effect.metric === "h") return `h = ${formatEffectValue(effect.value)} (proportions ${effect.proportions[0]} and ${effect.proportions[1]})`;
  if (effect.metric === "r") return `r = ${effect.value}${effect.nullValue === 0 ? "" : ` against a null correlation of ${effect.nullValue}`}`;
  return `${effect.metric} = ${formatEffectValue(effect.value)}`;
}

const directionText = (tails: Tails, design: Design) => (design === "anova" ? "" : `${tails} `);

/** The plain-language sentence under the result, which never claims an exact requirement. */
export function meaning(calculation: Extract<PowerCalculation, { ok: true }>): string {
  const copy = designs[calculation.design];
  const test = `${directionText(calculation.tails, calculation.design)}${copy.test}`;
  const result = calculation.result;
  if (result.kind === "sample-size" && calculation.effect) {
    const size = result.perGroup !== null ? `${people(result.total)} (${result.perGroup.toLocaleString("en")} per group)` : copy.sample.unit(result.total);
    return `Under the assumptions you entered, a minimum of about ${size} is needed for ${Math.round((calculation.targetPower ?? 0) * 100)}% power to detect an effect of ${describeEffect(calculation.effect)} at α = ${calculation.alpha} with a ${test}.`;
  }
  if (result.kind === "power" && calculation.effect) {
    return `Under the assumptions you entered, a ${test} with ${copy.sample.unit(result.n)}${result.total !== result.n ? ` per group (${result.total.toLocaleString("en")} in total)` : ""} would have a probability of about ${percent(result.power)} of detecting an effect of ${describeEffect(calculation.effect)} at α = ${calculation.alpha}, if that effect exists.`;
  }
  if (result.kind === "effect") {
    const symbol = copy.effect.symbol;
    const detectable =
      symbol === "r"
        ? `a correlation of about ${(result.equivalent ?? 0).toFixed(3)} or stronger`
        : `an effect of ${symbol} = ${formatDetectable(result.effect)}${symbol === "h" && result.equivalent !== null ? ` (an expected proportion of about ${result.equivalent.toFixed(3)})` : ""} or larger`;
    return `Under the assumptions you entered, a ${test} with this sample can detect ${detectable} with ${Math.round((calculation.targetPower ?? 0) * 100)}% power at α = ${calculation.alpha}. Smaller effects are less likely to be detected.`;
  }
  return "";
}

/** A reporting sentence for an a priori power analysis, with the values filled in. */
export function reportingSentence(calculation: Extract<PowerCalculation, { ok: true }>): string | null {
  const result = calculation.result;
  if (result.kind !== "sample-size" || !calculation.effect) return null;
  const copy = designs[calculation.design];
  // APA style puts commas in numbers of 1,000 or more.
  const count = (n: number) => n.toLocaleString("en");
  const size = result.perGroup !== null ? `${count(result.total)} participants (${count(result.perGroup)} per group)` : calculation.design === "paired-means" ? `${count(result.total)} pairs` : `${count(result.total)} participants`;
  const groups = calculation.design === "anova" ? ` with ${calculation.groups} groups of equal size` : "";
  return `An a priori power analysis for a ${directionText(calculation.tails, calculation.design)}${copy.test}${groups} indicated that a minimum of ${size} was required to detect an effect of ${describeEffect(calculation.effect)} with ${Math.round((calculation.targetPower ?? 0) * 100)}% power at α = ${formatAlpha(calculation.alpha)}.`;
}

export const announcements = {
  calculated: (calculation: Extract<PowerCalculation, { ok: true }>) => {
    const result = calculation.result;
    if (result.kind === "sample-size") return `Required sample size: ${result.total.toLocaleString("en")}${result.perGroup !== null ? `, ${result.perGroup.toLocaleString("en")} per group` : ""}.`;
    if (result.kind === "power") return `Power: ${formatPower(result.power)}.`;
    return designs[calculation.design].effect.symbol === "r" ? `Smallest detectable correlation: about ${(result.equivalent ?? 0).toFixed(3)}.` : `Smallest detectable effect: ${designs[calculation.design].effect.symbol} = ${formatDetectable(result.effect)}.`;
  },
  errors: (count: number) => `${count} ${count === 1 ? "value needs" : "values need"} checking.`,
} as const;
