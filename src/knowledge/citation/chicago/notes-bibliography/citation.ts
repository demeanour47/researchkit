/**
 * One source in Chicago notes and bibliography: its full note, shortened note and
 * bibliography entry, built from one reading of the source so the three always agree.
 */

import type { Run } from "../../source";
import { analyse } from "./analysis";
import { formatChicagoBibliography } from "./bibliography";
import { formatChicagoNote } from "./note";
import type { Decision, Note } from "./notes";
import type { NotesBibliographyRequest } from "./request";

export interface ChicagoNotesBibliographyCitation {
  /** For the first citation of the source. */
  fullNote: Run[];
  /** For every later citation of the source. */
  shortNote: Run[];
  bibliography: Run[];
  /** Decisions behind each output, in that order, without repeats. */
  decisions: Decision[];
  notes: Note[];
}

const unique = <T>(items: readonly T[]) => items.filter((item, index) => items.findIndex((other) => JSON.stringify(other) === JSON.stringify(item)) === index);

export function formatChicagoNotesBibliography(request: NotesBibliographyRequest): ChicagoNotesBibliographyCitation {
  const analysis = analyse(request.record.source);
  const full = formatChicagoNote(request, "full-note", analysis);
  const short = formatChicagoNote(request, "short-note", analysis);
  const entry = formatChicagoBibliography(request.record.source, analysis);
  return {
    fullNote: full.runs,
    shortNote: short.runs,
    bibliography: entry.runs,
    decisions: unique([...full.decisions, ...short.decisions, ...entry.decisions]),
    notes: unique([...full.notes, ...short.notes, ...entry.notes]),
  };
}
