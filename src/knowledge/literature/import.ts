/**
 * Bringing studies into the matrix from BibTeX, RIS or CSV. Each format's reader gives
 * column values; this step adds them as studies, skips any already in the matrix (by
 * DOI, or by title and year), and reports what happened in plain sentences.
 */

import { detectDelimiter, splitRecords } from "../charts/table";
import { parseBibtex, studyFromBibtex } from "./bibtex";
import { createStudy, nextId } from "./matrix";
import { fold } from "./query";
import { parseRis, studyFromRis } from "./ris";
import { identityKey } from "./validate";
import { COLOUR_TAGS, COLOUR_TAG_LABELS, FIELD_INFO, MATRIX_FIELDS, PRIORITIES, PRIORITY_LABELS, READING_STATUSES, READING_STATUS_LABELS, type Matrix, type MatrixField, type Study } from "./types";

export const IMPORT_FORMATS = ["bibtex", "ris", "csv"] as const;
export type ImportFormat = (typeof IMPORT_FORMATS)[number];
export const IMPORT_FORMAT_LABELS: Readonly<Record<ImportFormat, string>> = { bibtex: "BibTeX", ris: "RIS", csv: "CSV or spreadsheet" };

/** The most studies read in one import. */
export const MAX_IMPORT = 2000;

/** Column names spreadsheets and other matrices use, beyond each column's own label. */
const CSV_ALIASES: Readonly<Record<MatrixField, readonly string[]>> = {
  authors: ["author", "authors", "author(s)", "creator", "creators"],
  year: ["year", "publication year", "date", "pub year"],
  title: ["title", "article title", "study"],
  journal: ["journal", "source", "source title", "publication", "publication title"],
  publisher: ["publisher"],
  doi: ["doi"],
  country: ["country", "countries", "location", "setting country"],
  context: ["context", "setting", "research context"],
  problem: ["problem", "research problem", "problem statement"],
  objectives: ["objective", "objectives", "aim", "aims", "purpose", "research objectives"],
  design: ["design", "research design", "method", "methodology"],
  philosophy: ["philosophy", "research philosophy", "paradigm"],
  approach: ["approach", "research approach"],
  theory: ["theory", "theories", "framework", "theoretical framework", "theory or framework"],
  sampling: ["sampling", "sampling technique", "sampling method"],
  sampleSize: ["sample size", "sample", "n"],
  dataCollection: ["data collection", "data collection method", "instrument", "instruments"],
  analysis: ["analysis", "analysis technique", "data analysis", "statistical analysis", "analysis method"],
  variables: ["variables", "constructs", "key variables"],
  independent: ["independent variable", "independent variables", "iv", "ivs", "predictors"],
  dependent: ["dependent variable", "dependent variables", "dv", "dvs", "outcomes"],
  mediator: ["mediator", "mediators"],
  moderator: ["moderator", "moderators"],
  findings: ["findings", "major findings", "key findings", "results", "main findings"],
  gap: ["gap", "gaps", "research gap"],
  limitations: ["limitation", "limitations"],
  recommendations: ["recommendations", "future research", "future recommendations", "future directions"],
  contribution: ["contribution", "key contribution", "contributions"],
  notes: ["notes", "note", "comments"],
  reflection: ["reflection", "critical reflection", "researcher's critical reflection", "evaluation", "critique"],
};

const ORGANISATION = { status: ["status", "reading status"], priority: ["priority"], tag: ["tag", "colour tag", "color tag", "colour", "color"], favourite: ["favourite", "favorite", "starred"] } as const;

const key = (name: string) => fold(name).replace(/[^a-z0-9()' ]/g, "").replace(/\s+/g, " ").trim();

/** Which matrix column a spreadsheet column is, or null. */
export function columnFor(name: string): MatrixField | null {
  const wanted = key(name);
  return MATRIX_FIELDS.find((field) => key(FIELD_INFO[field].label) === wanted || key(field) === wanted || CSV_ALIASES[field].includes(wanted)) ?? null;
}

type Organisation = Pick<Study, "status" | "priority" | "tag" | "favourite">;
interface Row {
  fields: Partial<Record<MatrixField, string>>;
  organisation: Partial<Organisation>;
}

/** Rows of a CSV, TSV or pasted spreadsheet, with columns recognised by name. Unrecognised columns are kept in the notes. */
export function readCsv(text: string): { rows: Row[]; notes: string[] } {
  const records = splitRecords(text.replace(/^﻿/, ""), detectDelimiter(text));
  if (records.length < 2) return { rows: [], notes: ["Give the column names in the first row, then one study per row."] };
  const header = records[0];
  const columns = header.map((name) => columnFor(name));
  const organisation = header.map((name) => (Object.keys(ORGANISATION) as (keyof typeof ORGANISATION)[]).find((field) => (ORGANISATION[field] as readonly string[]).includes(key(name))) ?? null);
  const unknown = header.filter((name, index) => name.trim() && !columns[index] && !organisation[index]);
  const notes = unknown.length > 0 ? [`Columns not in the matrix were added to each study's notes: ${unknown.map((name) => `“${name}”`).join(", ")}.`] : [];
  if (columns.every((column) => column === null)) return { rows: [], notes: ["No column name matched the matrix. Use names such as Author(s), Year, Title and Major findings in the first row."] };
  const find = <T extends string>(value: string, ids: readonly T[], labels: Readonly<Record<T, string>>) => ids.find((id) => key(id) === key(value) || key(labels[id]) === key(value)) ?? null;
  const rows = records.slice(1).map((values): Row => {
    const fields: Partial<Record<MatrixField, string>> = {};
    const extra: string[] = [];
    const org: Partial<Organisation> = {};
    header.forEach((name, index) => {
      const value = (values[index] ?? "").trim();
      if (!value) return;
      const column = columns[index];
      if (column) fields[column] = fields[column] ? `${fields[column]}; ${value}` : value;
      else if (organisation[index] === "status") org.status = find(value, READING_STATUSES, READING_STATUS_LABELS) ?? undefined;
      else if (organisation[index] === "priority") org.priority = find(value, PRIORITIES, PRIORITY_LABELS);
      else if (organisation[index] === "tag") org.tag = find(value, COLOUR_TAGS, COLOUR_TAG_LABELS);
      else if (organisation[index] === "favourite") org.favourite = /^(yes|y|true|1|★|x)$/i.test(value);
      else if (name.trim()) extra.push(`${name.trim()}: ${value}`);
    });
    if (extra.length > 0) fields.notes = [fields.notes, ...extra].filter(Boolean).join("\n");
    return { fields, organisation: org };
  });
  return { rows, notes };
}

export interface ImportResult {
  matrix: Matrix;
  added: number;
  /** Studies skipped because the matrix already has them, by label. */
  duplicates: string[];
  notes: string[];
}

/** Adds the studies in a text to the matrix. */
export function importStudies(matrix: Matrix, format: ImportFormat, text: string): ImportResult {
  let rows: Row[];
  let notes: string[];
  if (format === "bibtex") {
    const parsed = parseBibtex(text);
    rows = parsed.entries.map((entry) => ({ fields: studyFromBibtex(entry), organisation: {} }));
    notes = parsed.notes;
  } else if (format === "ris") {
    const parsed = parseRis(text);
    rows = parsed.entries.map((record) => ({ fields: studyFromRis(record), organisation: {} }));
    notes = parsed.notes;
  } else ({ rows, notes } = readCsv(text));
  if (rows.length > MAX_IMPORT) {
    notes = [...notes, `Only the first ${MAX_IMPORT} studies were imported.`];
    rows = rows.slice(0, MAX_IMPORT);
  }
  const seen = new Set(matrix.map(identityKey).filter((value): value is string => value !== null));
  let next = [...matrix];
  const duplicates: string[] = [];
  let added = 0;
  for (const row of rows) {
    const study = { ...createStudy(nextId(next), row.fields), ...Object.fromEntries(Object.entries(row.organisation).filter(([, value]) => value !== undefined)) } as Study;
    if (MATRIX_FIELDS.every((field) => !study.fields[field])) continue;
    const identity = identityKey(study);
    if (identity && seen.has(identity)) {
      duplicates.push(study.fields.title || study.fields.authors || study.fields.doi);
      continue;
    }
    if (identity) seen.add(identity);
    next = [...next, study];
    added++;
  }
  if (rows.length === 0 && notes.length === 0) notes = [`No ${IMPORT_FORMAT_LABELS[format]} entries were found. Check that the text is in ${IMPORT_FORMAT_LABELS[format]} format.`];
  return { matrix: next, added, duplicates, notes };
}
