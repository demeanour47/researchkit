/**
 * The plain text copied for each part of a citation: exactly what is shown, with
 * italics dropped rather than marked up, and punctuation unchanged.
 */

// A relative import, so the test runner can load this module (see TESTING.md).
import { plainText } from "../../knowledge/citation/apa/runs";
import type { Citation } from "@/knowledge/citation/apa";

export type CopyTarget = "reference" | "parenthetical" | "narrative";

export function copyTexts(citation: Citation): Record<CopyTarget, string> {
  return {
    reference: plainText(citation.reference),
    parenthetical: plainText(citation.parenthetical),
    narrative: plainText(citation.narrative),
  };
}
