/**
 * Tables as text: Markdown for notes and repositories, CSV and tab-separated values for
 * spreadsheets, and plain text for the clipboard. Spreadsheet files hold the header and
 * body only; they start with a byte order mark so Excel reads accented and Greek letters,
 * use hyphens for minus signs so numbers stay numbers, and guard text that starts like a
 * formula so opening the file never runs one.
 */

import { captionLines, noteParagraphs, runsText } from "./caption";
import { plainMinus } from "./format";
import { numericColumns } from "./html";
import type { ResearchTable, TableCell, TableOptions, TableRow, TextRun } from "./types";

/** The byte order mark that tells Excel a file is UTF-8. */
export const BOM = "﻿";

/** Each row as one text per column: spanned cells put their text in the first column they cover. */
function grid(cells: readonly TableCell[], columns: number, text: (cell: TableCell) => string): string[] {
  const out: string[] = [];
  for (const cell of cells) {
    out.push(text(cell));
    for (let extra = 1; extra < (cell.span ?? 1); extra++) out.push("");
  }
  while (out.length < columns) out.push("");
  return out.slice(0, columns);
}

const cellWithNotes = (cell: TableCell) => `${cell.text}${(cell.notes ?? []).join("")}`;

/** The header and body as rows of text. Group rows put their label in the first column. */
export function tableGrid(table: ResearchTable, text: (cell: TableCell) => string = cellWithNotes): string[][] {
  return [...table.header.map((cells) => grid(cells, table.columns, text)), ...table.rows.map((candidate: TableRow) => grid(candidate.cells, table.columns, text))];
}

/** Text that a spreadsheet would read as a formula gets a leading apostrophe; numbers are left alone. */
export function guardFormula(value: string): string {
  if (/^[=+\-@\t\r]/.test(value) && !/^[+-]?\d/.test(value)) return `'${value}`;
  return value;
}

const spreadsheetCell = (cell: TableCell) => guardFormula(plainMinus(cellWithNotes(cell)));

export function tableCsv(table: ResearchTable): string {
  const quote = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return `${BOM}${tableGrid(table, spreadsheetCell)
    .map((values) => values.map(quote).join(","))
    .join("\r\n")}\r\n`;
}

/** Tab-separated values as Excel reads them: quoted only when a cell holds a tab, quote or line break. */
export function tableTsv(table: ResearchTable): string {
  const quote = (value: string) => (/[\t"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return `${BOM}${tableGrid(table, spreadsheetCell)
    .map((values) => values.map(quote).join("\t"))
    .join("\r\n")}\r\n`;
}

function markdownRuns(runs: readonly TextRun[]): string {
  return runs
    .map((run) => {
      const text = (run.smallCaps ? run.text.toUpperCase() : run.text).replace(/([\\*_`|[\]])/g, "\\$1");
      if (!text.trim()) return text;
      if (run.superscript) return `<sup>${text}</sup>`;
      if (run.bold && run.italic) return `***${text}***`;
      if (run.bold) return `**${text}**`;
      if (run.italic) return `*${text}*`;
      return text;
    })
    .join("");
}

/** A Markdown table with its caption above and notes below. Multi-row headers are combined into one row. */
export function tableMarkdown(table: ResearchTable, options: TableOptions): string {
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const header = Array.from({ length: table.columns }, (_, column) =>
    table.header
      .map((cells) => {
        let position = 0;
        for (const cell of cells) {
          const span = cell.span ?? 1;
          if (column >= position && column < position + span) return cell.text;
          position += span;
        }
        return "";
      })
      .filter(Boolean)
      .join(" "),
  );
  const numeric = numericColumns(table);
  const body = table.rows.map((candidate) => {
    if (candidate.kind === "group") return [`**${escape(candidate.cells[0].text)}**`, ...Array.from({ length: table.columns - 1 }, () => "")];
    return grid(candidate.cells, table.columns, (cell) => {
      const indent = "&nbsp;&nbsp;".repeat(cell.indent ?? 0);
      const text = `${indent}${escape(cell.text)}${(cell.notes ?? []).map((mark) => `<sup>${mark}</sup>`).join("")}`;
      return cell.bold && cell.text ? `**${text}**` : text;
    });
  });
  const line = (values: readonly string[]) => `| ${values.join(" | ")} |`;
  const caption = captionLines(table, options).map(markdownRuns);
  const notes = noteParagraphs(table, options).map(markdownRuns);
  return [
    caption.join("  \n"),
    "",
    line(header.map(escape)),
    line(numeric.map((isNumber, column) => (column > 0 && isNumber ? "---:" : ":---"))),
    ...body.map(line),
    ...(notes.length > 0 ? ["", notes.join("  \n")] : []),
    "",
  ].join("\n");
}

/** Plain text for the clipboard: the caption, tab-separated rows (which paste as a table), and the notes. */
export function tablePlainText(table: ResearchTable, options: TableOptions): string {
  const caption = captionLines(table, options).map(runsText);
  const rows = tableGrid(table).map((values) => values.join("\t"));
  const notes = noteParagraphs(table, options).map(runsText);
  return [...caption, ...rows, ...notes].join("\n");
}
