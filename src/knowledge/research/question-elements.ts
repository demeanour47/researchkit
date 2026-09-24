/**
 * Finds the building blocks of a research question: the independent and dependent
 * variables, the population, the context (setting) and the time.
 *
 * Every value reported is either something the researcher entered in their project
 * or a phrase copied exactly from their question. Nothing is invented: when an element
 * can't be found, the finding says what is missing and why it matters.
 */

import type { ResearchProjectDraft } from "./research-project";
import { containsPhrase, joinList, normalise } from "./question-text";
import { getQuestionType, type QuestionTypeId } from "./question-types";

export const QUESTION_ELEMENT_IDS = ["independentVariable", "dependentVariable", "population", "context", "time"] as const;
export type QuestionElementId = (typeof QUESTION_ELEMENT_IDS)[number];

export const ELEMENT_LABELS: Readonly<Record<QuestionElementId, string>> = {
  independentVariable: "Independent variable",
  dependentVariable: "Dependent variable",
  population: "Population",
  context: "Context",
  time: "Time",
};

/**
 * - found: in the question, from the project details or from its wording.
 * - notInQuestion: entered in the project details, but the question doesn't mention it.
 * - missing: not found anywhere.
 * - notNeeded: not usually part of this type of question.
 */
export type ElementStatus = "found" | "notInQuestion" | "missing" | "notNeeded";

export const ELEMENT_STATUS_LABELS: Readonly<Record<ElementStatus, string>> = {
  found: "Found",
  notInQuestion: "Not in the question",
  missing: "Missing",
  notNeeded: "Not usually needed",
};

export interface ElementFinding {
  element: QuestionElementId;
  label: string;
  status: ElementStatus;
  /** Whether a question of the chosen type usually names this element. */
  expected: boolean;
  /** The words found, exactly as the researcher wrote them. */
  value: string | null;
  /** Where the value came from. */
  source: "project" | "question" | null;
  explanation: string;
}

/** Words that end a variable or population phrase. */
const BOUNDARY = "(?=\\s+(?:among|in|for|at|during|within|over|across|between|from|since|when|while|compared)\\b|\\s*[,;?]|\\s*$)";

const VARIABLE_PATTERNS: { pattern: RegExp; order: "iv-dv" | "dv-iv"; wording: string }[] = [
  { pattern: new RegExp(`\\brelationships? between (.+?) and (.+?)${BOUNDARY}`, "i"), order: "iv-dv", wording: "relationship between … and …" },
  { pattern: new RegExp(`\\b(?:effects?|impacts?|influences?) of (.+?) on (.+?)${BOUNDARY}`, "i"), order: "iv-dv", wording: "effect of … on …" },
  { pattern: new RegExp(`\\b(?:is|are|was|were) (.+?) (?:associated|correlated) with (.+?)${BOUNDARY}`, "i"), order: "iv-dv", wording: "… associated with …" },
  { pattern: new RegExp(`\\b(?:does|do|did|can|could|will) (.+?) (?:affect|influence|predict|impact|shape|determine|cause|explain) (.+?)${BOUNDARY}`, "i"), order: "iv-dv", wording: "does … affect …" },
  { pattern: new RegExp(`\\b(?:does|do|did) (.+?) (?:differ|vary) (?:by|with|according to|across) (.+?)${BOUNDARY}`, "i"), order: "dv-iv", wording: "does … differ by …" },
];

const POPULATION_PATTERNS: { pattern: RegExp; wording: (match: string) => string }[] = [
  { pattern: new RegExp(`\\bamong (.+?)${BOUNDARY}`, "i"), wording: (match) => `among ${match}` },
  {
    pattern: /\bhow do (.+?) (?:experience|describe|perceive|understand|view|explain|make sense of)\b/i,
    wording: (match) => `how do ${match} experience…`,
  },
]
/** A place name: one or more capitalised words after "in" or "at". */
const PLACE_PATTERN = new RegExp("\\b(?:in|at) ((?:the )?\\p{Lu}[\\p{L}'’-]*(?: (?:of )?\\p{Lu}[\\p{L}'’-]*)*)", "u");
const TIME_PATTERN =
  /\b(?:(?:in|during|between|from|since|before|after) )?(?:(?:1[89]|20)\d{2}(?:\s*(?:–|-|and|to)\s*(?:1[89]|20)\d{2})?|the (?:past|last|next) (?:\w+ )?(?:days?|weeks?|months?|years?|decades?)|(?:the )?(?:\w+ )?(?:academic year|semester|school year|pandemic|lockdown))\b/i;

/** Types that ask about variables, and so need both an independent and a dependent variable. */
const needsFor = (types: readonly QuestionTypeId[]) => new Set(types.flatMap((type) => getQuestionType(type).needs));

/** An outcome on its own, as in a descriptive question. */
const OUTCOME_PATTERN = new RegExp(`\\b(?:level|levels|rate|rates|prevalence|frequency|proportion|incidence) of (.+?)${BOUNDARY}`, "i");

function detectVariables(question: string): { iv: string | null; dv: string | null; wording: string } | null {
  for (const { pattern, order, wording } of VARIABLE_PATTERNS) {
    const match = pattern.exec(question);
    if (!match) continue;
    const [first, second] = [normalise(match[1]), normalise(match[2])];
    return order === "iv-dv" ? { iv: first, dv: second, wording } : { iv: second, dv: first, wording };
  }
  const outcome = OUTCOME_PATTERN.exec(question);
  return outcome ? { iv: null, dv: normalise(outcome[1]), wording: `${outcome[0].split(" of ")[0].toLowerCase()} of …` } : null;
}

const WHY: Readonly<Record<QuestionElementId, string>> = {
  independentVariable:
    "The independent variable is what you think may influence the outcome, or what defines the groups you compare. Without it, it isn't clear what you will compare or test.",
  dependentVariable:
    "The dependent variable is the outcome you will measure or examine. Without it, it isn't clear what you will collect data about.",
  population:
    "The population says who or what you will study. It shapes your sampling, your access and how far your findings apply.",
  context:
    "The context, such as a country, organisation or setting, narrows the scope and tells readers where your findings apply. It is optional but usually helpful.",
  time: "A time frame, such as a year or a period, narrows the scope and matters for how you collect data. It is optional unless your question is about change or prediction.",
};

const NOT_NEEDED: Partial<Record<QuestionElementId, string>> = {
  independentVariable:
    "Questions of this type usually focus on a phenomenon or a single outcome rather than on what influences it, so an independent variable isn't expected.",
  dependentVariable:
    "Questions of this type usually focus on people's experiences and meanings rather than on a measured outcome, so a dependent variable isn't expected.",
};

/**
 * The elements of a question. `type` is the question type the researcher chose; when
 * it is missing, the types detected from the wording decide which elements are expected.
 */
export function identifyElements(
  question: string,
  project: ResearchProjectDraft,
  types: readonly QuestionTypeId[],
): ElementFinding[] {
  const expected = needsFor(types);
  // Every question needs a population, whatever its type.
  expected.add("population");
  const variables = detectVariables(question);

  const finding = (element: QuestionElementId, partial: Omit<ElementFinding, "element" | "label" | "expected">): ElementFinding => ({
    element,
    label: ELEMENT_LABELS[element],
    expected: expected.has(element),
    ...partial,
  });

  const fromProject = (element: QuestionElementId, values: readonly string[] | undefined, detected: string | null, detectedHow: string): ElementFinding => {
    const entered = values ?? [];
    const present = entered.filter((value) => containsPhrase(question, value));
    const absent = entered.filter((value) => !containsPhrase(question, value));
    const label = ELEMENT_LABELS[element].toLowerCase();

    if (present.length > 0) {
      const extra = absent.length > 0 ? ` You also listed ${quote(absent)}, which the question doesn't mention.` : "";
      return finding(element, {
        status: "found",
        value: joinList(present),
        source: "project",
        explanation: `The question names ${quote(present)}, which you entered as the ${label}.${extra}`,
      });
    }
    if (detected) {
      const extra = absent.length > 0 ? ` It differs from what you entered (${quote(absent)}); check which you mean.` : "";
      return finding(element, {
        status: "found",
        value: detected,
        source: "question",
        explanation: `${detectedHow} This was read from the wording, so check that it is what you mean.${extra}`,
      });
    }
    if (absent.length > 0) {
      return finding(element, {
        status: "notInQuestion",
        value: joinList(absent),
        source: "project",
        explanation: `You entered ${quote(absent)} as the ${label}, but the question doesn't mention it. ${WHY[element]}`,
      });
    }
    if (!expected.has(element) && NOT_NEEDED[element]) {
      return finding(element, { status: "notNeeded", value: null, source: null, explanation: NOT_NEEDED[element]! });
    }
    return finding(element, {
      status: "missing",
      value: null,
      source: null,
      explanation: `No ${label} was found in the question or your project details. ${WHY[element]}`,
    });
  };

  const population = POPULATION_PATTERNS.map(({ pattern, wording }) => {
    const match = pattern.exec(question);
    return match ? { value: normalise(match[1]), wording: wording(normalise(match[1])) } : null;
  }).find((candidate) => candidate !== null);
  const place = PLACE_PATTERN.exec(question);
  const time = TIME_PATTERN.exec(question);

  return [
    fromProject(
      "independentVariable",
      project.independentVariables,
      variables?.iv ?? null,
      variables?.iv ? `The wording “${variables.wording}” suggests “${variables.iv}” is the independent variable.` : "",
    ),
    fromProject(
      "dependentVariable",
      project.dependentVariables,
      variables?.dv ?? null,
      variables?.dv ? `The wording “${variables.wording}” suggests “${variables.dv}” is the dependent variable.` : "",
    ),
    fromProject(
      "population",
      project.population ? [project.population] : undefined,
      population?.value ?? null,
      population ? `The wording “${population.wording}” suggests who you will study.` : "",
    ),
    fromProject(
      "context",
      project.location ? [project.location] : undefined,
      place ? normalise(place[1]) : null,
      place ? `“${normalise(place[1])}” looks like the name of a place or organisation.` : "",
    ),
    fromProject(
      "time",
      project.timeContext ? [project.timeContext] : undefined,
      time ? normalise(time[0]) : null,
      time ? `“${normalise(time[0])}” looks like a time frame.` : "",
    ),
  ];
}

const quote = (values: readonly string[]) => joinList(values.map((value) => `“${value}”`));
