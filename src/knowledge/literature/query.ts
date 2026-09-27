/**
 * Finding studies: search across every column, sorting by any column, and filters on
 * the researcher's own organisation. Searching ignores case and accents, so “Muller”
 * finds “Müller”. Sorting is stable and puts empty values last in either direction.
 */

import { FIELD_INFO, MATRIX_FIELDS, type ColourTag, type Matrix, type MatrixField, type Priority, type ReadingStatus, type Study } from "./types";

/** Text reduced for comparison: lower case, accents removed, spaces collapsed. */
export const fold = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Studies containing every word of the query, in any column. */
export function searchStudies(matrix: Matrix, query: string, fields: readonly MatrixField[] = MATRIX_FIELDS): Study[] {
  const words = fold(query).split(" ").filter(Boolean);
  if (words.length === 0) return [...matrix];
  return matrix.filter((study) => {
    const text = fold(fields.map((field) => study.fields[field]).join(" \u0000 "));
    return words.every((word) => text.includes(word));
  });
}

export type SortDirection = "ascending" | "descending";

/** A number read from the start of a value, for sorting years and sample sizes: “2021a” is 2021, “1,204” is 1204. */
export function leadingNumber(value: string): number | null {
  const match = /^\s*(\d[\d,]*(?:\.\d+)?)/.exec(value.replace(/(\d),(?=\d{3}\b)/g, "$1"));
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

/** Studies sorted by a column. Years and sample sizes sort as numbers, everything else alphabetically; empty values go last. */
export function sortStudies(matrix: Matrix, field: MatrixField, direction: SortDirection = "ascending"): Study[] {
  const numeric = FIELD_INFO[field].kind === "year" || FIELD_INFO[field].kind === "number";
  const sign = direction === "ascending" ? 1 : -1;
  return matrix
    .map((study, index) => ({ study, index }))
    .sort((a, b) => {
      const x = a.study.fields[field].trim();
      const y = b.study.fields[field].trim();
      if (!x || !y) return (!x ? 1 : 0) - (!y ? 1 : 0) || a.index - b.index;
      let order: number;
      if (numeric) {
        const nx = leadingNumber(x);
        const ny = leadingNumber(y);
        order = nx !== null && ny !== null ? nx - ny : nx === null ? 1 : -1;
      } else order = fold(x).localeCompare(fold(y), "en", { numeric: true });
      return sign * order || a.index - b.index;
    })
    .map(({ study }) => study);
}

export interface StudyFilter {
  statuses?: readonly ReadingStatus[];
  priorities?: readonly (Priority | "none")[];
  tags?: readonly (ColourTag | "none")[];
  favouritesOnly?: boolean;
  /** Inclusive; studies without a year are left out when either bound is set. */
  fromYear?: number | null;
  toYear?: number | null;
}

/** Studies matching every filter given. Empty lists mean “any”. */
export function filterStudies(matrix: Matrix, filter: StudyFilter): Study[] {
  return matrix.filter((study) => {
    if (filter.favouritesOnly && !study.favourite) return false;
    if (filter.statuses?.length && !filter.statuses.includes(study.status)) return false;
    if (filter.priorities?.length && !filter.priorities.includes(study.priority ?? "none")) return false;
    if (filter.tags?.length && !filter.tags.includes(study.tag ?? "none")) return false;
    if (filter.fromYear != null || filter.toYear != null) {
      const year = leadingNumber(study.fields.year);
      if (year === null) return false;
      if (filter.fromYear != null && year < filter.fromYear) return false;
      if (filter.toYear != null && year > filter.toYear) return false;
    }
    return true;
  });
}

export interface MatrixView {
  query: string;
  sort: { field: MatrixField; direction: SortDirection } | null;
  filter: StudyFilter;
}

/** The studies to show: filtered, then searched, then sorted (or in the researcher's own order). */
export function viewStudies(matrix: Matrix, view: MatrixView): Study[] {
  const shown = searchStudies(filterStudies(matrix, view.filter), view.query);
  return view.sort ? sortStudies(shown, view.sort.field, view.sort.direction) : shown;
}

/** Columns in matrix order, keeping only those chosen; the author column always stays, so every row keeps its name. */
export function visibleFields(chosen: ReadonlySet<MatrixField> | readonly MatrixField[]): MatrixField[] {
  const set = new Set(chosen);
  return MATRIX_FIELDS.filter((field) => field === "authors" || set.has(field));
}
