/**
 * Tables of results already produced by statistics software: regression, model summary,
 * coefficients, ANOVA, factor loadings and convergent validity. Columns are recognised by
 * name. Values that follow from others are calculated when left out (mean squares, F, p
 * and partial eta squared in ANOVA; p from F or t), and the notes say which.
 */

import type { DataTable } from "../charts/table";
import { cellText, failed, finish, formatter, groupRow, head, levelsUsed, listNames, problem, row, textCell, warning, type BuildResult, type TableIssue } from "./build-common";
import { findColumns, nameMatches, normalizeName, type ColumnKey } from "./columns";
import { formatCount, formatNumber, formatPValue, stars } from "./format";
import { averageVarianceExtracted, compositeReliability, fTestP, tTestP } from "./stats";
import type { TableCell, TableOptions, TableRow } from "./types";

const numberAt = (table: DataTable, rowIndex: number, column: number): number | null => {
  if (column < 0) return null;
  const value = table.rows[rowIndex][column];
  return typeof value === "number" ? value : null;
};
const hasNumbers = (table: DataTable, rowIndex: number) => table.rows[rowIndex].slice(1).some((value) => typeof value === "number");
const needRows = (table: DataTable) => (table.rows.length === 0 ? problem("Paste the results from your statistics software, with the column names in the first row.") : null);

/** “p = .032” or “p < .001”, for notes. */
const pSentence = (p: number, dropLeadingZero: boolean) => {
  const value = formatPValue(p, dropLeadingZero);
  return /^[<>]/.test(value) ? `p ${value}` : `p = ${value}`;
};

// Regression.

/** Rows giving the model's fit rather than a coefficient. */
const MODEL_KEYS = ["r2", "adjr2", "f"] as const;

export function regressionTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const found = findColumns(table, ["b", "se", "beta", "t", "p"]);
  if (found.b < 0 && found.beta < 0) return failed(problem("No coefficient column was found. Name the columns B, SE, β, t and p, as your software prints them."));
  const model: { r2?: number; adjr2?: number; f?: number; df1?: number; df2?: number; n?: number } = {};
  const coefficientRows: TableRow[] = [];
  const marks: string[] = [];
  let calculatedP = false;
  const modelNames = (name: string) => MODEL_KEYS.find((key) => nameMatches(name, key)) ?? (normalizeName(name) === "n" ? "n" : null);
  const pending: number[] = [];
  table.rows.forEach((values, index) => {
    const name = cellText(values[0]).trim();
    const key = modelNames(name);
    const numbers = values.slice(1).filter((value): value is number => typeof value === "number");
    if (key === "r2") model.r2 = numbers[0];
    else if (key === "adjr2") model.adjr2 = numbers[0];
    else if (key === "f") [model.f, model.df1, model.df2] = numbers;
    else if (key === "n") model.n = numbers[0];
    else pending.push(index);
  });
  const pKnown = found.p >= 0 || (found.t >= 0 && model.df2 !== undefined);
  const columns: [ColumnKey, string, boolean][] = ([["b", "B", false], ["se", "SE", false], ["beta", "β", true], ["t", "t", false], ["p", "p", true]] as [ColumnKey, string, boolean][]).filter(
    ([key]) => (key === "p" ? pKnown && !options.pAsStars : found[key as keyof typeof found] >= 0),
  );
  for (const index of pending) {
    const name = cellText(table.rows[index][0]).trim();
    if (!hasNumbers(table, index)) {
      if (name) coefficientRows.push(groupRow(name, columns.length + 1));
      continue;
    }
    let p = numberAt(table, index, found.p);
    const t = numberAt(table, index, found.t);
    if (p === null && t !== null && model.df2 !== undefined) {
      p = tTestP(t, model.df2);
      calculatedP = true;
    }
    // Asterisks stand in for the p column when the researcher prefers them.
    const mark = options.pAsStars && p !== null ? stars(p) : "";
    if (mark) marks.push(mark);
    const starOn = found.beta >= 0 ? "beta" : "b";
    coefficientRows.push(
      row([
        textCell(name),
        ...columns.map(([key, , bounded]): TableCell => {
          if (key === "p") return f.p(p);
          const cell = f.stat(numberAt(table, index, found[key as keyof typeof found]), bounded);
          return key === starOn && cell.text ? { ...cell, text: `${cell.text}${mark}` } : cell;
        }),
      ]),
    );
  }
  if (coefficientRows.length === 0) return failed(problem("No predictor rows were found."));
  const fit: string[] = [];
  if (model.r2 !== undefined) fit.push(`R² = ${formatNumber(model.r2, options.decimals, { bounded: true, dropLeadingZero: f.dropLeadingZero })}`);
  if (model.adjr2 !== undefined) fit.push(`adjusted R² = ${formatNumber(model.adjr2, options.decimals, { bounded: true, dropLeadingZero: f.dropLeadingZero })}`);
  if (model.f !== undefined && model.df1 !== undefined && model.df2 !== undefined) fit.push(`F(${formatCount(model.df1)}, ${formatCount(model.df2)}) = ${formatNumber(model.f, options.decimals)}, ${pSentence(fTestP(model.f, model.df1, model.df2), f.dropLeadingZero)}`);
  else if (model.f !== undefined) issues.push(warning("Give the F row its two degrees of freedom, such as “F,33.45,2,197”, to report the model test."));
  const general = [
    ...(model.n !== undefined ? [`N = ${formatCount(model.n)}.`] : []),
    ...(fit.length > 0 ? [`${fit.join(", ")}.`.replace(/^./, (first) => first.toUpperCase())] : []),
    ...(calculatedP ? ["p-values were calculated from t with the model's residual degrees of freedom."] : []),
  ];
  if (fit.length === 0) issues.push(warning("No model fit was given. Add rows named R², Adjusted R² and F to report it in the note."));
  return {
    table: finish("regression", options, { header: [[head("Predictor"), ...columns.map(([, label]) => head(label))]], rows: coefficientRows, notes: { general, probability: levelsUsed(marks) } }),
    issues,
  };
}

// Coefficient table.

export function coefficientTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const found = findColumns(table, ["b", "se", "beta", "t", "p", "lower", "upper", "tolerance", "vif"]);
  if (found.b < 0 && found.beta < 0) return failed(problem("No coefficient column was found. Name the columns B, SE, β, t and p, as your software prints them."));
  const issues: TableIssue[] = [];
  const ci = found.lower >= 0 && found.upper >= 0;
  if ((found.lower >= 0) !== (found.upper >= 0)) issues.push(warning("Only one confidence interval bound was found. Name the columns Lower and Upper to show the interval."));
  const plain: [ColumnKey, string, boolean][] = [
    ["b", "B", false],
    ["se", "SE", false],
    ["beta", "β", true],
    ["t", "t", false],
    ["p", "p", true],
  ];
  const before = plain.filter(([key]) => found[key as keyof typeof found] >= 0 && !(key === "p" && options.pAsStars));
  const after: [ColumnKey, string, boolean][] = ([["tolerance", "Tolerance", true], ["vif", "VIF", false]] as [ColumnKey, string, boolean][]).filter(([key]) => found[key as keyof typeof found] >= 0);
  const width = 1 + before.length + (ci ? 2 : 0) + after.length;
  const marks: string[] = [];
  const rows: TableRow[] = table.rows.map((values, index) => {
    const name = cellText(values[0]).trim();
    if (!hasNumbers(table, index)) return groupRow(name, width);
    const p = numberAt(table, index, found.p);
    // Asterisks stand in for the p column when the researcher prefers them.
    const mark = options.pAsStars && p !== null ? stars(p) : "";
    if (mark) marks.push(mark);
    const cells: TableCell[] = [textCell(name)];
    for (const [key, , bounded] of before) {
      if (key === "p") cells.push(f.p(p));
      else {
        const cell = f.stat(numberAt(table, index, found[key as keyof typeof found]), bounded);
        cells.push(key === "b" && cell.text ? { ...cell, text: `${cell.text}${mark}` } : cell);
      }
    }
    if (ci) cells.push(f.stat(numberAt(table, index, found.lower)), f.stat(numberAt(table, index, found.upper)));
    for (const [key, , bounded] of after) cells.push(f.stat(numberAt(table, index, found[key as keyof typeof found]), bounded));
    return row(cells);
  });
  const header: TableCell[][] = ci
    ? [
        [head("Predictor"), ...before.map(([, label]) => head(label)), head("95% CI", 2), ...after.map(([, label]) => head(label))],
        [head(""), ...before.map(() => head("")), head("LL"), head("UL"), ...after.map(() => head(""))],
      ]
    : [[head("Predictor"), ...before.map(([, label]) => head(label)), ...after.map(([, label]) => head(label))]];
  const general = [...(ci ? ["CI = confidence interval; LL = lower limit; UL = upper limit."] : []), ...(after.length > 0 ? ["VIF = variance inflation factor."] : [])];
  return { table: finish("coefficients", options, { header, rows, notes: { general, probability: levelsUsed(marks) } }), issues };
}

// Model summary.

export function modelSummary(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const found = findColumns(table, ["r", "r2", "adjr2", "see", "dr2", "fchange", "df1", "df2", "p", "dw"]);
  const spec: [ColumnKey, string, "bounded" | "stat" | "count" | "p"][] = [
    ["r", "R", "bounded"],
    ["r2", "R²", "bounded"],
    ["adjr2", "Adjusted R²", "bounded"],
    ["see", "SE", "stat"],
    ["dr2", "ΔR²", "bounded"],
    ["fchange", "ΔF", "stat"],
    ["df1", "df1", "count"],
    ["df2", "df2", "count"],
    ["p", "p", "p"],
    ["dw", "Durbin–Watson", "stat"],
  ];
  const calculate = found.p < 0 && found.fchange >= 0 && found.df1 >= 0 && found.df2 >= 0;
  const shown = spec.filter(([key]) => found[key as keyof typeof found] >= 0 || (key === "p" && calculate));
  if (shown.length === 0) return failed(problem("No model statistics were found. Name the columns R, R², Adjusted R² and so on, as your software prints them."));
  const rows = table.rows.map((values, index) =>
    row([
      textCell(cellText(values[0])),
      ...shown.map(([key, , kind]): TableCell => {
        if (key === "p") {
          const p = calculate ? fTestP(numberAt(table, index, found.fchange) ?? Number.NaN, numberAt(table, index, found.df1) ?? Number.NaN, numberAt(table, index, found.df2) ?? Number.NaN) : numberAt(table, index, found.p);
          return f.p(p !== null && Number.isFinite(p) ? p : null);
        }
        const value = numberAt(table, index, found[key as keyof typeof found]);
        return kind === "count" ? f.count(value) : f.stat(value, kind === "bounded");
      }),
    ]),
  );
  if (found.r2 < 0) issues.push(warning("No R² column was found; most readers expect it."));
  return {
    table: finish("model-summary", options, {
      header: [[head("Model"), ...shown.map(([, label]) => head(label))]],
      rows,
      notes: { general: [...(found.see >= 0 ? ["SE = standard error of the estimate."] : []), ...(calculate ? ["p is for the F change, calculated from ΔF, df1 and df2."] : [])] },
    }),
    issues,
  };
}

// ANOVA.

export function anovaTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const found = findColumns(table, ["ss", "df", "ms", "f", "p", "eta"]);
  if (found.ss < 0 || found.df < 0) return failed(problem("An ANOVA table needs columns named SS (sums of squares) and df."));
  const names = table.rows.map((values) => cellText(values[0]).trim());
  const errorIndex = names.findIndex((name) => /within|error|residual/i.test(name));
  const isTotal = (name: string) => /total/i.test(name);
  const ss = (index: number) => numberAt(table, index, found.ss);
  const df = (index: number) => numberAt(table, index, found.df);
  for (const [index, name] of names.entries())
    if (df(index) !== null && !(df(index)! > 0)) issues.push(warning(`The df for “${name}” should be above zero.`));
  const msOf = (index: number) => numberAt(table, index, found.ms) ?? (ss(index) !== null && df(index) ? ss(index)! / df(index)! : null);
  const errorMs = errorIndex >= 0 ? msOf(errorIndex) : null;
  const effects = names.map((name, index) => index !== errorIndex && !isTotal(name) && hasNumbers(table, index));
  if (errorIndex < 0 && found.f < 0) return failed(problem("Add the error row, named “Within groups”, “Error” or “Residual”, so F can be calculated; or paste F and p."));
  const calculated = new Set<string>();
  const rows: TableRow[] = names.map((name, index) => {
    if (!hasNumbers(table, index)) return groupRow(name, 7);
    const total = isTotal(name);
    const ms = total ? null : msOf(index);
    if (!total && found.ms < 0 && ms !== null) calculated.add("MS");
    let F: number | null = null;
    let p: number | null = null;
    let eta: number | null = null;
    if (effects[index]) {
      F = numberAt(table, index, found.f) ?? (ms !== null && errorMs ? ms / errorMs : null);
      if (found.f < 0 && F !== null) calculated.add("F");
      p = numberAt(table, index, found.p) ?? (F !== null && df(index) && errorIndex >= 0 && df(errorIndex) ? fTestP(F, df(index)!, df(errorIndex)!) : null);
      if (found.p < 0 && p !== null) calculated.add("p");
      const errorSs = errorIndex >= 0 ? ss(errorIndex) : null;
      eta = numberAt(table, index, found.eta) ?? (ss(index) !== null && errorSs !== null ? ss(index)! / (ss(index)! + errorSs) : null);
      if (found.eta < 0 && eta !== null) calculated.add("partial η²");
    }
    return row([{ text: name }, f.stat(ss(index)), f.count(df(index)), f.stat(ms), f.stat(F), f.p(p), f.stat(eta, true)], total ? "total" : "body");
  });
  const general = calculated.size > 0 ? [`${listNames([...calculated])} ${calculated.size === 1 ? "was" : "were"} calculated from SS and df.`] : [];
  if (effects.every((effect) => !effect)) issues.push(warning("No effect rows were found between the error and total rows."));
  return {
    table: finish("anova", options, { header: [[head("Source"), head("SS"), head("df"), head("MS"), head("F"), head("p"), head("Partial η²")]], rows, notes: { general } }),
    issues,
  };
}

// Factor analysis.

const FOOTER_ROWS: readonly [RegExp, string, number | null][] = [
  [/eigen/i, "Eigenvalue", null],
  [/cumulative/i, "Cumulative %", 1],
  [/variance/i, "% of variance", 1],
];

export function factorTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  const factors = table.columns.map((column, index) => ({ column, index })).filter(({ column, index }) => index > 0 && column.kind === "number");
  if (factors.length === 0) return failed(problem("No loading columns were found. Paste one row per item, with one numeric column per factor."));
  const items: { name: string; loadings: (number | null)[]; primary: number }[] = [];
  const footers: TableRow[] = [];
  table.rows.forEach((values, index) => {
    const name = cellText(values[0]).trim();
    const footer = FOOTER_ROWS.find(([pattern]) => pattern.test(name));
    const loadings = factors.map(({ index: column }) => numberAt(table, index, column));
    if (footer) {
      footers.push(row([{ text: footer[1] }, ...loadings.map((value) => f.stat(value, false, footer[2] ?? options.decimals))], "total"));
      return;
    }
    if (loadings.every((value) => value === null)) return;
    let primary = 0;
    loadings.forEach((value, position) => {
      if (Math.abs(value ?? 0) > Math.abs(loadings[primary] ?? 0)) primary = position;
    });
    items.push({ name, loadings, primary });
  });
  if (items.length === 0) return failed(problem("No item rows with loadings were found."));
  const outside = items.filter((item) => item.loadings.some((value) => value !== null && Math.abs(value) > 1)).map((item) => `“${item.name}”`);
  if (outside.length > 0) issues.push(warning(`${listNames(outside)} ${outside.length === 1 ? "has a loading" : "have loadings"} above 1 in size; standardised loadings lie between −1 and 1.`));
  const threshold = Math.max(0.4, options.suppressBelow);
  const cross = items.filter((item) => item.loadings.filter((value) => Math.abs(value ?? 0) >= threshold).length > 1).map((item) => `“${item.name}”`);
  if (cross.length > 0) issues.push(warning(`${listNames(cross)} ${cross.length === 1 ? "loads" : "load"} at ${formatNumber(threshold, 2)} or more on more than one factor (cross-loading).`));
  // Grouped by the factor each item loads on most, largest loadings first, as “sorted by size” output does.
  const sorted = [...items].sort((a, b) => a.primary - b.primary || Math.abs(b.loadings[b.primary] ?? 0) - Math.abs(a.loadings[a.primary] ?? 0));
  const rows = sorted.map((item) =>
    row([
      { text: item.name },
      ...item.loadings.map((value, position): TableCell => {
        if (value === null || Math.abs(value) < options.suppressBelow) return { text: "" };
        return { ...f.stat(value, true), ...(position === item.primary ? { bold: true } : {}) };
      }),
    ]),
  );
  const general = [
    ...(options.suppressBelow > 0 ? [`Loadings below ${formatNumber(options.suppressBelow, 2, { bounded: true, dropLeadingZero: f.dropLeadingZero })} are not shown.`] : []),
    "Each item's highest loading is in bold. Items are sorted by the factor they load on most.",
  ];
  return {
    table: finish("factor-analysis", options, { header: [[head("Item"), ...factors.map(({ column }) => head(column.name))]], rows: [...rows, ...footers], notes: { general } }),
    issues,
  };
}

// Convergent validity.

export function validityTable(table: DataTable, options: TableOptions): BuildResult {
  const empty = needRows(table);
  if (empty) return failed(empty);
  const f = formatter(options);
  const issues: TableIssue[] = [];
  let found = findColumns(table, ["construct", "item", "loading"], new Set());
  if (found.loading < 0 && table.columns.length >= 3 && table.columns[2].kind === "number") found = { construct: 0, item: 1, loading: 2 };
  if (found.loading < 0 || found.construct < 0) return failed(problem("Validity needs three columns: the construct, the item, then its standardised loading."));
  const constructs = new Map<string, { item: string; loading: number }[]>();
  table.rows.forEach((values, index) => {
    const construct = cellText(values[found.construct]).trim();
    const loading = numberAt(table, index, found.loading);
    if (!construct || loading === null) return;
    constructs.set(construct, [...(constructs.get(construct) ?? []), { item: found.item >= 0 ? cellText(values[found.item]).trim() : `Item ${index + 1}`, loading }]);
  });
  if (constructs.size === 0) return failed(problem("No rows with a construct and a loading were found."));
  const rows: TableRow[] = [];
  for (const [construct, items] of constructs) {
    const loadings = items.map((item) => item.loading);
    if (loadings.some((loading) => Math.abs(loading) > 1)) {
      issues.push(problem(`“${construct}” has a loading above 1 in size. Composite reliability and AVE need standardised loadings, between −1 and 1.`));
      continue;
    }
    const cr = compositeReliability(loadings);
    const ave = averageVarianceExtracted(loadings);
    if (items.length < 2) issues.push(warning(`“${construct}” has one item; CR and AVE describe multi-item constructs.`));
    if (ave < 0.5) issues.push(warning(`AVE for “${construct}” is ${formatNumber(ave, 2)}, below the commonly used .50.`));
    if (cr < 0.7) issues.push(warning(`CR for “${construct}” is ${formatNumber(cr, 2)}, below the commonly used .70.`));
    rows.push(groupRow(construct, 4));
    items.forEach((item, position) => rows.push(row([{ text: item.item, indent: 1 }, f.stat(item.loading, true), position === 0 ? f.stat(cr, true) : { text: "" }, position === 0 ? f.stat(ave, true) : { text: "" }])));
  }
  if (rows.length === 0) return failed(...issues);
  return {
    table: finish("validity", options, {
      header: [[head("Construct and item"), head("Loading"), head("CR"), head("AVE")]],
      rows,
      notes: { general: ["CR = composite reliability; AVE = average variance extracted, both calculated from the standardised loadings."] },
    }),
    issues,
  };
}

