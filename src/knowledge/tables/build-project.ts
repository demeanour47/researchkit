/**
 * Tables built from the project draft, so nothing already entered is asked for again:
 * the hypothesis summary, variable operationalisation, measurement scales, the
 * questionnaire's structure and the sample size determination. Whatever the project
 * doesn't record yet appears as a placeholder in brackets; nothing is invented.
 */

import type { DataTable } from "../charts/table";
import { recommendAnalyses } from "../research/data-analysis";
import { getAnalysisMethod } from "../research/data-analysis-types";
import { orderedQuestions, questionNumbers, sectionQuestions } from "../research/questionnaire";
import { buildQuestionnaire, questionnaireVariables } from "../research/questionnaire-builder";
import { QUESTION_TYPE_INFO, SECTION_KIND_INFO, type Question, type Questionnaire } from "../research/questionnaire-types";
import type { ResearchProjectDraft } from "../research/research-project";
import { significance } from "../research/results/significance";
import { calculateSampleSize } from "../research/sample-size";
import { getSampleSizeMethod } from "../research/sample-size-types";
import { inputProblems } from "../research/sample-size-validator";
import { getTechnique } from "../research/sampling-types";
import { TABLE_HEADINGS, variableRows } from "../research/variable-summary";
import { MEASUREMENT_LEVEL_INFO, VARIABLE_PLACEHOLDERS } from "../research/variable-types";
import { cellText, failed, finish, formatter, head, listNames, problem, row, warning, type BuildResult, type TableIssue } from "./build-common";
import { findColumn } from "./columns";
import { formatCount, formatNumber } from "./format";
import type { TableCell, TableOptions, TableRow } from "./types";

export const PLACEHOLDERS = {
  result: "[result]",
  analysis: "[analysis]",
  source: "[source]",
  population: "[target population]",
  technique: "[sampling technique]",
  section: "[section title]",
} as const;

// Hypothesis summary.

/** The hypothesis labels, H1, H2 and so on, in the order the project lists the alternative hypotheses. */
export const hypothesisLabel = (index: number) => `H${index + 1}`;

/** p-values from pasted rows such as “H1,0.003”, keyed by label in upper case. */
function pastedPValues(data: DataTable | null): Map<string, number> {
  const values = new Map<string, number>();
  if (!data) return values;
  const pColumn = findColumn(data, "p", new Set([0]));
  const column = pColumn >= 0 ? pColumn : data.columns.findIndex((candidate, index) => index > 0 && candidate.kind === "number");
  if (column < 0) return values;
  for (const values_ of data.rows) {
    const label = cellText(values_[0]).trim().toUpperCase();
    const p = values_[column];
    if (label && typeof p === "number") values.set(label, p);
  }
  return values;
}

export function hypothesisSummary(project: ResearchProjectDraft, data: DataTable | null, options: TableOptions): BuildResult {
  const hypotheses = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
  if (hypotheses.length === 0) return failed(problem("Your project has no hypotheses yet. Add the independent and dependent variables and choose a hypothesis form in the project details."));
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const plan = recommendAnalyses(project);
  const questions = plan.stages.flatMap((stage) => stage.questions);
  const pValues = pastedPValues(data);
  const labels = hypotheses.map((_, index) => hypothesisLabel(index));
  const unknown = [...pValues.keys()].filter((label) => !labels.includes(label));
  if (unknown.length > 0) issues.push(warning(`${listNames(unknown)} ${unknown.length === 1 ? "doesn't" : "don't"} match a hypothesis; the project's are ${listNames(labels)}.`));
  for (const [label, p] of pValues) if (p < 0 || p > 1) issues.push(problem(`The p-value for ${label} is ${p}; p-values lie between 0 and 1.`));
  const rows: TableRow[] = hypotheses.map((hypothesis, index) => {
    const question = questions.find((candidate) => candidate.hypothesis === hypothesis.text);
    const strong = question?.recommendations.filter((recommendation) => recommendation.strength === "strong") ?? [];
    const methods = (strong.length > 0 ? strong : (question?.recommendations ?? []).slice(0, 1)).map((recommendation) => getAnalysisMethod(recommendation.method).name);
    const p = pValues.get(labels[index]);
    const valid = p !== undefined && p >= 0 && p <= 1;
    const decision = valid ? (significance(p, options.alpha).status === "significant" ? "Supported" : "Not supported") : PLACEHOLDERS.result;
    return row([{ text: labels[index] }, { text: hypothesis.text }, { text: methods.length > 0 ? listNames(methods) : PLACEHOLDERS.analysis }, valid ? f.p(p) : { text: "" }, { text: decision }]);
  });
  const alpha = formatNumber(options.alpha, 2, { bounded: true, dropLeadingZero: f.dropLeadingZero });
  const general = [
    "Analyses are those the Data Analysis Recommender plans from your project.",
    pValues.size > 0
      ? `A hypothesis is marked supported when p < ${alpha}. Check that the effect is also in the predicted direction; significance alone doesn't show that.`
      : "Enter each hypothesis's p-value to fill in the decisions.",
  ];
  return { table: finish("hypothesis-summary", options, { header: [[head("Hypothesis"), head("Statement"), head("Analysis"), head("p"), head("Decision")]], rows, notes: { general } }), issues };
}

// Variable operationalisation.

export function operationalizationTable(project: ResearchProjectDraft, options: TableOptions): BuildResult {
  const variables = project.variables ?? [];
  if (variables.length === 0) return failed(problem("Your project has no variables yet. Add them in the project details."));
  const issues: TableIssue[] = [];
  const rows = variableRows(variables).map((variable) => row([variable.name, variable.kind, variable.conceptual, variable.operational, variable.indicators, variable.level, variable.scale].map((text): TableCell => ({ text }))));
  const placeholders = Object.values(VARIABLE_PLACEHOLDERS);
  if (rows.some((candidate) => candidate.cells.some((cell) => placeholders.includes(cell.text as never)))) issues.push(warning("Text in square brackets marks what your project doesn't record yet. Fill it in, here or in the Variables Builder."));
  if (options.orientation === "portrait") issues.push(warning("This table has seven columns; landscape orientation gives the definitions room."));
  return { table: finish("operationalization", options, { header: [TABLE_HEADINGS.map((heading) => head(heading))], rows, notes: {} }), issues };
}

// Measurement scales.

/** The project's questionnaire, or one drafted from its variables by the Questionnaire Builder's rules. */
function questionnaireFor(project: ResearchProjectDraft): { questionnaire: Questionnaire; drafted: boolean } {
  return project.questionnaire ? { questionnaire: project.questionnaire, drafted: false } : { questionnaire: buildQuestionnaire(project), drafted: true };
}

const itemCount = (question: Question) => (question.type === "matrix" ? Math.max(1, question.rows.length) : 1);

/** A question's response scale, such as “5-point (Strongly disagree to Strongly agree)”. */
function scaleText(question: Question): string {
  const labels = question.scale?.labels ?? [];
  if (labels.length >= 2) return `${labels.length}-point (${labels[0]} to ${labels[labels.length - 1]})`;
  return QUESTION_TYPE_INFO[question.type].label;
}

export function measurementScaleTable(project: ResearchProjectDraft, options: TableOptions): BuildResult {
  const variables = questionnaireVariables(project);
  if (variables.length === 0) return failed(problem("Your project has no variables yet. Add them in the project details."));
  const { questionnaire, drafted } = questionnaireFor(project);
  const rows = variables.map((variable) => {
    const questions = questionnaire.questions.filter((question) => question.variableId === variable.id);
    const items = questions.reduce((total, question) => total + itemCount(question), 0);
    const scales = [...new Set(questions.map(scaleText))];
    const scale = scales.length > 0 ? scales.join("; ") : variable.measurementScale.trim() || VARIABLE_PLACEHOLDERS.scale;
    const level = variable.measurementLevel ? MEASUREMENT_LEVEL_INFO[variable.measurementLevel].label : VARIABLE_PLACEHOLDERS.measurement;
    return row([{ text: variable.name }, items > 0 ? { text: formatCount(items), numeric: true } : { text: "" }, { text: scale }, { text: level }, { text: PLACEHOLDERS.source }]);
  });
  const general = [
    ...(drafted ? ["Item counts and scales come from a questionnaire drafted from your variables by the Questionnaire Builder's rules; update them to match your final questionnaire."] : []),
    "Replace [source] with where each scale was adopted or adapted from.",
  ];
  return { table: finish("measurement-scale", options, { header: [[head("Construct"), head("Items"), head("Response scale"), head("Measurement level"), head("Source")]], rows, notes: { general } }), issues: [] };
}

// Questionnaire structure.

export function questionnaireSummaryTable(project: ResearchProjectDraft, options: TableOptions): BuildResult {
  const variables = questionnaireVariables(project);
  if (!project.questionnaire && variables.length === 0) return failed(problem("Your project has no questionnaire or variables yet. Add variables in the project details to draft one."));
  const { questionnaire, drafted } = questionnaireFor(project);
  const numbers = questionNumbers(questionnaire);
  const names = new Map(variables.map((variable) => [variable.id, variable.name]));
  const rows: TableRow[] = [];
  for (const section of questionnaire.sections) {
    const questions = sectionQuestions(questionnaire, section.id);
    if (questions.length === 0) continue;
    const first = numbers.get(questions[0].id);
    const last = numbers.get(questions[questions.length - 1].id);
    const types = [...new Set(questions.map((question) => QUESTION_TYPE_INFO[question.type].label))];
    const measured = [...new Set(questions.map((question) => (question.variableId ? names.get(question.variableId) : undefined)).filter((name): name is string => Boolean(name)))];
    rows.push(
      row([
        { text: section.title.trim() || SECTION_KIND_INFO[section.kind]?.label || PLACEHOLDERS.section },
        { text: first === last ? `${first}` : `${first}–${last}`, numeric: true },
        { text: formatCount(questions.reduce((total, question) => total + itemCount(question), 0)), numeric: true },
        { text: types.join("; ") },
        { text: measured.length > 0 ? measured.join("; ") : "—" },
      ]),
    );
  }
  if (rows.length === 0) return failed(problem("The questionnaire has no questions yet."));
  const total = orderedQuestions(questionnaire).reduce((sum, question) => sum + itemCount(question), 0);
  const general = [`The questionnaire has ${formatCount(total)} ${total === 1 ? "item" : "items"}; a statement in a rating table counts as one item.`, ...(drafted ? ["Drafted from your variables by the Questionnaire Builder's rules; update it to match your final questionnaire."] : [])];
  return { table: finish("questionnaire-summary", options, { header: [[head("Section"), head("Questions"), head("Items"), head("Question types"), head("Variables measured")]], rows, notes: { general } }), issues: [] };
}

// Sample size determination.

const percent = (value: number) => `${formatNumber(value, value % 1 === 0 ? 0 : 1)}%`;

export function sampleSizeSummary(project: ResearchProjectDraft, options: TableOptions): BuildResult {
  const plan = project.sampleSizePlan;
  if (!plan) return failed(problem("Your project has no sample size plan yet. Choose a margin of error in the project details, or plan one in the Sample Size Calculator."));
  const problems = inputProblems(plan);
  if (problems.length > 0) return failed(problem(`The sample size plan can't be calculated: ${problems[0].message}`));
  const result = calculateSampleSize(plan);
  if (!result.available || result.required === null) return failed(problem(`${getSampleSizeMethod(plan.method).name} can't be calculated here yet; use the Sample Size Calculator's report.`));
  const inputs = plan.inputs;
  const technique = project.samplingPlan?.chosen ? getTechnique(project.samplingPlan.chosen).name : PLACEHOLDERS.technique;
  const population = project.samplingPlan?.population.targetPopulation.trim() || project.population?.trim() || PLACEHOLDERS.population;
  const entries: [string, string][] = [
    ["Target population", population],
    ["Sampling technique", technique],
    ["Method", getSampleSizeMethod(plan.method).name],
    ["Population size", inputs.populationType === "finite" && inputs.populationSize !== null ? formatCount(inputs.populationSize) : "Unknown (treated as large)"],
    ["Confidence level", percent(inputs.confidence)],
    ["Margin of error", `±${percent(inputs.margin)}`],
    ["Estimated proportion", percent(inputs.proportion)],
    ["Design effect", formatNumber(inputs.designEffect, inputs.designEffect % 1 === 0 ? 0 : 2)],
    ["Required sample", formatCount(result.required)],
    ...(result.adjusted !== null && result.adjusted !== result.required ? [["Sample after design effect", formatCount(result.adjusted)] as [string, string]] : []),
    ["Expected response rate", inputs.responseRate !== null ? percent(inputs.responseRate) : "Not estimated"],
    ...(result.invite !== null ? [["Number to invite", formatCount(result.invite)] as [string, string]] : []),
  ];
  const rows = entries.map(([parameter, value]) => row([{ text: parameter }, { text: value }]));
  const issues: TableIssue[] = [];
  if (technique === PLACEHOLDERS.technique || population === PLACEHOLDERS.population) issues.push(warning("Text in square brackets marks what your project doesn't record yet."));
  return {
    table: finish("sample-size-summary", options, { header: [[head("Parameter"), head("Value")]], rows, notes: { general: [`Calculated with the ${getSampleSizeMethod(plan.method).name}, as the Sample Size Calculator shows step by step.`] } }),
    issues,
  };
}
