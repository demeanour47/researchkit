/** Mistakes researchers commonly make when reporting each kind of result. Standard teaching content awaiting review. */

import type { ResultKind } from "./types";

const CORRELATION = [
  "Saying the correlation shows that one variable causes the other.",
  "Reporting a non-significant correlation as proof that the variables are unrelated.",
  "Judging strength from the p-value instead of the coefficient.",
  "Leaving out the direction (positive or negative) or the sample size.",
];
const REGRESSION = [
  "Reading a coefficient as a causal effect when the design doesn't support it.",
  "Comparing unstandardised coefficients between predictors measured in different units.",
  "Reporting R² without saying whether the model is significant, or the reverse.",
  "Ignoring assumptions such as linearity and normally distributed residuals.",
];
const T_TEST = [
  "Reporting p without an effect size such as Cohen's d.",
  "Not saying which group, or which time, had the higher mean.",
  "Treating a non-significant result as proof that the groups are the same.",
];

export const COMMON_MISTAKES: Readonly<Record<ResultKind, readonly string[]>> = {
  "descriptive-statistics": ["Reporting a mean without its standard deviation.", "Using the mean for skewed data, where the median describes the typical value better.", "Generalising from descriptive statistics to the population without a test or confidence interval."],
  frequency: ["Leaving out the total the count is out of.", "Comparing counts between groups of different sizes instead of percentages."],
  percentage: ["Reporting a percentage without the number it is of.", "Giving more decimal places than a small sample justifies.", "Letting percentages of overlapping categories add up to more than 100% without saying why."],
  mean: ["Reporting a mean without its standard deviation.", "Averaging a single ordinal item, such as one rating, without justification.", "Reading a mean near the middle of a scale as “neutral” when answers may be split between the ends."],
  median: ["Reporting the median without the range or interquartile range.", "Using the median for a numeric variable that is symmetric, where the mean would use more of the data."],
  "standard-deviation": ["Reporting the standard deviation without the mean.", "Confusing the standard deviation (spread of scores) with the standard error (precision of the mean)."],
  "cronbach-alpha": [
    "Treating a high alpha as proof that the items measure one thing; it doesn't test that.",
    "Calculating alpha before reverse-scoring reverse-worded items.",
    "Reporting one alpha for items that measure several different constructs.",
    "Treating .70 as a fixed pass mark rather than a convention.",
  ],
  correlation: CORRELATION,
  pearson: [...CORRELATION, "Using Pearson for a curved relationship or with extreme outliers."],
  spearman: [...CORRELATION, "Describing Spearman's rho as measuring a straight-line relationship; it measures a consistently rising or falling one."],
  "simple-regression": REGRESSION,
  "multiple-regression": [...REGRESSION, "Ignoring multicollinearity: predictors that overlap strongly make individual coefficients unstable.", "Treating a significant model as meaning every predictor is significant."],
  "hierarchical-regression": [...REGRESSION, "Reporting only the final model and not the change in R² at each step.", "Choosing the order of entry after seeing the results."],
  "logistic-regression": ["Reading an odds ratio as a risk ratio or a probability.", "Reporting an odds ratio without its confidence interval.", "Using R²-style measures as if they meant the same as in linear regression."],
  "independent-t-test": [...T_TEST, "Using it for paired data, such as the same people measured twice."],
  "paired-t-test": [...T_TEST, "Using it for two separate groups of people."],
  "one-way-anova": ["Stopping at a significant F without post hoc tests to show which groups differ.", "Running many t-tests instead, which inflates the chance of a false positive.", "Reporting F without an effect size such as eta squared."],
  "two-way-anova": ["Interpreting main effects as if there were no interaction when the interaction is significant.", "Leaving out the interaction test.", "Reporting F without an effect size."],
  "chi-square": ["Using it when expected counts are below 5.", "Reading the size of chi-square as the strength of the association; use Cramér's V.", "Using counts from participants who appear in more than one cell."],
  "factor-analysis": ["Keeping factors only because their eigenvalue is above 1, without checking the scree plot or parallel analysis.", "Ignoring items that load on several factors.", "Treating an exploratory result as confirmed without testing it in new data."],
  sem: ["Relying on the chi-square test alone, which is almost always significant with large samples.", "Treating good fit as proof that the model is correct; other models may fit as well.", "Changing the model to improve fit without a theoretical reason."],
  "pls-sem": ["Reporting CB-SEM fit indices as if they applied to PLS-SEM.", "Skipping the measurement model (reliability and validity) before interpreting paths.", "Using p-values from methods other than bootstrapping."],
};
