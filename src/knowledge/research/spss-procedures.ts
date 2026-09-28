import type { AnalysisMethodId } from "./data-analysis-types";

export interface SpssProcedure {
  method: AnalysisMethodId;
  procedure: string;
  menu: readonly string[];
  variables: readonly { role: string; requirement: string }[];
  options: readonly string[];
  output: readonly { table: string; inspect: string }[];
  effectSize: string;
  interpretation: string;
  report: string;
  source: string;
  editionNote: string;
}

const IBM_32 = "https://www.ibm.com/docs/en/spss-statistics/32.0.0";
const EDITION_NOTE = "IBM documents this path for SPSS Statistics 32. Menu wording, dialog layouts and available options may differ by version, operating system and licensed edition; consult the IBM documentation for the installed version.";

const procedure = (
  method: AnalysisMethodId,
  name: string,
  topic: string,
  menu: readonly string[],
  variables: SpssProcedure["variables"],
  options: readonly string[],
  output: SpssProcedure["output"],
  effectSize: string,
  report: string,
): SpssProcedure => ({
  method,
  procedure: name,
  menu,
  variables,
  options,
  output,
  effectSize,
  interpretation: "Use the Results Interpretation Assistant to interpret the values you enter in the context of your research question and project. SPSS output alone does not establish a causal or practically important result.",
  report,
  source: `${IBM_32}?topic=${topic}`,
  editionNote: EDITION_NOTE,
});

export const SPSS_PROCEDURES: Readonly<Record<string, SpssProcedure>> = {
  "one-sample-t-test": procedure(
    "one-sample-t-test",
    "One-Sample T Test",
    "tests-one-sample-t-test",
    ["Analyze", "Compare Means", "One-Sample T Test"],
    [{ role: "Test Variable(s)", requirement: "One or more quantitative outcome variables." }, { role: "Test Value", requirement: "The comparison constant specified before inspecting the results." }],
    ["Request the confidence interval and effect-size estimate where available."],
    [{ table: "One-Sample Statistics", inspect: "N, mean and standard deviation." }, { table: "One-Sample Test", inspect: "Test value, mean difference, t, df, two-sided p and confidence interval." }],
    "Cohen's d for a one-sample comparison; state the standardizer and use the calculator for an independently documented calculation.",
    "Report M, SD, the comparison value, t(df), p, effect size and a confidence interval where available.",
  ),
  "independent-t-test": procedure(
    "independent-t-test",
    "Independent-Samples T Test",
    "tests-independent-samples-t-test",
    ["Analyze", "Compare Means", "Independent-Samples T Test"],
    [{ role: "Test Variable(s)", requirement: "One or more quantitative outcomes." }, { role: "Grouping Variable", requirement: "One variable identifying two independent groups; define the two group codes." }],
    ["Review Levene's homogeneity-of-variance test and use the corresponding equal-variance or unequal-variance row." , "Request the confidence interval and effect-size estimate where available."],
    [{ table: "Group Statistics", inspect: "Group N, mean and standard deviation." }, { table: "Independent Samples Test", inspect: "Levene result, the appropriate t-test row, t, df, two-sided p, mean difference and confidence interval." }],
    "Cohen's d or Hedges' g for independent groups; identify the pooled-SD convention and use the calculator's matching mode.",
    "Report each group's M and SD, then t(df), p, mean difference, effect size and confidence interval where available.",
  ),
  "paired-t-test": procedure(
    "paired-t-test",
    "Paired-Samples T Test",
    "tests-paired-samples-t-test",
    ["Analyze", "Compare Means", "Paired-Samples T Test"],
    [{ role: "Paired Variables", requirement: "Two quantitative measurements for the same cases, entered as a pair." }],
    ["Check the direction of the pair order before interpreting the mean difference." , "SPSS 32 offers several standardizers for its optional Cohen's d and Hedges correction; choose and report the intended convention."],
    [{ table: "Paired Samples Statistics", inspect: "N, mean and standard deviation for each measurement." }, { table: "Paired Samples Correlations", inspect: "The correlation between the paired measurements; it is not the change test." }, { table: "Paired Samples Test", inspect: "Mean difference, t, df, two-sided p and confidence interval." }],
    "Paired standardized mean difference. Specify whether the denominator is the SD of differences (d_z) or an average marginal SD (d_av); these are not interchangeable.",
    "Report each time/condition's M and SD, mean change, t(df), p, the specified paired effect-size convention and confidence interval where available.",
  ),
  "chi-square": procedure(
    "chi-square",
    "Crosstabs: Chi-Square Test of Independence",
    "features-crosstabs",
    ["Analyze", "Descriptive Statistics", "Crosstabs", "Statistics", "Chi-square"],
    [{ role: "Row(s)", requirement: "One categorical variable." }, { role: "Column(s)", requirement: "A second categorical variable; each case contributes to one cell." }],
    ["Select Chi-square in Statistics." , "Select observed and expected counts and suitable percentages in Cells."],
    [{ table: "Crosstabulation", inspect: "Observed counts, expected counts and the percentages appropriate to the question." }, { table: "Chi-Square Tests", inspect: "Pearson chi-square, df, asymptotic significance and footnotes about expected counts." }],
    "Cramér's V for general tables; phi is appropriate for a 2 × 2 table. IBM documents both in Crosstabs statistics.",
    "Report χ²(df, N), p, the relevant crosstab percentages and phi or Cramér's V; do not infer causation.",
  ),
  "chi-square-goodness-of-fit": procedure(
    "chi-square-goodness-of-fit",
    "Legacy Dialogs: Chi-Square Test (Goodness of Fit)",
    "tests-chi-square-test",
    ["Analyze", "Nonparametric Tests", "Legacy Dialogs", "Chi-Square"],
    [{ role: "Test Variable List", requirement: "A categorical variable whose observed category counts are compared with equal or specified expected proportions." }],
    ["Set expected values to the proportions justified before examining the observed counts." , "Inspect the expected frequencies; IBM notes expected frequencies should be at least 1 and no more than 20% below 5."],
    [{ table: "Frequencies", inspect: "Observed N, expected N, residuals and each category's contribution." }, { table: "Test Statistics", inspect: "Chi-square, df, asymptotic significance and any footnote." }],
    "Cohen's w can describe discrepancy from expected proportions; phi/Cramér's V definitions for independence tables are not interchangeable with this one-variable design.",
    "Report the expected proportions and their rationale, χ²(df, N), p, and any justified effect-size measure.",
  ),
  pearson: procedure(
    "pearson",
    "Bivariate Correlations: Pearson",
    "features-bivariate-correlations",
    ["Analyze", "Correlate", "Bivariate"],
    [{ role: "Variables", requirement: "At least two quantitative variables; each case supplies a paired set of values." }],
    ["Select Pearson and the prespecified one- or two-tailed significance test; request confidence intervals if needed." , "Inspect a scatterplot for linearity and influential outliers."],
    [{ table: "Correlations", inspect: "Pearson correlation, N and significance for the relevant pair." }],
    "Pearson's r is itself a standardized association measure; r² is the squared correlation, not a causal proportion explained.",
    "Report r(df), p, confidence interval where available, and interpret direction and magnitude in context.",
  ),
  "simple-regression": procedure(
    "simple-regression",
    "Linear Regression",
    "features-linear-regression",
    ["Analyze", "Regression", "Linear"],
    [{ role: "Dependent", requirement: "One quantitative outcome." }, { role: "Independent(s)", requirement: "One predictor for simple regression." }],
    ["Use Statistics for estimates, confidence intervals, model fit and collinearity as relevant." , "Use Plots and diagnostics to examine residual patterns; select options before inspecting results."],
    [{ table: "Model Summary", inspect: "R, R², adjusted R² and standard error of estimate." }, { table: "ANOVA", inspect: "Model F, degrees of freedom and significance." }, { table: "Coefficients", inspect: "B, standard error, standardized beta, t, significance and confidence interval." }],
    "R² describes model fit. It is not the same as a standardized mean difference or proof of practical importance.",
    "Report model F(df1, df2), p, R²/adjusted R² and the focal coefficient with its confidence interval and p.",
  ),
  "multiple-regression": procedure(
    "multiple-regression",
    "Linear Regression",
    "features-linear-regression",
    ["Analyze", "Regression", "Linear"],
    [{ role: "Dependent", requirement: "One quantitative outcome." }, { role: "Independent(s)", requirement: "Two or more predictors; categorical predictors require documented contrast/dummy coding." }],
    ["Choose entry method and blocks from the prespecified research plan." , "Inspect collinearity diagnostics, residuals, influence and confidence intervals."],
    [{ table: "Model Summary", inspect: "R², adjusted R², change in R² if blocks were specified." }, { table: "ANOVA", inspect: "Overall model F and significance." }, { table: "Coefficients", inspect: "Each B, standard error, beta, t, p and confidence interval." }],
    "R² and adjusted R² describe model fit; coefficient magnitudes answer predictor-specific questions. They are distinct quantities.",
    "Report overall model F, p, R² and adjusted R², then focal predictor coefficients and confidence intervals.",
  ),
  "one-way-anova": procedure(
    "one-way-anova",
    "One-Way ANOVA",
    "features-one-way-anova",
    ["Analyze", "Compare Means", "One-Way ANOVA"],
    [{ role: "Dependent List", requirement: "One or more quantitative outcomes." }, { role: "Factor", requirement: "One categorical grouping variable with independent groups." }],
    ["Request descriptives and homogeneity-of-variance test." , "Choose planned contrasts or post-hoc comparisons to answer which groups differ; these answer different questions." , "Request effect-size estimates if available."],
    [{ table: "Descriptives", inspect: "N, mean, SD and confidence interval per group." }, { table: "Test of Homogeneity of Variances", inspect: "Levene statistic and significance." }, { table: "ANOVA", inspect: "Between/within variation, F, df and significance." }, { table: "ANOVA Effect Sizes", inspect: "The named effect-size estimate and its interval, if requested." }, { table: "Post Hoc Tests", inspect: "Pairwise comparisons only when selected and justified." }],
    "Use the effect-size estimate named in SPSS output, commonly eta squared; do not confuse it with partial eta squared.",
    "Report group descriptives, F(df1, df2), p, a named effect size and appropriate planned/post-hoc comparisons.",
  ),
  "two-way-anova": procedure(
    "two-way-anova",
    "GLM Univariate: Factorial ANOVA",
    "features-glm-univariate-analysis",
    ["Analyze", "General Linear Model", "Univariate"],
    [{ role: "Dependent Variable", requirement: "One quantitative outcome." }, { role: "Fixed Factor(s)", requirement: "The categorical factors; include the theoretically relevant interaction in the model." }],
    ["Specify the model and sums-of-squares type deliberately." , "Request descriptive statistics, effect-size estimates, homogeneity tests and profile plots as appropriate." , "Interpret interaction before main effects when it is relevant."],
    [{ table: "Between-Subjects Factors", inspect: "Factor levels and case counts." }, { table: "Descriptive Statistics", inspect: "Means, SDs and counts for cells." }, { table: "Levene's Test of Equality of Error Variances", inspect: "Homogeneity evidence." }, { table: "Tests of Between-Subjects Effects", inspect: "Each factor and interaction: F, df, p, partial eta squared." }, { table: "Estimated Marginal Means", inspect: "Adjusted means for comparisons/plots when requested." }],
    "Partial eta squared is commonly listed for each model effect; report which effect it describes.",
    "Report each factor and interaction F(df1, df2), p and partial eta squared; explain follow-up comparisons and simple effects.",
  ),
  ancova: procedure(
    "ancova",
    "GLM Univariate: ANCOVA",
    "features-glm-univariate-analysis",
    ["Analyze", "General Linear Model", "Univariate"],
    [{ role: "Dependent Variable", requirement: "One quantitative outcome." }, { role: "Fixed Factor(s)", requirement: "Categorical group variable(s)." }, { role: "Covariate(s)", requirement: "Quantitative covariate measured and justified for adjustment." }],
    ["Specify the covariate and group model before analysis." , "Check homogeneity of regression slopes; if the covariate-by-factor interaction is retained, interpretation changes." , "Request estimated marginal means and effect-size estimates as appropriate."],
    [{ table: "Descriptive Statistics", inspect: "Unadjusted group descriptives." }, { table: "Levene's Test of Equality of Error Variances", inspect: "Homogeneity evidence." }, { table: "Tests of Between-Subjects Effects", inspect: "Covariate and adjusted factor effects, F, df, p and partial eta squared." }, { table: "Estimated Marginal Means", inspect: "Adjusted group means at the specified covariate value." }],
    "Partial eta squared for the adjusted factor effect is often reported; identify the effect and model used.",
    "Report unadjusted and adjusted means, covariate handling, the adjusted group F(df1, df2), p, partial eta squared and confidence intervals where available.",
  ),
};

export const SPSS_PROCEDURE_METHODS = Object.keys(SPSS_PROCEDURES) as AnalysisMethodId[];

export const SPSS_WORKFLOW_STEPS = [
  "Research question and design",
  "Variables and data preparation",
  "Descriptive checks",
  "Select a test with the Statistical Test Finder",
  "Run the mapped procedure in SPSS",
  "Review assumptions with the Assumption Checker",
  "Calculate a suitable effect size",
  "Read output and interpret the reported values",
  "Write and preserve the analysis report",
] as const;

export function getSpssProcedure(method: AnalysisMethodId): SpssProcedure {
  const entry = SPSS_PROCEDURES[method];
  if (!entry) throw new RangeError(`No SPSS procedure is mapped for analysis method: ${method}`);
  return entry;
}