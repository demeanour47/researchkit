/**
 * Checks across an alphabetical list that several styles share in outline: whether
 * entries are in order, and whether works by the same author in the same year are
 * told apart. Each style supplies what it sorts by and how it explains the rule;
 * entries the checker couldn't read are skipped rather than guessed at.
 */

import { comparable } from "./features";
import { issue } from "./issue";
import type { ParsedReference } from "./types";

/** Leading articles that alphabetical lists ignore when a title comes first. */
const ARTICLE = /^(?:a|an|the)\s+/u;

/** The first word or name an entry is alphabetized by, ready to compare. */
export function sortKey(reference: ParsedReference): string | null {
  const first = reference.key?.names[0] ?? reference.key?.title;
  if (!first) return null;
  return comparable(first).replace(ARTICLE, "");
}

export interface OrderRule {
  /** Why the list is ordered this way, in the style's terms. */
  explanation: string;
  /** Whether the same author's works go by year, earliest first. */
  sameAuthorByYear: boolean;
}

/** Warns where an entry comes before the one above it alphabetically, or, for the same author, by year. */
export function checkAlphabeticalOrder(references: readonly ParsedReference[], rule: OrderRule): void {
  let previous: ParsedReference | null = null;
  for (const reference of references) {
    if (reference.excluded) continue;
    const key = sortKey(reference);
    if (key === null) continue;
    const previousKey = previous ? sortKey(previous) : null;
    if (previous && previousKey !== null) {
      const order = key.localeCompare(previousKey, "en");
      const sameAuthor = order === 0 && rule.sameAuthorByYear;
      const thisYear = Number.parseInt(reference.key?.year ?? "", 10);
      const previousYear = Number.parseInt(previous.key?.year ?? "", 10);
      if (order < 0) {
        reference.issues.push(issue("ordering", "warning", "Entry appears out of alphabetical order.", rule.explanation, "Check where this entry belongs; the checker doesn't reorder your text.", `Comes after reference ${previous.index}`));
      } else if (sameAuthor && Number.isFinite(thisYear) && Number.isFinite(previousYear) && thisYear < previousYear) {
        reference.issues.push(issue("ordering", "warning", "Works by the same author appear out of date order.", "Works by the same author are listed by year, earliest first.", "Check the order of this author's works.", `Comes after reference ${previous.index}`));
      }
    }
    previous = reference;
  }
}

/** Reports same-author, same-year works that aren't told apart by distinct letters. */
export function checkYearLetters(references: readonly ParsedReference[], explanation: string): void {
  const groups = new Map<string, ParsedReference[]>();
  for (const reference of references) {
    const key = reference.key;
    if (reference.excluded || !key || key.names.length === 0 || !key.year) continue;
    const group = `${key.names.map(comparable).join("|")}|${key.year.replace(/[a-z]$/u, "")}`;
    groups.set(group, [...(groups.get(group) ?? []), reference]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const letters = group.map((reference) => /[a-z]$/u.exec(reference.key?.year ?? "")?.[0] ?? null);
    const distinct = letters.every((letter) => letter !== null) && new Set(letters).size === letters.length;
    if (distinct) continue;
    for (const reference of group) {
      reference.issues.push(issue("manual-review", "warning", "Multiple works by the same author appear in the same year.", explanation, "Give each work a distinct letter after the year, in the list and in every citation; the checker doesn't assign them.", `References ${group.map((item) => item.index).join(", ")}`));
    }
  }
}
