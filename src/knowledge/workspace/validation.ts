/**
 * Project checks: gaps and contradictions between stages, which no single tool can
 * see. Each names the stage to fix and says how, in plain words.
 *
 * - problem: something is contradictory or missing that later stages rely on; the
 *   stage it belongs to needs review.
 * - suggestion: worth a look, but the project can be sound without changing anything.
 */

import { pairVariables } from "../research/hypothesis-alignment";
import { checkCompatibility } from "../research/design-compatibility";
import type { ResearchProjectDraft } from "../research/research-project";
import { checkSamplingCompatibility } from "../research/sampling-compatibility";
import { projectPopulation, projectVariables, titleNames } from "../research/title/keywords";
import type { ModuleId } from "./modules";

export type IssueSeverity = "problem" | "suggestion";

export interface ProjectIssue {
  /** Stable, for keys and tests. */
  id: string;
  /** The stage the issue is about. */
  stage: ModuleId;
  severity: IssueSeverity;
  message: string;
  /** The stage where it can be fixed, when that is a different stage. */
  fixIn: ModuleId;
}

const fold = (text: string) => text.trim().toLowerCase();
const listNames = (names: readonly string[]) => names.map((name) => `“${name}”`).join(names.length === 2 ? " and " : ", ");

/** Every project check, in stage order. An empty project has no issues. */
export function validateProject(draft: ResearchProjectDraft): ProjectIssue[] {
  const issues: ProjectIssue[] = [];
  const add = (id: string, stage: ModuleId, severity: IssueSeverity, message: string, fixIn: ModuleId = stage) => issues.push({ id, stage, severity, message, fixIn });

  const variables = draft.variables ?? [];
  const variableNames = new Set(variables.map((variable) => fold(variable.name)));
  const hypotheses = draft.hypotheses ?? [];
  const qualitative = draft.methodology === "qualitative";

  // Question and objectives.
  if (draft.researchObjectives && !draft.researchQuestion)
    add("objectives-without-question", "objectives", "problem", "Your objectives have no research question to answer yet. Write the question, then check each objective still serves it.", "question");
  if (draft.researchObjectives && !draft.researchAim)
    add("objectives-without-aim", "objectives", "suggestion", "Add a general objective: one sentence your specific objectives work towards together.");
  if (hypotheses.length > 0 && !draft.researchQuestion)
    add("hypotheses-without-question", "hypotheses", "problem", "Your hypotheses have no research question. A hypothesis is a testable answer to a question, so write the question first.", "question");

  // The title: whether it names what the rest of the project has settled.
  const title = draft.projectTitle;
  if (title) {
    const core = [...projectVariables(draft, "independent"), ...projectVariables(draft, "dependent")];
    if (core.length > 0 && !core.some((name) => titleNames(title, name)))
      add("title-without-variables", "title", "suggestion", `Your title doesn't name any of your main variables (${listNames(core)}). Readers find studies by their variables; check the title in the Research Title Builder.`);
    const population = projectPopulation(draft);
    if (population && !titleNames(title, population))
      add("title-without-population", "title", "suggestion", `Your title doesn't name your population, ${listNames([population])}, so readers can't tell whom the findings apply to.`);
  }

  // Hypotheses and variables.
  const hasRelationship = variables.some((variable) => variable.variableType === "independent") && variables.some((variable) => variable.variableType === "dependent");
  if (!qualitative && hasRelationship && hypotheses.length === 0)
    add("variables-without-hypotheses", "hypotheses", "suggestion", "You have independent and dependent variables but no hypotheses. If you will test how they relate, state that as hypotheses.");
  if (qualitative && hypotheses.length > 0)
    add("hypotheses-in-qualitative", "hypotheses", "suggestion", "Your methodology is qualitative, which usually explores rather than tests. Check whether hypotheses belong in this project, or whether your methodology is mixed.", "onion");
  if (variables.length > 0) {
    const unknown = [...new Set(hypotheses.filter((hypothesis) => hypothesis.role === "alternative").flatMap((hypothesis) => pairVariables(hypothesis.relationship)).filter((name) => !variableNames.has(fold(name))))];
    if (unknown.length > 0)
      add("hypotheses-name-unknown-variables", "hypotheses", "problem", `Your hypotheses name ${listNames(unknown)}, which ${unknown.length === 1 ? "isn't" : "aren't"} among your variables. Add ${unknown.length === 1 ? "it" : "them"} as variables, or reword the hypotheses.`, "variables");
  }

  // Conceptual framework.
  const framework = draft.conceptualFramework;
  if (framework && variables.length === 0)
    add("framework-without-variables", "framework", "suggestion", "Your framework's boxes aren't defined as variables yet. Define them in the Variables Builder so each has a meaning and a measure.", "variables");
  if (framework && variables.length > 0) {
    const missing = framework.variables.filter((box) => !variableNames.has(fold(box.name))).map((box) => box.name);
    if (missing.length > 0)
      add("framework-names-unknown-variables", "framework", "problem", `Your framework shows ${listNames(missing)}, which ${missing.length === 1 ? "isn't" : "aren't"} among your variables. Rename the ${missing.length === 1 ? "box" : "boxes"} or add the ${missing.length === 1 ? "variable" : "variables"}.`, "variables");
  }

  // Design and sampling.
  if (draft.researchDesign?.chosen && !draft.researchOnionSelection)
    add("design-without-onion", "design", "suggestion", "You chose a design before your research onion choices. Record your philosophy, approach and methodological choice so the design can be checked against them.", "onion");
  if (draft.researchDesign?.chosen) {
    const worth = checkCompatibility(draft.researchDesign.chosen, draft).filter((check) => check.status === "worth-checking");
    for (const check of worth) add(`design-${check.check}`, "design", "suggestion", `${check.label}: ${check.explanation}`);
  }
  const sampling = draft.samplingPlan;
  if (sampling && !sampling.population.targetPopulation && !draft.population)
    add("sampling-without-population", "sampling", "problem", "Your sampling plan has no population. Say who the study is about before choosing how to sample them.");
  if (sampling?.chosen) {
    const worth = checkSamplingCompatibility(sampling.chosen, draft).filter((check) => check.status === "worth-checking");
    for (const check of worth) add(`sampling-${check.check}`, "sampling", "suggestion", `${check.label}: ${check.explanation}`);
  }
  if (draft.sampleSizePlan && !sampling?.chosen)
    add("sample-size-without-technique", "sample-size", "suggestion", "You have a sample size but no sampling technique. How the sample is drawn affects how large it needs to be, such as the design effect for cluster samples.", "sampling");

  // Questionnaire.
  const questionnaire = draft.questionnaire;
  if (questionnaire && questionnaire.questions.length > 0 && variables.length === 0)
    add("questionnaire-without-variables", "questionnaire", "problem", "Your questionnaire has questions but the project has no variables. Define your variables so every question measures one of them.", "variables");
  if (questionnaire && variables.length > 0) {
    const ids = new Set(variables.map((variable) => variable.id));
    const orphans = questionnaire.questions.filter((question) => question.variableId !== null && !ids.has(question.variableId));
    if (orphans.length > 0)
      add("questionnaire-unknown-variables", "questionnaire", "problem", `${orphans.length} ${orphans.length === 1 ? "question measures a variable" : "questions measure variables"} no longer in your project. Link ${orphans.length === 1 ? "it" : "them"} to a current variable, or remove ${orphans.length === 1 ? "it" : "them"}.`);
  }

  // Analysis and interpretation.
  if (draft.dataAnalysisPlan && variables.length === 0)
    add("analysis-without-variables", "analysis", "problem", "Your analysis plan has no variables to analyse. Define your variables and their measurement levels, then review the plan.", "variables");
  if (draft.interpretationNotes && !draft.dataAnalysisPlan)
    add("interpretation-without-plan", "interpretation", "suggestion", "You have interpreted results without an analysis plan. Record the plan so readers can see the analyses were decided in advance.", "analysis");

  return issues;
}
