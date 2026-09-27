/**
 * Tables summarised from raw data, one row per participant: demographic profiles,
 * frequency and percentage distributions, cross-tabulations, descriptive statistics,
 * correlation matrices, reliability and chi-square tests. Every number is calculated
 * here; methods are stated in each table's notes.
 */

import { histogramData } from "../charts/data";
import type { DataTable } from "../charts/table";
import {
  columnValues,
  failed,
  finish,
  formatter,
  groupRow,
  head,
  levelsUsed,
  listNames,
  numberValues,
  orderCategories,
  plural,
  problem,
  row,
  textValues,
  warning,
  type BuildResult,
  type TableIssue,
} from "./build-common";
import { formatCount, formatNumber, stars } from "./format";
import { chiSquareTest, cronbachAlpha, kurtosis, mean, pearson, skewness, spearman, standardDeviation } from "./stats";
import type { TableCell, TableOptions, TableRow } from "./types";

/** Categories with more distinct values than this are probably identifiers or free text. */
const MANY_CATEGORIES = 15;

const needRows = (table: DataTable): TableIssue | null => (table.rows.length === 0 ? problem("Paste or type your data, one row per participant, with names in the first row.") : null);

/** Counts of each category in a column, in order. */
function countsOf(table: DataTable, column: number): { categories: string[]; counts: number[]; valid: number; missing: number } {
  const values = textValues(table, column);
  const categories = orderCategories(values);
  return { categories, counts: categories.map((category) => values.filter((value) => value === category).length), valid: values.length, missing: table.rows.length - values.length };
}

// Demographic profile.

export function demographicProfile(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const total = table.rows.length;
  const rows: TableRow[] = [];
  table.columns.forEach((column, index) => {
    const { categories, counts, missing } = countsOf(table, index);
    if (categories.length === 0) {
      issues.push(warning(`“${column.name}” has no responses, so it is left out.`));
      return;
    }
    if (categories.length > MANY_CATEGORIES) issues.push(warning(`“${column.name}” has ${categories.length} categories. Group them, such as ages into bands, for a readable profile.`));
    rows.push(groupRow(column.name, 3));
    categories.forEach((category, position) => rows.push(row([{ text: category, indent: 1 }, f.count(counts[position]), f.percent((counts[position] / total) * 100)])));
    if (missing > 0) rows.push(row([{ text: "Missing", indent: 1 }, f.count(missing), f.percent((missing / total) * 100)]));
  });
  if (rows.length === 0) return failed(problem("No characteristic has any responses."), ...issues);
  return { table: finish("demographic-profile", options, { header: [[head("Characteristic"), head("n"), head("%")]], rows, notes: { general: [`N = ${formatCount(total)}.`] } }), issues };
}

// Frequency distribution.

/** A label for a class interval: “10–19” for whole numbers, “10.0 to < 12.5” otherwise. */
export function intervalLabel(from: number, to: number, integers: boolean, decimals: number): string {
  if (integers && Number.isInteger(from) && Number.isInteger(to)) return to - from === 1 ? formatNumber(from, 0) : `${formatNumber(from, 0)}–${formatNumber(to - 1, 0)}`;
  return `${formatNumber(from, decimals)} to < ${formatNumber(to, decimals)}`;
}

export function frequencyDistribution(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  if (table.columns.length > 1) issues.push(warning(`Only the first column, “${table.columns[0].name}”, is tabulated. Use a demographic profile or percentage distribution for several.`));
  const column = table.columns[0];
  const total = table.rows.length;
  let labels: string[];
  let counts: number[];
  let valid: number;
  const notes: string[] = [];
  const numbers = numberValues(table, 0);
  const distinct = new Set(numbers).size;
  if (column.kind === "number" && distinct > MANY_CATEGORIES) {
    // Many different numbers: group them into class intervals, sized as a histogram would be.
    const bins = histogramData(table, 0);
    const integers = numbers.every(Number.isInteger);
    labels = bins.bins.map((bin) => intervalLabel(bin.from, bin.to, integers, options.decimals));
    counts = bins.bins.map((bin) => bin.count);
    valid = bins.n;
    notes.push(`Values are grouped into intervals of ${formatNumber(bins.width, integers ? 0 : options.decimals)}, the number of intervals following Sturges' rule.`);
  } else {
    const result = countsOf(table, 0);
    labels = result.categories;
    counts = result.counts;
    valid = result.valid;
  }
  if (valid === 0) return failed(problem(`“${column.name}” has no responses.`));
  const missing = total - valid;
  let cumulative = 0;
  const rows: TableRow[] = labels.map((label, index) => {
    cumulative += counts[index];
    return row([{ text: label }, f.count(counts[index]), f.percent((counts[index] / total) * 100), f.percent((counts[index] / valid) * 100), f.percent((cumulative / valid) * 100)]);
  });
  if (missing > 0) rows.push(row([{ text: "Missing" }, f.count(missing), f.percent((missing / total) * 100), { text: "" }, { text: "" }]));
  rows.push(row([{ text: "Total" }, f.count(total), f.percent(100), missing > 0 ? f.percent(100) : { text: "" }, { text: "" }], "total"));
  if (missing > 0) notes.push("Valid and cumulative percentages exclude missing responses.");
  return {
    table: finish("frequency", options, { header: [[head(column.name), head("Frequency"), head("%"), head("Valid %"), head("Cumulative %")]], rows, notes: { general: notes } }),
    issues,
  };
}

// Percentage distribution.

export function percentageDistribution(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const all = table.columns.flatMap((_, index) => textValues(table, index));
  const categories = orderCategories(all);
  if (categories.length === 0) return failed(problem("The items have no responses."));
  if (categories.length > 10) issues.push(warning(`The items have ${categories.length} different responses between them. Percentage tables suit items sharing a few categories, such as a rating scale.`));
  const rows = table.columns.map((column, index) => {
    const values = textValues(table, index);
    return row([{ text: column.name }, ...categories.map((category) => f.percent(values.length === 0 ? Number.NaN : (values.filter((value) => value === category).length / values.length) * 100)), f.count(values.length)]);
  });
  return {
    table: finish("percentage", options, {
      header: [[head("Item"), ...categories.map((category) => head(category)), head("n")]],
      rows,
      notes: { general: ["Values are percentages of valid responses to each item; rows may not total 100 because of rounding."] },
    }),
    issues,
  };
}

// Cross-tabulation.

export function crossTabulation(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  if (table.columns.length < 2) return failed(problem("A cross-tabulation needs two columns: the row variable, then the column variable."));
  const f = formatter(options);
  const issues: TableIssue[] = [];
  if (table.columns.length > 2) issues.push(warning(`Only the first two columns are cross-tabulated; “${table.columns[2].name}” and any after it are left out.`));
  const pairs = table.rows.map((values) => [values[0], values[1]].map((value) => (value === null ? "" : String(value).trim()))).filter(([a, b]) => a !== "" && b !== "");
  if (pairs.length === 0) return failed(problem("No participant has answers to both variables."));
  const rowCategories = orderCategories(pairs.map(([a]) => a));
  const columnCategories = orderCategories(pairs.map(([, b]) => b));
  if (columnCategories.length > 8) issues.push(warning(`“${table.columns[1].name}” has ${columnCategories.length} categories, which makes a wide table. Put the variable with fewer categories second, or choose landscape.`));
  const count = (a: string | null, b: string | null) => pairs.filter(([x, y]) => (a === null || x === a) && (b === null || y === b)).length;
  const n = pairs.length;
  const base = options.percentBase;
  const cell = (a: string | null, b: string | null): TableCell => {
    const value = count(a, b);
    if (base === "none") return f.count(value);
    const denominator = base === "row" ? count(a, null) : base === "column" ? count(null, b) : n;
    return { text: `${formatCount(value)} (${formatNumber(denominator === 0 ? 0 : (value / denominator) * 100, 1)})`, numeric: true };
  };
  const rows: TableRow[] = rowCategories.map((a) => row([{ text: a }, ...columnCategories.map((b) => cell(a, b)), cell(a, null)]));
  rows.push(row([{ text: "Total" }, ...columnCategories.map((b) => cell(null, b)), cell(null, null)], "total"));
  const within = { row: "within each row", column: "within each column", total: "of the whole sample", none: "" }[base];
  const excluded = table.rows.length - n;
  return {
    table: finish("cross-tabulation", options, {
      header: [
        [head(""), head(table.columns[1].name, columnCategories.length), head("")],
        [head(table.columns[0].name), ...columnCategories.map((category) => head(category)), head("Total")],
      ],
      rows,
      notes: {
        general: [
          base === "none" ? "Values are counts." : `Values are n (%), with percentages ${within}.`,
          ...(excluded > 0 ? [`${plural(excluded, "participant")} missing either variable ${excluded === 1 ? "is" : "are"} excluded.`] : []),
        ],
      },
    }),
    issues,
  };
}

// Descriptive statistics.

function numericColumns(table: DataTable, issues: TableIssue[]): number[] {
  const indexes = table.columns.map((column, index) => ({ column, index })).filter(({ column }) => column.kind === "number").map(({ index }) => index);
  const skipped = table.columns.filter((column) => column.kind !== "number").map((column) => `“${column.name}”`);
  if (skipped.length > 0 && indexes.length > 0) issues.push(warning(`${listNames(skipped)} ${skipped.length === 1 ? "isn't" : "aren't"} numeric, so ${skipped.length === 1 ? "it is" : "they are"} left out.`));
  return indexes;
}

export function descriptiveStatistics(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const indexes = numericColumns(table, issues);
  if (indexes.length === 0) return failed(problem("No numeric column was found. Descriptive statistics need numbers, one column per variable."));
  const ns: number[] = [];
  const rows = indexes.map((index) => {
    const values = numberValues(table, index);
    ns.push(values.length);
    if (values.length < 3) issues.push(warning(`“${table.columns[index].name}” has ${plural(values.length, "value")}; skewness needs 3 and kurtosis 4.`));
    return row([
      { text: table.columns[index].name },
      f.count(values.length),
      f.stat(values.length > 0 ? mean(values) : null),
      f.stat(values.length > 1 ? standardDeviation(values) : null),
      f.stat(values.length > 0 ? Math.min(...values) : null),
      f.stat(values.length > 0 ? Math.max(...values) : null),
      f.stat(values.length >= 3 ? skewness(values) : null),
      f.stat(values.length >= 4 ? kurtosis(values) : null),
    ]);
  });
  const general = ["Skewness and kurtosis are sample statistics adjusted for sample size, as SPSS and Excel report them; kurtosis is excess kurtosis, 0 for a normal distribution."];
  if (new Set(ns).size === 1) general.unshift(`N = ${formatCount(ns[0])}.`);
  return {
    table: finish("descriptive-statistics", options, { header: [[head("Variable"), head("n"), head("M"), head("SD"), head("Min"), head("Max"), head("Skewness"), head("Kurtosis")]], rows, notes: { general } }),
    issues,
  };
}

// Correlation matrix.

export function correlationMatrix(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const indexes = numericColumns(table, issues);
  if (indexes.length < 2) return failed(problem("A correlation matrix needs at least two numeric columns, one per variable."), ...issues);
  if (indexes.length > 10) issues.push(warning(`With ${indexes.length} variables the matrix is wide; landscape orientation may fit it better.`));
  const correlate = options.correlation === "spearman" ? spearman : pearson;
  const columns = indexes.map((index) => columnValues(table, index));
  const marks: string[] = [];
  const ns = new Set<number>();
  // The last variable's column would hold only its diagonal, so it is left out, as APA's examples do.
  const shown = indexes.length - 1;
  const rows = indexes.map((index, i) => {
    const values = numberValues(table, index);
    const cells: TableCell[] = [{ text: `${i + 1}. ${table.columns[index].name}` }, f.stat(values.length > 0 ? mean(values) : null), f.stat(values.length > 1 ? standardDeviation(values) : null)];
    for (let j = 0; j < shown; j++) {
      if (j > i) cells.push({ text: "" });
      else if (j === i) cells.push({ text: "—", numeric: true });
      else {
        const result = correlate(columns[i], columns[j]);
        ns.add(result.n);
        const mark = options.stars ? stars(result.p) : "";
        if (mark) marks.push(mark);
        cells.push(Number.isFinite(result.r) ? { text: `${formatNumber(result.r, options.decimals, { bounded: true, dropLeadingZero: f.dropLeadingZero })}${mark}`, numeric: true } : { text: "—", numeric: true });
        if (!Number.isFinite(result.r)) issues.push(warning(`The correlation of “${table.columns[index].name}” with “${table.columns[indexes[j]].name}” can't be calculated: one of them doesn't vary, or there are fewer than 3 pairs.`));
      }
    }
    return row(cells);
  });
  const sizes = [...ns].sort((a, b) => a - b);
  const general = [
    sizes.length === 1 ? `N = ${formatCount(sizes[0])}.` : sizes.length > 1 ? `n ranges from ${formatCount(sizes[0])} to ${formatCount(sizes[sizes.length - 1])} because of missing responses (pairwise deletion).` : "",
    options.correlation === "spearman" ? "Correlations are Spearman's rho, with p-values from the t approximation." : "Correlations are Pearson's r.",
    "M and SD are means and standard deviations.",
  ].filter(Boolean);
  return {
    table: finish("correlation-matrix", options, {
      header: [[head("Variable"), head("M"), head("SD"), ...Array.from({ length: shown }, (_, index) => head(String(index + 1)))]],
      rows,
      notes: { general, probability: levelsUsed(marks) },
    }),
    issues,
  };
}

// Reliability.

/** The scale an item belongs to: the text before a colon, or its name without the trailing item number. */
export function scaleOf(name: string): { scale: string; item: string } {
  const colon = name.indexOf(":");
  if (colon > 0) return { scale: name.slice(0, colon).trim(), item: name.slice(colon + 1).trim() || name };
  const stem = name.replace(/[\s_.-]*\d+[a-z]?$/i, "").trim();
  return { scale: stem || name, item: name };
}

export function reliability(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const indexes = numericColumns(table, issues);
  if (indexes.length === 0) return failed(problem("No numeric item columns were found. Reliability needs the item scores, one column per item."));
  const scales = new Map<string, number[]>();
  for (const index of indexes) {
    const { scale } = scaleOf(table.columns[index].name);
    scales.set(scale, [...(scales.get(scale) ?? []), index]);
  }
  const detail = options.itemDetails;
  const width = detail ? 7 : 5;
  const rows: TableRow[] = [];
  const ns = new Set<number>();
  for (const [scale, items] of scales) {
    if (items.length < 2) {
      issues.push(warning(`“${scale}” has one item, so its alpha can't be calculated. Name items so a scale's share a stem, such as SQ1, SQ2 and SQ3.`));
      continue;
    }
    const result = cronbachAlpha(items.map((index) => columnValues(table, index)));
    ns.add(result.n);
    if (result.n < 2) {
      issues.push(warning(`Fewer than two participants answered every item of “${scale}”, so its alpha can't be calculated.`));
      continue;
    }
    if (result.alpha < 0) issues.push(warning(`Alpha for “${scale}” is negative, which usually means an item is worded in the opposite direction and needs reverse-scoring first.`));
    rows.push(row([{ text: scale }, f.count(items.length), f.stat(result.scaleMean), f.stat(result.scaleSd), f.stat(result.alpha, true), ...(detail ? [{ text: "" }, { text: "" }] : [])]));
    if (detail)
      items.forEach((index, position) => {
        const item = result.itemTotal[position];
        rows.push(row([{ text: scaleOf(table.columns[index].name).item, indent: 1 }, { text: "" }, { text: "" }, { text: "" }, { text: "" }, f.stat(item.r, true), f.stat(Number.isFinite(item.alphaIfDeleted) ? item.alphaIfDeleted : null, true)]));
      });
  }
  if (rows.length === 0) return failed(problem("No scale has two or more items with complete responses."), ...issues);
  const sizes = [...ns].sort((a, b) => a - b);
  const general = [
    "α = Cronbach's alpha. M and SD are of each participant's mean item score.",
    sizes.length === 1 ? `Calculated from the ${formatCount(sizes[0])} participants who answered every item.` : `Calculated from participants who answered every item of each scale (n from ${formatCount(sizes[0])} to ${formatCount(sizes[sizes.length - 1])}).`,
    ...(detail ? ["Item–total r is each item's correlation with the sum of the scale's other items."] : []),
  ];
  return {
    table: finish("reliability", options, {
      header: [[head(detail ? "Scale and item" : "Scale"), head("Items"), head("M"), head("SD"), head("α"), ...(detail ? [head("Item–total r"), head("α if deleted")] : [])]],
      rows: rows.map((candidate) => ({ ...candidate, cells: candidate.cells.slice(0, width) })),
      notes: { general },
    }),
    issues,
  };
}

// Chi-square tests of association.

export function chiSquareTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  if (table.columns.length < 2) return failed(problem("A chi-square table needs the grouping variable in the first column and at least one characteristic after it."));
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const groups = orderCategories(textValues(table, 0));
  if (groups.length < 2) return failed(problem(`The grouping variable, “${table.columns[0].name}”, needs at least two groups.`));
  if (groups.length > 6) issues.push(warning(`“${table.columns[0].name}” has ${groups.length} groups, which makes a wide table.`));
  const specific: { mark: string; text: string }[] = [];
  const rows: TableRow[] = [];
  const blanks = () => groups.map((): TableCell => ({ text: "" }));
  for (let column = 1; column < table.columns.length; column++) {
    const pairs = table.rows.map((values) => [values[0], values[column]].map((value) => (value === null ? "" : String(value).trim()))).filter(([a, b]) => a !== "" && b !== "");
    const categories = orderCategories(pairs.map(([, b]) => b));
    const name = table.columns[column].name;
    if (categories.length < 2) {
      issues.push(warning(`“${name}” has fewer than two categories, so it can't be tested.`));
      continue;
    }
    const counts = categories.map((category) => groups.map((group) => pairs.filter(([a, b]) => a === group && b === category).length));
    const groupTotals = groups.map((group) => pairs.filter(([a]) => a === group).length);
    const test = chiSquareTest(counts);
    let notes: string[] | undefined;
    if (test.smallExpected > 0.2) {
      const letter = String.fromCharCode(97 + specific.length);
      specific.push({ mark: letter, text: `More than 20% of expected counts for ${name} are below 5, so the chi-square approximation may be unreliable; Fisher's exact test is an alternative.` });
      notes = [letter];
      issues.push(warning(`For “${name}”, more than 20% of expected counts are below 5. Consider Fisher's exact test.`));
    }
    rows.push(
      row([
        { text: name },
        ...blanks(),
        { text: formatNumber(test.chi2, options.decimals), numeric: true, ...(notes ? { notes } : {}) },
        f.count(test.df),
        f.p(test.p),
        f.stat(test.cramersV, true),
      ]),
    );
    categories.forEach((category, position) =>
      rows.push(
        row([
          { text: category, indent: 1 },
          ...groups.map((_, g): TableCell => ({ text: `${formatCount(counts[position][g])} (${formatNumber(groupTotals[g] === 0 ? 0 : (counts[position][g] / groupTotals[g]) * 100, 1)})`, numeric: true })),
          { text: "" },
          { text: "" },
          { text: "" },
          { text: "" },
        ]),
      ),
    );
  }
  if (rows.length === 0) return failed(problem("No characteristic could be tested."), ...issues);
  return {
    table: finish("chi-square", options, {
      header: [
        [head(""), head(table.columns[0].name, groups.length), head(""), head(""), head(""), head("")],
        [head("Characteristic"), ...groups.map((group) => head(group)), head("χ²"), head("df"), head("p"), head("V")],
      ],
      rows,
      notes: { general: ["Values are n (%), with percentages within each group. V = Cramér's V."], specific },
    }),
    issues,
  };
}
