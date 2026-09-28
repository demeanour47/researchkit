/**
 * Alignment and quality checks for research objectives: whether the general
 * objective answers the research question, whether the specific objectives break it
 * down, and common wording problems. Checks describe what was found and why; they
 * never score, rank or declare an objective correct.
 *
 * Known limits
 * - Action verbs are recognised in English only. An objective written in another
 *   language is still checked for alignment and specificity, using the population,
 *   topic and variables the project already holds, but the verb check can't
 *   recognise a non-English verb and reports one as missing.
 */

import { RESEARCH_ACTION_VERBS } from "./objective-verbs";
import { containsPhrase, sharedWords, words } from "./question-text";
import type { CheckStatus } from "./hypothesis-checks";
import type { ResearchProjectDraft } from "./research-project";

export const OBJECTIVE_CHECK_IDS = [
  "generalPresence",
  "generalVerb",
  "questionAlignment",
  "specificity",
  "specificPresence",
  "duplicates",
  "breakdownCoverage",
  "objectiveVerb",
  "overloaded",
  "possibleOutcome",
  "objectiveAlignment",
] as const;
export type ObjectiveCheckId = (typeof OBJECTIVE_CHECK_IDS)[number];

export const OBJECTIVE_CHECK_LABELS: Readonly<Record<ObjectiveCheckId, string>> = {
  generalPresence: "General objective",
  generalVerb: "Action verb",
  questionAlignment: "Alignment with your research question",
  specificity: "Specificity",
  specificPresence: "Specific objectives",
  duplicates: "Duplicate objectives",
  breakdownCoverage: "Alignment with your general objective",
  objectiveVerb: "Action verb",
  overloaded: "Number of actions",
  possibleOutcome: "Research action",
  objectiveAlignment: "Alignment with your general objective",
} as const;

export interface ObjectiveCheck {
  check: ObjectiveCheckId;
  label: string;
  status: CheckStatus;
  explanation: string;
}

const make = (check: ObjectiveCheckId, status: CheckStatus, explanation: string): ObjectiveCheck => ({
  check,
  label: OBJECTIVE_CHECK_LABELS[check],
  status,
  explanation,
});

/** Inflected forms of every recognised research action verb, for finding one in free text. */
const VERB_FORMS: Readonly<Record<string, readonly string[]>> = {
  describe: ["describe", "describes", "described", "describing"],
  identify: ["identify", "identifies", "identified", "identifying"],
  assess: ["assess", "assesses", "assessed", "assessing"],
  determine: ["determine", "determines", "determined", "determining"],
  measure: ["measure", "measures", "measured", "measuring"],
  document: ["document", "documents", "documented", "documenting"],
  compare: ["compare", "compares", "compared", "comparing"],
  evaluate: ["evaluate", "evaluates", "evaluated", "evaluating"],
  examine: ["examine", "examines", "examined", "examining"],
  investigate: ["investigate", "investigates", "investigated", "investigating"],
  analyse: ["analyse", "analyses", "analysed", "analysing", "analyze", "analyzes", "analyzed", "analyzing"],
  explore: ["explore", "explores", "explored", "exploring"],
  understand: ["understand", "understands", "understood", "understanding"],
};

const FORM_TO_VERB = new Map<string, string>(Object.entries(VERB_FORMS).flatMap(([verb, forms]) => forms.map((form) => [form, verb] as const)));

/** The recognised research verbs used in a sentence, without repeats, in the order they appear. */
function verbsUsed(text: string): string[] {
  const found: string[] = [];
  for (const word of words(text)) {
    const verb = FORM_TO_VERB.get(word);
    if (verb && !found.includes(verb)) found.push(verb);
  }
  return found;
}

/** Phrasings that usually describe an outcome or application rather than a research action. */
const POSSIBLE_OUTCOME_PHRASES: readonly string[] = [
  "provide recommendations",
  "make recommendations",
  "give recommendations",
  "offer recommendations",
  "help the company",
  "help the organisation",
  "help the organization",
  "solve the problem",
  "raise awareness",
  "create awareness",
];

/** Every research action verb known to the tool, joined for use in explanations. */
const EXAMPLE_VERBS = RESEARCH_ACTION_VERBS.slice(0, 5).join(", ");

function generalPresenceCheck(text: string): ObjectiveCheck | null {
  if (text.trim()) return null;
  return make("generalPresence", "missing", "Write a general objective: one sentence that the specific objectives work towards together.");
}

function generalVerbCheck(text: string): ObjectiveCheck {
  const verbs = verbsUsed(text);
  if (verbs.length === 0) {
    return make("generalVerb", "clarify", `No recognised research action verb was found. General objectives usually begin with a verb such as “${EXAMPLE_VERBS}”.`);
  }
  return make("generalVerb", "aligned", `The objective uses the action verb “${verbs[0]}”.`);
}

function questionAlignmentCheck(text: string, project: ResearchProjectDraft): ObjectiveCheck {
  if (!project.researchQuestion) {
    return make("questionAlignment", "review", "Add your research question, so the general objective can be compared with what the study asks.");
  }
  const shared = sharedWords(text, project.researchQuestion);
  if (shared.length === 0) {
    return make("questionAlignment", "worth-checking", "The general objective doesn't share any words with your research question. Check that it sets out to answer the same question.");
  }
  return make("questionAlignment", "aligned", `The general objective shares wording with your research question, including “${shared[0]}”.`);
}

function specificityCheck(text: string, project: ResearchProjectDraft): ObjectiveCheck {
  const populationKnown = Boolean(project.population);
  const focusKnown = Boolean(project.topic) || (project.independentVariables?.length ?? 0) > 0 || (project.dependentVariables?.length ?? 0) > 0;
  if (!populationKnown && !focusKnown) {
    return make("specificity", "review", "Add your population, topic or variables, so specificity can be checked against them.");
  }
  if (populationKnown && !containsPhrase(text, project.population!)) {
    return make("specificity", "worth-checking", `Your project names the population “${project.population}”, but the general objective doesn't mention it.`);
  }
  const focusTerms = [project.topic, ...(project.independentVariables ?? []), ...(project.dependentVariables ?? [])].filter((value): value is string => Boolean(value));
  const mentionsFocus = focusTerms.some((term) => containsPhrase(text, term));
  if (focusKnown && !mentionsFocus) {
    return make(
      "specificity",
      "worth-checking",
      "The general objective names who is studied but not what you will examine about them. An objective such as “To understand employees” is too broad without saying what about them.",
    );
  }
  return make("specificity", "aligned", "The general objective names both who is studied and what will be examined.");
}

/** The general objective checked against the research question and the project's details. */
export function checkGeneralObjective(text: string, project: ResearchProjectDraft): ObjectiveCheck[] {
  const presence = generalPresenceCheck(text);
  if (presence) return [presence];
  return [generalVerbCheck(text), questionAlignmentCheck(text, project), specificityCheck(text, project)];
}

function objectiveVerbCheck(text: string): ObjectiveCheck {
  const verbs = verbsUsed(text);
  if (verbs.length === 0) {
    return make("objectiveVerb", "clarify", `No recognised research action verb was found. Specific objectives usually begin with a verb such as “${EXAMPLE_VERBS}”.`);
  }
  return make("objectiveVerb", "aligned", `Uses the action verb “${verbs[0]}”.`);
}

function overloadedCheck(text: string): ObjectiveCheck {
  const verbs = verbsUsed(text);
  if (verbs.length >= 3) {
    return make(
      "overloaded",
      "worth-checking",
      `This objective names several distinct actions (${verbs.join(", ")}). It may be easier to check and report as separate objectives, one action each.`,
    );
  }
  return make("overloaded", "aligned", "Names a single, focused action.");
}

function possibleOutcomeCheck(text: string): ObjectiveCheck {
  const matched = POSSIBLE_OUTCOME_PHRASES.find((phrase) => containsPhrase(text, phrase));
  if (matched) {
    return make(
      "possibleOutcome",
      "worth-checking",
      `This may be an outcome or application of the research (“${matched}”) rather than something the research itself does. It may still belong in your project, but check whether it belongs among your research objectives.`,
    );
  }
  return make("possibleOutcome", "aligned", "Reads as a research action, not an outcome or application.");
}

function objectiveAlignmentCheck(text: string, generalObjective: string): ObjectiveCheck {
  if (!generalObjective.trim()) {
    return make("objectiveAlignment", "review", "Write your general objective, so each specific objective can be checked against it.");
  }
  const shared = sharedWords(text, generalObjective);
  if (shared.length === 0) {
    return make("objectiveAlignment", "worth-checking", "This objective doesn't share any words with your general objective. Check that it helps to achieve it.");
  }
  return make("objectiveAlignment", "aligned", `Shares wording with your general objective, including “${shared[0]}”.`);
}

/** One specific objective checked against the general objective and common wording problems. */
export function checkSpecificObjective(text: string, generalObjective: string): ObjectiveCheck[] {
  return [objectiveVerbCheck(text), overloadedCheck(text), possibleOutcomeCheck(text), objectiveAlignmentCheck(text, generalObjective)];
}

const normalised = (text: string) => text.trim().toLowerCase().replace(/[.?!]+$/, "").replace(/\s+/g, " ");

/** Whether two objectives are the same once case, spacing and end punctuation are ignored. */
function areDuplicates(first: string, second: string): boolean {
  return normalised(first) === normalised(second) && normalised(first).length > 0;
}

function specificPresenceCheck(objectives: readonly string[]): ObjectiveCheck | null {
  if (objectives.length > 0) return null;
  return make("specificPresence", "missing", "Add at least one specific objective. Together, they should show how the general objective will be achieved.");
}

function duplicatesCheck(objectives: readonly string[]): ObjectiveCheck {
  for (let i = 0; i < objectives.length; i += 1) {
    for (let j = i + 1; j < objectives.length; j += 1) {
      if (areDuplicates(objectives[i], objectives[j])) {
        return make("duplicates", "worth-checking", `Objectives ${i + 1} and ${j + 1} say much the same thing. Consider combining them or making each one distinct.`);
      }
    }
  }
  return make("duplicates", "aligned", "Each specific objective reads as distinct.");
}

function breakdownCoverageCheck(objectives: readonly string[], generalObjective: string): ObjectiveCheck {
  if (!generalObjective.trim()) {
    return make("breakdownCoverage", "review", "Write your general objective, so the specific objectives can be checked against it.");
  }
  const covering = objectives.filter((objective) => sharedWords(objective, generalObjective).length > 0);
  if (covering.length === 0) {
    return make("breakdownCoverage", "worth-checking", "None of your specific objectives share wording with your general objective. Check that they break it down rather than covering something else.");
  }
  return make("breakdownCoverage", "aligned", `${covering.length} of ${objectives.length} specific ${objectives.length === 1 ? "objective shares" : "objectives share"} wording with your general objective.`);
}

/** The specific objectives as a set, checked for duplicates and coverage of the general objective. */
export function checkSpecificObjectivesOverall(objectives: readonly string[], generalObjective: string): ObjectiveCheck[] {
  const presence = specificPresenceCheck(objectives);
  if (presence) return [presence];
  const checks = [duplicatesCheck(objectives)];
  if (objectives.length > 0) checks.push(breakdownCoverageCheck(objectives, generalObjective));
  return checks;
}

export interface ObjectiveEvaluation {
  general: ObjectiveCheck[];
  specificOverall: ObjectiveCheck[];
  specific: { text: string; checks: ObjectiveCheck[] }[];
}

/** Every check, for the general objective, the specific objectives as a set, and each specific objective on its own. */
export function evaluateObjectives(generalObjective: string, specificObjectives: readonly string[], project: ResearchProjectDraft): ObjectiveEvaluation {
  return {
    general: checkGeneralObjective(generalObjective, project),
    specificOverall: checkSpecificObjectivesOverall(specificObjectives, generalObjective),
    specific: specificObjectives.map((text) => ({ text, checks: checkSpecificObjective(text, generalObjective) })),
  };
}

/** Everything the tool can't do, stated on the page. */
export const OBJECTIVES_GENERATOR_LIMITATIONS: readonly string[] = [
  "It can't tell you whether your objectives are original, feasible or approved by your supervisor or institution.",
  "Alignment and quality checks read wording, not meaning. They can miss a genuine problem or flag wording that is in fact fine: treat every check as a prompt to look again, not a verdict.",
  "It can't decide which verb or research purpose fits your study. Verb category suggestions come from your research question's wording; your research design decides what actually fits.",
  "Action verbs are recognised in English. An objective written in another language is still checked for alignment with your project's details, but the verb check can't recognise a non-English verb.",
];
