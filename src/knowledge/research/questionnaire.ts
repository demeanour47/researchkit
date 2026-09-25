/**
 * The questionnaire as stored in the project draft: reading it (sections, numbering,
 * wording with placeholders) and checking it at the boundary. Editing lives in
 * questionnaire-sections.ts and questionnaire-items.ts; building in questionnaire-builder.ts.
 *
 * Questionnaires are immutable: every change returns a new one.
 */

import { SCALE_PRESET_IDS, type QuestionScale } from "./questionnaire-scales";
import {
  QUESTIONNAIRE_PLACEHOLDERS,
  QUESTION_TYPES,
  QUESTION_TYPE_INFO,
  SECTION_KINDS,
  type Question,
  type Questionnaire,
  type QuestionnaireSection,
} from "./questionnaire-types";
import type { ProjectVariable } from "./variable-types";

export const EMPTY_QUESTIONNAIRE: Questionnaire = { title: "", sections: [], questions: [] };

export function findSection(questionnaire: Questionnaire, id: string): QuestionnaireSection {
  const section = questionnaire.sections.find((candidate) => candidate.id === id);
  if (!section) throw new RangeError(`Unknown section: ${id}`);
  return section;
}

export function findQuestion(questionnaire: Questionnaire, id: string): Question {
  const question = questionnaire.questions.find((candidate) => candidate.id === id);
  if (!question) throw new RangeError(`Unknown question: ${id}`);
  return question;
}

/** A section's questions, in order. */
export const sectionQuestions = (questionnaire: Questionnaire, sectionId: string): Question[] => questionnaire.questions.filter((question) => question.section === sectionId);

/**
 * Where a question joins a section at a position among its questions, as an index into
 * the full list. Keeps the stored order matching the section order, even for a section
 * that has no questions yet. Positions are clamped to the section.
 */
export function insertionIndex(sections: readonly QuestionnaireSection[], questions: readonly Question[], sectionId: string, position = Number.POSITIVE_INFINITY): number {
  const siblings = questions.filter((question) => question.section === sectionId);
  const at = Math.max(0, Math.min(siblings.length, Math.round(position)));
  if (at < siblings.length) return questions.indexOf(siblings[at]);
  if (siblings.length > 0) return questions.indexOf(siblings[siblings.length - 1]) + 1;
  const order = sections.map((section) => section.id);
  const later = questions.findIndex((question) => order.indexOf(question.section) > order.indexOf(sectionId));
  return later === -1 ? questions.length : later;
}

/** Every question in the order respondents meet them: section by section. */
export const orderedQuestions = (questionnaire: Questionnaire): Question[] => questionnaire.sections.flatMap((section) => sectionQuestions(questionnaire, section.id));

/**
 * Question numbers, running on through the whole questionnaire so every question has
 * one number. Statements in a matrix table are numbered under it: 5a, 5b, and so on.
 */
export function questionNumbers(questionnaire: Questionnaire): Map<string, string> {
  return new Map(orderedQuestions(questionnaire).map((question, index) => [question.id, String(index + 1)]));
}

/** The letter for a matrix statement: a to z, then aa, ab, and so on. */
export function rowLetter(index: number): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return index < 26 ? letters[index] : rowLetter(Math.floor(index / 26) - 1) + letters[index % 26];
}

export interface Wording {
  text: string;
  /** True while the researcher hasn't written the wording, so the text is a placeholder. */
  placeholder: boolean;
}

/** The question as respondents would read it, or a placeholder naming what it should ask about. */
export function questionWording(question: Question, variables: readonly ProjectVariable[], sectionKind?: string): Wording {
  const text = question.text.trim();
  if (text) return { text, placeholder: false };
  const variable = variables.find((candidate) => candidate.id === question.variableId);
  const indicator = variable?.possibleIndicators.find((candidate) => candidate.id === question.indicatorId);
  if (indicator) return { text: QUESTIONNAIRE_PLACEHOLDERS.question(indicator.name), placeholder: true };
  if (variable) return { text: QUESTIONNAIRE_PLACEHOLDERS.question(variable.name), placeholder: true };
  if (sectionKind === "consent") return { text: QUESTIONNAIRE_PLACEHOLDERS.consentQuestion, placeholder: true };
  return { text: QUESTIONNAIRE_PLACEHOLDERS.unlinked, placeholder: true };
}

/** The options respondents choose from: fixed ones for yes/no and true/false, otherwise the researcher's, or placeholders. */
export function answerOptions(question: Question): Wording[] {
  const info = QUESTION_TYPE_INFO[question.type];
  if (info.fixedOptions.length > 0) return info.fixedOptions.map((text) => ({ text, placeholder: false }));
  if (!info.usesOptions) return [];
  const written = question.options.map((option) => option.trim()).filter(Boolean);
  return written.length > 0 ? written.map((text) => ({ text, placeholder: false })) : [1, 2].map((number) => ({ text: QUESTIONNAIRE_PLACEHOLDERS.option(number), placeholder: true }));
}

/** A matrix table's statements, or placeholders. */
export function matrixRows(question: Question): Wording[] {
  if (!QUESTION_TYPE_INFO[question.type].usesRows) return [];
  const written = question.rows.map((row) => row.trim()).filter(Boolean);
  return written.length > 0 ? written.map((text) => ({ text, placeholder: false })) : [1, 2].map((number) => ({ text: QUESTIONNAIRE_PLACEHOLDERS.row(number), placeholder: true }));
}

const clean = (text: string) => text.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const cleanItems = (items: readonly string[]) => items.map((item) => clean(item)).filter(Boolean);

function cleanScale(scale: QuestionScale): QuestionScale {
  if (!SCALE_PRESET_IDS.includes(scale.preset)) throw new RangeError(`Unknown scale: ${scale.preset}`);
  if (scale.direction !== "ascending" && scale.direction !== "descending") throw new RangeError(`Unknown scale direction: ${scale.direction}`);
  if (scale.labels.length !== scale.values.length) throw new RangeError("Every scale label needs exactly one number.");
  if (!scale.values.every((value) => Number.isFinite(value))) throw new RangeError("Scale values must be numbers.");
  return {
    preset: scale.preset,
    labels: scale.labels.map((label) => clean(label)),
    values: [...scale.values],
    anchors: scale.anchors ? [clean(scale.anchors[0]), clean(scale.anchors[1])] : null,
    direction: scale.direction,
    reverseScored: Boolean(scale.reverseScored),
    references: [...scale.references],
  };
}

/**
 * Checks a questionnaire and returns a clean copy: text trimmed, empty options dropped,
 * options, statements and scales kept only for the types that use them. Throws a
 * RangeError for an unknown type or section kind, a repeated id, or a question in a
 * section that doesn't exist.
 */
export function cleanQuestionnaire(questionnaire: Questionnaire): Questionnaire {
  const sectionIds = new Set<string>();
  const sections = questionnaire.sections.map((section) => {
    if (!SECTION_KINDS.includes(section.kind)) throw new RangeError(`Unknown section kind: ${section.kind}`);
    if (!section.id || sectionIds.has(section.id)) throw new RangeError(`Missing or repeated section id: ${section.id}`);
    sectionIds.add(section.id);
    return { id: section.id, kind: section.kind, title: clean(section.title), content: clean(section.content) };
  });
  const questionIds = new Set<string>();
  const questions = questionnaire.questions.map((question) => {
    if (!QUESTION_TYPES.includes(question.type)) throw new RangeError(`Unknown question type: ${question.type}`);
    if (!question.id || questionIds.has(question.id)) throw new RangeError(`Missing or repeated question id: ${question.id}`);
    if (!sectionIds.has(question.section)) throw new RangeError(`Question ${question.id} is in a section that doesn't exist: ${question.section}`);
    questionIds.add(question.id);
    const info = QUESTION_TYPE_INFO[question.type];
    if (info.usesScale && !question.scale) throw new RangeError(`Question ${question.id} needs a scale.`);
    return {
      id: question.id,
      section: question.section,
      text: clean(question.text),
      type: question.type,
      variableId: question.variableId || null,
      indicatorId: question.variableId ? question.indicatorId || null : null,
      required: Boolean(question.required),
      helpText: clean(question.helpText),
      notes: clean(question.notes),
      options: info.usesOptions ? cleanItems(question.options) : [],
      rows: info.usesRows ? cleanItems(question.rows) : [],
      scale: info.usesScale && question.scale ? cleanScale(question.scale) : null,
    };
  });
  return { title: clean(questionnaire.title), sections, questions };
}
