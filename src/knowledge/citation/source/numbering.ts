/**
 * Reference numbers for numeric citation styles (ADR-0007). In a numeric style a
 * citation points to a numbered entry in the reference list, and the number comes
 * from the order sources are first cited in the writer's document. A number is
 * therefore part of how a source is cited, never part of the source.
 *
 * This module reads the numbers a writer gives and checks them; each numeric style
 * decides how to write them, such as IEEE's [1], [3].
 */

export type NumberProblem =
  | { code: "no-numbers" }
  | { code: "not-a-number"; value: string }
  | { code: "not-positive"; value: string }
  | { code: "malformed-range"; value: string }
  | { code: "duplicate-number"; value: number }
  | { code: "not-ascending" };

export interface ReferenceNumbers {
  /** The numbers in the order given, each listed once, and ranges expanded; empty if any problem makes the list invalid. */
  numbers: number[];
  problems: NumberProblem[];
}

/** The largest range expanded, so a typing slip such as 1-10000 can't produce a huge citation. */
const MAX_RANGE = 100;

/** A whole number of one or more digits, with no sign, decimal point or exponent. */
const WHOLE = /^\d+$/u;

/**
 * Reads reference numbers typed as a list, such as "1, 3, 7" or "1 3 7", where a
 * range such as "4-7" stands for every number in it. Nothing is corrected: numbers
 * that aren't positive whole numbers, malformed ranges and repeats are reported, and
 * a list out of ascending order is reported but kept in the order given.
 */
export function parseReferenceNumbers(text: string): ReferenceNumbers {
  const problems: NumberProblem[] = [];
  const tokens = text.split(/[\s,;]+/u).filter(Boolean);
  if (tokens.length === 0) return { numbers: [], problems: [{ code: "no-numbers" }] };

  const numbers: number[] = [];
  for (const token of tokens) {
    const range = token.split(/[-‐‑‒–—]/u);
    if (range.length === 2 && range[0] !== "" && range[1] !== "") {
      const [start, end] = range;
      if (!WHOLE.test(start) || !WHOLE.test(end) || Number(start) < 1 || Number(end) <= Number(start) || Number(end) - Number(start) > MAX_RANGE) {
        problems.push({ code: "malformed-range", value: token });
        continue;
      }
      for (let n = Number(start); n <= Number(end); n += 1) numbers.push(n);
      continue;
    }
    if (/^-\d+$/u.test(token) || token === "0" || /^0+$/u.test(token)) problems.push({ code: "not-positive", value: token });
    else if (!WHOLE.test(token)) problems.push({ code: "not-a-number", value: token });
    else numbers.push(Number(token));
  }

  const seen = new Set<number>();
  for (const n of numbers) {
    if (seen.has(n)) problems.push({ code: "duplicate-number", value: n });
    seen.add(n);
  }
  if (numbers.some((n, index) => index > 0 && n < numbers[index - 1])) problems.push({ code: "not-ascending" });

  const invalid = problems.some((problem) => problem.code !== "not-ascending");
  return { numbers: invalid ? [] : numbers, problems };
}

/** Consecutive runs in a list of numbers, in the order given: [2, 4, 5, 6, 9] → [[2], [4, 5, 6], [9]]. */
export function consecutiveRuns(numbers: readonly number[]): number[][] {
  const runs: number[][] = [];
  for (const n of numbers) {
    const run = runs[runs.length - 1];
    if (run && n === run[run.length - 1] + 1) run.push(n);
    else runs.push([n]);
  }
  return runs;
}
