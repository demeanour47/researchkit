/**
 * What each copy button copies: exactly what is shown, as plain text with
 * punctuation unchanged, and as HTML so italics survive pasting into a word processor.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { runsHtml } from "../../features/citation/runs-html";
import type { HarvardCitation } from "../../knowledge/citation/harvard";
import { plainText } from "../../knowledge/citation/source/runs";
import type { CopyTarget } from "./copy";

export interface CopyText {
  text: string;
  html: string;
}

export function copyTexts(citation: HarvardCitation): Record<CopyTarget, CopyText> {
  const copy = (runs: HarvardCitation["reference"]): CopyText => ({ text: plainText(runs), html: runsHtml(runs) });
  return { reference: copy(citation.reference), parenthetical: copy(citation.parenthetical), narrative: copy(citation.narrative) };
}
