/**
 * Whether a table can draw a chart, and what to watch. Problems stop the chart; warnings
 * don't, but explain a choice readers may find misleading, following common guidance on
 * chart design. Every message says how to fix it.
 */

import { boxData, categoryData, histogramData, meanData, pointData } from "./data";
import { CHART_TYPE_INFO, getChartType, type ChartOptions, type ChartType } from "./types";
import type { DataTable } from "./table";

export interface ChartIssue {
  severity: "problem" | "warning";
  message: string;
}

/** The most series any chart shows: the validated palette has eight colours, and more can't be told apart. */
export const MAX_SERIES = 8;
/** The most parts a pie or doughnut shows well. */
export const MAX_PIE_PARTS = 6;

const problem = (message: string): ChartIssue => ({ severity: "problem", message });
const warning = (message: string): ChartIssue => ({ severity: "warning", message });

export function chartIssues(table: DataTable, options: Pick<ChartOptions, "type" | "sort" | "percentages">): ChartIssue[] {
  const type: ChartType = options.type;
  const info = getChartType(type);
  const issues: ChartIssue[] = [];
  const numeric = table.columns.filter((column) => column.kind === "number");
  if (table.rows.length === 0) return [problem("Enter or paste some data.")];

  if (options.sort !== "none" && !info.sortable) issues.push(warning(`${info.label}s keep the order of the data, because the order carries meaning; sorting is ignored.`));

  switch (info.shape) {
    case "category-value":
    case "category-series":
    case "two-sides":
    case "likert": {
      const data = categoryData(table);
      if (data.series.length === 0) {
        issues.push(problem(`${info.layout} No numeric column was found after the first column.`));
        break;
      }
      const series = data.series;
      if (data.categories.length === 0) issues.push(problem("The first column needs category names."));
      if (info.shape === "category-value" && series.length > 1) issues.push(warning(`Only the first numeric column, “${series[0].name}”, is drawn; a ${info.label.toLowerCase()} shows one series.`));
      if (info.shape === "two-sides" && series.length !== 2) issues.push(problem("A population pyramid needs exactly two numeric columns: the left group and the right group."));
      if (info.shape === "likert" && series.length < 2) issues.push(problem("A Likert chart needs at least two response levels, one column each."));
      if (info.shape === "likert" && series.length > 9) issues.push(problem("A Likert chart shows at most nine response levels, four either side of a neutral middle."));
      if (series.length > MAX_SERIES) issues.push(problem(`There are ${series.length} series, but only ${MAX_SERIES} can be told apart. Combine the smallest into “Other”, or split the chart.`));
      const values = (info.shape === "category-value" ? series.slice(0, 1) : series).flatMap((item) => item.values).filter((value): value is number => value !== null);
      const negative = values.some((value) => value < 0);
      if (negative && ["pie", "doughnut", "stacked-bar", "stacked-bar-100", "pareto", "population-pyramid", "likert"].includes(type)) issues.push(problem(`${info.label}s need values of zero or more; negative values can't be shown as parts.`));
      if ((type === "pie" || type === "doughnut") && data.categories.length > MAX_SERIES) issues.push(problem(`A pie or doughnut can show at most ${MAX_SERIES} parts, because more colours can't be told apart; there are ${data.categories.length}. Combine the smallest parts into “Other”, or use a bar chart.`));
      else if ((type === "pie" || type === "doughnut") && data.categories.length > MAX_PIE_PARTS) issues.push(warning(`Pie and doughnut charts are hard to read with more than ${MAX_PIE_PARTS} parts; there are ${data.categories.length}. Consider a bar chart, or combine small parts into “Other”.`));
      if ((type === "pie" || type === "doughnut") && data.categories.length === 2) issues.push(warning("With only two parts, stating the two percentages is usually clearer than a chart."));
      if ((type === "pie" || type === "doughnut") && values.length > 0 && values.every((value) => value === 0)) issues.push(problem("Every value is zero, so there is no whole to divide."));
      if ((type === "bar" || type === "horizontal-bar") && data.categories.length === 1) issues.push(warning("A chart with one bar adds little; consider stating the number."));
      if (type === "radar" && data.categories.length < 3) issues.push(problem("A radar chart needs at least three dimensions."));
      if (type === "radar" && series.length > 3) issues.push(warning("Radar charts become hard to read with more than three profiles; consider a grouped bar chart."));
      if ((type === "line" || type === "multi-line" || type === "area") && data.categories.length < 2) issues.push(problem("A line needs at least two points."));
      if (type === "line" && series.length > 1) issues.push(warning("A line graph shows one series; for several, choose a multiple line graph."));
      if (type === "multi-line" && series.length === 1) issues.push(warning("There is one series; a line graph is enough."));
      if (options.percentages && ["line", "multi-line", "area", "radar"].includes(type)) issues.push(warning("Percentage labels apply to parts of a whole, so they aren't shown on this chart."));
      if (values.length === 0) issues.push(problem("The numeric columns have no numbers."));
      break;
    }
    case "values": {
      if (numeric.length === 0) {
        issues.push(problem(`${info.layout} No numeric column was found.`));
        break;
      }
      if (type === "box-plot") {
        const groups = boxData(table).groups;
        if (groups.length > MAX_SERIES) issues.push(problem(`There are ${groups.length} groups, but only ${MAX_SERIES} can be shown clearly. Split the chart.`));
        for (const group of groups.filter((candidate) => candidate.n < 5)) issues.push(warning(`“${group.name}” has only ${group.n} ${group.n === 1 ? "value" : "values"}; a box plot needs more to describe a distribution. Consider showing the individual values.`));
      } else {
        const histogram = histogramData(table);
        if (numeric.length > 1) issues.push(warning(`Only the first numeric column, “${histogram.name}”, is drawn.`));
        if (histogram.n < 10) issues.push(warning(`With ${histogram.n} ${histogram.n === 1 ? "value" : "values"}, a ${info.label.toLowerCase()} says little about the distribution's shape.`));
      }
      break;
    }
    case "xy":
    case "xyz": {
      const needed = info.shape === "xyz" ? 3 : 2;
      if (numeric.length < needed) {
        issues.push(problem(`${info.layout} Found ${numeric.length} numeric ${numeric.length === 1 ? "column" : "columns"}.`));
        break;
      }
      const data = pointData(table, info.shape === "xyz");
      if (data.points.length === 0) issues.push(problem("No row has all the numbers needed for a point."));
      if (info.shape === "xyz" && data.points.some((point) => (point.size ?? 0) < 0)) issues.push(problem("Bubble sizes must be zero or more."));
      if (data.points.length > 0 && data.points.length < 5) issues.push(warning(`With ${data.points.length} points, a pattern is hard to judge.`));
      if (numeric.length > needed) issues.push(warning(`Only the first ${needed} numeric columns are drawn.`));
      break;
    }
    case "mean-error": {
      const data = meanData(table);
      if (numeric.length === 0 || data.groups.length === 0) {
        issues.push(problem(`${info.layout} No group with a numeric value was found.`));
        break;
      }
      if (type === "error-bar" && data.groups.some((group) => group.error === null)) issues.push(problem("An error bar chart needs an error margin for every group, in the third column."));
      if (type === "mean-comparison" && data.errorName === null) issues.push(warning("Without error margins, readers can't judge whether the means differ reliably. Add standard errors or confidence interval margins."));
      if (data.errorName !== null) issues.push(warning(`Say in the caption what the error bars show: “${data.errorName}”, such as ±1 standard error or a 95% confidence interval.`));
      if (data.groups.length > MAX_SERIES * 2) issues.push(warning(`There are ${data.groups.length} groups; consider splitting the chart.`));
      break;
    }
  }
  return issues;
}

export const canDraw = (issues: readonly ChartIssue[]) => !issues.some((issue) => issue.severity === "problem");

/** Chart types whose data shape the table already fits, so the choice can be narrowed. */
export function fittingTypes(table: DataTable): ChartType[] {
  return (Object.keys(CHART_TYPE_INFO) as ChartType[]).filter((type) => canDraw(chartIssues(table, { type, sort: "none", percentages: false })));
}
