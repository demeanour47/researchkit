/**
 * Harvard dates. The year of publication follows the author in round brackets, or
 * "no date" takes its place; an access date is written in full, day first, with the
 * month as a word: "(Accessed: 23 July 2020)". Other parts of a publication date are
 * not used in the profile's books, journal articles and web pages.
 */

import { MONTHS, daysInMonth, isWholeNumberIn, type PublicationDate } from "../source";

export type DateProblem = "invalid-date" | "day-without-month";

export interface HarvardDate {
  /** The year, or null when there is no valid year. */
  year: number | null;
  /** The valid parts written day first, such as "23 July 2020", "July 2020" or "2020"; null without a valid year. */
  text: string | null;
  /** Whether the day, month and year are all present and valid. */
  complete: boolean;
  problem?: DateProblem;
}

/** The valid parts of a date. Nothing is guessed. */
export function harvardDate(date: PublicationDate | undefined): HarvardDate {
  const { year, month, day } = date ?? {};
  if (year === undefined) return { year: null, text: null, complete: false, ...(month !== undefined || day !== undefined ? { problem: "invalid-date" } : {}) };
  if (!isWholeNumberIn(year, 1, 9999)) return { year: null, text: null, complete: false, problem: "invalid-date" };
  if (month === undefined) return { year, text: String(year), complete: false, ...(day === undefined ? {} : { problem: "day-without-month" }) };
  if (!isWholeNumberIn(month, 1, 12)) return { year, text: String(year), complete: false, problem: "invalid-date" };
  const monthYear = `${MONTHS[month - 1]} ${year}`;
  if (day === undefined) return { year, text: monthYear, complete: false };
  if (!isWholeNumberIn(day, 1, daysInMonth(year, month))) return { year, text: monthYear, complete: false, problem: "invalid-date" };
  return { year, text: `${day} ${monthYear}`, complete: true };
}

/** The year letter a writer gives to tell apart works by the same author in the same year: one lowercase letter. */
export function readYearLetter(input: string | undefined): { letter: string | null; invalid: boolean } {
  const text = (input ?? "").trim();
  if (!text) return { letter: null, invalid: false };
  return /^[a-z]$/u.test(text) ? { letter: text, invalid: false } : { letter: null, invalid: true };
}
