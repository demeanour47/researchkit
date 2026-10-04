/**
 * Chicago dates. Months are written in full, month then day: "March 8, 2022"
 * (CMOS 18 sample citations). In an author-date reference, the year already follows
 * the author, so a later date repeats only the month and day: "Effective November 15".
 */

import { MONTHS, daysInMonth, isWholeNumberIn, type PublicationDate } from "../source";

export type DateProblem = "invalid-date" | "day-without-month";

export interface ChicagoDate {
  /** The year, or null when there is no valid year. */
  year: number | null;
  /** "November 15" or "November", or null. */
  monthDay: string | null;
  problem?: DateProblem;
}

/** The valid parts of a date. Nothing is guessed. */
export function chicagoDate(date: PublicationDate | undefined): ChicagoDate {
  const { year, month, day } = date ?? {};
  if (year === undefined) return { year: null, monthDay: null, ...(month !== undefined || day !== undefined ? { problem: "invalid-date" } : {}) };
  if (!isWholeNumberIn(year, 1, 9999)) return { year: null, monthDay: null, problem: "invalid-date" };
  if (month === undefined) return day === undefined ? { year, monthDay: null } : { year, monthDay: null, problem: "day-without-month" };
  if (!isWholeNumberIn(month, 1, 12)) return { year, monthDay: null, problem: "invalid-date" };
  const monthName = MONTHS[month - 1];
  if (day === undefined) return { year, monthDay: monthName };
  if (!isWholeNumberIn(day, 1, daysInMonth(year, month))) return { year, monthDay: monthName, problem: "invalid-date" };
  return { year, monthDay: `${monthName} ${day}` };
}

/** A full date, as in an access date: "March 8, 2022". Null without a valid year. */
export function fullDate(date: ChicagoDate): string | null {
  if (date.year === null) return null;
  if (!date.monthDay) return String(date.year);
  return date.monthDay.includes(" ") ? `${date.monthDay}, ${date.year}` : `${date.monthDay} ${date.year}`;
}
