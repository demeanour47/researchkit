/**
 * Checks a questionnaire against itself and the project. Each check explains what it
 * found and names the questions involved. Checks never score or rank: they use only
 * the shared statuses.
 */

import type { CheckStatus } from "./hypothesis-checks";
import { questionNumbers, sectionQuestions } from "./questionnaire";
import { questionnaireVariables } from "./questionnaire-builder";
import { scaleProblems, scaleSignature } from "./questionnaire-scales";
import { MEASURING_SECTIONS, QUESTION_TYPE_INFO, type Question, type Questionnaire } from "./questionnaire-types";
import type { ResearchProjectDraft } from "./research-project";
import type { ProjectVariable } from "./variable-types";

export interface QuestionnaireCheck {
  check: string;
  label: string;
  status: CheckStatus;
  explanation: string;
  /** Numbers of the questions involved, such as “Question 4”. */
  questions: string[];
}

const make = (check: string, label: string, status: CheckStatus, explanation: string, questions: string[] = []): QuestionnaireCheck => ({ check, label, status, explanation, questions });
const list = (items: readonly string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
// Built with the constructor because Unicode property escapes need ES2018 syntax.
const NOT_WORD = new RegExp("[^\\p{L}\\p{N}]+", "gu");
const normalise = (text: string) => text.toLowerCase().replace(NOT_WORD, " ").trim();
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** Every check, in a fixed order. */
export function checkQuestionnaire(questionnaire: Questionnaire, project: ResearchProjectDraft): QuestionnaireCheck[] {
  const numbers = questionNumbers(questionnaire);
  const label = (question: Question) => `Question ${numbers.get(question.id) ?? "?"}`;
  const variables = questionnaireVariables(project);
  const byId = new Map(variables.map((variable) => [variable.id, variable]));
  const sectionKind = new Map(questionnaire.sections.map((section) => [section.id, section.kind]));
  const measuring = questionnaire.questions.filter((question) => MEASURING_SECTIONS.has(sectionKind.get(question.section)!));
  const checks: QuestionnaireCheck[] = [];

  // Duplicate wording.
  const byText = new Map<string, Question[]>();
  for (const question of questionnaire.questions) {
    const key = normalise(question.text);
    if (key) byText.set(key, [...(byText.get(key) ?? []), question]);
  }
  const repeats = [...byText.values()].filter((group) => group.length > 1);
  checks.push(
    repeats.length > 0
      ? make("duplicates", "Duplicate questions", "worth-checking", `${plural(repeats.length, "wording appears", "wordings appear")} more than once: ${repeats.map((group) => list(group.map(label))).join("; ")}. Keep repeats only if they are deliberate, such as a check on consistency.`, repeats.flat().map(label))
      : make("duplicates", "Duplicate questions", "aligned", "No two questions have the same wording."),
  );

  // Variables.
  if (variables.length === 0) checks.push(make("variables", "Variables", "missing", "Your project has no variables yet, so no question can be traced to what your study measures. Add them in the Variables Builder."));
  else {
    const unused = variables.filter((variable) => !questionnaire.questions.some((question) => question.variableId === variable.id));
    checks.push(
      unused.length > 0
        ? make("variables", "Variables", "worth-checking", `${list(unused.map((variable) => variable.name))} ${unused.length === 1 ? "has" : "have"} no question yet. Measure ${unused.length === 1 ? "it" : "them"}, or record why not.`)
        : make("variables", "Variables", "aligned", "Every variable has at least one question."),
    );
  }

  // Indicators.
  const noIndicators = variables.filter((variable) => variable.possibleIndicators.length === 0);
  const unlinkedIndicator = measuring.filter((question) => {
    const variable = question.variableId ? byId.get(question.variableId) : undefined;
    return variable && variable.possibleIndicators.length > 0 && !variable.possibleIndicators.some((indicator) => indicator.id === question.indicatorId);
  });
  if (noIndicators.length > 0) {
    checks.push(make("indicators", "Indicators", "missing", `${list(noIndicators.map((variable) => variable.name))} ${noIndicators.length === 1 ? "has" : "have"} no indicators, so ${noIndicators.length === 1 ? "its questions measure" : "their questions measure"} the variable only in general. Add indicators in the Variables Builder.`));
  } else if (unlinkedIndicator.length > 0) {
    checks.push(make("indicators", "Indicators", "clarify", `${list(unlinkedIndicator.map(label))} ${unlinkedIndicator.length === 1 ? "isn't" : "aren't"} linked to one of the variable's indicators. Choose which indicator each measures.`, unlinkedIndicator.map(label)));
  } else if (variables.length > 0) checks.push(make("indicators", "Indicators", "aligned", "Every measuring question is linked to an indicator."));

  // Orphans: measuring questions with no variable, or one that no longer exists.
  const orphans = measuring.filter((question) => !question.variableId || !byId.has(question.variableId));
  const optional = questionnaire.questions.filter((question) => sectionKind.get(question.section) === "open-ended" && !question.variableId);
  if (orphans.length > 0) {
    checks.push(make("orphans", "Questions without a variable", "clarify", `${list(orphans.map(label))} ${orphans.length === 1 ? "doesn't" : "don't"} measure any variable in your project. Link ${orphans.length === 1 ? "it" : "each"} to a variable and indicator, or explain why ${orphans.length === 1 ? "it's" : "they're"} needed.`, orphans.map(label)));
  } else checks.push(make("orphans", "Questions without a variable", "aligned", "Every question in the measuring sections is linked to a variable."));
  if (optional.length > 0) checks.push(make("open-ended", "Open-ended questions", "review", `${list(optional.map(label))} ${optional.length === 1 ? "isn't" : "aren't"} linked to a variable. That's common for open questions; check what each adds.`, optional.map(label)));

  // Scales.
  const broken = questionnaire.questions.filter((question) => question.scale && scaleProblems(question.scale).some((problem) => !problem.includes("placeholders")));
  const unlabelled = questionnaire.questions.filter((question) => question.scale && scaleProblems(question.scale).some((problem) => problem.includes("placeholders")));
  const mixed = variables.filter((variable) => {
    const signatures = new Set(questionnaire.questions.filter((question) => question.variableId === variable.id && question.scale && QUESTION_TYPE_INFO[question.type].form !== "differential").map((question) => scaleSignature(question.scale!)));
    return signatures.size > 1;
  });
  const reversed = questionnaire.questions.filter((question) => question.scale?.reverseScored);
  if (broken.length > 0) checks.push(make("scales", "Scales", "clarify", `${list(broken.map(label))} ${broken.length === 1 ? "has a scale" : "have scales"} with problems: ${[...new Set(broken.flatMap((question) => scaleProblems(question.scale!)))].join(" ")}`, broken.map(label)));
  else if (mixed.length > 0) checks.push(make("scales", "Scales", "worth-checking", `Questions measuring ${list(mixed.map((variable) => variable.name))} use different scales. Items combined into one score usually share a scale.`));
  else if (unlabelled.length > 0) checks.push(make("scales", "Scales", "clarify", `${list(unlabelled.map(label))} still ${unlabelled.length === 1 ? "has" : "have"} placeholder scale labels or end words.`, unlabelled.map(label)));
  else checks.push(make("scales", "Scales", "aligned", "Every scale is complete, and questions measuring the same variable share a scale."));
  if (reversed.length > 0) checks.push(make("reverse", "Reverse-scored items", "review", `${list(reversed.map(label))} ${reversed.length === 1 ? "is" : "are"} reverse-scored. Check the wording runs the opposite way, and record the reversal in your codebook.`, reversed.map(label)));

  // Consent.
  const consent = questionnaire.sections.filter((section) => section.kind === "consent");
  if (consent.length === 0) checks.push(make("consent", "Consent", "missing", "There is no consent section. Most ethics committees require informed consent before any questions."));
  else {
    const written = consent.some((section) => section.content.trim());
    const asked = consent.some((section) => sectionQuestions(questionnaire, section.id).length > 0);
    const first = questionnaire.questions.find((question) => sectionKind.get(question.section) !== "consent");
    const firstConsent = questionnaire.questions.find((question) => sectionKind.get(question.section) === "consent");
    const late = Boolean(first && firstConsent && questionnaire.sections.findIndex((section) => section.id === first.section) < questionnaire.sections.findIndex((section) => section.id === firstConsent.section));
    if (!written && !asked) checks.push(make("consent", "Consent", "missing", "The consent section has no statement and no question."));
    else if (!written || !asked) checks.push(make("consent", "Consent", "clarify", !written ? "Add the consent statement approved by your ethics committee." : "Add a question recording the participant's agreement."));
    else if (late) checks.push(make("consent", "Consent", "worth-checking", "Some questions come before the consent section. Consent is usually given before any questions."));
    else checks.push(make("consent", "Consent", "aligned", "The questionnaire asks for consent before any other question."));
  }

  // Demographics.
  const demographics = questionnaire.sections.filter((section) => section.kind === "demographics");
  const demographicQuestions = demographics.flatMap((section) => sectionQuestions(questionnaire, section.id));
  if (demographics.length === 0) checks.push(make("demographics", "Demographic information", "worth-checking", "There is no demographic section. Most studies describe their participants; include what your analysis needs."));
  else if (demographicQuestions.length === 0) checks.push(make("demographics", "Demographic information", "worth-checking", "The demographic section has no questions. Add the participant characteristics your analysis needs, such as your control variables."));
  else checks.push(make("demographics", "Demographic information", "aligned", `The demographic section has ${plural(demographicQuestions.length, "question", "questions")}.`));

  // Coverage of dependent and independent variables.
  const coverage = (kind: "dependent" | "independent") => {
    const ofKind = variables.filter((variable) => variable.variableType === kind);
    const title = kind === "dependent" ? "Dependent variables" : "Independent variables";
    if (ofKind.length === 0) return make(`${kind}-coverage`, title, "review", `Your project has no ${kind} variables yet.`);
    const uncovered = ofKind.filter((variable) => !questionnaire.questions.some((question) => question.variableId === variable.id));
    return uncovered.length > 0
      ? make(`${kind}-coverage`, title, "missing", `No question measures ${list(uncovered.map((variable) => variable.name))}.`)
      : make(`${kind}-coverage`, title, "aligned", `Every ${kind} variable has a question: ${list(ofKind.map((variable) => variable.name))}.`);
  };
  checks.push(coverage("dependent"), coverage("independent"));

  // Hypotheses.
  const measured = (name: string) => variables.some((variable: ProjectVariable) => variable.name.toLowerCase() === name.trim().toLowerCase() && questionnaire.questions.some((question) => question.variableId === variable.id));
  const alternatives = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
  if (alternatives.length === 0) checks.push(make("hypotheses", "Hypotheses", "review", "Your project has no hypotheses to check the questionnaire against."));
  else {
    const gaps = alternatives.flatMap((hypothesis) => {
      const { independentVariables, dependentVariables, moderators, mediators } = hypothesis.relationship;
      const missing = [...independentVariables, ...dependentVariables, ...moderators, ...mediators].filter((name) => !measured(name));
      return missing.length > 0 ? [`“${hypothesis.text}” needs ${list(missing)}`] : [];
    });
    checks.push(
      gaps.length > 0
        ? make("hypotheses", "Hypotheses", "worth-checking", `Some hypotheses name variables no question measures. ${gaps.join("; ")}.`)
        : make("hypotheses", "Hypotheses", "aligned", `Every variable in your ${plural(alternatives.length, "hypothesis", "hypotheses")} has a question.`),
    );
  }

  // Objectives.
  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) checks.push(make("objectives", "Objectives", "review", "Your project has no objectives to check the questionnaire against."));
  else {
    const named = (objective: string) => variables.filter((variable) => objective.toLowerCase().includes(variable.name.toLowerCase()));
    const unmeasuredObjectives = objectives.filter((objective) => named(objective).some((variable) => !questionnaire.questions.some((question) => question.variableId === variable.id)));
    const unnamed = objectives.filter((objective) => named(objective).length === 0);
    if (unmeasuredObjectives.length > 0) checks.push(make("objectives", "Objectives", "worth-checking", `Some objectives name variables no question measures: ${unmeasuredObjectives.map((objective) => `“${objective}”`).join("; ")}.`));
    else if (unnamed.length > 0) checks.push(make("objectives", "Objectives", "review", `These objectives don't name a variable, so check by hand which questions serve them: ${unnamed.map((objective) => `“${objective}”`).join("; ")}.`));
    else checks.push(make("objectives", "Objectives", "aligned", "Every variable your objectives name has a question."));
  }

  // Wording and options still to write.
  const unwritten = questionnaire.questions.filter((question) => !question.text.trim());
  const noOptions = questionnaire.questions.filter((question) => QUESTION_TYPE_INFO[question.type].usesOptions && question.options.filter((option) => option.trim()).length < 2);
  if (unwritten.length > 0) checks.push(make("wording", "Question wording", "review", `${plural(unwritten.length, "question is", "questions are")} still a placeholder: ${list(unwritten.map(label))}. The builder never writes questions for you.`, unwritten.map(label)));
  if (noOptions.length > 0) checks.push(make("options", "Answer options", "clarify", `${list(noOptions.map(label))} ${noOptions.length === 1 ? "needs" : "need"} at least two answer options.`, noOptions.map(label)));
  const empty = questionnaire.sections.filter((section) => MEASURING_SECTIONS.has(section.kind) && sectionQuestions(questionnaire, section.id).length === 0 && section.kind !== "demographics");
  if (empty.length > 0) checks.push(make("empty-sections", "Empty sections", "review", `${list(empty.map((section) => section.title))} ${empty.length === 1 ? "has" : "have"} no questions. Add some, or remove ${empty.length === 1 ? "it" : "them"}.`));
  return checks;
}
