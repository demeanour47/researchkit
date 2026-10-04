/**
 * One source in MLA 9: its works-cited entry and in-text citations, with every
 * decision and problem behind them. In-text citations are derived from what the
 * entry begins with, so the two always point to each other.
 */

import type { CitationLocator, Run, SourceRecord } from "../source";
import { formatInText, type MlaNarrative } from "./in-text";
import type { Decision, Note } from "./notes";
import { formatWorksCited } from "./works-cited";

export interface MlaCitation {
  worksCited: Run[];
  /** For example "(LeCun et al. 437)". */
  parenthetical: Run[];
  narrative: MlaNarrative;
  decisions: Decision[];
  notes: Note[];
}

export function formatMla(record: SourceRecord, locator?: CitationLocator): MlaCitation {
  const entry = formatWorksCited(record.source);
  const inText = formatInText(entry.lead, locator);
  return {
    worksCited: entry.runs,
    parenthetical: inText.parenthetical,
    narrative: inText.narrative,
    decisions: [...entry.decisions, ...inText.decisions],
    notes: [...entry.notes, ...inText.notes],
  };
}
