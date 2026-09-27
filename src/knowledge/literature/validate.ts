/**
 * Checks on the matrix. Nothing here is a verdict on a study; each message says what
 * looks incomplete or inconsistent and how to fix it.
 */

import { normalizeDoi } from "../citation/apa/identifiers";
import { studyLabel } from "./matrix";
import { fold } from "./query";
import type { Matrix, MatrixField, Study } from "./types";

export interface MatrixIssue {
  severity: "problem" | "warning";
  /** The study concerned, or null for the whole matrix. */
  studyId: string | null;
  field: MatrixField | null;
  message: string;
}

/** Years before this are almost certainly typing mistakes. */
export const EARLIEST_YEAR = 1800;

/** Checks for one study. The current year bounds plausible publication years. */
export function studyIssues(study: Study, currentYear: number): MatrixIssue[] {
  const issues: MatrixIssue[] = [];
  const label = studyLabel(study);
  const add = (severity: MatrixIssue["severity"], field: MatrixField | null, message: string) => issues.push({ severity, studyId: study.id, field, message });
  const { fields } = study;
  if (!fields.authors && !fields.title) add("warning", "authors", `${label}: add the authors or title, so the study can be identified.`);
  if (!fields.year) add("warning", "year", `${label}: add the year of publication.`);
  else if (!/^\d{4}[a-z]?$/.test(fields.year) && fields.year.toLowerCase() !== "n.d." && !/^in press$/i.test(fields.year)) add("problem", "year", `${label}: “${fields.year}” isn't a year. Use four digits, such as 2021, or “n.d.” or “in press”.`);
  else if (/^\d{4}/.test(fields.year)) {
    const year = Number(fields.year.slice(0, 4));
    if (year < EARLIEST_YEAR || year > currentYear + 1) add("problem", "year", `${label}: ${year} is outside ${EARLIEST_YEAR}–${currentYear + 1}. Check the year.`);
  }
  if (fields.doi && !normalizeDoi(fields.doi)) add("problem", "doi", `${label}: “${fields.doi}” isn't a DOI. A DOI starts with 10., such as 10.1177/0013189X17739591.`);
  if (fields.sampleSize) {
    const size = fields.sampleSize.replace(/[,\s]/g, "");
    if (!/^\d+$/.test(size)) add("warning", "sampleSize", `${label}: write the sample size as a number, such as 312; put details in the notes.`);
    else if (Number(size) === 0) add("problem", "sampleSize", `${label}: a sample size of 0 can't be right.`);
  }
  if (fields.independent && !fields.dependent) add("warning", "dependent", `${label}: independent variables are given without a dependent variable.`);
  if ((fields.mediator || fields.moderator) && !(fields.independent && fields.dependent)) add("warning", fields.mediator ? "mediator" : "moderator", `${label}: a mediator or moderator needs the independent and dependent variables it connects.`);
  return issues;
}

/** A key that identifies the same publication: its DOI, or its title and year. */
export function identityKey(study: Pick<Study, "fields">): string | null {
  const doi = normalizeDoi(study.fields.doi);
  if (doi) return doi.toLowerCase();
  const title = fold(study.fields.title).replace(/[^a-z0-9 ]/g, "");
  return title.length >= 8 ? `${title}|${study.fields.year.slice(0, 4)}` : null;
}

/** Every check: each study's, then studies entered twice. */
export function matrixIssues(matrix: Matrix, currentYear: number): MatrixIssue[] {
  const issues = matrix.flatMap((study) => studyIssues(study, currentYear));
  const seen = new Map<string, Study>();
  for (const study of matrix) {
    const key = identityKey(study);
    if (!key) continue;
    const first = seen.get(key);
    if (first) issues.push({ severity: "warning", studyId: study.id, field: null, message: `${studyLabel(study)} looks like the same publication as ${studyLabel(first)} (same ${key.startsWith("https://doi.org/") ? "DOI" : "title and year"}). Delete one, or duplicate on purpose.` });
    else seen.set(key, study);
  }
  return issues;
}
