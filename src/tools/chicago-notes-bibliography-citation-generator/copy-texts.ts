/**
 * What each copy button copies: exactly what is shown, as plain text with
 * punctuation unchanged, and as HTML so italics survive pasting into a word processor.
 * Note numbers aren't included; the writer's word processor supplies them.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { runsHtml } from "../../features/citation/runs-html";
import type { ChicagoNotesBibliographyCitation } from "../../knowledge/citation/chicago/notes-bibliography";
import { plainText, type Run } from "../../knowledge/citation/source/runs";
import type { CopyTarget } from "./copy";

export interface CopyText {
  text: string;
  html: string;
}

export function copyTexts(citation: ChicagoNotesBibliographyCitation): Record<CopyTarget, CopyText> {
  const copy = (runs: readonly Run[]): CopyText => ({ text: plainText(runs), html: runsHtml(runs) });
  return { fullNote: copy(citation.fullNote), shortNote: copy(citation.shortNote), bibliography: copy(citation.bibliography) };
}
