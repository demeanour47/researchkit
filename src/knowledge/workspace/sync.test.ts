/**
 * Cross-tool synchronisation: a project built stage by stage through the workspace,
 * each stage using the owning tool's own knowledge functions on the project the
 * previous stages saved, exactly as the tools do when connected to the workspace.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assumptionChecklist } from "../research/assumptions/checklist";
import { applyFramework, frameworkFromProject } from "../research/conceptual-framework";
import { recommendAnalyses } from "../research/data-analysis";
import { EMPTY_DESIGN, chooseDesign } from "../research/research-design";
import { applyDesign } from "../research/design-summary";
import { generateHypotheses } from "../research/hypothesis-builder";
import { applyHypotheses, toProjectHypotheses } from "../research/hypothesis-summary";
import { buildQuestionnaire } from "../research/questionnaire-builder";
import { applyQuestionnaire } from "../research/questionnaire-summary";
import { PROJECT_FIELDS, createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "../research/research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN } from "../research/sample-size";
import { applySampleSize } from "../research/sample-size-summary";
import { EMPTY_SAMPLING_PLAN, chooseTechnique, updatePopulation } from "../research/sampling";
import { applySampling } from "../research/sampling-summary";
import { updateVariable } from "../research/variable-builder";
import { applyVariables } from "../research/variable-summary";
import { importVariables } from "../research/variables";
import { checklistMethods, planMethods } from "./accepted";
import { getModule, type ModuleId } from "./modules";
import { projectProgress } from "./progress";
import { FULL_ONION } from "./test-helpers";
import { createWorkspace, editModule, saveModule, type Workspace } from "./workspace";

let time = 1_700_000_000_000;
const tick = () => (time += 1000);

/** Runs a tool on the saved project and saves its stage, returning the new workspace. */
const step = (workspace: Workspace, id: ModuleId, tool: (project: ResearchProjectDraft) => ResearchProjectDraft) => saveModule(workspace, id, tool(workspace.draft), tick());

function buildProject() {
  const snapshots: Partial<Record<ModuleId, ResearchProjectDraft>> = {};
  let workspace = createWorkspace("sync", tick(), "Screen time and sleep");
  const record = (id: ModuleId) => (snapshots[id] = workspace.draft);

  workspace = editModule(workspace, "problem", { researchProblem: "Students sleep badly.", researchGap: "First-year students are rarely studied." }, tick());
  record("problem");
  // The Research Question Builder saves the topic, context, named variables and question.
  workspace = step(workspace, "question", (project) =>
    updateProjectDraft(project, { topic: "Screen time and sleep", population: "first-year students", independentVariables: ["screen time"], dependentVariables: ["sleep quality"], researchQuestion: "How does screen time relate to sleep quality among first-year students?" }),
  );
  record("question");
  workspace = editModule(workspace, "objectives", { researchAim: "To examine screen time and sleep", researchObjectives: ["To measure screen time", "To relate it to sleep quality"] }, tick());
  record("objectives");
  // The Hypothesis Builder drafts from the variables the question named.
  workspace = step(workspace, "hypotheses", (project) => applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "relationship", direction: "non-directional" }), {})));
  record("hypotheses");
  // The Variables Builder imports from the question and hypotheses, then the researcher defines each.
  workspace = step(workspace, "variables", (project) => {
    let variables = importVariables(project);
    for (const variable of variables) variables = updateVariable(variables, variable.id, { conceptualDefinition: "Defined.", operationalDefinition: "Measured.", measurementLevel: "interval" });
    return applyVariables(project, variables);
  });
  record("variables");
  workspace = step(workspace, "framework", (project) => applyFramework(project, frameworkFromProject(project)));
  record("framework");
  workspace = step(workspace, "onion", () => createProjectDraft({ researchOnionSelection: FULL_ONION }));
  record("onion");
  workspace = step(workspace, "design", (project) => applyDesign(project, chooseDesign(EMPTY_DESIGN, "survey")));
  record("design");
  // The Sampling Builder starts from the question's population.
  workspace = step(workspace, "sampling", (project) => applySampling(project, chooseTechnique(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: project.population ?? "" }), "simple-random")));
  record("sampling");
  workspace = step(workspace, "sample-size", (project) => applySampleSize(project, DEFAULT_SAMPLE_SIZE_PLAN));
  workspace = step(workspace, "questionnaire", (project) => applyQuestionnaire(project, buildQuestionnaire(project)));
  record("questionnaire");
  workspace = step(workspace, "analysis", (project) => updateProjectDraft(project, { dataAnalysisPlan: { methods: planMethods(recommendAnalyses(project)), notes: "" } }));
  workspace = step(workspace, "assumptions", (project) => updateProjectDraft(project, { statisticalAssumptions: { methods: checklistMethods(assumptionChecklist(project)), notes: "" } }));
  workspace = step(workspace, "interpretation", (project) => updateProjectDraft(project, { interpretationNotes: ["Screen time was related to sleep quality."] }));
  workspace = editModule(workspace, "references", { references: ["Smith, J. (2020). Sleep. Journal, 1, 1–2."] }, tick());
  return { workspace, snapshots };
}

describe("a project built through the workspace", () => {
  const { workspace, snapshots } = buildProject();

  it("completes every stage", () => {
    const progress = projectProgress(workspace.draft, workspace.saved);
    assert.deepEqual(
      progress.stages.filter((stage) => stage.status !== "completed").map((stage) => `${stage.stage.id}: ${stage.status} ${[...stage.missing, ...stage.reviewReasons].join(" ")}`),
      [],
    );
    assert.equal(progress.percent, 100);
  });

  it("drafts hypotheses from the variables the question named", () => {
    const alternative = workspace.draft.hypotheses!.find((hypothesis) => hypothesis.role === "alternative")!;
    assert.deepEqual(alternative.relationship.independentVariables, ["screen time"]);
    assert.deepEqual(alternative.relationship.dependentVariables, ["sleep quality"]);
  });

  it("defines the variables the question and hypotheses named, without retyping them", () => {
    assert.deepEqual(workspace.draft.variables!.map((variable) => variable.name).sort(), ["screen time", "sleep quality"]);
  });

  it("draws the framework from the saved variables and hypotheses", () => {
    assert.deepEqual(workspace.draft.conceptualFramework!.variables.map((box) => box.name).sort(), ["screen time", "sleep quality"]);
    assert.ok(workspace.draft.conceptualFramework!.relationships.length > 0);
  });

  it("builds the questionnaire from the saved variables", () => {
    const ids = new Set(workspace.draft.variables!.map((variable) => variable.id));
    assert.ok(workspace.draft.questionnaire!.questions.length > 0);
    assert.ok(workspace.draft.questionnaire!.questions.every((question) => question.variableId === null || ids.has(question.variableId)));
  });

  it("samples the population the question named, and reads the onion's methodology", () => {
    assert.equal(workspace.draft.samplingPlan!.population.targetPopulation, "first-year students");
    assert.equal(workspace.draft.methodology, "quantitative");
  });

  it("never lets a later stage change an earlier stage's fields", () => {
    for (const [id, before] of Object.entries(snapshots) as [ModuleId, ResearchProjectDraft][]) {
      // The variables stage keeps the named lists in step, which the question stage also writes.
      const owned = getModule(id).owns.filter((field) => !(id === "question" && (field === "independentVariables" || field === "dependentVariables")));
      for (const field of owned) assert.deepEqual(workspace.draft[field], before[field], `${id}.${field}`);
    }
  });

  it("keeps every stage's work in the one saved project", () => {
    const filled = ["projectTitle", "researchProblem", "researchGap", "topic", "population", "researchQuestion", "researchAim", "researchObjectives", "hypotheses", "variables", "independentVariables", "dependentVariables", "conceptualFramework", "researchOnionSelection", "methodology", "researchDesign", "samplingPlan", "sampleSizePlan", "questionnaire", "dataAnalysisPlan", "statisticalAssumptions", "interpretationNotes", "references"] as const;
    for (const field of filled) assert.notEqual(workspace.draft[field], undefined, field);
    for (const field of PROJECT_FIELDS) if (!(filled as readonly string[]).includes(field)) assert.equal(workspace.draft[field], undefined, field);
  });

  it("records each stage's save, in the order they happened", () => {
    const order = Object.entries(workspace.saved)
      .sort(([, a], [, b]) => a! - b!)
      .map(([id]) => id);
    assert.deepEqual(order, ["problem", "question", "objectives", "hypotheses", "variables", "framework", "onion", "design", "sampling", "sample-size", "questionnaire", "analysis", "assumptions", "interpretation", "references"]);
  });
});

describe("changes ripple forward as reviews", () => {
  it("asks for the framework, questionnaire and analysis to be reviewed after the variables change", () => {
    const { workspace } = buildProject();
    const changed = step(workspace, "variables", (project) => applyVariables(project, updateVariable([...project.variables!], project.variables![0].id, { measurementLevel: "ordinal" })));
    const statuses = Object.fromEntries(projectProgress(changed.draft, changed.saved).stages.map((stage) => [stage.stage.id, stage.status]));
    for (const id of ["framework", "questionnaire", "analysis", "design"] as const) assert.equal(statuses[id], "needs-review", id);
    assert.equal(statuses.question, "completed");
    assert.equal(statuses.references, "completed");
  });

  it("clears a review once the stage is saved again", () => {
    const { workspace } = buildProject();
    const changed = step(workspace, "variables", (project) => applyVariables(project, updateVariable([...project.variables!], project.variables![0].id, { notes: "Checked." })));
    const framework = (current: Workspace) => projectProgress(current.draft, current.saved).stages.find((stage) => stage.stage.id === "framework")!.status;
    assert.equal(framework(changed), "needs-review");
    // Saving without a change isn't a review: nothing is recorded.
    assert.equal(step(changed, "framework", (project) => project), changed);
    const resaved = step(changed, "framework", (project) => applyFramework(project, { ...project.conceptualFramework!, relationships: project.conceptualFramework!.relationships.map((relationship) => ({ ...relationship, label: "affects" })) }));
    assert.equal(framework(resaved), "completed");
  });

  it("asks for the accepted analysis plan to be reviewed when the project leads to different analyses", () => {
    const { workspace } = buildProject();
    const changed = step(workspace, "variables", (project) => {
      const variables = project.variables!.map((variable) => (variable.name === "sleep quality" ? { ...variable, measurementLevel: "nominal" as const } : variable));
      return applyVariables(project, variables);
    });
    const analysis = projectProgress(changed.draft, changed.saved).stages.find((stage) => stage.stage.id === "analysis")!;
    assert.equal(analysis.status, "needs-review");
    assert.ok(analysis.reviewReasons.some((reason) => /different set of analyses/.test(reason)));
  });
});
