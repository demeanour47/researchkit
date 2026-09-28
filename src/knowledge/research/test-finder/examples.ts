/**
 * Worked examples: a research question taken from question to variables, measurement,
 * groups, structure and a candidate test. Each has a small, invented dataset to make the
 * structure concrete. Summaries are calculated from the dataset, never typed in, and
 * make no claim of statistical significance: a real study's conclusion depends on its
 * own data, sample size and assumptions.
 */

import { mean, pearson, standardDeviation } from "../../tables/stats";
import type { AnalysisMethodId } from "../data-analysis-types";
import type { StructureDiagramId } from "./figures";
import type { FinderAnswers, FinderLevel } from "./questions";

export const WORKED_EXAMPLE_IDS = [
  "one-sample",
  "independent-t",
  "paired-t",
  "chi-square",
  "goodness-of-fit",
  "correlation",
  "regression",
  "one-way-anova",
  "two-way-anova",
  "ancova",
] as const;
export type WorkedExampleId = (typeof WORKED_EXAMPLE_IDS)[number];

export interface ExampleVariable {
  name: string;
  role: string;
  level: FinderLevel;
  detail: string;
}

export interface ExampleDataset {
  caption: string;
  columns: readonly string[];
  /** Which columns hold numbers, so they can be aligned for comparison. */
  numeric: readonly boolean[];
  rows: readonly (readonly (string | number)[])[];
}

export interface WorkedExample {
  id: WorkedExampleId;
  method: AnalysisMethodId;
  field: string;
  question: string;
  variables: readonly ExampleVariable[];
  groups: string;
  structure: string;
  /** The answers that describe this situation in the Statistical Test Finder. */
  answers: FinderAnswers;
  diagram: StructureDiagramId;
  why: string;
  /** What the result would tell the researcher, whichever way it came out. */
  interpretation: string;
  dataset: ExampleDataset;
  /** Figures worked out from the dataset, with the arithmetic shown. */
  summaries: readonly string[];
}

/** A number rounded to fixed decimals for display. */
export const fixed = (value: number, decimals: number) => value.toFixed(decimals);
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
const listed = (values: readonly number[]) => values.join(" + ");

/** Rows of a two-column long dataset: one row per participant, with its group. */
const longRows = (groups: readonly { label: string; values: readonly number[] }[]) => {
  let id = 0;
  return groups.flatMap((group) => group.values.map((value) => [++id, group.label, value] as const));
};

const groupMean = (label: string, values: readonly number[]) => `${label}: mean = (${listed(values)}) ÷ ${values.length} = ${sum(values)} ÷ ${values.length} = ${fixed(mean(values), 1)}.`;

// Datasets. Every figure below is derived from these arrays.

export const ONE_SAMPLE_HOURS = [41, 45, 40, 44, 46, 42] as const;
export const ONE_SAMPLE_VALUE = 40;
export const PUBLIC_SATISFACTION = [38, 34, 40, 36] as const;
export const PRIVATE_SATISFACTION = [32, 35, 30, 31] as const;
export const BEFORE_TRAINING = [62, 55, 70, 58, 65] as const;
export const AFTER_TRAINING = [68, 60, 74, 59, 71] as const;
/** Rows: female, male. Columns: employed, unemployed. */
export const EMPLOYMENT_BY_GENDER = [
  [42, 18],
  [48, 12],
] as const;
export const CHANNEL_CHOICES = [38, 42, 22, 18] as const;
export const CHANNELS = ["Branch", "Mobile app", "ATM", "Internet banking"] as const;
export const STUDY_HOURS = [2, 4, 5, 7, 8, 10] as const;
export const EXAM_SCORES = [55, 56, 63, 64, 72, 74] as const;
export const TEACHING_GROUPS = [
  { label: "Lecture", values: [65, 70, 60] },
  { label: "Discussion", values: [75, 72, 78] },
  { label: "Online", values: [68, 64, 66] },
] as const;
/** Sales in units, two salespeople in each combination of training method and experience. */
export const SALES_CELLS = [
  { method: "Online", experience: "Junior", values: [20, 22] },
  { method: "Online", experience: "Senior", values: [30, 32] },
  { method: "Classroom", experience: "Junior", values: [28, 30] },
  { method: "Classroom", experience: "Senior", values: [32, 34] },
] as const;
export const ANCOVA_GROUPS = [
  { label: "Method A", prior: [60, 70, 80], final: [65, 74, 83] },
  { label: "Method B", prior: [50, 60, 70], final: [60, 69, 78] },
] as const;

/** A one-sample t statistic, by the formula shown with the example. */
export const oneSampleT = (values: readonly number[], value: number) => (mean(values) - value) / (standardDeviation(values) / Math.sqrt(values.length));

/** The F ratio for independent groups: mean square between ÷ mean square within. */
export function fRatio(groups: readonly (readonly number[])[]): { f: number; between: number; within: number; dfBetween: number; dfWithin: number } {
  const all = groups.flat();
  const grand = mean(all);
  const ssBetween = groups.reduce((total, group) => total + group.length * (mean(group) - grand) ** 2, 0);
  const ssWithin = groups.reduce((total, group) => total + group.reduce((inner, value) => inner + (value - mean(group)) ** 2, 0), 0);
  const dfBetween = groups.length - 1;
  const dfWithin = all.length - groups.length;
  const between = ssBetween / dfBetween;
  const within = ssWithin / dfWithin;
  return { f: between / within, between, within, dfBetween, dfWithin };
}

/** Expected counts for a cross-tabulation, by (row total × column total) ÷ N. */
export function expectedCounts(counts: readonly (readonly number[])[]): number[][] {
  const rows = counts.map(sum);
  const columns = counts[0].map((_, column) => sum(counts.map((row) => row[column])));
  const n = sum(rows);
  return counts.map((row, r) => row.map((_, c) => (rows[r] * columns[c]) / n));
}

/** Σ (O − E)² ÷ E over paired observed and expected counts. */
export const chiSquareStatistic = (observed: readonly number[], expected: readonly number[]) => observed.reduce((total, value, index) => total + (value - expected[index]) ** 2 / expected[index], 0);

/** Least-squares slope and intercept for one predictor. */
export function leastSquares(xs: readonly number[], ys: readonly number[]): { slope: number; intercept: number } {
  const mx = mean(xs);
  const my = mean(ys);
  const slope = xs.reduce((total, x, i) => total + (x - mx) * (ys[i] - my), 0) / xs.reduce((total, x) => total + (x - mx) ** 2, 0);
  return { slope, intercept: my - slope * mx };
}

const differences = BEFORE_TRAINING.map((before, index) => AFTER_TRAINING[index] - before);
const pairedT = mean(differences) / (standardDeviation(differences) / Math.sqrt(differences.length));
const employmentExpected = expectedCounts(EMPLOYMENT_BY_GENDER);
const channelExpected = CHANNEL_CHOICES.map(() => sum(CHANNEL_CHOICES) / CHANNEL_CHOICES.length);
const teaching = fRatio(TEACHING_GROUPS.map((group) => group.values));
const line = leastSquares(STUDY_HOURS, EXAM_SCORES);
const cellMean = (method: string, experience: string) => mean(SALES_CELLS.find((cell) => cell.method === method && cell.experience === experience)!.values);

export const WORKED_EXAMPLES: Readonly<Record<WorkedExampleId, WorkedExample>> = {
  "one-sample": {
    id: "one-sample",
    method: "one-sample-t-test",
    field: "Management research",
    question: "Is the mean weekly working time of bank tellers different from the 40 hours set in their contracts?",
    variables: [{ name: "Weekly working hours", role: "Outcome", level: "ratio", detail: "Hours worked in a week, with a true zero." }],
    groups: "One group of tellers, compared with a fixed value of 40 hours.",
    structure: "There is no second group: the comparison value comes from the contract, stated before the data were collected.",
    answers: { purpose: "compare", comparison: "value", outcomeLevel: "ratio", normality: "yes" },
    diagram: "one-sample",
    why: "One quantitative outcome is compared with a value stated in advance, which is what the one-sample t-test does.",
    interpretation: "The test asks whether the sample mean is further from 40 than chance variation between samples would usually produce. A difference can matter to managers even when it is small, or be statistically clear yet too small to matter.",
    dataset: {
      caption: "Weekly working hours of six tellers (invented for illustration)",
      columns: ["Teller", "Hours"],
      numeric: [true, true],
      rows: ONE_SAMPLE_HOURS.map((hours, index) => [index + 1, hours]),
    },
    summaries: [
      `Mean = (${listed(ONE_SAMPLE_HOURS)}) ÷ 6 = ${sum(ONE_SAMPLE_HOURS)} ÷ 6 = ${fixed(mean(ONE_SAMPLE_HOURS), 1)} hours, against the contract's ${ONE_SAMPLE_VALUE}.`,
      `Standard deviation s = ${fixed(standardDeviation(ONE_SAMPLE_HOURS), 2)}, so t = (${fixed(mean(ONE_SAMPLE_HOURS), 1)} − ${ONE_SAMPLE_VALUE}) ÷ (${fixed(standardDeviation(ONE_SAMPLE_HOURS), 2)} ÷ √6) = ${fixed(oneSampleT(ONE_SAMPLE_HOURS, ONE_SAMPLE_VALUE), 2)} with 5 degrees of freedom.`,
    ],
  },
  "independent-t": {
    id: "independent-t",
    method: "independent-t-test",
    field: "Business research",
    question: "Is mean job satisfaction different between public and private bank employees?",
    variables: [
      { name: "Bank type", role: "Grouping variable (independent variable)", level: "nominal", detail: "Two categories: public and private." },
      { name: "Job satisfaction", role: "Outcome (dependent variable)", level: "interval", detail: "A scale score from ten rating items, commonly treated as interval." },
    ],
    groups: "Two groups: public and private bank employees.",
    structure: "Independent: each employee works in one type of bank only.",
    answers: { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "two", secondFactor: "no", covariate: "no", normality: "yes" },
    diagram: "two-groups",
    why: "A quantitative outcome is compared between two independent groups, which is the situation the independent-samples t-test is built for.",
    interpretation: "The test asks whether the gap between the group means is larger than chance would usually produce. Report the effect size as well: a clear difference can still be small in practice.",
    dataset: {
      caption: "Job satisfaction scores out of 50 (invented for illustration)",
      columns: ["Employee", "Bank type", "Satisfaction"],
      numeric: [true, false, true],
      rows: longRows([
        { label: "Public", values: PUBLIC_SATISFACTION },
        { label: "Private", values: PRIVATE_SATISFACTION },
      ]),
    },
    summaries: [
      groupMean("Public", PUBLIC_SATISFACTION),
      groupMean("Private", PRIVATE_SATISFACTION),
      `The sample means differ by ${fixed(mean(PUBLIC_SATISFACTION) - mean(PRIVATE_SATISFACTION), 1)} points. With four employees per group this is an illustration only; the test weighs the gap against the spread within each group.`,
    ],
  },
  "paired-t": {
    id: "paired-t",
    method: "paired-t-test",
    field: "Education research",
    question: "Did students' mean scores change after training?",
    variables: [
      { name: "Score before training", role: "First measurement", level: "interval", detail: "A test score out of 100." },
      { name: "Score after training", role: "Second measurement, same students", level: "interval", detail: "The same test, taken again." },
    ],
    groups: "One group of students, measured twice.",
    structure: "Paired: every “after” score belongs to the same student as one “before” score.",
    answers: { purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "two", normality: "yes" },
    diagram: "paired",
    why: "The same students are measured twice on a quantitative outcome, so the paired-samples t-test analyses each student's change.",
    interpretation: "The test asks whether the mean change is further from zero than chance would usually produce. Without a comparison group it can't show that the training caused the change: practice, time or other events may explain it.",
    dataset: {
      caption: "Test scores before and after training (invented for illustration)",
      columns: ["Student", "Before", "After", "Difference"],
      numeric: [true, true, true, true],
      rows: BEFORE_TRAINING.map((before, index) => [index + 1, before, AFTER_TRAINING[index], differences[index]]),
    },
    summaries: [
      `Mean before = ${fixed(mean(BEFORE_TRAINING), 1)}; mean after = ${fixed(mean(AFTER_TRAINING), 1)}.`,
      `Mean difference d̄ = (${listed(differences)}) ÷ 5 = ${fixed(mean(differences), 1)}, with s_d = ${fixed(standardDeviation(differences), 2)}, so t = ${fixed(mean(differences), 1)} ÷ (${fixed(standardDeviation(differences), 2)} ÷ √5) = ${fixed(pairedT, 2)} with 4 degrees of freedom.`,
    ],
  },
  "chi-square": {
    id: "chi-square",
    method: "chi-square",
    field: "Social science research",
    question: "Is employment status associated with gender?",
    variables: [
      { name: "Gender", role: "First categorical variable", level: "nominal", detail: "Female or male, as recorded in this survey." },
      { name: "Employment status", role: "Second categorical variable", level: "nominal", detail: "Employed or unemployed." },
    ],
    groups: "Two categories of each variable, making a 2 × 2 table.",
    structure: "Independent: each respondent is counted once, in one cell.",
    answers: { purpose: "association", categoricalVariables: "two" },
    diagram: "association",
    why: "Both variables are categories, so the question is whether the counts in the table depart from what unrelated variables would give.",
    interpretation: "The test asks whether the pattern of counts differs from independence by more than chance would usually produce. It says nothing about cause, and a clear association can still be weak; Cramér's V describes its strength.",
    dataset: {
      caption: "Observed counts, with expected counts in brackets (invented for illustration)",
      columns: ["Gender", "Employed", "Unemployed", "Total"],
      numeric: [false, true, true, true],
      rows: [
        ["Female", `${EMPLOYMENT_BY_GENDER[0][0]} (${fixed(employmentExpected[0][0], 0)})`, `${EMPLOYMENT_BY_GENDER[0][1]} (${fixed(employmentExpected[0][1], 0)})`, sum(EMPLOYMENT_BY_GENDER[0])],
        ["Male", `${EMPLOYMENT_BY_GENDER[1][0]} (${fixed(employmentExpected[1][0], 0)})`, `${EMPLOYMENT_BY_GENDER[1][1]} (${fixed(employmentExpected[1][1], 0)})`, sum(EMPLOYMENT_BY_GENDER[1])],
        ["Total", EMPLOYMENT_BY_GENDER[0][0] + EMPLOYMENT_BY_GENDER[1][0], EMPLOYMENT_BY_GENDER[0][1] + EMPLOYMENT_BY_GENDER[1][1], sum(EMPLOYMENT_BY_GENDER.flat())],
      ],
    },
    summaries: [
      `Expected count for employed women = (60 × 90) ÷ 120 = ${fixed(employmentExpected[0][0], 0)}; the other cells follow the same way.`,
      `χ² = (42 − 45)² ÷ 45 + (18 − 15)² ÷ 15 + (48 − 45)² ÷ 45 + (12 − 15)² ÷ 15 = ${fixed(chiSquareStatistic(EMPLOYMENT_BY_GENDER.flat(), employmentExpected.flat()), 2)}, with 1 degree of freedom.`,
    ],
  },
  "goodness-of-fit": {
    id: "goodness-of-fit",
    method: "chi-square-goodness-of-fit",
    field: "Business research",
    question: "Do customers choose the bank's four service channels equally often?",
    variables: [{ name: "Service channel chosen", role: "Categorical variable", level: "nominal", detail: "Branch, mobile app, ATM or internet banking." }],
    groups: "Four categories, compared with equal expected shares.",
    structure: "Independent: each customer's most recent transaction is counted once.",
    answers: { purpose: "association", categoricalVariables: "one" },
    diagram: "goodness-of-fit",
    why: "One categorical variable is compared with shares stated in advance, which is what the goodness-of-fit test does.",
    interpretation: "The test asks whether the counts depart from equal shares by more than chance would usually produce. It doesn't say which channels differ, or why; look at the gap between observed and expected counts in each category.",
    dataset: {
      caption: "Channel used by 120 customers (invented for illustration)",
      columns: ["Channel", "Observed", "Expected"],
      numeric: [false, true, true],
      rows: CHANNELS.map((channel, index) => [channel, CHANNEL_CHOICES[index], channelExpected[index]]),
    },
    summaries: [
      `Equal shares give 120 ÷ 4 = ${channelExpected[0]} expected customers per channel.`,
      `χ² = Σ (O − E)² ÷ E = ${fixed(chiSquareStatistic(CHANNEL_CHOICES, channelExpected), 2)}, with 3 degrees of freedom (four categories minus one).`,
    ],
  },
  correlation: {
    id: "correlation",
    method: "pearson",
    field: "Education research",
    question: "Is study time associated with examination score?",
    variables: [
      { name: "Study time", role: "First variable", level: "ratio", detail: "Hours of study per week." },
      { name: "Examination score", role: "Second variable", level: "interval", detail: "A score out of 100." },
    ],
    groups: "One group of students, each with a value on both variables.",
    structure: "Each student contributes one pair of values; no variable is treated as the outcome.",
    answers: { purpose: "relationship", outcomeLevel: "ratio", predictorLevel: "interval", normality: "yes" },
    diagram: "correlation",
    why: "Two quantitative variables are examined together for a straight-line relationship, which Pearson's correlation measures.",
    interpretation: "A positive correlation means that students who study more tend to score higher. It doesn't show that studying causes higher scores: ability or motivation could affect both.",
    dataset: {
      caption: "Study time and exam score for six students (invented for illustration)",
      columns: ["Student", "Study hours", "Exam score"],
      numeric: [true, true, true],
      rows: STUDY_HOURS.map((hours, index) => [index + 1, hours, EXAM_SCORES[index]]),
    },
    summaries: [`Pearson's r = ${fixed(pearson(STUDY_HOURS, EXAM_SCORES).r, 2)} for these six illustrative students: a strong positive straight-line relationship in this sample.`],
  },
  regression: {
    id: "regression",
    method: "simple-regression",
    field: "Education research",
    question: "Can examination score be predicted from study hours?",
    variables: [
      { name: "Study hours", role: "Predictor (independent variable)", level: "ratio", detail: "Hours of study per week." },
      { name: "Examination score", role: "Outcome (dependent variable)", level: "interval", detail: "A score out of 100." },
    ],
    groups: "One group of students.",
    structure: "Each student contributes one value of each variable; study hours predict the score.",
    answers: { purpose: "predict", outcomeLevel: "interval", predictors: "one", predictorLevel: "ratio" },
    diagram: "regression",
    why: "One quantitative predictor is used to estimate a quantitative outcome with a straight-line equation, which is simple linear regression.",
    interpretation: "The slope says how much the predicted score changes for each extra hour of study. It describes prediction in this sample, not the effect of making a student study more.",
    dataset: {
      caption: "The same six students as the correlation example (invented for illustration)",
      columns: ["Student", "Study hours", "Exam score"],
      numeric: [true, true, true],
      rows: STUDY_HOURS.map((hours, index) => [index + 1, hours, EXAM_SCORES[index]]),
    },
    summaries: [
      `Least-squares line: predicted score = ${fixed(line.intercept, 1)} + ${fixed(line.slope, 2)} × study hours.`,
      `So each extra hour of study goes with a predicted score about ${fixed(line.slope, 1)} points higher in these data. Correlation and regression use the same data but answer different questions: how strongly they go together, and what score to predict.`,
    ],
  },
  "one-way-anova": {
    id: "one-way-anova",
    method: "one-way-anova",
    field: "Education research",
    question: "Do mean scores differ across three teaching methods?",
    variables: [
      { name: "Teaching method", role: "Grouping variable (factor)", level: "nominal", detail: "Lecture, discussion or online." },
      { name: "Exam score", role: "Outcome (dependent variable)", level: "interval", detail: "A score out of 100." },
    ],
    groups: "Three groups: lecture, discussion and online.",
    structure: "Independent: each student is taught by one method only.",
    answers: { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "three-plus", secondFactor: "no", covariate: "no", normality: "yes" },
    diagram: "three-groups",
    why: "A quantitative outcome is compared across three independent groups in one test, which is what one-way ANOVA does.",
    interpretation: "A large F says the group means differ more than the variation within groups would lead you to expect. It doesn't say which groups differ: post hoc tests or planned comparisons answer that.",
    dataset: {
      caption: "Exam scores under three teaching methods (invented for illustration)",
      columns: ["Student", "Method", "Score"],
      numeric: [true, false, true],
      rows: longRows(TEACHING_GROUPS),
    },
    summaries: [
      ...TEACHING_GROUPS.map((group) => groupMean(group.label, group.values)),
      `Mean square between = ${fixed(teaching.between, 1)}; mean square within = ${fixed(teaching.within, 2)}; F = ${fixed(teaching.between, 1)} ÷ ${fixed(teaching.within, 2)} = ${fixed(teaching.f, 2)}, with ${teaching.dfBetween} and ${teaching.dfWithin} degrees of freedom.`,
    ],
  },
  "two-way-anova": {
    id: "two-way-anova",
    method: "two-way-anova",
    field: "Management research",
    question: "Do training method and experience level, separately and together, relate to sales performance?",
    variables: [
      { name: "Training method", role: "Factor A", level: "nominal", detail: "Online or classroom." },
      { name: "Experience level", role: "Factor B", level: "nominal", detail: "Junior or senior." },
      { name: "Sales performance", role: "Outcome (dependent variable)", level: "ratio", detail: "Units sold in a month." },
    ],
    groups: "Four combinations: online junior, online senior, classroom junior and classroom senior.",
    structure: "Independent: each salesperson is in one combination only.",
    answers: { purpose: "compare", comparison: "independent", outcomeLevel: "ratio", groups: "two", secondFactor: "yes", covariate: "no", normality: "yes" },
    diagram: "two-way",
    why: "Two grouping variables and one quantitative outcome are analysed together, including whether they interact, which is what two-way ANOVA does.",
    interpretation: "Two-way ANOVA tests three things: a difference between training methods, a difference between experience levels, and an interaction. An interaction means the effect of one factor depends on the other; when there is one, describe the effects within each level rather than relying on the overall main effects.",
    dataset: {
      caption: "Mean units sold in each combination (two salespeople per cell, invented for illustration)",
      columns: ["Training method", "Junior", "Senior"],
      numeric: [false, true, true],
      rows: [
        ["Online", cellMean("Online", "Junior"), cellMean("Online", "Senior")],
        ["Classroom", cellMean("Classroom", "Junior"), cellMean("Classroom", "Senior")],
      ],
    },
    summaries: [
      `For juniors, classroom training is ${cellMean("Classroom", "Junior") - cellMean("Online", "Junior")} units ahead of online training; for seniors, only ${cellMean("Classroom", "Senior") - cellMean("Online", "Senior")} units ahead.`,
      "Because the gap between methods changes with experience level, these illustrative means show an interaction pattern. Two-way ANOVA tests whether a pattern like this is larger than chance would usually produce.",
    ],
  },
  ancova: {
    id: "ancova",
    method: "ancova",
    field: "Education research",
    question: "Do final scores differ between two teaching methods after controlling for prior achievement?",
    variables: [
      { name: "Teaching method", role: "Grouping variable (factor)", level: "nominal", detail: "Method A or method B." },
      { name: "Prior achievement", role: "Covariate", level: "interval", detail: "A pretest score, measured before teaching began." },
      { name: "Final score", role: "Outcome (dependent variable)", level: "interval", detail: "A score out of 100." },
    ],
    groups: "Two groups, one per teaching method.",
    structure: "Independent: each student is taught by one method; the covariate was measured before the groups were taught.",
    answers: { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "two", secondFactor: "no", covariate: "yes", normality: "yes" },
    diagram: "ancova",
    why: "Groups are compared on a quantitative outcome while adjusting for a quantitative covariate, which is what ANCOVA does.",
    interpretation: "ANCOVA compares the groups' final scores as if they had started with the same prior achievement. Adjustment helps, but it can't make groups that differ in other ways truly comparable; random assignment does that.",
    dataset: {
      caption: "Prior achievement and final scores (invented for illustration)",
      columns: ["Student", "Method", "Prior achievement", "Final score"],
      numeric: [true, false, true, true],
      rows: ANCOVA_GROUPS.flatMap((group, g) => group.prior.map((prior, index) => [g * 3 + index + 1, group.label, prior, group.final[index]])),
    },
    summaries: [
      ...ANCOVA_GROUPS.map((group) => `${group.label}: mean prior achievement = ${fixed(mean(group.prior), 1)}; mean final score = ${fixed(mean(group.final), 1)}.`),
      `Method B's final mean is ${fixed(mean(ANCOVA_GROUPS[0].final) - mean(ANCOVA_GROUPS[1].final), 1)} points lower, but its students also started ${fixed(mean(ANCOVA_GROUPS[0].prior) - mean(ANCOVA_GROUPS[1].prior), 1)} points lower. ANCOVA asks whether the methods still differ once that starting gap is allowed for.`,
    ],
  },
};

export const getWorkedExample = (id: WorkedExampleId): WorkedExample => WORKED_EXAMPLES[id];
