/**
 * The keyword panel: what the title names, element by element, set beside what the
 * project says. Every value is either the researcher's own project detail or words
 * copied exactly from the title; nothing is invented.
 */

import { getDesign } from "../design-types";
import { POPULATION_PATTERNS, PLACE_PATTERN, TIME_PATTERN, detectVariables } from "../question-elements";
import { containsPhrase, normalise } from "../question-text";
import type { ResearchProjectDraft } from "../research-project";
import type { VariableKind } from "../variable-types";
import { IMPLICIT_RELATIONSHIP, classifyTitle, mainTitle } from "./patterns";

/**
 * Who is studied, in wordings common in titles but not in questions, such as
 * “Experiences of Nurses Caring for …”. Tried after the wordings questions share.
 */
const TITLE_POPULATION = new RegExp(
  "\\b(?:experiences?|perceptions?|perspectives?|views?|attitudes?|knowledge|practices?|voices?) of (.+?)(?= (?:caring|working|living|using|with|who|towards|about|regarding|on|in|at|during|from|for)\\b|$)",
  "i",
);

/** Every place-like phrase in the title; the last is usually the study's setting, as places come at the end. */
const PLACES = new RegExp(PLACE_PATTERN.source, "gu");

/** The variables of “X and Y among …”, when no clearer wording names them. */
function implicitVariables(title: string): { iv: string; dv: string } | null {
  const match = IMPLICIT_RELATIONSHIP.exec(title);
  return match ? { iv: normalise(match[1]), dv: normalise(match[2]) } : null;
}

export const KEYWORD_ELEMENTS = ["independent", "dependent", "moderator", "mediator", "population", "location", "design", "time"] as const;
export type KeywordElement = (typeof KEYWORD_ELEMENTS)[number];

export const KEYWORD_LABELS: Readonly<Record<KeywordElement, string>> = {
  independent: "Independent variables",
  dependent: "Dependent variables",
  moderator: "Moderators",
  mediator: "Mediators",
  population: "Population",
  location: "Location",
  design: "Research design",
  time: "Time",
};

export interface Keyword {
  text: string;
  /** Whether the title names it. */
  inTitle: boolean;
  /** Where the keyword comes from: the project, or words read from the title. */
  source: "project" | "title";
}

export type KeywordPanel = Readonly<Record<KeywordElement, readonly Keyword[]>>;

/** The project's variables of one kind: the defined variables when there are any, or else the named lists. */
export function projectVariables(project: ResearchProjectDraft, kind: VariableKind): string[] {
  const defined = (project.variables ?? []).filter((variable) => variable.variableType === kind).map((variable) => variable.name);
  if (defined.length > 0) return defined;
  const lists: Partial<Record<VariableKind, readonly string[] | undefined>> = {
    independent: project.independentVariables,
    dependent: project.dependentVariables,
    moderator: project.moderatorVariables,
    mediator: project.mediatorVariables,
  };
  return [...(lists[kind] ?? [])];
}

/** The population the project names: from the research question stage, or else the sampling plan. */
export const projectPopulation = (project: ResearchProjectDraft): string | null => project.population ?? (project.samplingPlan?.population.targetPopulation || null);

/** The name of the design the project chose, if any. */
export const projectDesign = (project: ResearchProjectDraft): string | null => (project.researchDesign?.chosen ? getDesign(project.researchDesign.chosen).name : null);

/** Whether a title names a project detail, allowing the usual variation of singular and plural. */
export function titleNames(title: string, phrase: string): boolean {
  const target = normalise(phrase);
  if (!target) return false;
  if (containsPhrase(title, target)) return true;
  // The other number of the phrase's last word: “teachers” for “teacher”, “baby” for “babies”, and back.
  const forms = target.endsWith("ies")
    ? [`${target.slice(0, -3)}y`]
    : target.endsWith("s") && !target.endsWith("ss")
      ? [target.slice(0, -1)]
      : target.endsWith("y") && !/[aeiou]y$/i.test(target)
        ? [`${target.slice(0, -1)}ies`]
        : [`${target}s`, `${target}es`];
  return forms.some((form) => containsPhrase(title, form));
}

const fromProject = (title: string, values: readonly string[]): Keyword[] => values.map((text) => ({ text, inTitle: titleNames(title, text), source: "project" }));

/** Words read from the title, used only when the project has nothing for the element. */
const fromTitle = (value: string | null | undefined): Keyword[] => (value ? [{ text: normalise(value), inTitle: true, source: "title" }] : []);

export function extractKeywords(rawTitle: string, project: ResearchProjectDraft): KeywordPanel {
  const title = normalise(rawTitle);
  // Variables and population are read from the main title, so a subtitle such as “: A Case Study” isn't taken as part of them.
  const main = mainTitle(title);
  const variables = detectVariables(main) ?? implicitVariables(main);
  const either = (values: readonly string[], detected: string | null | undefined) => (values.length > 0 ? fromProject(title, values) : fromTitle(detected));

  const population = projectPopulation(project);
  const populationFromTitle = POPULATION_PATTERNS.map(({ pattern }) => pattern.exec(main)?.[1]).find(Boolean) ?? TITLE_POPULATION.exec(main)?.[1];
  const location = project.location;
  const place = [...title.matchAll(PLACES)].pop()?.[1];
  const design = projectDesign(project);
  const methodWords = classifyTitle(title).filter((match) => match.pattern.method).map((match) => match.wording);
  const time = project.timeContext;
  const timeFromTitle = TIME_PATTERN.exec(title)?.[0];

  return {
    independent: either(projectVariables(project, "independent"), variables?.iv),
    dependent: either(projectVariables(project, "dependent"), variables?.dv),
    moderator: fromProject(title, projectVariables(project, "moderator")),
    mediator: fromProject(title, projectVariables(project, "mediator")),
    population: population ? fromProject(title, [population]) : fromTitle(populationFromTitle),
    location: location ? fromProject(title, [location]) : fromTitle(place),
    design: design ? [...fromProject(title, [design]), ...methodWords.filter((word) => !titleNames(word, design)).map((text) => ({ text, inTitle: true, source: "title" as const }))] : methodWords.map((text) => ({ text, inTitle: true, source: "title" as const })),
    time: time ? fromProject(title, [time]) : fromTitle(timeFromTitle),
  };
}
