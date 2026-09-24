/**
 * Assembles a draft research question from the researcher's own project details,
 * using the typical structure of the chosen question type.
 *
 * The draft is a starting point to rewrite, never a final question. It uses only the
 * words the researcher entered; anything missing is shown as a bracketed placeholder
 * instead of being invented.
 */

import { getQuestionType, QUESTION_TYPES, type QuestionTypeId } from "./question-types";
import { joinList, stripEndPunctuation } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";

export const PLACEHOLDERS = {
  independentVariable: "[independent variable]",
  dependentVariable: "[dependent variable]",
  population: "[population]",
  topic: "[topic]",
} as const;

export type PlaceholderId = keyof typeof PLACEHOLDERS;

export interface DraftQuestion {
  type: QuestionTypeId;
  /** The draft, with a placeholder for anything missing. */
  text: string;
  /** What the placeholders stand for, so the researcher knows what to add. */
  placeholders: PlaceholderId[];
  explanation: string;
}

/** Words that already introduce a place or time, so "in" isn't added before them. */
const PREPOSITIONS = /^(in|at|on|during|between|from|since|over|within|across|throughout|before|after|until|by|under|around|near)\b/i;

/** A location or time phrase ready to follow the rest of the question, such as " in Nepal". */
export function contextPhrase(value: string | undefined): string {
  const phrase = value ? stripEndPunctuation(value) : "";
  if (!phrase) return "";
  return PREPOSITIONS.test(phrase) ? ` ${phrase}` : ` in ${phrase}`;
}

/** Builds a draft for a question type from the project details. */
export function buildDraftQuestion(type: QuestionTypeId, project: ResearchProjectDraft): DraftQuestion {
  const placeholders = new Set<PlaceholderId>();
  const list = (values: readonly string[] | undefined, placeholder: PlaceholderId) => {
    const cleaned = (values ?? []).map(stripEndPunctuation).filter(Boolean);
    if (cleaned.length === 0) placeholders.add(placeholder);
    return { text: cleaned.length > 0 ? joinList(cleaned) : PLACEHOLDERS[placeholder], plural: cleaned.length > 1 };
  };
  const text = (value: string | undefined, placeholder: PlaceholderId) => {
    const cleaned = value ? stripEndPunctuation(value) : "";
    if (!cleaned) placeholders.add(placeholder);
    return cleaned || PLACEHOLDERS[placeholder];
  };

  const hasIv = (project.independentVariables?.length ?? 0) > 0;
  const hasDv = (project.dependentVariables?.length ?? 0) > 0;
  const iv = () => list(project.independentVariables, "independentVariable");
  const dv = () => list(project.dependentVariables, "dependentVariable");
  const population = () => text(project.population, "population");
  // A qualitative focus: the topic, or failing that the outcome the researcher named.
  const focus = () => (project.topic ? text(project.topic, "topic") : hasDv ? dv().text : text(undefined, "topic"));
  const where = () => `${contextPhrase(project.location)}${contextPhrase(project.timeContext)}`;
  const among = () => `among ${population()}${where()}`;

  let draft: string;
  switch (type) {
    case "descriptive":
      draft = hasDv || !project.topic ? `What is the level of ${dv().text} ${among()}?` : `What characterises ${focus()} ${among()}?`;
      break;
    case "comparative":
      draft = `How does ${dv().text} differ by ${iv().text} ${among()}?`;
      break;
    case "relational":
      draft = `What is the relationship between ${iv().text} and ${dv().text} ${among()}?`;
      break;
    case "correlational": {
      const predictor = iv();
      draft = `To what extent ${predictor.plural ? "are" : "is"} ${predictor.text} associated with ${dv().text} ${among()}?`;
      break;
    }
    case "explanatory": {
      const cause = iv();
      draft = `How and why ${cause.plural ? "do" : "does"} ${cause.text} influence ${dv().text} ${among()}?`;
      break;
    }
    case "exploratory":
      draft = `How do ${population()} experience ${focus()}${where()}?`;
      break;
    case "predictive": {
      const predictor = iv();
      draft = `To what extent ${predictor.plural ? "do" : "does"} ${predictor.text} predict ${dv().text} ${among()}?`;
      break;
    }
    case "qualitative":
      draft = `How do ${population()} describe their experiences of ${focus()}${where()}?`;
      break;
    case "quantitative":
      draft = hasIv ? `How much does ${dv().text} vary with ${iv().text} ${among()}?` : `What is the level of ${dv().text} ${among()}?`;
      break;
    case "mixed-methods": {
      const first = hasIv
        ? `To what extent ${iv().plural ? "are" : "is"} ${iv().text} associated with ${dv().text} ${among()}`
        : `What is the level of ${dv().text} ${among()}`;
      draft = `${first}, and how do they experience ${focus()}?`;
      break;
    }
  }

  const name = getQuestionType(type).name.toLowerCase();
  const missing = [...placeholders];
  return {
    type,
    text: draft,
    placeholders: missing,
    explanation:
      `This draft follows the usual structure of ${/^[aeiou]/.test(name) ? "an" : "a"} ${name} question and uses only the words you entered. ` +
      (missing.length > 0
        ? `The parts in square brackets are missing from your project details. `
        : "") +
      "It is a starting point: rewrite it in your own words and check it with your supervisor.",
  };
}

export interface TypeSuggestion {
  type: QuestionTypeId;
  reason: string;
}

const AIM_CUES: { type: QuestionTypeId; pattern: RegExp; purpose: string }[] = [
  { type: "exploratory", pattern: /\b(explor\w*|understand\w*|experienc\w*|perceptions?)\b/i, purpose: "explore how people experience or understand something" },
  { type: "comparative", pattern: /\b(compar\w*|differ\w*|contrast\w*)\b/i, purpose: "compare groups, places or times" },
  { type: "relational", pattern: /\b(relationships?|relat\w* to)\b/i, purpose: "examine how two things are related" },
  { type: "correlational", pattern: /\b(associat\w*|correlat\w*)\b/i, purpose: "measure how strongly two variables vary together" },
  { type: "explanatory", pattern: /\b(explain\w*|why|caus\w*|effects?|impacts?|influenc\w*)\b/i, purpose: "explain why or how something happens" },
  { type: "predictive", pattern: /\b(predict\w*|forecast\w*)\b/i, purpose: "predict an outcome" },
  { type: "descriptive", pattern: /\b(describ\w*|measur\w*|assess\w*|prevalence|levels?)\b/i, purpose: "describe or measure something" },
];

/**
 * Question types that suit the project details, each with the reason. These are
 * suggestions to consider; the researcher always chooses.
 */
export function suggestQuestionTypes(project: ResearchProjectDraft): TypeSuggestion[] {
  const suggestions = new Map<QuestionTypeId, string>();
  const add = (type: QuestionTypeId, reason: string) => {
    if (!suggestions.has(type)) suggestions.set(type, reason);
  };

  for (const { type, pattern, purpose } of AIM_CUES) {
    const match = project.researchAim ? pattern.exec(project.researchAim) : null;
    if (match) add(type, `Your aim uses the word “${match[0]}”, which suggests a question that sets out to ${purpose}.`);
  }

  const hasIv = (project.independentVariables?.length ?? 0) > 0;
  const hasDv = (project.dependentVariables?.length ?? 0) > 0;
  if (hasIv && hasDv) {
    add("relational", "You named both an independent and a dependent variable, so a question about how they are related fits your details.");
    add("explanatory", "You named what may influence an outcome and the outcome itself, so you could ask how or why one affects the other.");
  } else if (hasDv) {
    add("descriptive", "You named an outcome but nothing that might influence it, so a question describing that outcome fits your details.");
  }

  const methodology = project.methodology ?? project.researchOnionSelection?.choice;
  const philosophy = project.researchOnionSelection?.philosophy;
  if (methodology === "qualitative" || philosophy === "interpretivism") {
    add("qualitative", `Your ${methodology === "qualitative" ? "qualitative methodology" : "interpretivist philosophy"} suits a question about meanings and experiences.`);
    add("exploratory", "Qualitative and interpretive research often begins with an open, exploratory question.");
  }
  if (methodology === "quantitative" || philosophy === "positivism") {
    add("quantitative", `Your ${methodology === "quantitative" ? "quantitative methodology" : "positivist philosophy"} suits a question about things you can measure.`);
  }
  if (methodology === "mixed-methods" || philosophy === "pragmatism") {
    add("mixed-methods", `Your ${methodology === "mixed-methods" ? "mixed methods design" : "pragmatist philosophy"} suits a question with a measured part and an interpretive part.`);
  }

  // Keep the catalogue order, so suggestions always appear in the same sequence.
  return QUESTION_TYPES.filter((type) => suggestions.has(type.id)).map((type) => ({ type: type.id, reason: suggestions.get(type.id)! }));
}
