/**
 * How a hypothesis pair fits the rest of the project: the research question, the
 * objectives, the variables, the population and the context. Also how hypotheses fit
 * the project's methodology, using the Research Onion's own descriptions.
 */

import { makeCheck, type CheckStatus, type HypothesisCheck, type PairTexts } from "./hypothesis-checks";
import type { HypothesisForm, HypothesisRelationship } from "./hypothesis-types";
import { containsPhrase, joinList } from "./question-text";
import { detectQuestionTypes, getQuestionType, type QuestionTypeId } from "./question-types";
import { findOption } from "./research-onion";
import type { ResearchProjectDraft } from "./research-project";

/** Question types whose questions a hypothesis of each form typically answers. */
const MATCHING_QUESTION_TYPES: Readonly<Record<HypothesisForm, readonly QuestionTypeId[]>> = {
  difference: ["comparative", "explanatory"],
  relationship: ["relational", "correlational", "explanatory"],
  prediction: ["predictive", "explanatory"],
};

const OPEN_QUESTION_TYPES: readonly QuestionTypeId[] = ["exploratory", "qualitative"];

const quoted = (values: readonly string[]) => joinList(values.map((value) => `“${value}”`));

/** The variables a pair is about: independent, dependent, then any moderators and mediators. */
export function pairVariables(relationship: HypothesisRelationship): string[] {
  return [
    ...relationship.independentVariables,
    ...relationship.dependentVariables,
    ...relationship.moderators,
    ...relationship.mediators,
  ];
}

function questionCheck(relationship: HypothesisRelationship, project: ResearchProjectDraft): HypothesisCheck {
  const question = project.researchQuestion;
  if (!question) {
    return makeCheck("researchQuestion", "missing", "Add your research question, so the hypothesis can be compared with what the study asks.");
  }
  const variables = [...relationship.independentVariables, ...relationship.dependentVariables];
  if (variables.length === 0) {
    return makeCheck("researchQuestion", "clarify", "The hypothesis has no named variables yet, so it can't be compared with your question.");
  }
  const types = detectQuestionTypes(question).map((detection) => detection.type);
  const purposeTypes = types.filter((type) => getQuestionType(type).dimension === "purpose" && !OPEN_QUESTION_TYPES.includes(type));
  if (purposeTypes.length === 0 && types.some((type) => OPEN_QUESTION_TYPES.includes(type))) {
    return makeCheck(
      "researchQuestion",
      "clarify",
      "Your question reads as open and exploratory. Hypotheses usually accompany questions about differences, relationships or predictions; an exploratory question may not need one.",
    );
  }
  const named = variables.filter((variable) => containsPhrase(question, variable));
  const unnamed = variables.filter((variable) => !named.includes(variable));
  const matching = MATCHING_QUESTION_TYPES[relationship.form].filter((type) => types.includes(type));
  const problems: string[] = [];
  if (unnamed.length > 0) problems.push(`Your question doesn't mention ${quoted(unnamed)}.`);
  if (relationship.kind === "main" && purposeTypes.length > 0 && matching.length === 0) {
    const asked = joinList(purposeTypes.map((type) => getQuestionType(type).name.toLowerCase()));
    problems.push(`Your question reads as ${asked}, which doesn't usually lead to a ${relationship.form} hypothesis.`);
  }
  if (problems.length > 0) return makeCheck("researchQuestion", "worth-checking", problems.join(" "));
  return makeCheck(
    "researchQuestion",
    "aligned",
    `Your question names ${quoted(named)}${matching.length > 0 ? ` and asks a ${getQuestionType(matching[0]).name.toLowerCase()} question, which a ${relationship.form} hypothesis can answer` : ""}.`,
  );
}

function objectivesCheck(relationship: HypothesisRelationship, project: ResearchProjectDraft): HypothesisCheck {
  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) {
    return makeCheck("objectives", "missing", "Add your research objectives, so you can see which objective each hypothesis serves.");
  }
  const variables = pairVariables(relationship);
  const serving = objectives.filter((objective) => variables.some((variable) => containsPhrase(objective, variable)));
  if (variables.length > 0 && serving.length > 0) {
    return makeCheck("objectives", "aligned", `The objective “${serving[0]}” mentions the same variables, so the hypothesis appears to serve it.`);
  }
  return makeCheck(
    "objectives",
    "worth-checking",
    "None of your objectives mentions this hypothesis's variables. Each hypothesis should help to achieve at least one objective.",
  );
}

function variablesCheck(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck {
  if (texts.null.includes("[") || texts.alternative.includes("[")) {
    return makeCheck("variables", "missing", "The wording still contains placeholders in square brackets. Replace them with information from your project.");
  }
  const variables = pairVariables(relationship);
  const absent = variables.filter((variable) => !containsPhrase(texts.null, variable) || !containsPhrase(texts.alternative, variable));
  if (absent.length > 0) {
    return makeCheck("variables", "worth-checking", `Both hypotheses should name ${quoted(absent)}, which your project lists for this relationship.`);
  }
  return makeCheck("variables", "aligned", `Both hypotheses name ${quoted(variables)}, as listed in your project.`);
}

function populationCheck(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck {
  if (!relationship.population) {
    return makeCheck("population", "missing", "Your project doesn't name a population. A hypothesis is a claim about a population, so name who it applies to.");
  }
  const inBoth = containsPhrase(texts.null, relationship.population) && containsPhrase(texts.alternative, relationship.population);
  return inBoth
    ? makeCheck("population", "aligned", `Both hypotheses name your population, “${relationship.population}”.`)
    : makeCheck("population", "worth-checking", `Your population is “${relationship.population}”, but at least one hypothesis doesn't name it.`);
}

function contextCheck(texts: PairTexts, project: ResearchProjectDraft): HypothesisCheck {
  if (texts.null.includes("[context]") || texts.alternative.includes("[context]")) {
    return makeCheck(
      "context",
      "missing",
      "Replace “[context]” with where or when the hypothesis applies, or remove it if the hypothesis applies generally.",
    );
  }
  const details = [project.location, project.timeContext].filter((value): value is string => Boolean(value));
  if (details.length === 0) {
    return makeCheck("context", "review", "Your project has no location or time frame. That is optional; add one if the hypothesis applies only to a particular setting.");
  }
  const absent = details.filter((detail) => !containsPhrase(texts.null, detail) || !containsPhrase(texts.alternative, detail));
  return absent.length === 0
    ? makeCheck("context", "aligned", `Both hypotheses name your context (${quoted(details)}).`)
    : makeCheck("context", "worth-checking", `Your project's context includes ${quoted(absent)}, which at least one hypothesis doesn't mention.`);
}

/** Alignment of one hypothesis pair with the project. */
export function checkAlignment(texts: PairTexts, relationship: HypothesisRelationship, project: ResearchProjectDraft): HypothesisCheck[] {
  return [
    questionCheck(relationship, project),
    objectivesCheck(relationship, project),
    variablesCheck(texts, relationship),
    populationCheck(texts, relationship),
    contextCheck(texts, project),
  ];
}

/** How hypotheses fit one of the project's methodological choices. */
export interface MethodologyNote {
  /** The choice, such as "Qualitative". */
  choice: string;
  status: CheckStatus;
  text: string;
  /** The Research Onion's own description of the choice. */
  why: string;
}

const describe = (id: string) => {
  const option = findOption(id)!;
  return { choice: option.name, why: `${option.subject.charAt(0).toUpperCase()}${option.subject.slice(1)} usually ${option.essence}.` };
};

/**
 * Whether hypotheses usually suit the project's methodology, philosophy and approach.
 * It explains typical practice and never says one methodology is universally correct.
 */
export function methodologyGuidance(project: ResearchProjectDraft): MethodologyNote[] {
  const notes: MethodologyNote[] = [];
  const onion = project.researchOnionSelection ?? {};
  const methodology = project.methodology ?? onion.choice;

  switch (methodology) {
    case "quantitative":
      notes.push({ ...describe("quantitative"), status: "aligned", text: "Hypotheses are commonly used in quantitative research, where statistical tests assess them." });
      break;
    case "qualitative":
      notes.push({
        ...describe("qualitative"),
        status: "clarify",
        text: "Qualitative studies often don't use hypotheses: open research questions are usually preferred, because the aim is to understand meanings rather than to test predictions. Some qualitative designs do examine propositions, so discuss this with your supervisor.",
      });
      break;
    case "mixed-methods":
      notes.push({
        ...describe("mixed-methods"),
        status: "review",
        text: "In mixed methods research, hypotheses may suit the quantitative strand, while the qualitative strand is usually guided by research questions. State which strand each hypothesis belongs to.",
      });
      break;
    case "multi-method":
      notes.push({
        ...describe("multi-method"),
        status: "review",
        text: "In a multi-method design, hypotheses may suit an all-quantitative design but are rarely used in an all-qualitative one. It depends on the tradition your techniques come from.",
      });
      break;
    default:
      notes.push({
        choice: "Methodology",
        status: "review",
        text: "Your project has no methodology yet. Hypotheses are most common in quantitative research; add your methodology to see how they fit.",
        why: "Whether a study needs hypotheses depends on its methodology.",
      });
  }

  if (onion.philosophy === "positivism") {
    notes.push({ ...describe("positivism"), status: "aligned", text: "Positivist research commonly states hypotheses to test." });
  } else if (onion.philosophy === "interpretivism") {
    notes.push({ ...describe("interpretivism"), status: "clarify", text: "Interpretivist research usually explores meanings rather than testing hypotheses. Consider whether research questions alone would suit your study." });
  } else if (onion.philosophy === "realism" || onion.philosophy === "pragmatism") {
    notes.push({ ...describe(onion.philosophy), status: "review", text: "Hypotheses can be used within this philosophy when your research question calls for testing." });
  }

  if (onion.approach === "deductive") {
    notes.push({ ...describe("deductive"), status: "aligned", text: "A deductive approach develops hypotheses from theory and tests them, so hypotheses fit it well." });
  } else if (onion.approach === "inductive") {
    notes.push({ ...describe("inductive"), status: "clarify", text: "An inductive approach usually builds theory from the data rather than testing hypotheses set in advance." });
  } else if (onion.approach === "abductive") {
    notes.push({ ...describe("abductive"), status: "review", text: "An abductive approach may develop and refine hypotheses as the study moves between data and theory." });
  }
  return notes;
}
