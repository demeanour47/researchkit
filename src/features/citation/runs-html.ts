/**
 * Formatted runs as HTML for rich copying, so a word processor keeps the italics a
 * citation style requires. The plain-text alternative is plainText().
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import type { Run } from "../../knowledge/citation/source";
import { escapeHtml } from "../../knowledge/tables/html";

export function runsHtml(runs: readonly Run[]): string {
  return runs.map((run) => (run.italic ? `<i>${escapeHtml(run.text)}</i>` : escapeHtml(run.text))).join("");
}
