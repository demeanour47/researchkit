/**
 * One source in Chicago author-date: its reference list entry and text citations,
 * with every decision and problem behind them. Text citations are derived from
 * what the entry begins with and its year, so the two always match.
 */

import type { CitationLocator, Run, SourceRecord } from "../../source";
import { formatChicagoTextCitations } from "./in-text";
import type { Decision, Note } from "./notes";
import { formatChicagoReference } from "./reference";

export interface ChicagoAuthorDateCitation {
  reference: Run[];
  parenthetical: Run[];
  narrative: Run[];
  decisions: Decision[];
  notes: Note[];
}

export function formatChicagoAuthorDate(record: SourceRecord, locator?: CitationLocator): ChicagoAuthorDateCitation {
  const reference = formatChicagoReference(record.source);
  const text = formatChicagoTextCitations(reference.lead, reference.year, locator);
  return {
    reference: reference.runs,
    parenthetical: text.parenthetical,
    narrative: text.narrative,
    decisions: [...reference.decisions, ...text.decisions],
    // Year suffixes (2024a, 2024b) depend on the whole reference list, which a single-source generator can't see.
    notes: [...reference.notes, ...text.notes, { code: "same-year-suffix" }],
  };
}
