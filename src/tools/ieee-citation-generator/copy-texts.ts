/**
 * What each copy button copies: exactly what is shown, as plain text with
 * punctuation unchanged, and as HTML so italics survive pasting into a word processor.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { runsHtml } from "../../features/citation/runs-html";
import { plainText, type Run } from "../../knowledge/citation/source/runs";

export interface CopyText {
  text: string;
  html: string;
}

export const copyText = (runs: readonly Run[]): CopyText => ({ text: plainText(runs), html: runsHtml(runs) });
