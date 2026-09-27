/**
 * Tables from lists typed or pasted in: the contents page, lists of tables and figures,
 * a research timeline, a reference coding table, and appendix and custom tables. Text is
 * kept exactly as entered; only numbers in appendix and custom tables are rounded.
 */

import { detectDelimiter, parseNumber, parseTable, splitRecords } from "../charts/table";
import { tableLabel } from "./caption";
import { failed, finish, formatter, groupRow, head, plural, problem, row, textCell, warning, type BuildResult, type TableIssue } from "./build-common";
import { nameMatches } from "./columns";
import { formatNumber, roman } from "./format";
import { styleSpec } from "./styles";
import type { TableCell, TableOptions, TableRow, TableType } from "./types";

export interface RawRecords {
  header: string[];
  rows: string[][];
}

/** The pasted text as rows of text, the first row as column names, everything as entered. */
export function rawRecords(text: string): RawRecords {
  const records = splitRecords(text, detectDelimiter(text));
  const width = Math.max(0, ...records.map((record) => record.length));
  const pad = (record: string[]) => Array.from({ length: width }, (_, index) => (record[index] ?? "").trim());
  return { header: pad(records[0] ?? []), rows: records.slice(1).map(pad) };
}

const needRows = (raw: RawRecords) => (raw.rows.length === 0 ? problem("Paste or type the entries, one per row, with the column names in the first row.") : null);

// Contents.

/** A heading's level from its numbering: “2” is 1, “2.1” is 2, “2.1.3” is 3. Unnumbered headings are level 1. */
export function headingLevel(heading: string): number {
  const match = /^(\d+(?:\.\d+)*)\.?\s/.exec(heading.trim());
  return match ? Math.min(4, match[1].split(".").length) : 1;
}

export function tableOfContents(text: string, options: TableOptions): BuildResult {
  const raw = rawRecords(text);
  const empty = needRows(raw);
  if (empty) return failed(empty);
  const pageColumn = raw.header.findIndex((name) => /^pages?$/i.test(name));
  const levelColumn = raw.header.findIndex((name) => /^level$/i.test(name));
  const page = pageColumn >= 0 ? pageColumn : raw.header.length - 1;
  const heading = raw.header.findIndex((_, index) => index !== page && index !== levelColumn);
  if (heading < 0) return failed(problem("Give each heading and its page, such as “1.1 Background,2”."));
  const rows = raw.rows
    .filter((values) => values[heading])
    .map((values) => {
      const typed = levelColumn >= 0 ? Number(values[levelColumn]) : Number.NaN;
      const level = Number.isInteger(typed) && typed >= 1 ? Math.min(4, typed) : headingLevel(values[heading]);
      return row([{ text: values[heading], indent: level - 1, ...(level === 1 ? { bold: true } : {}) }, { text: page === heading ? "" : values[page], numeric: true }]);
    });
  const issues: TableIssue[] = rows.some((candidate) => !candidate.cells[1].text) ? [warning("Some headings have no page number. Update them when the document's pages are final.")] : [];
  return { table: finish("table-of-contents", options, { header: [[head("Section"), head("Page")]], rows, notes: {} }), issues };
}

// Lists of tables and figures.

export function captionList(type: "list-of-tables" | "list-of-figures", text: string, options: TableOptions): BuildResult {
  const raw = rawRecords(text);
  const empty = needRows(raw);
  if (empty) return failed(empty);
  const figures = type === "list-of-figures";
  const spec = styleSpec(options);
  const hasNumber = raw.header.length >= 3;
  const [numberColumn, titleColumn, pageColumn] = hasNumber ? [0, 1, 2] : raw.header.length === 2 ? [-1, 0, 1] : [-1, 0, -1];
  let next = 1;
  const rows = raw.rows
    .filter((values) => values[titleColumn])
    .map((values) => {
      const given = numberColumn >= 0 ? values[numberColumn] : "";
      const number = given || (figures ? String(next) : spec.numerals === "roman" ? roman(next) : String(next));
      next++;
      return row([{ text: number, numeric: true }, { text: values[titleColumn] }, { text: pageColumn >= 0 ? values[pageColumn] : "", numeric: true }]);
    });
  const label = figures ? (options.style === "ieee" ? "Fig." : "Figure") : spec.labelWord.charAt(0) + spec.labelWord.slice(1).toLowerCase();
  const issues: TableIssue[] = pageColumn < 0 ? [warning("No page numbers were given. Add a Page column when the document's pages are final.")] : [];
  return { table: finish(type, options, { header: [[head(label), head("Title"), head("Page")]], rows, notes: {} }), issues };
}

// Timeline.

export const TIMELINE_MARK = "■";

export function researchTimeline(text: string, options: TableOptions): BuildResult {
  const raw = rawRecords(text);
  const empty = needRows(raw);
  if (empty) return failed(empty);
  if (raw.header.length < 3) return failed(problem("Give each activity its first and last month, such as “Data collection,4,6”."));
  const find = (pattern: RegExp, fallback: number) => {
    const index = raw.header.findIndex((name) => pattern.test(name));
    return index >= 0 ? index : fallback;
  };
  const start = find(/^(start|from|begin)/i, 1);
  const end = find(/^(end|to|finish)/i, 2);
  const issues: TableIssue[] = [];
  const activities: { name: string; from: number; to: number }[] = [];
  for (const values of raw.rows) {
    const name = values[0];
    if (!name) continue;
    const from = Number(values[start]);
    const to = Number(values[end]);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < 1) {
      issues.push(warning(`“${name}” needs whole month numbers from 1, such as 4 and 6; it is left out.`));
      continue;
    }
    if (from > to) {
      issues.push(warning(`“${name}” ends (month ${to}) before it starts (month ${from}); it is left out.`));
      continue;
    }
    activities.push({ name, from, to });
  }
  if (activities.length === 0) return failed(problem("No activity has a valid first and last month."), ...issues);
  const months = Math.max(...activities.map((activity) => activity.to));
  if (months > 36) return failed(problem(`The timeline runs to month ${months}. Show at most 36 months, or group months into quarters.`));
  if (months > 12 && options.orientation === "portrait") issues.push(warning(`${plural(months, "month")} make a wide table; landscape orientation fits it better.`));
  const rows = activities.map((activity) =>
    row([{ text: activity.name }, ...Array.from({ length: months }, (_, index): TableCell => (index + 1 >= activity.from && index + 1 <= activity.to ? { text: TIMELINE_MARK, mark: true } : { text: "" }))]),
  );
  return {
    table: finish("research-timeline", options, {
      header: [
        [head(""), head("Month", months)],
        [head("Activity"), ...Array.from({ length: months }, (_, index) => head(String(index + 1)))],
      ],
      rows,
      notes: { general: [`${TIMELINE_MARK} marks the months in which each activity takes place.`] },
    }),
    issues,
  };
}

// Reference coding.

export function referenceCoding(text: string, options: TableOptions): BuildResult {
  const raw = rawRecords(text);
  const empty = needRows(raw);
  if (empty) return failed(empty);
  const issues: TableIssue[] = [];
  const missing = raw.rows.filter((values) => values.some(Boolean) && !values[0]).length;
  if (missing > 0) issues.push(warning(`${plural(missing, "row")} ${missing === 1 ? "has" : "have"} no study in the first column.`));
  if (raw.header.length > 6 && options.orientation === "portrait") issues.push(warning(`${raw.header.length} columns make a wide table; landscape orientation fits it better.`));
  const rows = raw.rows.filter((values) => values.some(Boolean)).map((values) => row(values.map((value) => textCell(value))));
  return { table: finish("reference-coding", options, { header: [raw.header.map((name, index) => head(name || `Column ${index + 1}`))], rows, notes: {} }), issues };
}

// Appendix and custom tables.

/** Any pasted table: numbers rounded to the chosen decimals (whole-number columns stay whole), p columns as p-values, and rows with only a first cell as group headings. */
export function customTable(type: Extract<TableType, "appendix" | "custom">, text: string, options: TableOptions): BuildResult {
  const raw = rawRecords(text);
  const empty = needRows(raw);
  if (empty) return failed(empty);
  const f = formatter(options);
  // Note markers such as “12.3^a” mustn't make a numeric column look like text.
  const { columns } = parseTable(text.replace(/\^[a-z]{1,2}(?=[,;\t\r\n]|$)/gm, "")).table;
  const decimalComma = detectDelimiter(text) === ";";
  const plans = raw.header.map((name, index) => {
    const numeric = index > 0 && columns[index]?.kind === "number";
    const numbers = raw.rows.map((values) => parseNumber((values[index] ?? "").replace(/\^[a-z]{1,2}$/, ""), decimalComma)).filter((value): value is number => value !== null);
    return { numeric, whole: numbers.every(Number.isInteger), p: nameMatches(name, "p") };
  });
  const width = raw.header.length;
  const rows: TableRow[] = raw.rows
    .filter((values) => values.some(Boolean))
    .map((values) => {
      if (values[0] && values.slice(1).every((value) => !value)) return groupRow(values[0], width);
      return row(
        values.map((value, index): TableCell => {
          const plan = plans[index];
          const number = plan.numeric ? parseNumber(value.replace(/\^[a-z]{1,2}$/, ""), decimalComma) : null;
          if (number === null) return textCell(value, plan.numeric ? { numeric: true } : {});
          const cell = plan.p ? f.p(number) : plan.whole ? { text: formatNumber(number, 0), numeric: true } : f.stat(number);
          const marked = textCell(value);
          return marked.notes ? { ...cell, notes: marked.notes } : cell;
        }),
      );
    });
  const issues: TableIssue[] = width > 8 && options.orientation === "portrait" ? [warning(`${width} columns make a wide table; landscape orientation fits it better.`)] : [];
  if (type === "appendix" && !/^[A-Z]{1,2}$/i.test(options.appendix.trim())) issues.push(warning(`The appendix letter should be a letter, such as A; the table is numbered ${tableLabel(options, true)}.`));
  return { table: finish(type, options, { header: [raw.header.map((name, index) => head(name || (index === 0 ? "" : `Column ${index + 1}`)))], rows, notes: {} }), issues };
}
