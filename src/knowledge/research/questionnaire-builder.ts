/**
 * Assembles a questionnaire from the project draft, and explains every question.
 *
 * Each measuring question comes from a chain: variable → indicator → operational
 * definition → question. The builder never writes question wording. It uses the
 * researcher's own draft items where they exist, and otherwise leaves a placeholder
 * naming the indicator. Everything it does is deterministic: the same project gives
 * the same questionnaire.
 */

import { questionNumbers } from "./questionnaire";
import { createQuestion } from "./questionnaire-items";
import { DEFAULT_SECTIONS } from "./questionnaire-sections";
import { QUESTION_TYPE_INFO, TYPE_FOR_LEVEL, type Question, type Questionnaire, type QuestionnaireSection, type QuestionType } from "./questionnaire-types";
import type { ResearchProjectDraft } from "./research-project";
import { MEASUREMENT_LEVEL_INFO, VARIABLE_KIND_INFO, VARIABLE_PLACEHOLDERS, type ProjectVariable, type VariableIndicator, type VariableKind } from "./variable-types";
import { importVariables } from "./variables";

/**
 * The variables questions are built from: the Variables Builder's, with their
 * indicators, or, if the project has none yet, those named in its variable lists,
 * hypotheses and framework, which have no indicators.
 */
export function questionnaireVariables(project: ResearchProjectDraft): ProjectVariable[] {
  return project.variables ? [...project.variables] : importVariables(project);
}

/** Where each kind of variable is measured by default. */
export const SECTION_FOR_KIND: Readonly<Record<VariableKind, string>> = {
  independent: "section-a",
  mediator: "section-b",
  moderator: "section-b",
  dependent: "section-c",
  control: "demographics",
  extraneous: "demographics",
  confounding: "demographics",
};

/** The type a question starts as: the one its measurement level usually suggests, or a short answer when no level is set. */
export function suggestedType(variable: ProjectVariable, indicator: VariableIndicator | null): QuestionType {
  const level = indicator?.level ?? variable.measurementLevel;
  return level ? TYPE_FOR_LEVEL[level] : "short-answer";
}

const nextNumber = (questions: readonly Question[]) => Math.max(0, ...questions.map((question) => Number(/^q-(\d+)$/.exec(question.id)?.[1] ?? 0))) + 1;

/**
 * Questions for one variable. The researcher's draft items become questions, linked to
 * the indicator they match: item by item when the counts match, or all to the one
 * indicator when there is only one. Indicators still without a question get a
 * placeholder each; a variable without indicators gets one placeholder.
 */
function questionsFor(variable: ProjectVariable, section: string, startAt: number): Question[] {
  const indicators = variable.possibleIndicators;
  const items = variable.questionnaireItems.map((item) => item.trim()).filter(Boolean);
  const questions: Question[] = [];
  const make = (indicator: VariableIndicator | null, text = "") =>
    questions.push(createQuestion(`q-${startAt + questions.length}`, section, { type: suggestedType(variable, indicator), variableId: variable.id, indicatorId: indicator?.id ?? null, text }));

  const linked = new Set<string>();
  items.forEach((item, index) => {
    const indicator = indicators.length === items.length ? indicators[index] : indicators.length === 1 ? indicators[0] : null;
    if (indicator) linked.add(indicator.id);
    make(indicator, item);
  });
  if (items.length === 0 && indicators.length === 0) make(null);
  for (const indicator of indicators) if (!linked.has(indicator.id)) make(indicator);
  return questions;
}

/**
 * The questionnaire the project suggests: the standard sections, a consent question,
 * and questions for every variable and indicator, placed by the variable's kind.
 */
export function buildQuestionnaire(project: ResearchProjectDraft): Questionnaire {
  const sections: QuestionnaireSection[] = DEFAULT_SECTIONS.map((section) => ({ ...section }));
  const questions: Question[] = [createQuestion("q-1", "consent", { type: "yes-no", required: true })];
  const order: VariableKind[] = ["control", "extraneous", "confounding", "independent", "mediator", "moderator", "dependent"];
  const variables = questionnaireVariables(project);
  for (const kind of order) {
    for (const variable of variables.filter((candidate) => candidate.variableType === kind)) {
      questions.push(...questionsFor(variable, SECTION_FOR_KIND[kind], nextNumber(questions)));
    }
  }
  return { title: project.topic ?? "", sections, questions };
}

/** Variables and indicators that no question measures yet. A variable without indicators appears once, with a null indicator. */
export interface Unmeasured {
  variable: ProjectVariable;
  indicator: VariableIndicator | null;
}

export function unmeasured(questionnaire: Questionnaire, project: ResearchProjectDraft): Unmeasured[] {
  const measured = new Set(questionnaire.questions.map((question) => `${question.variableId}/${question.indicatorId}`));
  const variablesMeasured = new Set(questionnaire.questions.map((question) => question.variableId));
  return questionnaireVariables(project).flatMap((variable): Unmeasured[] =>
    variable.possibleIndicators.length === 0
      ? variablesMeasured.has(variable.id)
        ? []
        : [{ variable, indicator: null }]
      : variable.possibleIndicators.filter((indicator) => !measured.has(`${variable.id}/${indicator.id}`)).map((indicator) => ({ variable, indicator })),
  );
}

/**
 * Adds a placeholder question for everything unmeasured, in the section for its
 * variable's kind, or in the last question section if that one was removed. Returns
 * the questionnaire unchanged if there is nowhere to put them.
 */
export function addMissingQuestions(questionnaire: Questionnaire, project: ResearchProjectDraft): Questionnaire {
  const fallback = [...questionnaire.sections].reverse().find((section) => section.kind === "items" || section.kind === "custom" || section.kind === "demographics");
  let questions = [...questionnaire.questions];
  for (const { variable, indicator } of unmeasured(questionnaire, project)) {
    const preferred = SECTION_FOR_KIND[variable.variableType];
    const section = questionnaire.sections.some((candidate) => candidate.id === preferred) ? preferred : fallback?.id;
    if (!section) continue;
    const question = createQuestion(`q-${nextNumber(questions)}`, section, { type: suggestedType(variable, indicator), variableId: variable.id, indicatorId: indicator?.id ?? null });
    const last = questions.map((candidate) => candidate.section).lastIndexOf(section);
    const at = last === -1 ? questions.length : last + 1;
    questions = [...questions.slice(0, at), question, ...questions.slice(at)];
  }
  return { ...questionnaire, questions };
}

// Explaining a question.

const mentions = (text: string, variable: ProjectVariable) => {
  const lower = text.toLowerCase();
  return [variable.name, variable.shortName].some((name) => name.trim().length >= 3 && lower.includes(name.trim().toLowerCase()));
};
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export interface OriginStep {
  label: string;
  value: string;
  missing: boolean;
}

export interface QuestionOrigin {
  variable: ProjectVariable | null;
  indicator: VariableIndicator | null;
  /** Variable → indicator → operational definition → question, with placeholders for what's missing. */
  chain: OriginStep[];
  /** The research question, when it names the variable. */
  researchQuestion: string | null;
  objectives: string[];
  hypotheses: { id: string; label: string; text: string }[];
  /** Framework relationships involving the variable, such as “screen time → sleep quality”. */
  framework: string[];
  /** Who answers, from the sampling plan. */
  population: string | null;
  /** Why the question exists and why it has its type, in sentences. */
  explanation: string[];
}

/** Everything that links a question to the project, so the researcher can see exactly why it exists. */
export function questionOrigin(question: Question, project: ResearchProjectDraft, questionnaire?: Questionnaire): QuestionOrigin {
  const variables = questionnaireVariables(project);
  const variable = variables.find((candidate) => candidate.id === question.variableId) ?? null;
  const indicator = variable?.possibleIndicators.find((candidate) => candidate.id === question.indicatorId) ?? null;
  const population = project.samplingPlan?.population.targetPopulation || null;
  const number = questionnaire ? questionNumbers(questionnaire).get(question.id) : undefined;
  const typeLabel = QUESTION_TYPE_INFO[question.type].label.toLowerCase();

  if (!variable) {
    const explanation =
      question.section === "consent"
        ? ["This is the consent question. It records the participant's agreement and doesn't measure a variable."]
        : ["This question isn't linked to a variable, so it can't be traced to your research question, objectives or hypotheses. Link it to a variable and indicator, or keep it as a question you added for another reason."];
    return {
      variable: null,
      indicator: null,
      chain: [
        { label: "Variable", value: "[variable]", missing: true },
        { label: "Indicator", value: VARIABLE_PLACEHOLDERS.indicator, missing: true },
        { label: "Operational definition", value: VARIABLE_PLACEHOLDERS.operationalDefinition, missing: true },
        { label: "Question", value: question.text || "[question]", missing: !question.text },
      ],
      researchQuestion: null,
      objectives: [],
      hypotheses: [],
      framework: [],
      population,
      explanation,
    };
  }

  const kind = VARIABLE_KIND_INFO[variable.variableType].label.toLowerCase();
  const hypotheses = (project.hypotheses ?? [])
    .filter((hypothesis) => {
      const { independentVariables, dependentVariables, moderators, mediators, controls } = hypothesis.relationship;
      return [...independentVariables, ...dependentVariables, ...moderators, ...mediators, ...controls].some((name) => sameName(name, variable.name));
    })
    .map((hypothesis) => ({ id: hypothesis.id, label: hypothesis.role === "null" ? "H₀" : "H₁", text: hypothesis.text }));
  const framework = project.conceptualFramework;
  const boxes = framework?.variables.filter((box) => sameName(box.name, variable.name)).map((box) => box.id) ?? [];
  const name = (id: string) => framework?.variables.find((box) => box.id === id)?.name ?? id;
  const relationships = (framework?.relationships ?? []).filter((relationship) => boxes.includes(relationship.source) || boxes.includes(relationship.target)).map((relationship) => `${name(relationship.source)} → ${name(relationship.target)}`);

  const level = indicator?.level ?? variable.measurementLevel;
  const explanation = [
    indicator
      ? `${number ? `Question ${number}` : "This question"} measures “${indicator.name}”, an indicator of ${variable.name} (${kind} variable).`
      : `${number ? `Question ${number}` : "This question"} measures ${variable.name} (${kind} variable), but no indicator is chosen, so what it measures isn't yet specific.`,
    question.text.trim() ? "Its wording is yours." : "Its wording is still to be written: the builder never writes questions for you.",
    level
      ? TYPE_FOR_LEVEL[level] === question.type
        ? `It is a ${typeLabel} question because the ${indicator?.level ? "indicator" : "variable"} is measured at the ${MEASUREMENT_LEVEL_INFO[level].label.toLowerCase()} level.`
        : `The ${indicator?.level ? "indicator" : "variable"} is measured at the ${MEASUREMENT_LEVEL_INFO[level].label.toLowerCase()} level, which usually suggests a ${QUESTION_TYPE_INFO[TYPE_FOR_LEVEL[level]].label.toLowerCase()} question; this one is a ${typeLabel} question.`
      : `No measurement level is set, so the ${typeLabel} type is a starting point for you to change.`,
  ];
  if (indicator?.scale.trim() && question.scale) explanation.push(`The indicator's scale is recorded as “${indicator.scale.trim()}”; check the question's scale matches it.`);

  return {
    variable,
    indicator,
    chain: [
      { label: "Variable", value: `${variable.name} (${kind})`, missing: false },
      { label: "Indicator", value: indicator?.name ?? VARIABLE_PLACEHOLDERS.indicator, missing: !indicator },
      { label: "Operational definition", value: variable.operationalDefinition.trim() || VARIABLE_PLACEHOLDERS.operationalDefinition, missing: !variable.operationalDefinition.trim() },
      { label: "Question", value: question.text.trim() || VARIABLE_PLACEHOLDERS.item, missing: !question.text.trim() },
    ],
    researchQuestion: project.researchQuestion && mentions(project.researchQuestion, variable) ? project.researchQuestion : null,
    objectives: (project.researchObjectives ?? []).filter((objective) => mentions(objective, variable)),
    hypotheses,
    framework: relationships,
    population,
    explanation,
  };
}

/** What to write in a section, with the project information that helps. Shown to the researcher, never exported. */
export function sectionGuidance(section: QuestionnaireSection, project: ResearchProjectDraft): string[] {
  const guidance: string[] = [];
  if (section.kind === "cover" && project.topic) guidance.push(`Your topic: ${project.topic}`);
  if (section.kind === "introduction" || section.kind === "participant-information") {
    if (project.researchAim) guidance.push(`Your research aim: ${project.researchAim}`);
    if (project.researchQuestion) guidance.push(`Your research question: ${project.researchQuestion}`);
  }
  if ((section.kind === "introduction" || section.kind === "participant-information" || section.kind === "consent") && project.samplingPlan?.population.targetPopulation) {
    guidance.push(`Who will answer: ${project.samplingPlan.population.targetPopulation}`);
  }
  if (section.kind === "demographics") {
    const controls = questionnaireVariables(project).filter((variable) => SECTION_FOR_KIND[variable.variableType] === "demographics");
    guidance.push(controls.length > 0 ? `Variables measured here: ${controls.map((variable) => variable.name).join(", ")}` : "No control variables yet. Add only the characteristics your analysis needs.");
  }
  if (section.kind === "items") {
    const here = questionnaireVariables(project).filter((variable) => SECTION_FOR_KIND[variable.variableType] === section.id);
    if (here.length > 0) guidance.push(`Variables measured here by default: ${here.map((variable) => variable.name).join(", ")}`);
  }
  return guidance;
}
