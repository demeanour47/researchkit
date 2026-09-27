/**
 * The matrix as files. Word, PDF, HTML, Markdown and CSV come from the Research Table
 * Builder's writers, with the matrix as a table of reviewed studies; Excel uses the
 * shared workbook writer. Spreadsheet files also carry each study's status, priority,
 * tag and favourite mark, so exporting and importing again loses nothing.
 */

import { tableCsv, tableDocx, tableHtmlDocument, tableMarkdown, tablePdf } from "../tables";
import { DEFAULT_TABLE_OPTIONS, type ResearchTable, type TableOptions } from "../tables/types";
import { workbookXlsx } from "../tables/xlsx";
import { studyLabel } from "./matrix";
import { COLOUR_TAG_LABELS, FIELD_INFO, PRIORITY_LABELS, READING_STATUS_LABELS, type MatrixField, type Study } from "./types";

export const EXPORT_FORMATS = ["DOCX", "PDF", "XLSX", "CSV", "Markdown", "HTML"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const ORGANISATION_HEADERS = ["Status", "Priority", "Tag", "Favourite"] as const;

const organisation = (study: Study) => [READING_STATUS_LABELS[study.status], study.priority ? PRIORITY_LABELS[study.priority] : "", study.tag ? COLOUR_TAG_LABELS[study.tag] : "", study.favourite ? "Yes" : ""];

/** The matrix as a table of reviewed studies, with the chosen columns. */
export function matrixTable(studies: readonly Study[], fields: readonly MatrixField[], { title = "Literature Matrix", withOrganisation = false }: { title?: string; withOrganisation?: boolean } = {}): ResearchTable {
  const header = [...fields.map((field) => FIELD_INFO[field].label), ...(withOrganisation ? ORGANISATION_HEADERS : [])];
  return {
    type: "reference-coding",
    title,
    header: [header.map((text) => ({ text }))],
    rows: studies.map((study) => ({ kind: "body" as const, cells: [...fields.map((field) => ({ text: field === "authors" && !study.fields.authors ? studyLabel(study) : study.fields[field] })), ...(withOrganisation ? organisation(study).map((text) => ({ text })) : [])] })),
    columns: header.length,
    rowHeaders: true,
    notes: { general: [`${studies.length} ${studies.length === 1 ? "study" : "studies"}.`], specific: [], probability: [] },
  };
}

/** Page settings that fit a wide matrix: landscape, a grid, compact cells, and smaller text as columns are added. */
export function matrixTableOptions(columns: number, title = "Literature Matrix"): TableOptions {
  return { ...DEFAULT_TABLE_OPTIONS, title, orientation: "landscape", borders: "grid", padding: "compact", textAlign: "left", numberAlign: "right", fontSize: columns > 12 ? 7 : columns > 8 ? 8 : columns > 5 ? 9 : 10, repeatHeader: true };
}

/** The columns beyond which a printed matrix becomes hard to read. */
export const PRINTABLE_COLUMNS = 12;

/** A file's bytes or text, with its type and extension. */
export interface MatrixFile {
  data: Uint8Array<ArrayBuffer> | string;
  type: string;
  extension: string;
}

export function exportMatrix(format: ExportFormat, studies: readonly Study[], fields: readonly MatrixField[], title = "Literature Matrix"): MatrixFile {
  const options = matrixTableOptions(fields.length, title);
  switch (format) {
    case "DOCX":
      return { data: tableDocx(matrixTable(studies, fields, { title }), options), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" };
    case "PDF":
      return { data: tablePdf(matrixTable(studies, fields, { title }), options), type: "application/pdf", extension: "pdf" };
    case "HTML":
      return { data: tableHtmlDocument(matrixTable(studies, fields, { title }), options), type: "text/html;charset=utf-8", extension: "html" };
    case "Markdown":
      return { data: tableMarkdown(matrixTable(studies, fields, { title }), options), type: "text/markdown;charset=utf-8", extension: "md" };
    case "CSV":
      return { data: tableCsv(matrixTable(studies, fields, { title, withOrganisation: true })), type: "text/csv;charset=utf-8", extension: "csv" };
    case "XLSX": {
      const table = matrixTable(studies, fields, { title, withOrganisation: true });
      const header = table.header[0].map((cell) => cell.text);
      const rows = table.rows.map((row) => row.cells.map((cell, index) => (index < fields.length && fields[index] === "year" && /^\d{4}$/.test(cell.text) ? Number(cell.text) : cell.text)));
      const widths = header.map((_, index) => (index < fields.length ? (FIELD_INFO[fields[index]].multiline ? 45 : 18) : 12));
      return { data: workbookXlsx([{ name: title, header, rows, widths }], title), type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" };
    }
  }
}
