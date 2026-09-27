/**
 * One entry point for every table: the type, the pasted text and the project go in; a
 * table and anything worth checking come out. Checks common to all tables run last.
 */

import { parseTable } from "../charts/table";
import type { ResearchProjectDraft } from "../research/research-project";
import { noteLetter } from "./caption";
import { failed, problem, warning, type BuildResult, type TableIssue } from "./build-common";
import { chiSquareTable, correlationMatrix, crossTabulation, demographicProfile, descriptiveStatistics, frequencyDistribution, percentageDistribution, reliability } from "./build-data";
import { captionList, customTable, referenceCoding, researchTimeline, tableOfContents } from "./build-entries";
import { hypothesisSummary, measurementScaleTable, operationalizationTable, questionnaireSummaryTable, sampleSizeSummary } from "./build-project";
import { anovaTable, coefficientTable, factorTable, modelSummary, regressionTable, validityTable } from "./build-results";
import { getTableType, type ResearchTable, type TableOptions, type TableType } from "./types";

export interface TableInput {
  type: TableType;
  /** The pasted or typed text. Ignored by tables built only from the project. */
  text: string;
  project: ResearchProjectDraft;
  options: TableOptions;
}

function dispatch({ type, text, project, options }: TableInput): BuildResult {
  const data = () => parseTable(text).table;
  switch (type) {
    case "table-of-contents":
      return tableOfContents(text, options);
    case "list-of-tables":
    case "list-of-figures":
      return captionList(type, text, options);
    case "demographic-profile":
      return demographicProfile(data(), options);
    case "frequency":
      return frequencyDistribution(data(), options);
    case "percentage":
      return percentageDistribution(data(), options);
    case "cross-tabulation":
      return crossTabulation(data(), options);
    case "descriptive-statistics":
      return descriptiveStatistics(data(), options);
    case "reliability":
      return reliability(data(), options);
    case "validity":
      return validityTable(data(), options);
    case "factor-analysis":
      return factorTable(data(), options);
    case "correlation-matrix":
      return correlationMatrix(data(), options);
    case "regression":
      return regressionTable(data(), options);
    case "model-summary":
      return modelSummary(data(), options);
    case "coefficients":
      return coefficientTable(data(), options);
    case "anova":
      return anovaTable(data(), options);
    case "chi-square":
      return chiSquareTable(data(), options);
    case "hypothesis-summary":
      return hypothesisSummary(project, text.trim() ? data() : null, options);
    case "operationalization":
      return operationalizationTable(project, options);
    case "measurement-scale":
      return measurementScaleTable(project, options);
    case "questionnaire-summary":
      return questionnaireSummaryTable(project, options);
    case "sample-size-summary":
      return sampleSizeSummary(project, options);
    case "research-timeline":
      return researchTimeline(text, options);
    case "reference-coding":
      return referenceCoding(text, options);
    case "appendix":
    case "custom":
      return customTable(type, text, options);
  }
}

/** Checks every table gets, whatever its type. */
export function tableIssues(table: ResearchTable, options: TableOptions): TableIssue[] {
  const issues: TableIssue[] = [];
  const marks = new Set(table.rows.flatMap((candidate) => candidate.cells.flatMap((cell) => cell.notes ?? [])));
  const defined = new Set([
    ...table.notes.specific.map((note) => note.mark),
    ...options.footnotes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((_, index) => noteLetter(table.notes.specific.length + index)),
  ]);
  const undefinedMarks = [...marks].filter((mark) => !defined.has(mark)).sort();
  if (undefinedMarks.length > 0) issues.push(warning(`Note ${undefinedMarks.map((mark) => `“${mark}”`).join(", ")} is marked in the table but has no text. Add one line per note under Footnotes, in letter order.`));
  // Timelines check their own width, month by month.
  if (table.columns > 9 && options.orientation === "portrait" && table.type !== "research-timeline") issues.push(warning(`${table.columns} columns may not fit a portrait page; try landscape or a smaller font.`));
  if (table.rows.length > 40) issues.push(warning(`With ${table.rows.length} rows the table will run over pages; its header repeats${options.repeatHeader ? "" : " once you turn on continuation"}.`));
  if (options.title.trim().length > 150) issues.push(warning("The title is long. Keep it brief; details belong in the notes."));
  return issues;
}

/** Builds any table, with its type's checks followed by the checks every table gets. */
export function buildTable(input: TableInput): BuildResult {
  getTableType(input.type);
  if (!(input.options.decimals >= 0 && input.options.decimals <= 6)) return failed(problem("Decimal places must be between 0 and 6."));
  const result = dispatch(input);
  if (!result.table) return result;
  return { table: result.table, issues: [...result.issues, ...tableIssues(result.table, input.options)] };
}

export const canShow = (result: BuildResult) => result.table !== null;
