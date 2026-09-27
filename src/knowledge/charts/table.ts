/**
 * Tables of data typed or pasted in: CSV, TSV, semicolon-separated values, and tables
 * copied from spreadsheets (which paste as tab-separated text). Parsing follows RFC 4180
 * for quoting. Numbers are read as spreadsheets print them, including thousands
 * separators, percentages, Unicode minus signs and, with semicolons, decimal commas.
 */

export type Cell = string | number | null;

export interface Column {
  name: string;
  /** Numeric when every non-empty cell is a number. */
  kind: "number" | "text";
}

export interface DataTable {
  columns: Column[];
  /** Rows of cells: numbers in numeric columns, text otherwise, null when empty. */
  rows: Cell[][];
}

export interface ParseResult {
  table: DataTable;
  delimiter: "," | "\t" | ";";
  hasHeader: boolean;
  /** Problems with the input that were worked around, each as a sentence. */
  notes: string[];
}

/** The most rows the builder reads; larger tables are cut, with a note. */
export const MAX_ROWS = 5000;

/** Splits text into records and fields, honouring quotes, doubled quotes and line breaks inside quotes. */
export function splitRecords(text: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  let wasQuoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') quoted = false;
      else field += character;
      continue;
    }
    if (character === '"' && field.trim() === "") {
      quoted = true;
      wasQuoted = true;
      field = "";
    } else if (character === delimiter) {
      record.push(wasQuoted ? field : field.trim());
      field = "";
      wasQuoted = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index++;
      record.push(wasQuoted ? field : field.trim());
      records.push(record);
      record = [];
      field = "";
      wasQuoted = false;
    } else field += character;
  }
  if (field !== "" || record.length > 0 || wasQuoted) {
    record.push(wasQuoted ? field : field.trim());
    records.push(record);
  }
  return records.filter((candidate) => candidate.some((value) => value !== ""));
}

/** The delimiter: tab if any line has one (as pasted from spreadsheets), otherwise commas or semicolons, whichever the first line has more of. */
export function detectDelimiter(text: string): "," | "\t" | ";" {
  if (text.includes("\t")) return "\t";
  const first = text.split(/\r?\n/).find((line) => line.trim() !== "") ?? "";
  const outsideQuotes = first.replace(/"[^"]*"/g, "");
  const semicolons = (outsideQuotes.match(/;/g) ?? []).length;
  const commas = (outsideQuotes.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

/**
 * A cell as a number, or null if it isn't one. Accepts “1,234.5”, “12%”, “−3” and,
 * when decimal commas are expected, “3,5” and “1.234,5”.
 */
export function parseNumber(text: string, decimalComma = false): number | null {
  let cleaned = text.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  if (cleaned.endsWith("%")) cleaned = cleaned.slice(0, -1);
  if (cleaned === "" || cleaned === "-") return null;
  if (decimalComma) cleaned = cleaned.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) cleaned = cleaned.replace(/,/g, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

const MISSING = new Set(["", "na", "n/a", "nan", "-", "."]);
const isMissing = (text: string) => MISSING.has(text.trim().toLowerCase());

/** Reads a typed or pasted table. The first row is a header when none of its cells is a number. */
export function parseTable(text: string): ParseResult {
  const delimiter = detectDelimiter(text);
  const decimalComma = delimiter === ";";
  const notes: string[] = [];
  let records = splitRecords(text, delimiter);
  if (records.length === 0) return { table: { columns: [], rows: [] }, delimiter, hasHeader: false, notes: ["There is no data yet."] };

  const numeric = (value: string) => !isMissing(value) && parseNumber(value, decimalComma) !== null;
  const hasHeader = records.length > 1 && records[0].every((value) => !numeric(value));
  const header = hasHeader ? records[0] : [];
  let body = hasHeader ? records.slice(1) : records;
  if (body.length > MAX_ROWS) {
    notes.push(`Only the first ${MAX_ROWS} rows are used.`);
    body = body.slice(0, MAX_ROWS);
  }
  const width = Math.max(header.length, ...body.map((record) => record.length));
  body.forEach((record, index) => {
    if (record.length < width) notes.push(`Row ${index + 1} has ${record.length} ${record.length === 1 ? "value" : "values"} instead of ${width}; the rest are treated as missing.`);
  });
  records = body.map((record) => Array.from({ length: width }, (_, index) => record[index] ?? ""));

  const columns: Column[] = Array.from({ length: width }, (_, index) => {
    const name = header[index]?.trim() || `Column ${index + 1}`;
    const cells = records.map((record) => record[index]).filter((value) => !isMissing(value));
    return { name, kind: cells.length > 0 && cells.every(numeric) ? "number" : "text" };
  });
  const names = new Map<string, number>();
  for (const column of columns) {
    const seen = names.get(column.name) ?? 0;
    names.set(column.name, seen + 1);
    if (seen > 0) column.name = `${column.name} (${seen + 1})`;
  }
  const rows = records.map((record) =>
    record.map((value, index): Cell => {
      if (isMissing(value)) return null;
      return columns[index].kind === "number" ? parseNumber(value, decimalComma) : value.trim();
    }),
  );
  return { table: { columns, rows }, delimiter, hasHeader, notes };
}

/** A table as CSV, quoting where needed, for copying or re-editing. */
export function tableToCsv(table: DataTable): string {
  const quote = (value: Cell) => {
    if (value === null) return "";
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [table.columns.map((column) => quote(column.name)).join(","), ...table.rows.map((row) => row.map(quote).join(","))].join("\n");
}

export const numericColumns = (table: DataTable) => table.columns.map((column, index) => ({ column, index })).filter(({ column }) => column.kind === "number");
export const textColumns = (table: DataTable) => table.columns.map((column, index) => ({ column, index })).filter(({ column }) => column.kind === "text");
