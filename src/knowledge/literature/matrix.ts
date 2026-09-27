/**
 * Changes to the matrix. Each returns a new matrix and leaves the old one untouched, so
 * any change can be undone by keeping the previous value.
 */

import { EMPTY_FIELDS, MATRIX_FIELDS, type ColourTag, type Matrix, type MatrixField, type Priority, type ReadingStatus, type Study, type StudyFields } from "./types";

/** An id not used in the matrix yet: s1, s2 and so on. */
export function nextId(matrix: Matrix): string {
  const used = new Set(matrix.map((study) => study.id));
  let number = matrix.length + 1;
  while (used.has(`s${number}`)) number++;
  return `s${number}`;
}

/** Field values with anything missing filled in as empty, extra keys dropped, and text tidied at the ends. */
export function cleanFields(fields: Partial<Record<MatrixField, string>>): StudyFields {
  return Object.fromEntries(MATRIX_FIELDS.map((field) => [field, (fields[field] ?? "").trim()])) as Record<MatrixField, string>;
}

export function createStudy(id: string, fields: Partial<Record<MatrixField, string>> = {}): Study {
  return { id, fields: { ...EMPTY_FIELDS, ...cleanFields(fields) }, tag: null, favourite: false, status: "to-read", priority: null };
}

export const addStudy = (matrix: Matrix, fields: Partial<Record<MatrixField, string>> = {}): Matrix => [...matrix, createStudy(nextId(matrix), fields)];

const indexOf = (matrix: Matrix, id: string) => {
  const index = matrix.findIndex((study) => study.id === id);
  if (index < 0) throw new RangeError(`No study with id ${id}.`);
  return index;
};

/** A copy of a study, placed just after it, with its details and organisation but its own id. */
export function duplicateStudy(matrix: Matrix, id: string): Matrix {
  const index = indexOf(matrix, id);
  const copy: Study = { ...matrix[index], id: nextId(matrix) };
  return [...matrix.slice(0, index + 1), copy, ...matrix.slice(index + 1)];
}

export function deleteStudy(matrix: Matrix, id: string): Matrix {
  indexOf(matrix, id);
  return matrix.filter((study) => study.id !== id);
}

/** Moves a study to a position, clamped to the ends. */
export function moveStudy(matrix: Matrix, id: string, position: number): Matrix {
  const index = indexOf(matrix, id);
  const target = Math.max(0, Math.min(matrix.length - 1, Math.round(position)));
  if (target === index) return matrix;
  const rest = matrix.filter((study) => study.id !== id);
  return [...rest.slice(0, target), matrix[index], ...rest.slice(target)];
}

/** Moves a study up (−1) or down (+1) one place. */
export const shiftStudy = (matrix: Matrix, id: string, by: -1 | 1): Matrix => moveStudy(matrix, id, indexOf(matrix, id) + by);

const change = (matrix: Matrix, id: string, update: (study: Study) => Study): Matrix => {
  indexOf(matrix, id);
  return matrix.map((study) => (study.id === id ? update(study) : study));
};

export const updateField = (matrix: Matrix, id: string, field: MatrixField, value: string): Matrix => change(matrix, id, (study) => ({ ...study, fields: { ...study.fields, [field]: value } }));
export const setTag = (matrix: Matrix, id: string, tag: ColourTag | null): Matrix => change(matrix, id, (study) => ({ ...study, tag }));
export const setFavourite = (matrix: Matrix, id: string, favourite: boolean): Matrix => change(matrix, id, (study) => ({ ...study, favourite }));
export const setStatus = (matrix: Matrix, id: string, status: ReadingStatus): Matrix => change(matrix, id, (study) => ({ ...study, status }));
export const setPriority = (matrix: Matrix, id: string, priority: Priority | null): Matrix => change(matrix, id, (study) => ({ ...study, priority }));

/** A short name for a study, as it is cited: “Smith & Lee (2021)”, “Smith et al. (2021)”, or its title when there are no authors. */
export function studyLabel(study: Pick<Study, "fields" | "id">): string {
  const surnames = listItems(study.fields.authors).map((author) => author.split(",")[0].trim()).filter(Boolean);
  const year = study.fields.year.trim() || "n.d.";
  if (surnames.length === 0) {
    if (study.fields.title.trim()) return `${study.fields.title.trim().slice(0, 60)} (${year})`;
    // A study added by its DOI alone is known by its DOI until its details are filled in.
    return study.fields.doi.trim() ? `DOI ${study.fields.doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")} (${year})` : `Untitled study (${year})`;
  }
  const names = surnames.length === 1 ? surnames[0] : surnames.length === 2 ? `${surnames[0]} & ${surnames[1]}` : `${surnames[0]} et al.`;
  return `${names} (${year})`;
}

/** The items of a list field: separated by semicolons or line breaks, tidied, blanks dropped. */
export const listItems = (value: string) =>
  value
    .split(/[;\n]/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
