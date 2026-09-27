/**
 * Which charts suit a variable, a research purpose, a statistical test, or a project.
 * Recommendations follow common guidance for statistical graphics: distributions as
 * histograms and box plots, categories as bars, rating items as diverging stacked bars,
 * change over time as lines, relationships between numbers as scatter plots, and parts
 * of a whole as pies only when the parts are few. Nothing is scored or ranked, and no
 * chart is called wrong: strengths reuse the Data Analysis Recommender's three labels.
 */

import { recommendAnalyses, allRecommendations, listNames } from "../research/data-analysis";
import { MEASURE_FOR_LEVEL, analysisProfile, type Measure, type MeasuredVariable } from "../research/data-analysis-profile";
import { getAnalysisMethod, type AnalysisMethodId, type RecommendationStrength } from "../research/data-analysis-types";
import { questionnaireVariables } from "../research/questionnaire-builder";
import type { ResearchProjectDraft } from "../research/research-project";
import type { MeasurementLevel } from "../research/variable-types";
import { CHART_TYPE_INFO, type ChartType, type SortOrder } from "./types";

export const CHART_PURPOSES = ["distribution", "comparison", "composition", "relationship", "trend", "ranking", "agreement", "population", "profile"] as const;
export type ChartPurpose = (typeof CHART_PURPOSES)[number];

export const CHART_PURPOSE_INFO: Readonly<Record<ChartPurpose, { label: string; question: string }>> = {
  distribution: { label: "Distribution", question: "How are the values spread?" },
  comparison: { label: "Comparison", question: "How do groups or categories differ?" },
  composition: { label: "Composition", question: "What share does each part make of the whole?" },
  relationship: { label: "Relationship", question: "How does one variable change with another?" },
  trend: { label: "Change over time", question: "How do values change across times or waves?" },
  ranking: { label: "Ranking", question: "Which categories are largest, in order?" },
  agreement: { label: "Agreement", question: "How far do respondents agree with each statement?" },
  population: { label: "Population structure", question: "How is the sample made up by age and sex, or two other groups?" },
  profile: { label: "Profile", question: "How do cases compare across several dimensions at once?" },
};

export interface ChartSuggestion {
  type: ChartType;
  strength: RecommendationStrength;
  /** Why it suits, in one or two sentences. */
  reason: string;
  /** The order that reads best, or null when the chart can't be sorted or the order is the data's own. */
  sort: SortOrder | null;
  /** Suggested wording, empty when the suggestion isn't about named variables. */
  title: string;
  xTitle: string;
  yTitle: string;
}

const suggest = (type: ChartType, strength: RecommendationStrength, reason: string, sort: SortOrder | null = null): ChartSuggestion => ({ type, strength, reason, sort: CHART_TYPE_INFO[type].sortable ? sort : null, title: "", xTitle: "", yTitle: "" });

const RANK: Readonly<Record<RecommendationStrength, number>> = { strong: 0, possible: 1, justify: 2 };

/** One suggestion per chart type, keeping the strongest, in the order first suggested. */
export function mergeSuggestions(suggestions: readonly ChartSuggestion[]): ChartSuggestion[] {
  const kept = new Map<ChartType, ChartSuggestion>();
  for (const suggestion of suggestions) {
    const existing = kept.get(suggestion.type);
    if (!existing || RANK[suggestion.strength] < RANK[existing.strength]) kept.set(suggestion.type, suggestion);
  }
  return [...kept.values()];
}

// By purpose.

const PURPOSE_CHARTS: Readonly<Record<ChartPurpose, readonly ChartSuggestion[]>> = {
  distribution: [
    suggest("histogram", "strong", "A histogram shows the shape of a numeric variable: where values cluster, how spread they are, and any skew."),
    suggest("box-plot", "strong", "A box plot summarises the median, quartiles and outliers, and compares distributions side by side."),
    suggest("frequency-polygon", "possible", "A frequency polygon shows the same shape as a histogram and overlays more easily."),
  ],
  comparison: [
    suggest("bar", "strong", "Bars compare amounts across categories accurately, because lengths start from zero.", "descending"),
    suggest("grouped-bar", "strong", "Grouped bars compare two or more series within each category."),
    suggest("mean-comparison", "strong", "Bars of group means, with error bars, compare a numeric outcome across groups."),
    suggest("horizontal-bar", "possible", "Horizontal bars suit long category names.", "descending"),
    suggest("error-bar", "possible", "Means with error bars show how precisely each group mean is estimated."),
  ],
  composition: [
    suggest("stacked-bar-100", "strong", "100% stacked bars compare how the whole divides in several groups."),
    suggest("pie", "possible", "A pie shows parts of one whole; it reads well only with a few parts (up to about six)."),
    suggest("doughnut", "possible", "A doughnut is a pie with room for a total in the centre; the same limit of a few parts applies."),
    suggest("stacked-bar", "possible", "Stacked bars show totals and their parts together; only the lowest part shares a baseline, so the others are harder to compare."),
  ],
  relationship: [
    suggest("scatter", "strong", "A scatter plot shows how one numeric variable changes with another, including its direction, strength and any outliers."),
    suggest("bubble", "possible", "A bubble chart adds a third numeric variable as the size of each point; sizes are harder to compare than positions."),
  ],
  trend: [
    suggest("line", "strong", "A line joins values in time order, so rises and falls are easy to follow."),
    suggest("multi-line", "strong", "Several lines compare how groups change over the same times."),
    suggest("area", "possible", "An area chart stresses the size of a running total over time."),
  ],
  ranking: [
    suggest("horizontal-bar", "strong", "Sorted horizontal bars list categories from largest to smallest, with room for long names.", "descending"),
    suggest("pareto", "possible", "A Pareto chart ranks categories and shows how quickly the largest few account for most of the total."),
    suggest("bar", "possible", "Sorted vertical bars rank a few categories with short names.", "descending"),
  ],
  agreement: [
    suggest("likert", "strong", "A diverging stacked bar places disagreement left of centre and agreement right, so items can be compared at a glance."),
    suggest("stacked-bar-100", "possible", "100% stacked bars show every response level in scale order, without dividing at a centre."),
  ],
  population: [
    suggest("population-pyramid", "strong", "A population pyramid shows two groups, such as female and male, on either side of each age band."),
    suggest("grouped-bar", "possible", "Grouped bars show the same counts with a shared baseline, which compares the two sides more exactly."),
  ],
  profile: [
    suggest("grouped-bar", "strong", "Grouped bars compare cases across several dimensions with a shared baseline."),
    suggest("radar", "justify", "A radar chart shows a profile's shape, but areas exaggerate differences and depend on the order of the dimensions. Say why it suits your reader better than grouped bars."),
  ],
};

export const chartsForPurpose = (purpose: ChartPurpose): ChartSuggestion[] => PURPOSE_CHARTS[purpose].map((suggestion) => ({ ...suggestion }));

// By how a variable is measured.

/** Charts that describe one variable, by how it is measured. Likert items are ordinal, but a diverging chart suits them best. */
export function chartsForMeasure(measure: Measure, options: { likert?: boolean; groups?: number | null } = {}): ChartSuggestion[] {
  const groups = options.groups ?? null;
  switch (measure) {
    case "numeric":
      return [...chartsForPurpose("distribution")];
    case "scale-score":
      return [
        suggest("histogram", "strong", "A scale score is usually analysed as numeric, so a histogram shows its distribution."),
        suggest("box-plot", "strong", "A box plot summarises the scale score's median, quartiles and outliers."),
        suggest("likert", "possible", "A diverging chart of the separate rating items shows which items drive the score."),
      ];
    case "ordinal":
      return options.likert
        ? [
            suggest("likert", "strong", "Likert items are ordered agreement levels, which a diverging stacked bar shows around the neutral point."),
            suggest("stacked-bar-100", "possible", "100% stacked bars show each item's response levels in scale order."),
            suggest("bar", "possible", "Bars show the count at each response level for a single item; keep the scale's order.", "none"),
          ]
        : [
            suggest("bar", "strong", "Bars show how many responses fall in each ordered category; keep the categories in their natural order.", "none"),
            suggest("stacked-bar-100", "possible", "100% stacked bars compare the ordered categories across groups."),
          ];
    case "binary":
      return [suggest("bar", "strong", "Two bars compare the two categories directly."), suggest("pie", "possible", "A two-part pie shows the split, though a single percentage in the text often says the same more simply.")];
    case "categorical":
      return [
        suggest("bar", "strong", "Bars compare the number in each category; sorting from largest to smallest helps when the categories have no natural order.", "descending"),
        suggest("horizontal-bar", "possible", "Horizontal bars suit many categories or long category names.", "descending"),
        groups !== null && groups > 6
          ? suggest("pie", "justify", `With ${groups} categories, pie slices become hard to compare. Say why a pie suits better than bars.`)
          : suggest("pie", "possible", "A pie shows each category's share of the whole when there are only a few (up to about six)."),
      ];
    case "multiple":
      return [
        suggest("horizontal-bar", "strong", "When respondents can tick several choices, bars of the percentage ticking each choice show them fairly. Shares don't add up to 100%, so a pie would mislead.", "descending"),
        suggest("bar", "possible", "Vertical bars suit a few choices with short names.", "descending"),
      ];
    case "text":
    case "unknown":
      return [];
  }
}

/** Charts for a variable's recorded measurement level, from the same rules. */
export const chartsForLevel = (level: MeasurementLevel): ChartSuggestion[] => chartsForMeasure(MEASURE_FOR_LEVEL[level], { likert: level === "likert" });

/** Why nothing is suggested for a measure, or null when something is. */
export function noChartReason(measure: Measure): string | null {
  if (measure === "text") return "Written answers can't be charted directly. Code them into categories first; the categories can then be shown as bars.";
  if (measure === "unknown") return "Record how the variable is measured to see which charts suit it.";
  return null;
}

// By statistical test.

const scatter = suggest("scatter", "strong", "A scatter plot shows the relationship the test measures, and reveals outliers or curves a single coefficient hides.");
const groupMeans = suggest("mean-comparison", "strong", "Group means with error bars show the difference the test assesses.");
const boxes = (strength: RecommendationStrength, reason: string) => suggest("box-plot", strength, reason);
const crossTab = [
  suggest("grouped-bar", "strong", "Grouped bars show the counts in each combination of categories, as in the contingency table."),
  suggest("stacked-bar-100", "strong", "100% stacked bars compare the proportions in each group, which is what an association changes."),
];

const METHOD_CHARTS: Readonly<Partial<Record<AnalysisMethodId, readonly ChartSuggestion[]>>> = {
  "descriptive-statistics": [boxes("strong", "A box plot shows the median, quartiles and outliers that descriptive statistics report."), suggest("histogram", "strong", "A histogram shows the distribution that means and standard deviations summarise.")],
  frequency: [suggest("bar", "strong", "Bars show the frequency of each category.", "descending"), suggest("horizontal-bar", "possible", "Horizontal bars suit long category names.", "descending")],
  percentage: [suggest("bar", "strong", "Bars with percentage labels show each category's share."), suggest("pie", "possible", "A pie shows shares of one whole when there are only a few parts.")],
  mean: [groupMeans, suggest("error-bar", "possible", "Means with error bars, drawn as points, show each estimate's precision.")],
  median: [boxes("strong", "A box plot marks the median, with the quartiles around it.")],
  "standard-deviation": [suggest("error-bar", "strong", "Error bars can show one standard deviation either side of each mean; say so in the caption."), boxes("possible", "A box plot shows spread through the interquartile range instead.")],
  reliability: [suggest("likert", "possible", "A diverging chart of the scale's items shows how responses to each item compare before reliability is reported.")],
  "cronbach-alpha": [suggest("likert", "possible", "A diverging chart of the scale's items shows how responses to each item compare before alpha is reported.")],
  correlation: [scatter],
  pearson: [scatter],
  spearman: [suggest("scatter", "possible", "A scatter plot shows whether the relationship is consistently rising or falling, which Spearman's rho measures on ranks.")],
  regression: [scatter],
  "simple-regression": [scatter],
  "multiple-regression": [suggest("scatter", "possible", "Scatter plots of the outcome against each predictor show the separate relationships; they don't show each predictor's effect adjusted for the others.")],
  "hierarchical-regression": [suggest("scatter", "possible", "Scatter plots of the outcome against each predictor show the separate relationships, not the adjusted effects.")],
  "logistic-regression": [boxes("possible", "Box plots of a numeric predictor for each outcome group show how the groups differ."), suggest("stacked-bar-100", "possible", "100% stacked bars show the outcome's proportions for each category of a categorical predictor.")],
  moderation: [suggest("multi-line", "possible", "Lines of the outcome at low and high levels of the moderator show the interaction. Use values from your fitted model, not raw means.")],
  "independent-t-test": [groupMeans, boxes("possible", "Box plots show the two groups' whole distributions, including outliers the t-test is sensitive to.")],
  "paired-t-test": [suggest("error-bar", "strong", "Means at each time with error bars show the change the test assesses."), suggest("line", "possible", "A line joins the two times' means, showing the direction of change.")],
  "one-way-anova": [groupMeans, boxes("possible", "Box plots show each group's distribution and outliers.")],
  "two-way-anova": [suggest("multi-line", "strong", "An interaction plot, one line for each level of the second factor, shows whether the effects combine."), suggest("grouped-bar", "possible", "Grouped bars of the cell means show the same comparison with a shared baseline.")],
  manova: [suggest("mean-comparison", "possible", "A chart of group means for each outcome in turn shows where the groups differ.")],
  ancova: [suggest("mean-comparison", "possible", "Group means with error bars show the comparison; use the adjusted means from your model and say so in the caption.")],
  "repeated-measures-anova": [suggest("error-bar", "strong", "Means at each time with error bars show the change across times."), suggest("line", "strong", "A line joins the means in time order.")],
  "chi-square": crossTab,
  "fisher-exact": crossTab,
  wilcoxon: [boxes("strong", "Box plots at each time show the medians and spread the test compares.")],
  "mann-whitney": [boxes("strong", "Box plots show the medians and spread the test compares.")],
  "kruskal-wallis": [boxes("strong", "Box plots show each group's median and spread.")],
};

/** Charts that show what a test examines. Empty for model-based methods, whose results are shown as path diagrams or tables. */
export const chartsForMethod = (method: AnalysisMethodId): ChartSuggestion[] => (METHOD_CHARTS[method] ?? []).map((suggestion) => ({ ...suggestion }));

// By pairs of variables.

const NUMERIC: readonly Measure[] = ["numeric", "scale-score"];
const GROUPS: readonly Measure[] = ["binary", "categorical", "ordinal"];

/** Charts that relate a predictor or grouping variable to an outcome, with suggested titles. */
export function chartsForPair(x: Pick<MeasuredVariable, "name" | "measure">, y: Pick<MeasuredVariable, "name" | "measure">): ChartSuggestion[] {
  const named = (suggestion: ChartSuggestion, title: string, xTitle: string, yTitle: string): ChartSuggestion => ({ ...suggestion, title, xTitle, yTitle });
  if (NUMERIC.includes(y.measure) && NUMERIC.includes(x.measure))
    return [named(suggest("scatter", "strong", `Both ${x.name} and ${y.name} are numeric, so a scatter plot shows how one changes with the other.`), `${y.name} and ${x.name}`, x.name, y.name)];
  if (NUMERIC.includes(y.measure) && GROUPS.includes(x.measure))
    return [
      named(suggest("mean-comparison", "strong", `${x.name} forms groups and ${y.name} is numeric, so group means with error bars compare them.`), `Mean ${y.name} by ${x.name}`, x.name, `Mean ${y.name}`),
      named(suggest("box-plot", "strong", `Box plots show the whole distribution of ${y.name} in each group of ${x.name}.`), `${y.name} by ${x.name}`, x.name, y.name),
      named(suggest("error-bar", "possible", "Means drawn as points with error bars suit groups with no zero baseline worth showing."), `Mean ${y.name} by ${x.name}`, x.name, `Mean ${y.name}`),
    ];
  if (GROUPS.includes(y.measure) && GROUPS.includes(x.measure))
    return [
      named(suggest("stacked-bar-100", "strong", `Both are categories, so 100% stacked bars compare the proportions of ${y.name} within each group of ${x.name}.`), `${y.name} by ${x.name}`, x.name, "Percentage"),
      named(suggest("grouped-bar", "strong", `Grouped bars show the count in each combination of ${x.name} and ${y.name}.`), `${y.name} by ${x.name}`, x.name, "Number of participants"),
    ];
  if (GROUPS.includes(y.measure) && NUMERIC.includes(x.measure))
    return [named(suggest("box-plot", "strong", `${y.name} forms groups and ${x.name} is numeric, so box plots compare ${x.name} across the groups of ${y.name}.`), `${x.name} by ${y.name}`, y.name, x.name)];
  return [];
}

// By research objective.

const OBJECTIVE_WORDS: readonly [ChartPurpose, RegExp][] = [
  ["relationship", /\b(relationship|associat\w*|correlat\w*|predict\w*|influence\w*|impact\w*|effect\w* of|affect\w*)\b/i],
  ["comparison", /\b(compar\w*|differ\w*|between groups|versus|vs\.?)\b/i],
  ["trend", /\b(over time|trend\w*|chang\w*|before and after|longitudinal|growth)\b/i],
  ["agreement", /\b(perception\w*|attitude\w*|agree\w*|satisf\w*|opinion\w*|views?)\b/i],
  ["composition", /\b(proportion\w*|share|composition|breakdown|make[- ]up)\b/i],
  ["ranking", /\b(rank\w*|most common|leading|main reasons?|priorit\w*)\b/i],
  ["distribution", /\b(level\w* of|extent|distribution|prevalence|how much|how many)\b/i],
];

/** The purposes an objective's wording suggests, in a fixed order. A reading of words, not of meaning: the researcher confirms it. */
export const purposesInText = (text: string): ChartPurpose[] => OBJECTIVE_WORDS.filter(([, pattern]) => pattern.test(text)).map(([purpose]) => purpose);

// For a whole project.

export interface ProjectChartGroup {
  /** What the charts are for, such as “Screen time” or “Screen time and sleep quality”. */
  heading: string;
  /** The project details the suggestions rest on, quoted. */
  basedOn: string[];
  suggestions: ChartSuggestion[];
  /** Why there are no suggestions, when there are none. */
  empty: string | null;
}

export interface ProjectChartPlan {
  variables: ProjectChartGroup[];
  pairs: ProjectChartGroup[];
  analyses: ProjectChartGroup[];
  objectives: ProjectChartGroup[];
  notes: string[];
}

/** The most predictor–outcome pairs listed, so the plan stays readable. */
export const MAX_PAIRS = 8;

const describeTitles = (suggestion: ChartSuggestion, variable: MeasuredVariable): ChartSuggestion => {
  const shape = CHART_TYPE_INFO[suggestion.type].shape;
  if (shape === "values") return { ...suggestion, title: `Distribution of ${variable.name}`, xTitle: suggestion.type === "box-plot" ? "" : variable.name, yTitle: suggestion.type === "box-plot" ? variable.name : "Frequency" };
  if (shape === "likert") return { ...suggestion, title: `Responses to ${variable.name} items`, xTitle: "Percentage of responses", yTitle: "" };
  if (suggestion.type === "pie" || suggestion.type === "doughnut") return { ...suggestion, title: `${variable.name}`, xTitle: "", yTitle: "" };
  if (suggestion.type === "horizontal-bar") return { ...suggestion, title: `${variable.name}`, xTitle: variable.measure === "multiple" ? "Percentage of respondents" : "Number of participants", yTitle: variable.name };
  return { ...suggestion, title: `${variable.name}`, xTitle: variable.name, yTitle: variable.measure === "multiple" ? "Percentage of respondents" : "Number of participants" };
};

/** Chart suggestions for every variable, predictor–outcome pair, planned analysis and objective in the project draft. */
export function recommendationsForProject(project: ResearchProjectDraft): ProjectChartPlan {
  const profile = analysisProfile(project);
  const raw = new Map(questionnaireVariables(project).map((variable) => [variable.id, variable]));
  const isLikert = (variable: MeasuredVariable) => {
    const source = raw.get(variable.id);
    if (!source) return false;
    if (source.measurementLevel) return source.measurementLevel === "likert";
    return source.possibleIndicators.length > 0 && source.possibleIndicators.every((indicator) => indicator.level === "likert");
  };

  const variables = profile.variables.map((variable): ProjectChartGroup => {
    const suggestions = chartsForMeasure(variable.measure, { likert: isLikert(variable), groups: variable.groups }).map((suggestion) => describeTitles(suggestion, variable));
    return { heading: variable.name, basedOn: [variable.source], suggestions, empty: noChartReason(variable.measure) };
  });

  const predictors = profile.variables.filter((variable) => variable.kind === "independent" || variable.kind === "moderator");
  const outcomes = profile.variables.filter((variable) => variable.kind === "dependent" || variable.kind === "mediator");
  const allPairs = predictors.flatMap((x) => outcomes.filter((y) => y.id !== x.id).map((y) => ({ x, y })));
  const pairs = allPairs.slice(0, MAX_PAIRS).map(({ x, y }): ProjectChartGroup => {
    const suggestions = chartsForPair(x, y);
    return {
      heading: `${x.name} and ${y.name}`,
      basedOn: [`${x.name}: ${x.source}`, `${y.name}: ${y.source}`],
      suggestions,
      empty: suggestions.length > 0 ? null : `No chart relates ${x.name} (${x.measure === "unknown" ? "measurement not recorded" : x.measure}) to ${y.name} (${y.measure === "unknown" ? "measurement not recorded" : y.measure}) directly. Record how each is measured, or code written answers first.`,
    };
  });
  if (profile.repeated)
    for (const outcome of outcomes.filter((variable) => NUMERIC.includes(variable.measure)))
      pairs.push({
        heading: `${outcome.name} over time`,
        basedOn: [profile.repeatedSource ?? "Repeated measurements"],
        suggestions: [
          { ...suggest("line", "strong", `The same participants are measured more than once, so a line of mean ${outcome.name} at each time shows the change.`), title: `Mean ${outcome.name} over time`, xTitle: "Time", yTitle: `Mean ${outcome.name}` },
          { ...suggest("error-bar", "possible", "Means with error bars show how precisely each time's mean is estimated."), title: `Mean ${outcome.name} over time`, xTitle: "Time", yTitle: `Mean ${outcome.name}` },
        ],
        empty: null,
      });

  const plan = recommendAnalyses(project);
  const methods = [...new Set(allRecommendations(plan).filter((entry) => entry.recommendation.strength === "strong").map((entry) => entry.recommendation.method))];
  const analyses = methods
    .map((method): ProjectChartGroup => ({ heading: getAnalysisMethod(method).name, basedOn: [`Data analysis plan: ${getAnalysisMethod(method).name} (strong recommendation)`], suggestions: chartsForMethod(method), empty: null }))
    .filter((group) => group.suggestions.length > 0);

  const objectives = profile.objectives
    .filter((objective) => objective.trim() !== "")
    .map((objective): ProjectChartGroup => {
      const purposes = purposesInText(objective);
      const suggestions = mergeSuggestions(purposes.flatMap((purpose) => chartsForPurpose(purpose).map((suggestion) => ({ ...suggestion, strength: suggestion.strength === "strong" ? ("possible" as const) : suggestion.strength, reason: `The objective's wording suggests ${CHART_PURPOSE_INFO[purpose].label.toLowerCase()}. ${suggestion.reason}` }))));
      return { heading: objective.trim(), basedOn: [`Research objective: “${objective.trim()}”`], suggestions, empty: suggestions.length > 0 ? null : "The wording doesn't point to a particular kind of chart. Choose a purpose below." };
    });

  const notes: string[] = [];
  if (profile.variables.length === 0) notes.push("No variables are recorded yet. Add them in the project details to see charts for each.");
  if (allPairs.length > MAX_PAIRS) notes.push(`Only the first ${MAX_PAIRS} of ${allPairs.length} predictor–outcome pairs are listed.`);
  if (profile.choice === "qualitative") notes.push("Your project is qualitative. Charts suit any counts or ratings you collect; themes are usually presented in words, tables or thematic maps.");
  const unknown = profile.variables.filter((variable) => variable.measure === "unknown");
  if (unknown.length > 0) notes.push(`No measurement level is recorded for ${listNames(unknown.map((variable) => variable.name))}, so no chart can be matched to ${unknown.length === 1 ? "it" : "them"}.`);
  return { variables, pairs, analyses, objectives, notes };
}
