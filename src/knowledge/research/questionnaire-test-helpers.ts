/** A fictional project for questionnaire tests. Not part of the product. */

import { frameworkFromProject } from "./conceptual-framework";
import { generateHypotheses } from "./hypothesis-builder";
import { applyHypotheses, toProjectHypotheses } from "./hypothesis-summary";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { EMPTY_SAMPLING_PLAN, updatePopulation } from "./sampling";
import { applySampling } from "./sampling-summary";
import { addIndicator, addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";
import type { ProjectVariable } from "./variable-types";

/** Screen time and sleep: two variables with two indicators each, and a control variable without indicators. */
export function sleepVariables(): ProjectVariable[] {
  let variables = addVariable([], "screen time", "independent");
  variables = addVariable(variables, "sleep quality", "dependent");
  variables = addVariable(variables, "year of study", "control");
  variables = addIndicator(variables, "var-screen-time", { name: "Weekday screen time", level: "ratio", scale: "Hours per day" });
  variables = addIndicator(variables, "var-screen-time", { name: "Screen use before bed", level: "likert" });
  variables = addIndicator(variables, "var-sleep-quality", { name: "Time taken to fall asleep", level: "ratio" });
  variables = addIndicator(variables, "var-sleep-quality", { name: "Feeling rested on waking", level: "likert" });
  variables = updateVariable(variables, "var-year-of-study", { measurementLevel: "ordinal" });
  return updateVariable(variables, "var-sleep-quality", { operationalDefinition: "Self-reported sleep over the past week" });
}

/** The sleep project: question, aim, objectives, hypotheses, framework, variables and sampling plan. */
export function sleepProject(): ResearchProjectDraft {
  let project = createProjectDraft({
    topic: "Screen time and sleep quality",
    researchAim: "To understand how screen use relates to students' sleep",
    researchQuestion: "What is the relationship between screen time and sleep quality among first-year students?",
    researchObjectives: ["To examine the relationship between screen time and sleep quality", "To describe how students spend their evenings"],
    independentVariables: ["screen time"],
    dependentVariables: ["sleep quality"],
    controlVariables: ["year of study"],
  });
  project = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "relationship", direction: "non-directional" }), {}));
  project = updateProjectDraft(project, { conceptualFramework: frameworkFromProject(project) });
  project = applySampling(project, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "First-year students at one university" }));
  return applyVariables(project, sleepVariables());
}
