/**
 * Chicago inclusive numbers, as the Chicago Manual of Style's own
 * blog sets them out (cmosshoptalk.com, "316–7, 316–17, or 316–317?", 2018):
 *
 * 1. Up to 100, and for multiples of 100, use all the digits: 3–10, 71–72, 96–117,
 *    100–104, 1100–1113.
 * 2. For 101 through 109 (and 201–209, and so on), show only the changed part:
 *    101–8, 808–33, 1103–4.
 * 3. Otherwise use two digits, or more if needed to show the changed part:
 *    321–28, 498–532, 1087–89, 1496–500, 11564–615, 12991–3001.
 *
 * The CMOS 18 sample citations follow these rules: 117–18, 471–85, 1818–59.
 * Shortening applies only to two plain whole numbers in ascending order. Anything
 * else (roman numerals, article IDs, numbers with commas, a range already
 * shortened) is kept as typed, with only its dash normalised.
 */

import { formatPages } from "../source";

export interface ChicagoPages {
  text: string;
  /** Whether a range was entered. */
  range: boolean;
  /** True when the second number was shortened. */
  shortened: boolean;
}

/** The second number, from the first digit that differs from the first number. */
function changedPart(start: string, end: string, minimumDigits: number): string {
  if (start.length !== end.length) return end;
  let first = 0;
  while (first < end.length && start[first] === end[first]) first += 1;
  return end.slice(Math.min(first, end.length - minimumDigits));
}

/** A page or page range as Chicago writes it. */
export function formatChicagoPages(pages: string): ChicagoPages {
  const text = formatPages(pages);
  const parts = text.split("–");
  if (parts.length !== 2 || parts.some((part) => part === "")) return { text, range: parts.length > 1, shortened: false };
  const [start, end] = parts;
  const from = Number(start);
  if (!/^\d+$/u.test(start) || !/^\d+$/u.test(end) || Number(end) <= from || from < 100 || from % 100 === 0) {
    return { text, range: true, shortened: false };
  }
  const short = from % 100 < 10 ? changedPart(start, end, 1) : changedPart(start, end, 2);
  return { text: `${start}–${short}`, range: true, shortened: short !== end };
}
