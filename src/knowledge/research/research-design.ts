/**
 * The research design record stored in the project draft: the designs the
 * researcher is considering, the one they have chosen (only ever by their own
 * action), their justification, notes and decision answers.
 */

import { DECISION_UNSURE, validateAnswers, type DecisionAnswers, type DecisionQuestionId } from "./design-decision";
import { isDesignId, type DesignId } from "./design-types";

export interface ResearchDesignRecord {
  /** The design the researcher has chosen, or null until they choose. */
  chosen: DesignId | null;
  /** Designs being considered and compared, in the order added. */
  shortlist: readonly DesignId[];
  justification: string;
  notes: string;
  answers: DecisionAnswers;
}

export const EMPTY_DESIGN: ResearchDesignRecord = { chosen: null, shortlist: [], justification: "", notes: "", answers: {} };

function check(id: DesignId) {
  if (!isDesignId(id)) throw new RangeError(`Unknown research design: ${id}`);
}

/** Adds a design to the shortlist, once. */
export function shortlistDesign(record: ResearchDesignRecord, id: DesignId): ResearchDesignRecord {
  check(id);
  return record.shortlist.includes(id) ? record : { ...record, shortlist: [...record.shortlist, id] };
}

/** Removes a design from the shortlist; if it was chosen, nothing is chosen any more. */
export function removeDesign(record: ResearchDesignRecord, id: DesignId): ResearchDesignRecord {
  check(id);
  return { ...record, shortlist: record.shortlist.filter((candidate) => candidate !== id), chosen: record.chosen === id ? null : record.chosen };
}

/** Records the researcher's own choice of design, adding it to the shortlist if needed. `null` clears the choice. */
export function chooseDesign(record: ResearchDesignRecord, id: DesignId | null): ResearchDesignRecord {
  if (id === null) return { ...record, chosen: null };
  return { ...shortlistDesign(record, id), chosen: id };
}

export const setJustification = (record: ResearchDesignRecord, justification: string): ResearchDesignRecord => ({ ...record, justification });
export const setDesignNotes = (record: ResearchDesignRecord, notes: string): ResearchDesignRecord => ({ ...record, notes });

/** Records an answer to a decision question; “unsure” or undefined clears it. */
export function answerQuestion(record: ResearchDesignRecord, question: DecisionQuestionId, answer: string | undefined): ResearchDesignRecord {
  const answers = { ...record.answers };
  if (answer === undefined || answer === DECISION_UNSURE) delete answers[question];
  else answers[question] = answer;
  validateAnswers(answers);
  return { ...record, answers };
}

/** Checks and cleans a record for storage. Throws a RangeError for an unknown design or answer. */
export function cleanDesignRecord(record: ResearchDesignRecord): ResearchDesignRecord | undefined {
  for (const id of record.shortlist) check(id);
  if (record.chosen !== null) check(record.chosen);
  validateAnswers(record.answers);
  const shortlist = [...new Set(record.chosen && !record.shortlist.includes(record.chosen) ? [...record.shortlist, record.chosen] : record.shortlist)];
  const clean = (text: string) => text.replace(/[ \t]+/g, " ").trim();
  const cleaned: ResearchDesignRecord = {
    chosen: record.chosen,
    shortlist,
    justification: clean(record.justification),
    notes: clean(record.notes),
    answers: Object.fromEntries(Object.entries(record.answers).filter(([, value]) => value !== undefined && value !== DECISION_UNSURE)),
  };
  const empty = !cleaned.chosen && cleaned.shortlist.length === 0 && !cleaned.justification && !cleaned.notes && Object.keys(cleaned.answers).length === 0;
  return empty ? undefined : cleaned;
}
