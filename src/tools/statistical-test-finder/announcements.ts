/**
 * What the Statistical Test Finder announces to screen readers when its result changes.
 * Pure, so it is tested. It names what changed, never ranks the tests.
 */

import type { FinderResult } from "../../knowledge/research/test-finder";

export function resultAnnouncement(result: FinderResult): string {
  switch (result.status) {
    case "incomplete":
      return result.missing.length === 1 ? `One more question: ${result.missing[0].prompt}` : `${result.missing.length} questions still to answer. Next: ${result.missing[0].prompt}`;
    case "invalid":
      return `Check your answers. ${result.problems[0]}`;
    case "complete": {
      const count = result.candidates.length;
      if (count === 0) return "No test this tool covers fits this situation. A note names the test usually used.";
      return `${count} candidate ${count === 1 ? "test" : "tests"} shown, each with why it may fit.`;
    }
  }
}

/** What identifies a result for announcing: a change in names alone doesn't change the tests, so it isn't announced. */
export function resultKey(result: FinderResult): string {
  switch (result.status) {
    case "incomplete":
      return `incomplete:${result.missing.map((entry) => entry.question).join(",")}`;
    case "invalid":
      return `invalid:${result.problems.join("|")}`;
    case "complete":
      return `complete:${result.candidates.map((candidate) => `${candidate.method}/${candidate.fit}`).join(",")}`;
  }
}
