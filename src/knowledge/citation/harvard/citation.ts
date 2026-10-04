/**
 * One source in ResearchKit's Harvard profile: its reference and text citations,
 * with every decision and problem behind them. Text citations are derived from what
 * the reference begins with and its date, so the two always match.
 */

import type { CitationLocator, Run, SourceRecord } from "../source";
import { formatHarvardTextCitations } from "./in-text";
import type { Decision, Note } from "./notes";
import { formatHarvardReference } from "./reference";

/**
 * How the writer is citing the source. The year letter (a, b …) belongs here, not in
 * the source: it depends on the writer's other references (ADR-0008).
 */
export interface HarvardRequest {
  record: SourceRecord;
  locator?: CitationLocator;
  /** A letter the writer chose to tell apart works by the same author in the same year. */
  yearLetter?: string;
}

export interface HarvardCitation {
  reference: Run[];
  parenthetical: Run[];
  narrative: Run[];
  decisions: Decision[];
  notes: Note[];
}

export function formatHarvard({ record, locator, yearLetter }: HarvardRequest): HarvardCitation {
  const reference = formatHarvardReference(record.source, yearLetter);
  const text = formatHarvardTextCitations(reference.lead, reference.date, locator);
  return {
    reference: reference.runs,
    parenthetical: text.parenthetical,
    narrative: text.narrative,
    decisions: [...reference.decisions, ...text.decisions],
    notes: [...reference.notes, ...text.notes],
  };
}
