/**
 * What each copy button copies: exactly what is shown, as plain text with
 * punctuation unchanged, and as HTML so the italics MLA requires survive pasting
 * into a word processor. The narrative copy is the name for your sentence.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { runsHtml } from "../../features/citation/runs-html";
import type { MlaCitation } from "../../knowledge/citation/mla";
import { plainText } from "../../knowledge/citation/source/runs";
import type { CopyTarget } from "./copy";

export interface CopyText {
  text: string;
  /** Present when the copy should keep formatting. */
  html?: string;
}

export function copyTexts(citation: MlaCitation): Record<CopyTarget, CopyText> {
  const { firstMention } = citation.narrative;
  return {
    worksCited: { text: plainText(citation.worksCited), html: runsHtml(citation.worksCited) },
    parenthetical: { text: plainText(citation.parenthetical), html: runsHtml(citation.parenthetical) },
    narrative: { text: plainText(firstMention), html: runsHtml(firstMention) },
  };
}
