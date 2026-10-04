/**
 * MLA 9 page numbers and inclusive ranges.
 *
 * In a range, the second number is given in full up to 99; for larger numbers only
 * its last two digits are given, unless more are needed: 96–101, 103–04, 395–401,
 * 1608–774 (MLA Handbook, 9th ed.; MLA Style Center example "pp. 250-58",
 * style.mla.org/works-cited/citations-by-format/).
 *
 * The shortening is applied only to plain whole numbers. Anything else (roman
 * numerals, letters, numbers with commas, or a range already shortened) is kept as
 * typed, with only its dash normalised.
 */

import { formatPages } from "../source";

export interface MlaPages {
  text: string;
  /** Whether the range was written as a range ("pp.") or a single page ("p."). */
  range: boolean;
  /** True when the second number was shortened by the inclusive-number rule. */
  shortened: boolean;
}

/** The fewest trailing digits of `end`, at least two, that complete `start` into `end`. */
function shortenedEnd(start: string, end: string): string {
  if (start.length !== end.length) return end;
  for (let digits = 2; digits < end.length; digits += 1) {
    if (start.slice(0, end.length - digits) === end.slice(0, end.length - digits)) return end.slice(-digits);
  }
  return end;
}

/** A page or page range as MLA writes it. */
export function formatMlaPages(pages: string): MlaPages {
  const text = formatPages(pages);
  const parts = text.split("–");
  if (parts.length !== 2 || parts.some((part) => part === "")) return { text, range: parts.length > 1, shortened: false };
  const [start, end] = parts;
  if (!/^\d+$/u.test(start) || !/^\d+$/u.test(end) || Number(end) <= Number(start) || Number(start) < 100) {
    return { text, range: true, shortened: false };
  }
  const short = shortenedEnd(start, end);
  return { text: `${start}–${short}`, range: true, shortened: short !== end };
}
