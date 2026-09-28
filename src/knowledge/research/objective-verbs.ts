/**
 * Action verbs for research objectives, grouped by research purpose.
 *
 * Verb choice depends on what the study sets out to do, not on methodology alone: a
 * qualitative study can describe or explore, a quantitative study can describe or
 * compare. These categories share the purpose dimension already used to classify
 * research questions (see question-types.ts), so a question and the objectives that
 * follow from it can be reasoned about with the same vocabulary. Choosing a category
 * is guidance, never a rule: the researcher always chooses the verb that fits their
 * study and design.
 */

import { detectQuestionTypes, getQuestionType, type QuestionTypeId } from "./question-types";

/** The purpose categories that have a distinct set of objective verbs. */
export const OBJECTIVE_VERB_CATEGORY_IDS = [
  "descriptive",
  "comparative",
  "relational",
  "correlational",
  "explanatory",
  "predictive",
  "exploratory",
] as const satisfies readonly QuestionTypeId[];

export type ObjectiveVerbCategoryId = (typeof OBJECTIVE_VERB_CATEGORY_IDS)[number];

export interface ObjectiveVerbCategory {
  id: ObjectiveVerbCategoryId;
  /** The category's name, shared with the matching question type. */
  name: string;
  /** When this category of verb usually fits. */
  guidance: string;
  /** Verbs typical of this purpose, most common first. */
  verbs: readonly string[];
}

export const OBJECTIVE_VERB_CATEGORIES: readonly ObjectiveVerbCategory[] = [
  {
    id: "descriptive",
    name: "Descriptive",
    guidance: "Fits an objective that reports what something is like or how common it is, without comparing groups or testing a relationship.",
    verbs: ["describe", "identify", "assess", "determine", "measure", "document"],
  },
  {
    id: "comparative",
    name: "Comparative",
    guidance: "Fits an objective that sets out to compare two or more groups, places or times on something.",
    verbs: ["compare", "evaluate", "assess", "examine"],
  },
  {
    id: "relational",
    name: "Relational",
    guidance: "Fits an objective that sets out to examine whether and how two or more things are related, without claiming which one causes the other.",
    verbs: ["examine", "investigate", "assess", "determine"],
  },
  {
    id: "correlational",
    name: "Correlational",
    guidance: "Fits an objective that sets out to measure how strongly two variables vary together.",
    verbs: ["examine", "determine", "assess", "measure"],
  },
  {
    id: "explanatory",
    name: "Explanatory",
    guidance: "Fits an objective that sets out to explain why something happens, or how one thing influences another. Claims about influence need a design that can support them.",
    verbs: ["examine", "investigate", "determine", "analyse"],
  },
  {
    id: "predictive",
    name: "Predictive",
    guidance: "Fits an objective that sets out to find out whether one or more factors predict a later outcome.",
    verbs: ["examine", "determine", "assess"],
  },
  {
    id: "exploratory",
    name: "Exploratory",
    guidance: "Fits an objective that sets out to explore or understand experiences or meanings, usually where little is known. Needs a clear focus so it doesn't stay too broad.",
    verbs: ["explore", "understand", "investigate", "examine"],
  },
];

export function getVerbCategory(id: ObjectiveVerbCategoryId): ObjectiveVerbCategory {
  const category = OBJECTIVE_VERB_CATEGORIES.find((candidate) => candidate.id === id);
  if (!category) throw new RangeError(`Unknown objective verb category: ${id}`);
  return category;
}

/** Every verb across every category, without repeats, in lower case. Used to recognise a research action verb in text. */
export const RESEARCH_ACTION_VERBS: readonly string[] = [...new Set(OBJECTIVE_VERB_CATEGORIES.flatMap((category) => category.verbs))];

export interface VerbCategorySuggestion {
  category: ObjectiveVerbCategoryId;
  reason: string;
}

/**
 * Verb categories that suit the research question's wording, each with the reason.
 * These are suggestions to consider, not a rule that a question's wording determines
 * the objective's verb: the researcher always chooses.
 */
export function suggestVerbCategories(question: string | undefined): VerbCategorySuggestion[] {
  if (!question) return [];
  return detectQuestionTypes(question)
    .filter((detection) => getQuestionType(detection.type).dimension === "purpose")
    .filter((detection): detection is { type: ObjectiveVerbCategoryId; cues: string[]; reason: string } =>
      (OBJECTIVE_VERB_CATEGORY_IDS as readonly string[]).includes(detection.type),
    )
    .map((detection) => ({ category: detection.type, reason: detection.reason }));
}
