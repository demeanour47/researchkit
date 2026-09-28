/**
 * What a student needs to know about each core test beyond the analysis catalogue's
 * summary: the question it answers, the data structure it needs, its hypotheses, a
 * worked example, why commonly confused tests may not fit, common mistakes and how
 * results are introduced. Names, purposes, assumptions and limitations stay in the
 * analysis catalogue and the assumption guides; nothing here repeats them.
 */

import { getAnalysisMethod, type AnalysisMethodId } from "../data-analysis-types";
import type { WorkedExampleId } from "./examples";
import type { StructureDiagramId } from "./figures";
import type { FormulaId } from "./formulas";

export const PROFILED_TESTS = [
  "one-sample-t-test",
  "independent-t-test",
  "paired-t-test",
  "one-way-anova",
  "two-way-anova",
  "ancova",
  "chi-square",
  "chi-square-goodness-of-fit",
  "pearson",
  "simple-regression",
  "multiple-regression",
] as const satisfies readonly AnalysisMethodId[];
export type ProfiledTest = (typeof PROFILED_TESTS)[number];

export interface DataStructure {
  outcome: string;
  predictor: string;
  groups: string;
  pairing: string;
}

export interface TestProfile {
  method: ProfiledTest;
  /** The research question it answers, in plain words. */
  answers: string;
  structure: DataStructure;
  diagram: StructureDiagramId;
  /** Why it may fit, when its situation applies. */
  fits: string;
  /** Why commonly confused tests may not fit the same situation. */
  whyNot: readonly { method: AnalysisMethodId; reason: string }[];
  nullHypothesis: string;
  alternativeHypothesis: string;
  example: WorkedExampleId;
  mistakes: readonly string[];
  /** An introduction to reporting, with placeholders rather than numbers. */
  reporting: string;
  formulas: readonly FormulaId[];
}

const INDEPENDENT = "Independent: each participant is in one group only.";

export const TEST_PROFILES: Readonly<Record<ProfiledTest, TestProfile>> = {
  "one-sample-t-test": {
    method: "one-sample-t-test",
    answers: "Does the mean of a quantitative outcome differ from a known or hypothesised value?",
    structure: { outcome: "One quantitative variable (interval or ratio).", predictor: "None: a comparison value stated in advance.", groups: "One.", pairing: "Not applicable: one measurement per participant." },
    diagram: "one-sample",
    fits: "It compares one sample's mean with a value set before the data were collected.",
    whyNot: [{ method: "independent-t-test", reason: "The independent-samples t-test needs a second group of participants; here the comparison is with a fixed value." }],
    nullHypothesis: "The population mean equals the stated value (μ = μ₀).",
    alternativeHypothesis: "The population mean differs from the stated value (μ ≠ μ₀), or, if stated in advance, is larger or smaller.",
    example: "one-sample",
    mistakes: ["Choosing the comparison value after seeing the data.", "Using a value taken from the same sample, which isn't a fixed comparison."],
    reporting: "Report the sample mean and standard deviation and the comparison value, then the test as t(df) = [value], p = [value], with an effect size such as Cohen's d.",
    formulas: ["mean", "standard-deviation", "one-sample-t"],
  },
  "independent-t-test": {
    method: "independent-t-test",
    answers: "Do two separate groups differ in the mean of a quantitative outcome?",
    structure: { outcome: "One quantitative variable (interval or ratio).", predictor: "One grouping variable with two categories.", groups: "Two.", pairing: INDEPENDENT },
    diagram: "two-groups",
    fits: "It compares the means of two independent groups on a quantitative outcome.",
    whyNot: [
      { method: "paired-t-test", reason: "The paired-samples t-test is for the same participants measured twice, or matched pairs; here each participant is in one group only." },
      { method: "one-way-anova", reason: "One-way ANOVA is usually used for three or more groups. With two groups it gives the same answer as the equal-variances t-test (F = t²)." },
    ],
    nullHypothesis: "The two population means are equal (μ₁ = μ₂).",
    alternativeHypothesis: "The two population means differ (μ₁ ≠ μ₂), or, if stated in advance, one is larger.",
    example: "independent-t",
    mistakes: ["Using it when the same participants appear in both groups.", "Running a t-test for every pair of three or more groups instead of one ANOVA, which raises the chance of a false positive.", "Not saying whether the equal-variances or Welch version was used."],
    reporting: "Report each group's mean and standard deviation, then the test as t(df) = [value], p = [value], with an effect size such as Cohen's d and its confidence interval.",
    formulas: ["mean", "t-ratio"],
  },
  "paired-t-test": {
    method: "paired-t-test",
    answers: "Does the mean of a quantitative outcome change between two measurements of the same people?",
    structure: { outcome: "One quantitative variable, measured twice.", predictor: "Time or condition: two measurements.", groups: "One group, two measurements.", pairing: "Paired: each participant contributes both measurements, or participants are matched in pairs." },
    diagram: "paired",
    fits: "It analyses each participant's change, comparing the mean of the differences with zero.",
    whyNot: [{ method: "independent-t-test", reason: "The independent-samples t-test treats the two sets of scores as coming from different people, ignoring that each participant is compared with themselves." }],
    nullHypothesis: "The mean difference between the paired measurements is zero in the population (μ_d = 0).",
    alternativeHypothesis: "The mean difference is not zero (μ_d ≠ 0), or, if stated in advance, is positive or negative.",
    example: "paired-t",
    mistakes: ["Checking the normality of each time point instead of the differences.", "Using it for two separate groups of people.", "Treating a before–after change as the effect of an intervention when there is no comparison group."],
    reporting: "Report the mean and standard deviation at each time, then the test as t(df) = [value], p = [value], with the mean difference and its confidence interval.",
    formulas: ["paired-t"],
  },
  "one-way-anova": {
    method: "one-way-anova",
    answers: "Do three or more independent groups differ in the mean of a quantitative outcome?",
    structure: { outcome: "One quantitative variable (interval or ratio).", predictor: "One grouping variable (factor) with three or more categories.", groups: "Three or more.", pairing: INDEPENDENT },
    diagram: "three-groups",
    fits: "It compares the variation between group means with the variation within groups, in one test across all the groups.",
    whyNot: [
      { method: "independent-t-test", reason: "A t-test for every pair of groups raises the chance of a false positive; ANOVA tests all the groups at once." },
      { method: "repeated-measures-anova", reason: "Repeated measures ANOVA is for the same participants measured several times, not separate groups." },
    ],
    nullHypothesis: "All the group means are equal in the population (μ₁ = μ₂ = μ₃ = …).",
    alternativeHypothesis: "At least one group mean differs from the others.",
    example: "one-way-anova",
    mistakes: ["Concluding which groups differ from the F test alone: post hoc tests or planned comparisons are needed.", "Using it for repeated measurements of the same people."],
    reporting: "Report each group's mean and standard deviation, then F(df between, df within) = [value], p = [value], with an effect size such as η², followed by post hoc comparisons.",
    formulas: ["f-ratio"],
  },
  "two-way-anova": {
    method: "two-way-anova",
    answers: "Do two grouping variables, separately and together, relate to differences in a quantitative outcome?",
    structure: { outcome: "One quantitative variable (interval or ratio).", predictor: "Two grouping variables (factors), each with two or more categories.", groups: "Every combination of the two factors' categories.", pairing: "Independent: each participant is in one combination only." },
    diagram: "two-way",
    fits: "It tests each factor's main effect and whether the effect of one factor depends on the other: their interaction.",
    whyNot: [{ method: "one-way-anova", reason: "Two separate one-way ANOVAs can't test whether the factors interact." }],
    nullHypothesis: "Three null hypotheses: no difference across the first factor's categories, none across the second's, and no interaction between the factors.",
    alternativeHypothesis: "For each null hypothesis, the corresponding effect exists in the population.",
    example: "two-way-anova",
    mistakes: ["Interpreting the main effects without first looking at the interaction.", "Leaving some combinations of groups with very few participants."],
    reporting: "Report the mean and standard deviation for each combination, then F and p for each main effect and the interaction, with effect sizes such as partial η²; plot the cell means.",
    formulas: ["f-ratio"],
  },
  ancova: {
    method: "ancova",
    answers: "Do groups differ in the mean of a quantitative outcome once a quantitative covariate is allowed for?",
    structure: { outcome: "One quantitative variable (interval or ratio).", predictor: "One or more grouping variables, plus one or more quantitative covariates.", groups: "Two or more.", pairing: INDEPENDENT },
    diagram: "ancova",
    fits: "It compares group means adjusted for a covariate that also relates to the outcome, which can account for initial differences and reduce unexplained variation.",
    whyNot: [{ method: "one-way-anova", reason: "One-way ANOVA compares unadjusted means, leaving out the covariate." }],
    nullHypothesis: "The adjusted group means are equal in the population.",
    alternativeHypothesis: "At least one adjusted group mean differs.",
    example: "ancova",
    mistakes: ["Skipping the check that the covariate relates to the outcome in the same way in every group.", "Using a covariate measured after the groups were formed, which the grouping may have changed.", "Expecting adjustment to make groups that differ in other ways truly comparable."],
    reporting: "Report the unadjusted and adjusted means for each group, then F and p for the group effect with the covariate in the model, and an effect size such as partial η².",
    formulas: ["f-ratio"],
  },
  "chi-square": {
    method: "chi-square",
    answers: "Are two categorical variables associated?",
    structure: { outcome: "One categorical variable.", predictor: "A second categorical variable.", groups: "Two or more categories of each.", pairing: "Independent: each participant is counted once, in one cell." },
    diagram: "association",
    fits: "It compares the counts in a cross-tabulation with the counts expected if the two variables were unrelated.",
    whyNot: [{ method: "independent-t-test", reason: "A t-test compares means, which need a quantitative outcome; here both variables are categories." }],
    nullHypothesis: "The two variables are independent in the population.",
    alternativeHypothesis: "The two variables are associated.",
    example: "chi-square",
    mistakes: ["Calculating it from percentages instead of counts.", "Counting the same participant in more than one cell.", "Reading a clear result as cause, or as a strong association: report an effect size such as Cramér's V."],
    reporting: "Report the cross-tabulated counts and percentages, then χ²(df, N = [total]) = [value], p = [value], with Cramér's V.",
    formulas: ["expected-count", "chi-square"],
  },
  "chi-square-goodness-of-fit": {
    method: "chi-square-goodness-of-fit",
    answers: "Do the counts in one categorical variable's categories match shares stated in advance?",
    structure: { outcome: "One categorical variable.", predictor: "None: expected proportions stated in advance.", groups: "Two or more categories.", pairing: "Independent: each participant falls in one category." },
    diagram: "goodness-of-fit",
    fits: "It compares the observed count in each category with the count expected from shares stated in advance.",
    whyNot: [{ method: "chi-square", reason: "The chi-square test of independence needs two categorical variables; here there is one, compared with expected shares." }],
    nullHypothesis: "The population proportions equal the stated expected proportions.",
    alternativeHypothesis: "At least one population proportion differs from its expected proportion.",
    example: "goodness-of-fit",
    mistakes: ["Setting the expected proportions after looking at the observed counts.", "Calculating it from percentages instead of counts."],
    reporting: "Report the observed and expected count for each category, then χ²(df, N = [total]) = [value], p = [value].",
    formulas: ["chi-square"],
  },
  pearson: {
    method: "pearson",
    answers: "Do two quantitative variables go together in a straight line, and how strongly?",
    structure: { outcome: "First variable: quantitative.", predictor: "Second variable: quantitative. Neither needs to be the outcome.", groups: "Not applicable: one group, a pair of values per participant.", pairing: "Each participant contributes one value of each variable." },
    diagram: "correlation",
    fits: "It measures the strength and direction of a straight-line relationship between two quantitative variables.",
    whyNot: [
      { method: "simple-regression", reason: "Regression goes further, estimating one variable from the other; correlation treats the two alike." },
      { method: "spearman", reason: "Spearman's rank correlation suits ordinal variables, curved but consistently rising or falling relationships, or clearly non-normal data." },
    ],
    nullHypothesis: "There is no straight-line relationship in the population (ρ = 0).",
    alternativeHypothesis: "There is a straight-line relationship (ρ ≠ 0), or, if stated in advance, a positive or negative one.",
    example: "correlation",
    mistakes: ["Treating a correlation as evidence of cause and effect.", "Not looking at the scatterplot, which shows curves and outliers the coefficient hides.", "Studying a narrow range of either variable, which weakens the correlation."],
    reporting: "Report r(df) = [value], p = [value], with the confidence interval for r, and show the scatterplot.",
    formulas: [],
  },
  "simple-regression": {
    method: "simple-regression",
    answers: "How well can a quantitative outcome be predicted from one predictor, and how much does it change per unit of the predictor?",
    structure: { outcome: "One quantitative variable.", predictor: "One predictor, usually quantitative.", groups: "Not applicable.", pairing: "Each participant contributes one value of each variable." },
    diagram: "regression",
    fits: "It estimates a straight-line equation that predicts the outcome from the predictor.",
    whyNot: [{ method: "pearson", reason: "Correlation describes how strongly the variables go together but gives no prediction equation." }],
    nullHypothesis: "The slope is zero in the population (β₁ = 0): the predictor doesn't predict the outcome in a straight line.",
    alternativeHypothesis: "The slope is not zero (β₁ ≠ 0).",
    example: "regression",
    mistakes: ["Reading the slope as a causal effect in an observational study.", "Predicting far beyond the range of the data.", "Checking the normality of each variable instead of the residuals."],
    reporting: "Report the slope with its confidence interval and p, the intercept, and R², for example b = [value], 95% CI [lower, upper], R² = [value].",
    formulas: ["regression"],
  },
  "multiple-regression": {
    method: "multiple-regression",
    answers: "How well do several predictors together predict a quantitative outcome, and what does each add while the others are held constant?",
    structure: { outcome: "One quantitative variable.", predictor: "Two or more predictors, quantitative or categorical (entered as dummy variables).", groups: "Not applicable.", pairing: "Each participant contributes one value of each variable." },
    diagram: "multiple-regression",
    fits: "It estimates each predictor's contribution to the outcome while holding the other predictors constant.",
    whyNot: [{ method: "simple-regression", reason: "Simple regression uses one predictor and can't separate the contributions of related predictors." }],
    nullHypothesis: "Overall, none of the predictors predicts the outcome (all slopes are zero); and, for each predictor, its slope is zero.",
    alternativeHypothesis: "At least one slope is not zero; and, for each predictor, its slope is not zero.",
    example: "regression",
    mistakes: ["Adding many predictors to a small sample.", "Interpreting coefficients without checking that the predictors aren't too highly related (multicollinearity).", "Reading coefficients as causal effects in an observational study."],
    reporting: "Report R² and the overall F test, then each predictor's coefficient with its confidence interval and p, usually in a table.",
    formulas: ["multiple-regression"],
  },
};

export const isProfiledTest = (method: string): method is ProfiledTest => (PROFILED_TESTS as readonly string[]).includes(method);

/** Why other methods the finder can suggest may fit, where they have no full profile. */
const FIT_STATEMENTS: Readonly<Partial<Record<AnalysisMethodId, string>>> = {
  mean: "The mean summarises a quantitative variable that is roughly symmetric.",
  median: "The median is the middle value, which skew and extreme values don't distort, so it also suits ordinal variables.",
  mode: "The mode is the most common value or category: the only average that suits nominal variables.",
  "standard-deviation": "The standard deviation shows how spread out values are around the mean, and is reported with every mean.",
  frequency: "Counts show how many cases fall in each category.",
  percentage: "Percentages let categories be compared between groups of different sizes.",
  "repeated-measures-anova": "It compares the mean of a quantitative outcome across three or more measurements of the same participants.",
  "fisher-exact": "It tests the same association as chi-square exactly, which suits small samples with low expected counts.",
  spearman: "It measures how consistently two variables rise or fall together using ranks, so it suits ordinal or non-normal data.",
  "logistic-regression": "It models the chance of a two-category outcome from one or more predictors.",
  "mann-whitney": "It compares two independent groups using ranks, without assuming normality.",
  wilcoxon: "It compares two paired measurements using the ranks of their differences, without assuming normality.",
  "kruskal-wallis": "It compares three or more independent groups using ranks, without assuming normality.",
};

/** Why a method may fit its situation: its profile, a statement written for the finder, or the catalogue's own. */
export function whyItFits(method: AnalysisMethodId): string {
  if (isProfiledTest(method)) return TEST_PROFILES[method].fits;
  return FIT_STATEMENTS[method] ?? getAnalysisMethod(method).suitableWhen;
}
