/**
 * MLA 9 dates in the works-cited list.
 *
 * - Dates are written day, month, year: 2 Mar. 2016 (MLA Style Center,
 *   style.mla.org/author-publisher-web-site-names/).
 * - Months longer than four letters are abbreviated (MLA Handbook, 9th ed.; MLA Style
 *   Center examples "Sept. 1959", "Oct. 2004", "25 Oct. 2015"). May, June and July are
 *   written in full.
 * - A missing date is left out. MLA does not use "n.d." (style.mla.org/placeholders/).
 */

import { daysInMonth, isWholeNumberIn, type PublicationDate } from "../source";

export const MLA_MONTHS = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
  "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec.",
] as const;

export type DateProblem = "invalid-date" | "day-without-month";

export interface MlaDate {
  /** "2 Mar. 2016", "Mar. 2016", "2016", or null when there is nothing valid to show. */
  text: string | null;
  problem?: DateProblem;
}

/** The date as MLA writes it, keeping only the parts that are valid. Nothing is guessed. */
export function formatMlaDate(date: PublicationDate | undefined): MlaDate {
  const { year, month, day } = date ?? {};
  if (year === undefined) {
    if (month !== undefined || day !== undefined) return { text: null, problem: "invalid-date" };
    return { text: null };
  }
  if (!isWholeNumberIn(year, 1, 9999)) return { text: null, problem: "invalid-date" };
  if (month === undefined) return day === undefined ? { text: String(year) } : { text: String(year), problem: "day-without-month" };
  if (!isWholeNumberIn(month, 1, 12)) return { text: String(year), problem: "invalid-date" };
  const monthText = `${MLA_MONTHS[month - 1]} ${year}`;
  if (day === undefined) return { text: monthText };
  if (!isWholeNumberIn(day, 1, daysInMonth(year, month))) return { text: monthText, problem: "invalid-date" };
  return { text: `${day} ${monthText}` };
}
