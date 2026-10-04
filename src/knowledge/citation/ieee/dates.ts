/**
 * IEEE dates: abbreviated months before the day and year, as in “Oct. 2011”,
 * “Dec. 8, 1965” and “Accessed: Feb. 1, 2009” (IEEE Reference Guide, v. 3.28.2025).
 * The guide's examples abbreviate June, July and September as Jun., Jul. and Sep.
 */

import { daysInMonth, isWholeNumberIn, type PublicationDate } from "../source";

export const IEEE_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] as const;

export type DateProblem = "invalid-date" | "day-without-month";

export interface IeeeDate {
  /** “Oct. 2011”, “Dec. 8, 1965”, “2011”, or null when there is nothing valid. */
  text: string | null;
  problem?: DateProblem;
}

/** The valid parts of a date, as IEEE writes them. Nothing is guessed. */
export function ieeeDate(date: PublicationDate | undefined): IeeeDate {
  const { year, month, day } = date ?? {};
  if (year === undefined) return month !== undefined || day !== undefined ? { text: null, problem: "invalid-date" } : { text: null };
  if (!isWholeNumberIn(year, 1, 9999)) return { text: null, problem: "invalid-date" };
  if (month === undefined) return day === undefined ? { text: String(year) } : { text: String(year), problem: "day-without-month" };
  if (!isWholeNumberIn(month, 1, 12)) return { text: String(year), problem: "invalid-date" };
  const name = IEEE_MONTHS[month - 1];
  if (day === undefined) return { text: `${name} ${year}` };
  if (!isWholeNumberIn(day, 1, daysInMonth(year, month))) return { text: `${name} ${year}`, problem: "invalid-date" };
  return { text: `${name} ${day}, ${year}` };
}
