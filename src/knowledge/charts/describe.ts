/**
 * Text alternatives for charts: a short description for screen readers and alt text,
 * a summary of what the chart shows, and the data as a table. A chart must never be
 * the only way to reach its numbers.
 */

import { likertData, paretoData, type CategoryData, type ChartData } from "./data";
import { decimalsIn, formatValue } from "./scales";
import { CHART_TYPE_INFO, type ChartOptions } from "./types";

export interface TableView {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface ChartText {
  /** A one-sentence description, for alt text. */
  alt: string;
  /** A few sentences on what the chart shows, for readers who can't see it. */
  summary: string;
  table: TableView;
}

const list = (items: readonly string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
/** A value with the decimals it actually has, up to the maximum, so the text and table never round away detail or add false precision. */
const fmt = (value: number | null, maximum: number) => (value === null ? "–" : formatValue(value, decimalsIn([value], maximum)));

function extremes(data: CategoryData, decimals: number): string {
  const series = data.series[0];
  const present = data.categories.map((category, index) => ({ category, value: series.values[index] })).filter((entry): entry is { category: string; value: number } => entry.value !== null);
  if (present.length < 2) return "";
  const highest = present.reduce((best, entry) => (entry.value > best.value ? entry : best));
  const lowest = present.reduce((best, entry) => (entry.value < best.value ? entry : best));
  return ` The highest is ${highest.category} (${fmt(highest.value, decimals)}) and the lowest is ${lowest.category} (${fmt(lowest.value, decimals)}).`;
}

/** The chart's text alternatives, from the data it draws. */
export function describeChart(data: ChartData, options: Pick<ChartOptions, "type" | "title" | "labelDecimals">): ChartText {
  const info = CHART_TYPE_INFO[options.type];
  const name = options.title.trim() || info.label;
  const decimals = Math.max(options.labelDecimals ?? 0, 2);
  const caption = `Data for ${name}`;
  // “Bar chart: Enrolment by faculty, …”, or just “Bar chart, …” when there's no title to add.
  const lead = name === info.label ? `${info.label}, ` : `${info.label}: ${name}, `;
  switch (data.kind) {
    case "category": {
      const series = CHART_TYPE_INFO[options.type].shape === "category-value" ? data.series.slice(0, 1) : data.series;
      const table: TableView = { caption, columns: ["Category", ...series.map((item) => item.name)], rows: data.categories.map((category, index) => [category, ...series.map((item) => fmt(item.values[index], decimals))]) };
      if (options.type === "pareto") {
        const shares = paretoData(data);
        const eighty = shares.cumulative.findIndex((value) => value >= 80 - 1e-9) + 1;
        return {
          alt: `${lead}${shares.categories.length} categories in descending order.`,
          summary: `${shares.categories[0]} is the largest category, with ${formatValue(shares.percentages[0] ?? 0, 1, true)} of the total. The first ${eighty} ${eighty === 1 ? "category accounts" : "categories account"} for at least 80% of the total.`,
          table: { caption, columns: ["Category", "Count", "Percentage", "Cumulative percentage"], rows: shares.categories.map((category, index) => [category, fmt(shares.counts[index], decimals), formatValue(shares.percentages[index], 1, true), formatValue(shares.cumulative[index], 1, true)]) },
        };
      }
      if (options.type === "likert") {
        const layout = likertData(data);
        const half = Math.floor(layout.levels.length / 2);
        const agreement = layout.rows.map((row) => ({ item: row.item, positive: row.percentages.slice(layout.levels.length - half).reduce((a, b) => a + b, 0) }));
        const most = agreement.reduce((best, entry) => (entry.positive > best.positive ? entry : best), agreement[0]);
        return {
          alt: `${lead}${layout.rows.length} items rated on ${layout.levels.length} levels from ${layout.levels[0]} to ${layout.levels[layout.levels.length - 1]}.`,
          summary: most ? `“${most.item}” has the most positive responses: ${formatValue(most.positive, 1, true)} in the top ${half} ${half === 1 ? "level" : "levels"}.` : "",
          table: { caption, columns: ["Item", ...layout.levels.map((level) => `${level} (%)`)], rows: layout.rows.map((row) => [row.item, ...row.percentages.map((value) => formatValue(value, 1))]) },
        };
      }
      const seriesText = series.length === 1 ? "" : ` for ${list(series.map((item) => item.name))}`;
      return {
        alt: `${lead}showing ${data.categories.length} ${data.categories.length === 1 ? "category" : "categories"}${seriesText}.`,
        summary: `${info.description}${series.length === 1 ? extremes({ ...data, series }, decimals) : ` It compares ${list(series.map((item) => item.name))} across ${list(data.categories)}.`}`,
        table,
      };
    }
    case "histogram":
      return {
        alt: `${lead}the distribution of ${data.name} for ${data.n} values in ${data.bins.length} intervals.`,
        summary: data.bins.length > 0 ? `The most frequent interval is ${fmt(data.bins.reduce((best, bin) => (bin.count > best.count ? bin : best)).from, decimals)} to under ${fmt(data.bins.reduce((best, bin) => (bin.count > best.count ? bin : best)).to, decimals)}. Each interval is ${fmt(data.width, decimals)} wide.` : "There are no values.",
        table: { caption, columns: ["From", "To (under)", "Count"], rows: data.bins.map((bin) => [fmt(bin.from, decimals), fmt(bin.to, decimals), String(bin.count)]) },
      };
    case "box":
      return {
        alt: `${lead}comparing ${data.groups.length} ${data.groups.length === 1 ? "group" : "groups"}: ${list(data.groups.map((group) => group.name))}.`,
        summary: data.groups.map((group) => `${group.name}: median ${fmt(group.median, decimals)}, quartiles ${fmt(group.q1, decimals)} to ${fmt(group.q3, decimals)}${group.outliers.length > 0 ? `, ${group.outliers.length} ${group.outliers.length === 1 ? "outlier" : "outliers"}` : ""}.`).join(" "),
        table: { caption, columns: ["Group", "N", "Minimum", "Q1", "Median", "Q3", "Maximum", "Outliers"], rows: data.groups.map((group) => [group.name, String(group.n), fmt(group.min, decimals), fmt(group.q1, decimals), fmt(group.median, decimals), fmt(group.q3, decimals), fmt(group.max, decimals), group.outliers.map((value) => fmt(value, decimals)).join(", ") || "None"]) },
      };
    case "points": {
      const xs = data.points.map((point) => point.x);
      const ys = data.points.map((point) => point.y);
      const range = (values: number[]) => (values.length > 0 ? `from ${fmt(Math.min(...values), decimals)} to ${fmt(Math.max(...values), decimals)}` : "with no values");
      return {
        alt: `${lead}${data.points.length} points of ${data.yName} against ${data.xName}${data.sizeName ? `, sized by ${data.sizeName}` : ""}.`,
        summary: `${data.xName} ranges ${range(xs)}; ${data.yName} ranges ${range(ys)}.`,
        table: { caption, columns: [...(data.points.some((point) => point.label) ? ["Label"] : []), data.xName, data.yName, ...(data.sizeName ? [data.sizeName] : [])], rows: data.points.map((point) => [...(data.points.some((candidate) => candidate.label) ? [point.label ?? ""] : []), fmt(point.x, decimals), fmt(point.y, decimals), ...(data.sizeName ? [fmt(point.size, decimals)] : [])]) },
      };
    }
    case "means":
      return {
        alt: `${lead}${data.valueName} for ${data.groups.length} ${data.groups.length === 1 ? "group" : "groups"}${data.errorName ? ` with error bars showing ${data.errorName}` : ""}.`,
        summary: data.groups.map((group) => `${group.name}: ${fmt(group.value, decimals)}${group.error !== null ? ` ± ${fmt(group.error, decimals)}` : ""}.`).join(" "),
        table: { caption, columns: ["Group", data.valueName, ...(data.errorName ? [data.errorName] : [])], rows: data.groups.map((group) => [group.name, fmt(group.value, decimals), ...(data.errorName ? [fmt(group.error, decimals)] : [])]) },
      };
  }
}
