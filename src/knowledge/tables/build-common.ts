/**
 * What every table builder shares: cells formatted for the chosen style, headers with
 * statistical symbols in italics, the categories of a column in a sensible order, and
 * the finished table.
 */

import type { Cell, DataTable } from "../charts/table";
import { formatCount, formatNumber, formatPValue, formatPercent } from "./format";
import { styleSpec } from "./styles";
import { TABLE_TYPE_INFO, type ResearchTable, type RowKind, type StarLevel, type TableCell, type TableNotes, type TableOptions, type TableRow, type TableType } from "./types";

export interface TableIssue {
  severity: "problem" | "warning";
  message: string;
}

export interface BuildResult {
  table: ResearchTable | null;
  issues: TableIssue[];
}

export const problem = (message: string): TableIssue => ({ severity: "problem", message });
export const warning = (message: string): TableIssue => ({ severity: "warning", message });
export const failed = (...issues: TableIssue[]): BuildResult => ({ table: null, issues });

/** Symbols APA sets in italics in column heads. Greek letters stay upright. */
const ITALIC_SYMBOLS = new Set(["N", "n", "M", "SD", "SE", "p", "t", "F", "r", "R", "R²", "B", "df", "Mdn", "z", "U", "H", "V", "k", "LL", "UL", "ΔF"]);

/** Formatting helpers bound to the options, so every builder formats numbers alike. */
export function formatter(options: TableOptions) {
  const dropLeadingZero = styleSpec(options).dropLeadingZero;
  return {
    dropLeadingZero,
    /** A statistic with the chosen decimals; bounded ones (at most 1 in size) lose the leading zero in APA. */
    stat: (value: number | null | undefined, bounded = false, decimals = options.decimals): TableCell => ({ text: value === null || value === undefined ? "" : formatNumber(value, decimals, { bounded, dropLeadingZero }), numeric: true }),
    count: (value: number | null | undefined): TableCell => ({ text: value === null || value === undefined ? "" : formatCount(value), numeric: true }),
    percent: (value: number | null | undefined, decimals = 1): TableCell => ({ text: value === null || value === undefined || !Number.isFinite(value) ? "" : formatPercent(value, decimals), numeric: true }),
    p: (value: number | null | undefined): TableCell => ({ text: value === null || value === undefined ? "" : formatPValue(value, dropLeadingZero), numeric: true }),
  };
}

/** A header cell, italic when it is a statistical symbol. */
export const head = (text: string, span = 1): TableCell => ({ text, ...(ITALIC_SYMBOLS.has(text) ? { italic: true } : {}), ...(span > 1 ? { span } : {}) });

/** A text cell. A trailing “^a” marks it with specific note a. */
export function textCell(text: string, extra: Partial<TableCell> = {}): TableCell {
  const match = /\^([a-z]{1,2})$/.exec(text.trim());
  return match ? { text: text.trim().slice(0, -match[0].length).trim(), notes: [match[1]], ...extra } : { text: text.trim(), ...extra };
}

export const row = (cells: TableCell[], kind: RowKind = "body"): TableRow => ({ kind, cells });

/** A row naming a group, spanning every column. */
export const groupRow = (text: string, columns: number): TableRow => ({ kind: "group", cells: [{ text, span: columns }] });

export const cellText = (cell: Cell) => (cell === null ? "" : String(cell));

/** The present values of a column, as text. */
export const textValues = (table: DataTable, column: number) => table.rows.map((values) => values[column]).filter((value): value is string | number => value !== null && String(value).trim() !== "").map((value) => String(value).trim());

/** The present values of a numeric column. */
export const numberValues = (table: DataTable, column: number) => table.rows.map((values) => values[column]).filter((value): value is number => typeof value === "number");

/** The values of a numeric column, with null for missing ones, row by row. */
export const columnValues = (table: DataTable, column: number) => table.rows.map((values) => (typeof values[column] === "number" ? (values[column] as number) : null));

/** Response words in their natural order, so rating scales read from low to high. */
const ORDERED_WORDS = [
  "strongly disagree",
  "disagree",
  "somewhat disagree",
  "slightly disagree",
  "neither agree nor disagree",
  "neutral",
  "undecided",
  "slightly agree",
  "somewhat agree",
  "agree",
  "strongly agree",
  "never",
  "rarely",
  "sometimes",
  "often",
  "very often",
  "always",
  "very poor",
  "poor",
  "fair",
  "good",
  "very good",
  "excellent",
  "very dissatisfied",
  "dissatisfied",
  "satisfied",
  "very satisfied",
  "no",
  "yes",
];

/**
 * Categories in a sensible order: numbers ascending; known rating words in scale order;
 * otherwise the order they first appear in, which is usually the order of the questionnaire.
 */
export function orderCategories(values: readonly string[]): string[] {
  const unique = [...new Set(values)];
  if (unique.every((value) => value !== "" && Number.isFinite(Number(value)))) return unique.sort((a, b) => Number(a) - Number(b));
  const known = (value: string) => ORDERED_WORDS.indexOf(value.toLowerCase());
  if (unique.every((value) => known(value) >= 0)) return unique.sort((a, b) => known(a) - known(b));
  return unique;
}

/** The title in use: the researcher's, or the type's default. */
export const titleFor = (type: TableType, options: Pick<TableOptions, "title">) => options.title.trim() || TABLE_TYPE_INFO[type].defaultTitle;

export const EMPTY_NOTES: TableNotes = { general: [], specific: [], probability: [] };

/** A finished table, with its column count taken from the widest header or body row. */
export function finish(type: TableType, options: Pick<TableOptions, "title">, parts: { header: TableCell[][]; rows: TableRow[]; rowHeaders?: boolean; notes?: Partial<TableNotes> }): ResearchTable {
  const width = (cells: readonly TableCell[]) => cells.reduce((sum, cell) => sum + (cell.span ?? 1), 0);
  const columns = Math.max(0, ...parts.header.map(width), ...parts.rows.filter((candidate) => candidate.kind !== "group").map((candidate) => width(candidate.cells)));
  return {
    type,
    title: titleFor(type, options),
    header: parts.header,
    rows: parts.rows.map((candidate) => (candidate.kind === "group" ? { ...candidate, cells: [{ ...candidate.cells[0], span: columns }] } : candidate)),
    columns,
    rowHeaders: parts.rowHeaders ?? true,
    notes: { ...EMPTY_NOTES, ...parts.notes },
  };
}

/** The star levels used in a set of cells, for the probability note. */
export function levelsUsed(marks: readonly string[]): StarLevel[] {
  const levels = new Set<StarLevel>();
  for (const mark of marks) {
    if (mark === "***") levels.add(0.001);
    else if (mark === "**") levels.add(0.01);
    else if (mark === "*") levels.add(0.05);
  }
  return [...levels].sort((a, b) => b - a);
}

export { listNames } from "../research/data-analysis";

/** “1 value”, “3 values”. */
export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
