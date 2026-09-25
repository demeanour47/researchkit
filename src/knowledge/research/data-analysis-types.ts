/**
 * Statistical analysis methods the Data Analysis Recommender can suggest: what each
 * answers, when it suits, what it assumes and where it falls short. Standard textbook
 * content awaiting review by a statistician. References are left empty until chosen at
 * review; none are invented.
 */

export const ANALYSIS_METHOD_IDS = [
  "descriptive-statistics",
  "frequency",
  "percentage",
  "mean",
  "median",
  "standard-deviation",
  "reliability",
  "cronbach-alpha",
  "validity",
  "kmo",
  "bartlett",
  "factor-analysis",
  "correlation",
  "pearson",
  "spearman",
  "regression",
  "simple-regression",
  "multiple-regression",
  "hierarchical-regression",
  "logistic-regression",
  "moderation",
  "mediation",
  "independent-t-test",
  "paired-t-test",
  "one-way-anova",
  "two-way-anova",
  "manova",
  "ancova",
  "repeated-measures-anova",
  "chi-square",
  "fisher-exact",
  "wilcoxon",
  "mann-whitney",
  "kruskal-wallis",
  "sem",
  "pls-sem",
  "cb-sem",
] as const;
export type AnalysisMethodId = (typeof ANALYSIS_METHOD_IDS)[number];

/** What a method is for, which decides where it appears in the plan. */
export type AnalysisFamily = "describe" | "measures" | "relationship" | "prediction" | "difference" | "categorical" | "model";

export const ANALYSIS_FAMILY_LABELS: Readonly<Record<AnalysisFamily, string>> = {
  describe: "Describing the data",
  measures: "Checking the measures",
  relationship: "Relationships between variables",
  prediction: "Predicting an outcome",
  difference: "Differences between groups or times",
  categorical: "Associations between categories",
  model: "Testing a whole model",
};

/** How strongly the project supports a method. Never a verdict that a method is wrong. */
export const RECOMMENDATION_STRENGTHS = ["strong", "possible", "justify"] as const;
export type RecommendationStrength = (typeof RECOMMENDATION_STRENGTHS)[number];

export const STRENGTH_LABELS: Readonly<Record<RecommendationStrength, string>> = {
  strong: "Strong recommendation",
  possible: "Possible recommendation",
  justify: "Needs justification",
};

export interface AnalysisMethod {
  id: AnalysisMethodId;
  name: string;
  family: AnalysisFamily;
  /** For a family's overview entry, such as Correlation, the specific methods it covers. */
  covers: readonly AnalysisMethodId[];
  /** Whether it assumes normally distributed data, or residuals. */
  parametric: boolean;
  /** The question it answers. */
  purpose: string;
  /** When it usually suits, in one sentence. */
  suitableWhen: string;
  assumptions: readonly string[];
  limitations: readonly string[];
  /** Reference ids, empty until academic review. */
  references: readonly string[];
}

const method = (id: AnalysisMethodId, name: string, family: AnalysisFamily, parametric: boolean, purpose: string, suitableWhen: string, assumptions: readonly string[], limitations: readonly string[], covers: readonly AnalysisMethodId[] = []): AnalysisMethod => ({
  id,
  name,
  family,
  covers,
  parametric,
  purpose,
  suitableWhen,
  assumptions,
  limitations,
  references: [],
});

export const ANALYSIS_METHODS: readonly AnalysisMethod[] = [
  method(
    "descriptive-statistics",
    "Descriptive statistics",
    "describe",
    false,
    "Summarises who took part and what each variable looks like before any test.",
    "Almost every quantitative study reports them first.",
    ["The summaries chosen suit each variable's measurement level."],
    ["They describe the sample only; they don't test hypotheses or generalise to the population."],
    ["frequency", "percentage", "mean", "median", "standard-deviation"],
  ),
  method("frequency", "Frequency", "describe", false, "Counts how many participants gave each answer or fall in each category.", "For categorical, binary and ordinal variables, and for participant characteristics.", ["Categories don't overlap and every answer fits one."], ["Counts alone are hard to compare between groups of different sizes."]),
  method("percentage", "Percentage", "describe", false, "Shows each category's share of the sample, so groups of different sizes can be compared.", "Alongside frequencies, for categorical, binary and ordinal variables.", ["The base (the number the percentage is of) is stated."], ["Percentages of small samples can look more precise than they are."]),
  method("mean", "Mean", "describe", true, "Gives the average value of a numeric variable.", "For numeric variables, and for scale scores made from several items.", ["The variable is numeric, with equal intervals between values."], ["Extreme values pull it away from the typical case.", "It can mislead for ordinal answers such as a single rating."]),
  method("median", "Median", "describe", false, "Gives the middle value, which extreme values don't distort.", "For ordinal variables, and for numeric variables that are skewed.", ["Values can be put in order."], ["It ignores how far values lie from the middle."]),
  method("standard-deviation", "Standard deviation", "describe", true, "Shows how spread out a numeric variable's values are around the mean.", "Reported with every mean.", ["The variable is numeric."], ["Like the mean, it is sensitive to extreme values."]),
  method(
    "reliability",
    "Reliability",
    "measures",
    false,
    "Checks that a measure gives consistent results, such as items in a scale agreeing with each other.",
    "Whenever a variable is measured with several items combined into one score.",
    ["The items are meant to measure the same thing."],
    ["A reliable measure isn't necessarily valid: it can consistently measure the wrong thing."],
    ["cronbach-alpha"],
  ),
  method(
    "cronbach-alpha",
    "Cronbach's alpha",
    "measures",
    false,
    "Estimates the internal consistency of a set of items that form one scale.",
    "For multi-item scales, such as several Likert items measuring one variable.",
    ["The items measure one underlying construct.", "Reverse-worded items are reverse-scored first."],
    ["It rises with the number of items, so long scales can look consistent when they aren't.", "It assumes every item contributes equally, which often isn't true."],
  ),
  method(
    "validity",
    "Validity",
    "measures",
    false,
    "Checks that a measure captures the construct it is meant to, such as items grouping as the theory expects.",
    "When scales are new, adapted or used in a new population.",
    ["There is a theory of which items belong to which construct."],
    ["Statistical checks cover construct validity only; content and face validity need expert review."],
    ["kmo", "bartlett", "factor-analysis"],
  ),
  method("kmo", "Kaiser–Meyer–Olkin (KMO) measure", "measures", false, "Checks whether the items share enough variance for factor analysis to be worthwhile.", "As a check before factor analysis.", ["The items are numeric or treated as numeric."], ["It says whether factor analysis is sensible, not what the factors are."]),
  method("bartlett", "Bartlett's test of sphericity", "measures", false, "Checks that the items are correlated at all, which factor analysis needs.", "As a check before factor analysis.", ["The items are roughly normally distributed."], ["With large samples it is almost always significant, so it is a minimal check."]),
  method(
    "factor-analysis",
    "Factor analysis",
    "measures",
    true,
    "Finds or confirms groups of items that measure the same underlying construct.",
    "For multi-item scales: exploratory when the structure is unknown, confirmatory when theory specifies it.",
    ["Enough participants for stable results.", "Items are related to each other in straight-line ways."],
    ["Small samples give unstable factors.", "Choices such as how many factors to keep need justifying."],
  ),
  method(
    "correlation",
    "Correlation",
    "relationship",
    false,
    "Measures how strongly two variables move together.",
    "When a hypothesis or objective concerns a relationship between two measured variables.",
    ["The relationship is monotonic (it keeps going one way)."],
    ["Correlation doesn't show cause and effect."],
    ["pearson", "spearman"],
  ),
  method("pearson", "Pearson correlation", "relationship", true, "Measures the strength and direction of a straight-line relationship between two numeric variables.", "When both variables are numeric and roughly normally distributed.", ["Both variables are numeric.", "The relationship is linear.", "No extreme outliers.", "The variables are roughly normally distributed."], ["It misses curved relationships.", "Outliers can distort it strongly."]),
  method("spearman", "Spearman's rank correlation", "relationship", false, "Measures how consistently two variables rise or fall together, using ranks.", "When a variable is ordinal, or numeric data aren't normally distributed.", ["Both variables can be ranked.", "The relationship is monotonic."], ["It has less power than Pearson when Pearson's assumptions hold."]),
  method(
    "regression",
    "Regression",
    "prediction",
    true,
    "Predicts an outcome from one or more variables and estimates each one's contribution.",
    "When a hypothesis or objective predicts an outcome from other variables.",
    ["The outcome's type matches the kind of regression."],
    ["Prediction isn't causation unless the design supports it."],
    ["simple-regression", "multiple-regression", "hierarchical-regression", "logistic-regression"],
  ),
  method("simple-regression", "Simple linear regression", "prediction", true, "Predicts a numeric outcome from one variable.", "One numeric predictor and one numeric outcome.", ["Linear relationship.", "Independent observations.", "Residuals are normally distributed with equal spread."], ["Leaves out other variables that may matter."]),
  method("multiple-regression", "Multiple regression", "prediction", true, "Predicts a numeric outcome from several variables at once, each adjusted for the others.", "Two or more predictors of one numeric outcome.", ["Linear relationships.", "Independent observations.", "Residuals are normally distributed with equal spread.", "Predictors aren't too highly correlated with each other (no multicollinearity)."], ["Needs more participants as predictors are added.", "Highly related predictors make individual estimates unstable."]),
  method("hierarchical-regression", "Hierarchical regression", "prediction", true, "Adds predictors in stages, showing what each set adds beyond the ones before, such as control variables first.", "When control variables should be accounted for before the variables of interest.", ["As for multiple regression.", "The order of entry is set by theory before analysis."], ["The order of entry must be justified; changing it changes the results."]),
  method("logistic-regression", "Logistic regression", "prediction", false, "Predicts the chance of a two-category outcome, such as yes or no.", "When the outcome is binary.", ["Independent observations.", "A straight-line relationship between numeric predictors and the log odds of the outcome.", "Enough cases in the smaller outcome category."], ["Odds ratios are easy to misread as risks.", "Needs larger samples than linear regression."]),
  method("moderation", "Moderation analysis", "model", true, "Tests whether a third variable changes the strength or direction of a relationship, using an interaction term.", "When a hypothesis names a moderator.", ["As for regression.", "The moderator is measured before or independently of the outcome."], ["Interaction effects need larger samples to detect.", "Continuous moderators are best mean-centred to make results interpretable."]),
  method("mediation", "Mediation analysis", "model", true, "Tests whether one variable affects an outcome through another, estimating the indirect effect.", "When a hypothesis names a mediator.", ["As for regression.", "The causal order of predictor, mediator and outcome is justified by theory or design.", "The indirect effect is usually tested with bootstrapped confidence intervals."], ["With data from one time point, mediation shows a pattern consistent with a process, not proof of it."]),
  method("independent-t-test", "Independent-samples t-test", "difference", true, "Compares the means of a numeric outcome between two separate groups.", "When a difference hypothesis compares two independent groups.", ["The outcome is numeric.", "The groups are independent.", "The outcome is roughly normally distributed in each group.", "The groups have similar variances, or Welch's version is used."], ["Only two groups.", "Sensitive to outliers in small samples."]),
  method("paired-t-test", "Paired-samples t-test", "difference", true, "Compares the means of a numeric outcome measured twice on the same participants, such as before and after.", "When the same people are measured at two times or in two conditions.", ["The outcome is numeric.", "Measurements are paired.", "The differences between pairs are roughly normally distributed."], ["Only two measurements."]),
  method("one-way-anova", "One-way ANOVA", "difference", true, "Compares the means of a numeric outcome across three or more independent groups.", "When a difference hypothesis compares three or more groups on one factor.", ["The outcome is numeric.", "Groups are independent.", "Roughly normal within each group.", "Similar variances across groups."], ["Shows that groups differ, not which ones: post hoc tests are needed."]),
  method("two-way-anova", "Two-way ANOVA", "difference", true, "Compares means across two grouping factors at once, including whether they interact.", "When two categorical factors may each, and together, affect a numeric outcome.", ["As for one-way ANOVA, for every combination of groups."], ["Every combination of groups needs enough participants."]),
  method("manova", "MANOVA", "difference", true, "Compares groups on several related numeric outcomes at once.", "When one grouping factor may affect two or more related numeric outcomes.", ["Outcomes are numeric and moderately related.", "Multivariate normality.", "Similar covariance matrices across groups."], ["Harder to interpret, and needs follow-up tests on each outcome."]),
  method("ancova", "ANCOVA", "difference", true, "Compares group means on a numeric outcome after adjusting for a numeric covariate, such as a control variable or a pretest score.", "When groups are compared and a control variable should be adjusted for.", ["As for ANOVA.", "The covariate relates to the outcome in a straight line.", "The covariate's relationship with the outcome is the same in every group."], ["Adjustment can't make non-equivalent groups truly comparable."]),
  method("repeated-measures-anova", "Repeated measures ANOVA", "difference", true, "Compares the means of a numeric outcome measured three or more times on the same participants.", "When the same people are measured repeatedly over time or conditions.", ["The outcome is numeric.", "Roughly normal at each time.", "Sphericity: similar variances of the differences between times."], ["Participants who miss one time point drop out of the analysis."]),
  method("chi-square", "Chi-square test of independence", "categorical", false, "Tests whether two categorical variables are associated.", "When both variables are categorical, such as group and a yes/no answer.", ["Independent observations.", "Expected counts of at least 5 in most cells."], ["Shows association, not its strength or cause; report an effect size too."]),
  method("fisher-exact", "Fisher's exact test", "categorical", false, "Tests an association between two categorical variables exactly, without large-sample approximations.", "When samples are small and some expected counts fall below 5.", ["Independent observations."], ["Mainly used for two-by-two tables."]),
  method("wilcoxon", "Wilcoxon signed-rank test", "difference", false, "Compares two related measurements, such as before and after, using ranks.", "The non-parametric counterpart of the paired t-test, for ordinal or non-normal data.", ["Measurements are paired.", "The differences can be ranked."], ["Less power than the paired t-test when its assumptions hold."]),
  method("mann-whitney", "Mann–Whitney U test", "difference", false, "Compares two independent groups using ranks.", "The non-parametric counterpart of the independent t-test, for ordinal or non-normal data.", ["Independent groups.", "The outcome can be ranked."], ["Tests whether values tend to be higher in one group, not whether means differ."]),
  method("kruskal-wallis", "Kruskal–Wallis test", "difference", false, "Compares three or more independent groups using ranks.", "The non-parametric counterpart of one-way ANOVA.", ["Independent groups.", "The outcome can be ranked."], ["Needs follow-up tests to find which groups differ."]),
  method(
    "sem",
    "Structural equation modelling",
    "model",
    true,
    "Tests a whole model of relationships at once, often between constructs measured by several items each.",
    "When a conceptual framework links several constructs, each measured by multiple items.",
    ["The model is specified from theory before analysis.", "Enough participants for the model's size."],
    ["Needs large samples and careful model specification.", "Good fit doesn't prove the model is the right one."],
    ["pls-sem", "cb-sem"],
  ),
  method("pls-sem", "PLS-SEM", "model", false, "Estimates a structural model by maximising the variance explained in the outcomes.", "Often chosen for prediction-focused or exploratory models, complex models, or smaller samples.", ["The measurement and structural models are specified from theory.", "Indicators relate to their constructs as specified."], ["It doesn't give the same overall model-fit tests as CB-SEM.", "Its estimates can be biased when constructs are truly latent factors."]),
  method("cb-sem", "CB-SEM", "model", true, "Tests how well a theorised model reproduces the observed relationships, with overall fit statistics.", "Usually chosen for confirming an established theory with a large sample.", ["Multivariate normality, or a robust estimator.", "A large sample.", "A model identified from theory."], ["Needs larger samples than PLS-SEM.", "Complex models may fail to converge."]),
];

export function getAnalysisMethod(id: AnalysisMethodId): AnalysisMethod {
  const found = ANALYSIS_METHODS.find((candidate) => candidate.id === id);
  if (!found) throw new RangeError(`Unknown analysis method: ${id}`);
  return found;
}

/**
 * The non-parametric method to use if a parametric method's normality assumption doesn't
 * hold. Repeated measures ANOVA has none here: its counterpart, the Friedman test, isn't
 * among the methods this tool covers, so the rules name it in words.
 */
export const NON_PARAMETRIC_ALTERNATIVE: Readonly<Partial<Record<AnalysisMethodId, AnalysisMethodId>>> = {
  pearson: "spearman",
  "independent-t-test": "mann-whitney",
  "paired-t-test": "wilcoxon",
  "one-way-anova": "kruskal-wallis",
  mean: "median",
  "cb-sem": "pls-sem",
};
