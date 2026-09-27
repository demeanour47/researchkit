/**
 * Numbers as tables print them. Statistics take the chosen decimals; counts are whole
 * numbers with thousands separators; percentages take one decimal; p-values take three,
 * with “< .001” below one in a thousand. APA style drops the leading zero from values
 * that can't exceed 1, such as p, r, β and α; the other styles keep it. Negative values
 * take a true minus sign, which exports that feed spreadsheets turn back into a hyphen.
 */

import { formatBounded, formatStat } from "../research/results/format";
import type { StarLevel } from "./types";

export const MINUS = "−";

const withMinus = (text: string) => text.replace(/^-/, MINUS);

/** A statistic with fixed decimals. Bounded statistics lose the leading zero when the style drops it. */
export function formatNumber(value: number, decimals: number, { bounded = false, dropLeadingZero = false }: { bounded?: boolean; dropLeadingZero?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "";
  const places = Math.max(0, Math.min(6, decimals));
  return withMinus(bounded && dropLeadingZero ? formatBounded(value, places) : formatStat(value, places));
}

/** A count, with thousands separators. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "";
  return withMinus(Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

/** A percentage, with one decimal by default and no percent sign, as table columns headed “%” print it. */
export const formatPercent = (value: number, decimals = 1) => formatNumber(value, decimals);

/** A p-value for a table cell: “.032”, “< .001” or “> .999”, with the leading zero when the style keeps it. */
export function formatPValue(p: number, dropLeadingZero: boolean): string {
  if (!Number.isFinite(p)) return "";
  const text = p < 0.001 ? "< .001" : p > 0.999 ? "> .999" : formatBounded(p, 3);
  return dropLeadingZero ? text : text.replace(/(^|[<> ])\./, "$10.");
}

/** Asterisks for the strongest significance level a p-value reaches: * below .05, ** below .01, *** below .001. */
export function stars(p: number): string {
  if (!Number.isFinite(p)) return "";
  if (p < 0.001) return "***";
  if (p < 0.01) return "**";
  if (p < 0.05) return "*";
  return "";
}

/** The significance level asterisks stand for. */
export const starLevel = (marks: string): StarLevel | null => (marks === "***" ? 0.001 : marks === "**" ? 0.01 : marks === "*" ? 0.05 : null);

/** A number in Roman numerals, as IEEE numbers tables. */
export function roman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) return String(value);
  const numerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = value;
  let out = "";
  for (const [amount, numeral] of numerals) {
    while (rest >= amount) {
      out += numeral;
      rest -= amount;
    }
  }
  return out;
}

/** A cell's text for spreadsheets: a hyphen for the minus sign. */
export const plainMinus = (text: string) => text.replace(/−/g, "-");
