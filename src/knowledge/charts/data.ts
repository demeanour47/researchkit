/**
 * The numbers each chart draws, taken from the table by its data shape, with the
 * transformations some charts need: sorting, percentages, histogram bins, box plot
 * statistics, Pareto shares, Likert percentages and error margins. Methods are stated
 * beside each calculation, because different software makes different choices.
 */

import { CHART_TYPE_INFO, type ChartType, type SortOrder } from "./types";
import type { Cell, DataTable } from "./table";

export interface Series {
  name: string;
  values: (number | null)[];
}

/** Categories (row labels) with one or more numeric series. */
export interface CategoryData {
  kind: "category";
  categories: string[];
  series: Series[];
}

export interface HistogramBin {
  from: number;
  to: number;
  count: number;
}

export interface HistogramData {
  kind: "histogram";
  name: string;
  bins: HistogramBin[];
  width: number;
  n: number;
}

export interface BoxStats {
  name: string;
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Whisker ends: the most extreme values within 1.5 × IQR of the box. */
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
}

export interface BoxData {
  kind: "box";
  groups: BoxStats[];
}

export interface Point {
  x: number;
  y: number;
  size: number | null;
  label: string | null;
}

export interface PointData {
  kind: "points";
  xName: string;
  yName: string;
  sizeName: string | null;
  points: Point[];
}

export interface MeanData {
  kind: "means";
  valueName: string;
  errorName: string | null;
  groups: { name: string; value: number; error: number | null }[];
}

export type ChartData = CategoryData | HistogramData | BoxData | PointData | MeanData;

const label = (cell: Cell) => (cell === null ? "" : String(cell));
const numbers = (table: DataTable, column: number): number[] => table.rows.map((row) => row[column]).filter((value): value is number => typeof value === "number");

/** The first column as categories, and every later numeric column as a series. Rows without a category are dropped. */
export function categoryData(table: DataTable): CategoryData {
  const rows = table.rows.filter((row) => label(row[0]).trim() !== "");
  const series = table.columns
    .map((column, index) => ({ column, index }))
    .slice(1)
    .filter(({ column }) => column.kind === "number")
    .map(({ column, index }) => ({ name: column.name, values: rows.map((row) => (typeof row[index] === "number" ? (row[index] as number) : null)) }));
  return { kind: "category", categories: rows.map((row) => label(row[0])), series };
}

const total = (values: readonly (number | null)[]) => values.reduce<number>((sum, value) => sum + (value ?? 0), 0);

/** Rows sorted by their total across series. Ties keep their original order. */
export function sortCategories(data: CategoryData, order: SortOrder): CategoryData {
  if (order === "none") return data;
  const totals = data.categories.map((_, index) => total(data.series.map((series) => series.values[index])));
  const indexes = data.categories.map((_, index) => index).sort((a, b) => (order === "ascending" ? totals[a] - totals[b] : totals[b] - totals[a]) || a - b);
  return { ...data, categories: indexes.map((index) => data.categories[index]), series: data.series.map((series) => ({ ...series, values: indexes.map((index) => series.values[index]) })) };
}

/** Each category's values as percentages of that category's total, for 100% stacked bars. A zero total gives zeros. */
export function percentOfRow(data: CategoryData): CategoryData {
  return {
    ...data,
    series: data.series.map((series) => ({
      ...series,
      values: series.values.map((value, index) => {
        const rowTotal = total(data.series.map((candidate) => candidate.values[index]));
        return value === null ? null : rowTotal === 0 ? 0 : (value / rowTotal) * 100;
      }),
    })),
  };
}

/** Each value as a percentage of its series' total, for pie charts and percentage labels. */
export function percentOfSeries(values: readonly (number | null)[]): (number | null)[] {
  const sum = total(values);
  return values.map((value) => (value === null ? null : sum === 0 ? 0 : (value / sum) * 100));
}

/** A number rounded up to 1, 2 or 5 times a power of ten, the steps charts read most easily. */
export function niceStep(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Histogram bins. The number of bins follows Sturges' rule (1 + log2 n, rounded up);
 * the width is then rounded to a nice step, and bins start at a multiple of it. Each
 * bin includes its lower edge; the last also includes its upper edge.
 */
export function histogramData(table: DataTable, column = firstNumeric(table)): HistogramData {
  const values = numbers(table, column);
  const name = table.columns[column]?.name ?? "Value";
  if (values.length === 0) return { kind: "histogram", name, bins: [], width: 1, n: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const count = Math.ceil(Math.log2(values.length) + 1);
  const width = min === max ? niceStep(Math.abs(min) || 1) : niceStep((max - min) / count);
  const start = Math.floor(min / width) * width;
  const binCount = Math.max(1, Math.floor((max - start) / width) + 1);
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, index) => ({ from: round(start + index * width), to: round(start + (index + 1) * width), count: 0 }));
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.floor((value - start) / width + 1e-9));
    bins[index].count++;
  }
  return { kind: "histogram", name, bins, width, n: values.length };
}

const round = (value: number) => Math.round(value * 1e9) / 1e9;
const firstNumeric = (table: DataTable) => Math.max(0, table.columns.findIndex((column) => column.kind === "number"));

/** A quantile by linear interpolation between order statistics (the method of Excel's QUARTILE.INC and R's default). */
export function quantile(sorted: readonly number[], probability: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

/** Box plot statistics for each numeric column: quartiles by linear interpolation, and Tukey's whiskers at 1.5 × IQR. */
export function boxData(table: DataTable): BoxData {
  const groups = table.columns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => column.kind === "number")
    .map(({ column, index }): BoxStats | null => {
      const sorted = numbers(table, index).sort((a, b) => a - b);
      if (sorted.length === 0) return null;
      const q1 = quantile(sorted, 0.25);
      const q3 = quantile(sorted, 0.75);
      const fence = 1.5 * (q3 - q1);
      const inside = sorted.filter((value) => value >= q1 - fence && value <= q3 + fence);
      return {
        name: column.name,
        n: sorted.length,
        min: sorted[0],
        q1,
        median: quantile(sorted, 0.5),
        q3,
        max: sorted[sorted.length - 1],
        lowerWhisker: inside[0],
        upperWhisker: inside[inside.length - 1],
        outliers: sorted.filter((value) => value < q1 - fence || value > q3 + fence),
      };
    })
    .filter((group): group is BoxStats => group !== null);
  return { kind: "box", groups };
}

/** Points from the first two (or, for bubbles, three) numeric columns; a text first column labels them. */
export function pointData(table: DataTable, withSize: boolean): PointData {
  const numeric = table.columns.map((column, index) => ({ column, index })).filter(({ column }) => column.kind === "number");
  const [x, y, size] = numeric;
  const labelColumn = table.columns[0]?.kind === "text" ? 0 : null;
  const points = table.rows
    .filter((row) => typeof row[x?.index ?? -1] === "number" && typeof row[y?.index ?? -1] === "number" && (!withSize || typeof row[size?.index ?? -1] === "number"))
    .map((row) => ({ x: row[x.index] as number, y: row[y.index] as number, size: withSize ? (row[size.index] as number) : null, label: labelColumn === null ? null : label(row[labelColumn]) || null }));
  return { kind: "points", xName: x?.column.name ?? "x", yName: y?.column.name ?? "y", sizeName: withSize ? (size?.column.name ?? null) : null, points };
}

/** Groups with a value and an optional error margin, from the first text column and the first two numeric columns. */
export function meanData(table: DataTable): MeanData {
  const numeric = table.columns.map((column, index) => ({ column, index })).filter(({ column }) => column.kind === "number");
  const [value, error] = numeric;
  const groups = table.rows
    .filter((row) => label(row[0]).trim() !== "" && typeof row[value?.index ?? -1] === "number")
    .map((row) => ({ name: label(row[0]), value: row[value.index] as number, error: error && typeof row[error.index] === "number" ? Math.abs(row[error.index] as number) : null }));
  return { kind: "means", valueName: value?.column.name ?? "Value", errorName: error?.column.name ?? null, groups };
}

/** Pareto shares: categories in descending order, each as a percentage of the total, with the running cumulative percentage. */
export function paretoData(data: CategoryData): { categories: string[]; percentages: number[]; cumulative: number[]; counts: number[] } {
  const sorted = sortCategories({ ...data, series: data.series.slice(0, 1) }, "descending");
  const counts = sorted.series[0]?.values.map((value) => value ?? 0) ?? [];
  const sum = counts.reduce((a, b) => a + b, 0);
  const percentages = counts.map((value) => (sum === 0 ? 0 : (value / sum) * 100));
  let running = 0;
  const cumulative = percentages.map((value) => (running += value));
  return { categories: sorted.categories, percentages, cumulative, counts };
}

export interface LikertRow {
  item: string;
  /** Each level's percentage of the item's responses, in level order. */
  percentages: number[];
  /** Where each level's segment starts and ends, as percentages; negative levels left of zero. */
  segments: { from: number; to: number }[];
  total: number;
}

/**
 * Diverging Likert layout: each item's responses as percentages, placed so negative
 * levels lie left of zero and positive ones right. With an odd number of levels, the
 * middle (neutral) level is split evenly across zero, a common convention.
 */
export function likertData(data: CategoryData): { levels: string[]; rows: LikertRow[] } {
  const levels = data.series.map((series) => series.name);
  const middle = levels.length % 2 === 1 ? (levels.length - 1) / 2 : null;
  const negativeCount = Math.floor(levels.length / 2);
  const rows = data.categories.map((item, row) => {
    const counts = data.series.map((series) => series.values[row] ?? 0);
    const sum = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map((count) => (sum === 0 ? 0 : (count / sum) * 100));
    const leftOfZero = percentages.slice(0, negativeCount).reduce((a, b) => a + b, 0) + (middle !== null ? percentages[middle] / 2 : 0);
    let position = -leftOfZero;
    const segments = percentages.map((percentage) => {
      const segment = { from: position, to: position + percentage };
      position += percentage;
      return segment;
    });
    return { item, percentages, segments, total: sum };
  });
  return { levels, rows };
}

/** The data a chart type draws, taken from the table by its shape. */
export function chartData(table: DataTable, type: ChartType, sort: SortOrder = "none"): ChartData {
  const shape = CHART_TYPE_INFO[type].shape;
  switch (shape) {
    case "values":
      return type === "box-plot" ? boxData(table) : histogramData(table);
    case "xy":
      return pointData(table, false);
    case "xyz":
      return pointData(table, true);
    case "mean-error": {
      const data = meanData(table);
      if (!CHART_TYPE_INFO[type].sortable || sort === "none") return data;
      const groups = [...data.groups].sort((a, b) => (sort === "ascending" ? a.value - b.value : b.value - a.value));
      return { ...data, groups };
    }
    default: {
      const data = categoryData(table);
      return CHART_TYPE_INFO[type].sortable ? sortCategories(data, sort) : data;
    }
  }
}
