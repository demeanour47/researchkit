/**
 * Counting records from the files the searches exported, with the Literature Matrix
 * Builder's readers for BibTeX, RIS and CSV. Records are matched across and within
 * sources by DOI, or by title and year, so the duplicates count is the number of
 * records found again after their first appearance. Records with neither a DOI nor a
 * usable title can't be matched, and are counted but reported.
 */

import { readRecords, type ImportFormat } from "../literature/import";
import { createStudy, studyLabel } from "../literature/matrix";
import { identityKey } from "../literature/validate";

export interface RecordExport {
  id: string;
  /** The database or register the file came from, such as “MEDLINE”. */
  name: string;
  format: ImportFormat;
  text: string;
}

export interface RecordCount {
  sources: { id: string; name: string; records: number; notes: string[] }[];
  /** All records, before removing duplicates. */
  total: number;
  duplicates: number;
  /** Records left after removing duplicates. */
  unique: number;
  /** Records without a DOI or title, which couldn't be checked for duplicates. */
  unmatched: number;
}

export function countRecords(exports: readonly RecordExport[]): RecordCount {
  const seen = new Set<string>();
  let duplicates = 0;
  let unmatched = 0;
  const sources = exports.map((file) => {
    const { rows, notes } = readRecords(file.format, file.text);
    for (const row of rows) {
      const key = identityKey(createStudy("record", row.fields));
      if (!key) unmatched++;
      else if (seen.has(key)) duplicates++;
      else seen.add(key);
    }
    return { id: file.id, name: file.name.trim() || "Unnamed source", records: rows.length, notes };
  });
  const total = sources.reduce((sum, source) => sum + source.records, 0);
  return { sources, total, duplicates, unique: total - duplicates, unmatched };
}

/** The studies in a Literature Matrix export, counted and named, for the included box. */
export function includedFromMatrix(csv: string): { count: number; labels: string[]; notes: string[] } {
  const { rows, notes } = readRecords("csv", csv);
  const studies = rows.map((row, index) => createStudy(`s${index + 1}`, row.fields)).filter((study) => Object.values(study.fields).some(Boolean));
  return { count: studies.length, labels: studies.map(studyLabel), notes };
}
