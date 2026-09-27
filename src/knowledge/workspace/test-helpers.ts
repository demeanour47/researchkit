/** A fictional, complete project for workspace tests. Not part of the product. */

import { buildQuestionnaire } from "../research/questionnaire-builder";
import { applyQuestionnaire } from "../research/questionnaire-summary";
import { EMPTY_DESIGN, chooseDesign } from "../research/research-design";
import { applyDesign } from "../research/design-summary";
import { DEFAULT_SAMPLE_SIZE_PLAN } from "../research/sample-size";
import { applySampleSize } from "../research/sample-size-summary";
import { chooseTechnique } from "../research/sampling";
import { applySampling } from "../research/sampling-summary";
import { sleepProject } from "../research/questionnaire-test-helpers";
import { updateProjectDraft, type ResearchProjectDraft } from "../research/research-project";
import { updateVariable } from "../research/variable-builder";
import { applyVariables } from "../research/variable-summary";
import { currentAnalysisMethods, currentAssumptionMethods } from "./progress";

export const FULL_ONION = {
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  strategy: "survey",
  timeHorizon: "cross-sectional",
  technique: "questionnaire",
} as const;

/** The sleep project with every stage complete. */
export function completeProject(): ResearchProjectDraft {
  let project = sleepProject();
  let variables = project.variables!;
  for (const variable of variables) {
    variables = updateVariable(variables, variable.id, {
      conceptualDefinition: `What ${variable.name} means in this study.`,
      operationalDefinition: `How ${variable.name} is measured.`,
      measurementLevel: variable.measurementLevel ?? "interval",
    });
  }
  project = applyVariables(project, variables);
  project = updateProjectDraft(project, {
    projectTitle: "Screen time and sleep in first-year students",
    population: "first-year students",
    researchProblem: "Students report poor sleep.",
    background: "Screens are used late at night.",
    researchGap: "Little is known about first-year students in Nepal.",
    references: ["Smith, J. (2020). Sleep and screens. Journal of Sleep, 1(1), 1–10."],
    methodology: "quantitative",
    researchOnionSelection: FULL_ONION,
  });
  project = applyDesign(project, chooseDesign(EMPTY_DESIGN, "survey"));
  project = applySampling(project, chooseTechnique(project.samplingPlan!, "simple-random"));
  project = applySampleSize(project, DEFAULT_SAMPLE_SIZE_PLAN);
  project = applyQuestionnaire(project, buildQuestionnaire(project));
  project = updateProjectDraft(project, { dataAnalysisPlan: { methods: currentAnalysisMethods(project), notes: "" } });
  project = updateProjectDraft(project, { statisticalAssumptions: { methods: currentAssumptionMethods(project), notes: "" } });
  return updateProjectDraft(project, { interpretationNotes: ["Screen time was moderately related to sleep quality."] });
}
