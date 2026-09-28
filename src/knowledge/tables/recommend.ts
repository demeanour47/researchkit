/**
 * Which tables a project needs, from what it records: its planned analyses (correlation
 * leads to a correlation matrix, regression to coefficient and model summary tables,
 * ANOVA to an ANOVA table), its variables and questionnaire, its hypotheses, its
 * sampling and sample size, and its design. Strengths reuse the Data Analysis
 * Recommender's three labels; nothing is scored or ranked.
 */

import { allRecommendations, recommendAnalyses } from "../research/data-analysis";
import { analysisProfile } from "../research/data-analysis-profile";
import { getAnalysisMethod, type AnalysisMethodId, type RecommendationStrength } from "../research/data-analysis-types";
import type { ResearchProjectDraft } from "../research/research-project";
import { TABLE_TYPES, type TableType } from "./types";

export interface TableSuggestion {
  type: TableType;
  strength: RecommendationStrength;
  /** Why the table suits, in sentences. */
  reasons: string[];
  /** The project details the suggestion rests on. */
  basedOn: string[];
}

const RANK: Readonly<Record<RecommendationStrength, number>> = { strong: 0, possible: 1, justify: 2 };

/** One suggestion per table, keeping the strongest and gathering every reason, strongest first, then in catalogue order. */
export function mergeTableSuggestions(suggestions: readonly TableSuggestion[]): TableSuggestion[] {
  const merged = new Map<TableType, TableSuggestion>();
  for (const suggestion of suggestions) {
    const existing = merged.get(suggestion.type);
    if (!existing) {
      merged.set(suggestion.type, { ...suggestion, reasons: [...suggestion.reasons], basedOn: [...suggestion.basedOn] });
      continue;
    }
    existing.strength = RANK[suggestion.strength] < RANK[existing.strength] ? suggestion.strength : existing.strength;
    for (const reason of suggestion.reasons) if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    for (const basis of suggestion.basedOn) if (!existing.basedOn.includes(basis)) existing.basedOn.push(basis);
  }
  return [...merged.values()].sort((a, b) => RANK[a.strength] - RANK[b.strength] || TABLE_TYPES.indexOf(a.type) - TABLE_TYPES.indexOf(b.type));
}

/** The tables that report each analysis, with why. */
export const METHOD_TABLES: Readonly<Record<AnalysisMethodId, readonly [TableType, RecommendationStrength, string][]>> = {
  "descriptive-statistics": [["descriptive-statistics", "strong", "Means, standard deviations and ranges of the study variables are usually reported in one table."]],
  frequency: [
    ["frequency", "strong", "A frequency table shows how many responses fall in each category."],
    ["demographic-profile", "strong", "A demographic profile reports the frequencies of the sample's characteristics together."],
  ],
  percentage: [["percentage", "strong", "A percentage table compares the share of responses in each category across items."]],
  mean: [["descriptive-statistics", "strong", "Means are reported with their standard deviations in a descriptive statistics table."]],
  median: [["descriptive-statistics", "possible", "Medians can be added to a descriptive statistics table; build it as a custom table if you report medians instead of means."]],
  mode: [["frequency", "strong", "The mode is the category with the highest count, which a frequency table shows directly."]],
  "standard-deviation": [["descriptive-statistics", "strong", "Standard deviations are reported beside the means in a descriptive statistics table."]],
  reliability: [["reliability", "strong", "A reliability table reports the internal consistency of each scale."]],
  "cronbach-alpha": [["reliability", "strong", "Cronbach's alpha for each scale is usually reported in one table."]],
  validity: [["validity", "strong", "Composite reliability and average variance extracted are reported for each construct."]],
  kmo: [["factor-analysis", "possible", "The KMO measure is usually reported in the note to the factor loadings table."]],
  bartlett: [["factor-analysis", "possible", "Bartlett's test is usually reported in the note to the factor loadings table."]],
  "factor-analysis": [["factor-analysis", "strong", "A table of factor loadings shows which items belong to which factor."]],
  correlation: [["correlation-matrix", "strong", "A correlation matrix shows every pair of variables with their means and standard deviations."]],
  pearson: [["correlation-matrix", "strong", "Pearson correlations between the study variables are reported as a matrix."]],
  spearman: [["correlation-matrix", "strong", "Spearman correlations can be reported as a matrix, like Pearson's."]],
  regression: [
    ["coefficients", "strong", "A coefficient table reports each predictor's effect, standard error and significance."],
    ["model-summary", "possible", "A model summary reports how much variance the model explains."],
  ],
  "simple-regression": [["regression", "strong", "One regression table reports the coefficient and the model's fit in its note."]],
  "multiple-regression": [
    ["regression", "strong", "A regression table reports every predictor's coefficients, with R² and the F test in its note."],
    ["coefficients", "possible", "A full coefficient table adds confidence intervals and collinearity statistics."],
  ],
  "hierarchical-regression": [
    ["model-summary", "strong", "A model summary compares the steps: R², the change in R² and its F test."],
    ["coefficients", "strong", "A coefficient table grouped by step reports each predictor's effect."],
  ],
  "logistic-regression": [["coefficients", "possible", "Coefficients can be reported in a coefficient table; add odds ratios, Exp(B), as a custom table if your software gives them."]],
  moderation: [["coefficients", "possible", "The interaction term and its components are reported in a coefficient table."]],
  mediation: [["coefficients", "possible", "The paths of a mediation model can be reported in a coefficient table, with the indirect effect's interval in the note."]],
  "one-sample-t-test": [["descriptive-statistics", "strong", "The sample's mean and standard deviation are reported alongside the test, with the comparison value in the note."]],
  "independent-t-test": [["descriptive-statistics", "strong", "Each group's mean and standard deviation are reported alongside the t-test."]],
  "paired-t-test": [["descriptive-statistics", "strong", "The mean and standard deviation at each time are reported alongside the t-test."]],
  "one-way-anova": [
    ["anova", "strong", "An ANOVA table reports the sums of squares, F test and effect size."],
    ["descriptive-statistics", "possible", "Group means and standard deviations help readers interpret the F test."],
  ],
  "two-way-anova": [["anova", "strong", "An ANOVA table reports each main effect and the interaction."]],
  manova: [["anova", "possible", "Follow-up ANOVAs for each outcome can be reported in ANOVA tables."]],
  ancova: [["anova", "strong", "An ANOVA table reports the covariate and group effects with their effect sizes."]],
  "repeated-measures-anova": [["anova", "strong", "An ANOVA table reports the within-subjects effect and its error term."]],
  "chi-square": [
    ["chi-square", "strong", "A chi-square table reports the counts in each group with the test of association."],
    ["cross-tabulation", "possible", "A cross-tabulation shows the counts and percentages behind the test."],
  ],
  "chi-square-goodness-of-fit": [["frequency", "strong", "A frequency table shows the observed count in each category beside the expected count or proportion."]],
  "fisher-exact": [["cross-tabulation", "strong", "A cross-tabulation shows the counts Fisher's exact test compares; report its p in the note."]],
  wilcoxon: [["descriptive-statistics", "possible", "Report medians with the Wilcoxon test; a custom table suits if you report medians and ranges."]],
  "mann-whitney": [["descriptive-statistics", "possible", "Report each group's median with the Mann–Whitney test; a custom table suits medians and ranges."]],
  "kruskal-wallis": [["descriptive-statistics", "possible", "Report each group's median with the Kruskal–Wallis test; a custom table suits medians and ranges."]],
  sem: [
    ["validity", "strong", "Structural equation models report convergent validity for each construct."],
    ["correlation-matrix", "possible", "A correlation matrix of the constructs supports discriminant validity."],
    ["coefficients", "possible", "Path coefficients can be reported in a coefficient table."],
  ],
  "pls-sem": [
    ["validity", "strong", "PLS-SEM reports loadings, composite reliability and AVE for each construct."],
    ["coefficients", "possible", "Path coefficients can be reported in a coefficient table."],
  ],
  "cb-sem": [
    ["validity", "strong", "Covariance-based SEM reports loadings, composite reliability and AVE for each construct."],
    ["coefficients", "possible", "Path coefficients can be reported in a coefficient table."],
  ],
};

/** The tables a project needs, from everything it records. */
export function recommendTables(project: ResearchProjectDraft): TableSuggestion[] {
  const suggestions: TableSuggestion[] = [];
  const add = (type: TableType, strength: RecommendationStrength, reason: string, basedOn: string) => suggestions.push({ type, strength, reasons: [reason], basedOn: [basedOn] });
  const profile = analysisProfile(project);

  // Planned analyses.
  const plan = recommendAnalyses(project);
  for (const { recommendation } of allRecommendations(plan)) {
    if (recommendation.strength === "justify") continue;
    for (const [type, strength, reason] of METHOD_TABLES[recommendation.method] ?? []) {
      add(type, recommendation.strength === "strong" ? strength : "possible", reason, `Data analysis plan: ${getAnalysisMethod(recommendation.method).name}`);
    }
  }

  // Variables and measurement.
  if (profile.variables.length > 0) {
    add("operationalization", "strong", "The methodology chapter usually shows how each variable is defined and measured.", `Variables: ${profile.variables.map((variable) => variable.name).join(", ")}`);
    const rated = profile.variables.filter((variable) => variable.measure === "scale-score" || variable.measure === "ordinal");
    add(
      "measurement-scale",
      rated.length > 0 ? "strong" : "possible",
      rated.length > 0 ? "Rating scales are described with their items, response options and sources." : "A measurement table describes how each variable is measured.",
      rated.length > 0 ? `Rated variables: ${rated.map((variable) => variable.name).join(", ")}` : "Variables",
    );
    const categories = profile.variables.filter((variable) => ["binary", "categorical"].includes(variable.measure) && ["control", "independent", "extraneous", "confounding"].includes(variable.kind));
    if (categories.length > 0) add("demographic-profile", "strong", "Categorical characteristics describe the sample in a demographic profile.", `Categorical variables: ${categories.map((variable) => variable.name).join(", ")}`);
  }

  // Questionnaire.
  if (project.questionnaire) add("questionnaire-summary", "strong", "A questionnaire summary shows its sections, items and the variables each measures.", "Questionnaire");
  else if (profile.variables.length > 0) add("questionnaire-summary", "possible", "Once your questionnaire is drafted, a summary shows its sections and the variables each measures.", "Variables");
  if (profile.variables.some((variable) => variable.measure === "scale-score" || variable.measure === "ordinal")) add("percentage", "possible", "An item summary gives the percentage of each response to the rating items.", "Rated variables");

  // Hypotheses.
  if (profile.hypotheses.length > 0) add("hypothesis-summary", "strong", "A hypothesis summary lists each hypothesis, its test and the decision.", `Hypotheses: ${profile.hypotheses.length}`);

  // Sampling and sample size.
  if (project.sampleSizePlan) add("sample-size-summary", "strong", "A sample size table shows the values behind the planned sample, so readers can check it.", profile.sampleSource ?? "Sample size plan");
  if (project.samplingPlan?.chosen || project.sampleSizePlan) add("demographic-profile", "strong", "A sample description reports who took part, compared with the population sampled.", profile.samplingSource ?? "Sampling plan");

  // Design and write-up.
  if (profile.design) add("research-timeline", "possible", "A proposal usually includes a timeline of the research activities.", `Research design: ${profile.design.name}`);
  if (profile.design?.family === "experimental") add("descriptive-statistics", "strong", "Experimental designs report each group's means and standard deviations.", `Research design: ${profile.design.name}`);
  add("table-of-contents", "possible", "Theses and long reports open with a contents page.", "Any thesis or report");
  add("list-of-tables", "possible", "Theses list their tables after the contents page.", "Any thesis or report");

  return mergeTableSuggestions(suggestions);
}
