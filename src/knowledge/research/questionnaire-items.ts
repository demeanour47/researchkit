/**
 * Editing questions: adding, duplicating, deleting, moving, changing section or type,
 * editing the scale, and the question's own details. Question wording is always the
 * researcher's; a new question starts without any.
 */

import { findQuestion, findSection, insertionIndex } from "./questionnaire";
import { createScale, type QuestionScale } from "./questionnaire-scales";
import { QUESTION_TYPES, QUESTION_TYPE_INFO, type Question, type QuestionType, type Questionnaire } from "./questionnaire-types";

/** The scale a type starts with: 5-point agreement, or seven points between two words for a semantic differential. */
export function defaultScaleFor(type: QuestionType): QuestionScale | null {
  if (!QUESTION_TYPE_INFO[type].usesScale) return null;
  return createScale(type === "semantic-differential" ? "semantic-differential-7" : "agreement-5");
}

/** The next free id of the form q-1, q-2, and so on. Ids are never reused within a questionnaire. */
export function nextQuestionId(questionnaire: Questionnaire): string {
  const numbers = questionnaire.questions.map((question) => Number(/^q-(\d+)$/.exec(question.id)?.[1] ?? 0));
  return `q-${Math.max(0, ...numbers) + 1}`;
}

export interface NewQuestion {
  type?: QuestionType;
  variableId?: string | null;
  indicatorId?: string | null;
  text?: string;
  required?: boolean;
}

/** A question with no wording yet. */
export function createQuestion(id: string, section: string, details: NewQuestion = {}): Question {
  const type = details.type ?? "short-answer";
  if (!QUESTION_TYPES.includes(type)) throw new RangeError(`Unknown question type: ${type}`);
  return {
    id,
    section,
    text: details.text ?? "",
    type,
    variableId: details.variableId ?? null,
    indicatorId: details.variableId ? (details.indicatorId ?? null) : null,
    required: details.required ?? false,
    helpText: "",
    notes: "",
    options: [],
    rows: [],
    scale: defaultScaleFor(type),
  };
}

/** Adds a question at the end of a section. Returns the questionnaire and the new question's id. */
export function addQuestion(questionnaire: Questionnaire, sectionId: string, details: NewQuestion = {}): { questionnaire: Questionnaire; id: string } {
  findSection(questionnaire, sectionId);
  const id = nextQuestionId(questionnaire);
  const question = createQuestion(id, sectionId, details);
  const at = insertionIndex(questionnaire.sections, questionnaire.questions, sectionId);
  return { questionnaire: { ...questionnaire, questions: [...questionnaire.questions.slice(0, at), question, ...questionnaire.questions.slice(at)] }, id };
}

/** Copies a question, with its links, straight after the original. Returns the copy's id. */
export function duplicateQuestion(questionnaire: Questionnaire, id: string): { questionnaire: Questionnaire; id: string } {
  const original = findQuestion(questionnaire, id);
  const copyId = nextQuestionId(questionnaire);
  const at = questionnaire.questions.indexOf(original) + 1;
  const copy: Question = { ...original, id: copyId, options: [...original.options], rows: [...original.rows], scale: original.scale && { ...original.scale } };
  return { questionnaire: { ...questionnaire, questions: [...questionnaire.questions.slice(0, at), copy, ...questionnaire.questions.slice(at)] }, id: copyId };
}

export function deleteQuestion(questionnaire: Questionnaire, id: string): Questionnaire {
  findQuestion(questionnaire, id);
  return { ...questionnaire, questions: questionnaire.questions.filter((question) => question.id !== id) };
}

/** Moves a question to a position within its section, clamped to the section. */
export function moveQuestion(questionnaire: Questionnaire, id: string, toIndex: number): Questionnaire {
  const question = findQuestion(questionnaire, id);
  const others = questionnaire.questions.filter((candidate) => candidate.id !== id);
  const position = insertionIndex(questionnaire.sections, others, question.section, toIndex);
  return { ...questionnaire, questions: [...others.slice(0, position), question, ...others.slice(position)] };
}

/** Moves a question to the end of another section. */
export function changeSection(questionnaire: Questionnaire, id: string, sectionId: string): Questionnaire {
  const question = findQuestion(questionnaire, id);
  findSection(questionnaire, sectionId);
  if (question.section === sectionId) return questionnaire;
  const others = questionnaire.questions.filter((candidate) => candidate.id !== id);
  const at = insertionIndex(questionnaire.sections, others, sectionId);
  return { ...questionnaire, questions: [...others.slice(0, at), { ...question, section: sectionId }, ...others.slice(at)] };
}

const replaceQuestion = (questionnaire: Questionnaire, id: string, change: (question: Question) => Question): Questionnaire => {
  findQuestion(questionnaire, id);
  return { ...questionnaire, questions: questionnaire.questions.map((question) => (question.id === id ? change(question) : question)) };
};

/**
 * Changes the type. Options, statements and the scale are kept when the new type
 * uses them and dropped when it doesn't. A semantic differential gets its own
 * two-ended scale; the other scale types keep the current one.
 */
export function changeType(questionnaire: Questionnaire, id: string, type: QuestionType): Questionnaire {
  if (!QUESTION_TYPES.includes(type)) throw new RangeError(`Unknown question type: ${type}`);
  return replaceQuestion(questionnaire, id, (question) => {
    const info = QUESTION_TYPE_INFO[type];
    const differential = (scale: QuestionScale | null) => scale?.preset === "semantic-differential-7";
    const keepScale = info.usesScale && question.scale && (type === "semantic-differential") === differential(question.scale);
    return {
      ...question,
      type,
      options: info.usesOptions ? question.options : [],
      rows: info.usesRows ? question.rows : [],
      scale: keepScale ? question.scale : defaultScaleFor(type),
    };
  });
}

export type QuestionDetails = Partial<Pick<Question, "text" | "required" | "helpText" | "notes" | "options" | "rows">>;

/** Updates the question's own details, kept as typed. */
export function updateQuestion(questionnaire: Questionnaire, id: string, details: QuestionDetails): Questionnaire {
  return replaceQuestion(questionnaire, id, (question) => {
    if ((details.options && !QUESTION_TYPE_INFO[question.type].usesOptions) || (details.rows && !QUESTION_TYPE_INFO[question.type].usesRows)) {
      throw new RangeError(`${QUESTION_TYPE_INFO[question.type].label} questions don't have ${details.options ? "options" : "statements"}.`);
    }
    return { ...question, ...details };
  });
}

/** Links a question to a variable and one of its indicators, or unlinks it with null. */
export function linkQuestion(questionnaire: Questionnaire, id: string, variableId: string | null, indicatorId: string | null = null): Questionnaire {
  return replaceQuestion(questionnaire, id, (question) => ({ ...question, variableId, indicatorId: variableId ? indicatorId : null }));
}

export function setQuestionScale(questionnaire: Questionnaire, id: string, scale: QuestionScale): Questionnaire {
  return replaceQuestion(questionnaire, id, (question) => {
    if (!QUESTION_TYPE_INFO[question.type].usesScale) throw new RangeError(`${QUESTION_TYPE_INFO[question.type].label} questions don't use a scale.`);
    return { ...question, scale };
  });
}
