/**
 * Assembles draft research objectives from the researcher's own project details,
 * following the usual structure for the chosen verb category.
 *
 * Every draft is a starting point to rewrite, never a final objective. It uses only
 * the words the researcher entered; anything missing is shown as a bracketed
 * placeholder instead of being invented. The verb is chosen by the researcher: this
 * module only assembles the sentence around it.
 */

import { PLACEHOLDERS, contextPhrase, type PlaceholderId } from "./question-builder";
import { joinList, stripEndPunctuation } from "./question-text";
import type { ObjectiveVerbCategoryId } from "./objective-verbs";
import type { ResearchProjectDraft } from "./research-project";

export interface DraftObjective {
  verb: string;
  category: ObjectiveVerbCategoryId;
  /** The draft, with a placeholder for anything missing. */
  text: string;
  /** What the placeholders stand for, so the researcher knows what to add. */
  placeholders: PlaceholderId[];
  explanation: string;
}

interface Parts {
  iv: { text: string; plural: boolean };
  dv: { text: string; plural: boolean };
  population: string;
  /** A qualitative focus: the topic, or failing that the outcome the researcher named. */
  focus: string;
  where: string;
  among: string;
  hasDv: boolean;
  hasTopic: boolean;
}

/** The project details assembled into the parts every objective sentence needs. */
function partsOf(project: ResearchProjectDraft): Parts {
  const list = (values: readonly string[] | undefined, placeholder: PlaceholderId) => {
    const cleaned = (values ?? []).map(stripEndPunctuation).filter(Boolean);
    return { text: cleaned.length > 0 ? joinList(cleaned) : PLACEHOLDERS[placeholder], plural: cleaned.length > 1 };
  };
  const text = (value: string | undefined, placeholder: PlaceholderId) => stripEndPunctuation(value ?? "") || PLACEHOLDERS[placeholder];

  const hasDv = (project.dependentVariables?.length ?? 0) > 0;
  const iv = list(project.independentVariables, "independentVariable");
  const dv = list(project.dependentVariables, "dependentVariable");
  const population = text(project.population, "population");
  const focus = project.topic ? text(project.topic, "topic") : hasDv ? dv.text : text(undefined, "topic");
  const where = `${contextPhrase(project.location)}${contextPhrase(project.timeContext)}`;
  const among = `among ${population}${where}`;

  return { iv, dv, population, focus, where, among, hasDv, hasTopic: Boolean(project.topic) };
}

/** The sentence body for a category, without the leading "To {verb} " or trailing full stop. */
function sentenceFor(category: ObjectiveVerbCategoryId, parts: Parts): string {
  const { iv, dv, population, focus, where, among } = parts;
  switch (category) {
    case "descriptive":
      return parts.hasDv || !parts.hasTopic ? `${dv.text} ${among}` : `the characteristics of ${focus} ${among}`;
    case "comparative":
      return `${dv.text} by ${iv.text} ${among}`;
    case "relational":
      return `the relationship between ${iv.text} and ${dv.text} ${among}`;
    case "correlational":
      return `the association between ${iv.text} and ${dv.text} ${among}`;
    case "explanatory":
      return `how ${iv.text} ${iv.plural ? "influence" : "influences"} ${dv.text} ${among}`;
    case "predictive":
      return `whether ${iv.text} ${iv.plural ? "predict" : "predicts"} ${dv.text} ${among}`;
    case "exploratory":
      return `how ${population} experience ${focus}${where}`;
  }
}

/** The placeholders actually present in an assembled sentence, in the order they appear. */
function placeholdersIn(text: string): PlaceholderId[] {
  return (Object.keys(PLACEHOLDERS) as PlaceholderId[])
    .filter((id) => text.includes(PLACEHOLDERS[id]))
    .sort((a, b) => text.indexOf(PLACEHOLDERS[a]) - text.indexOf(PLACEHOLDERS[b]));
}

const explanationFor = (categoryName: string, missing: readonly PlaceholderId[]) =>
  `This draft follows the usual structure of ${/^[aeiou]/i.test(categoryName) ? "an" : "a"} ${categoryName.toLowerCase()} objective and uses only the words you entered. ` +
  (missing.length > 0 ? "The parts in square brackets are missing from your project details. " : "") +
  "It is a starting point: rewrite it in your own words.";

/** A draft sentence with an explicit leading verb, used as-is (the body doesn't repeat it). */
function draftFrom(category: ObjectiveVerbCategoryId, verb: string, categoryName: string, body: string): DraftObjective {
  const text = `To ${verb} ${body}.`;
  const placeholders = placeholdersIn(text);
  return { verb, category, text, placeholders, explanation: explanationFor(categoryName, placeholders) };
}

/** Builds a draft general objective for a verb category, verb and the project's details. */
export function buildDraftGeneralObjective(category: ObjectiveVerbCategoryId, verb: string, project: ResearchProjectDraft, categoryName: string): DraftObjective {
  const cleanVerb = verb.trim().toLowerCase() || "examine";
  return draftFrom(category, cleanVerb, categoryName, sentenceFor(category, partsOf(project)));
}

/**
 * Two or three starting points for specific objectives that would typically support a
 * general objective of this category, each a draft sentence to rewrite. This is
 * guidance, not a required structure: the researcher decides how many specific
 * objectives to write and what each should say. Each outline uses whichever verb
 * best fits its own step, which may differ from the general objective's verb.
 */
export function suggestSpecificObjectiveOutlines(category: ObjectiveVerbCategoryId, verb: string, project: ResearchProjectDraft, categoryName: string): DraftObjective[] {
  const parts = partsOf(project);
  const cleanVerb = verb.trim().toLowerCase() || "examine";
  const draft = (outlineVerb: string, body: string) => draftFrom(category, outlineVerb, categoryName, body);

  const needsVariables = category === "relational" || category === "correlational" || category === "explanatory" || category === "predictive" || category === "comparative";
  if (needsVariables) {
    return [
      draft("identify", `the level of ${parts.iv.text} ${parts.among}`),
      draft("identify", `the level of ${parts.dv.text} ${parts.among}`),
      draft(cleanVerb, sentenceFor(category, parts)),
    ];
  }
  if (category === "descriptive") {
    return [draft("identify", `the characteristics of ${parts.population}${parts.where}`), draft("describe", `${parts.dv.text} ${parts.among}`)];
  }
  return [draft("identify", `how ${parts.population} describe ${parts.focus}${parts.where}`), draft("explore", `the factors that shape ${parts.focus} ${parts.among}`)];
}
