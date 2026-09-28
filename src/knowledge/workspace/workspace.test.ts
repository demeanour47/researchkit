import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addVariable } from "../research/variable-builder";
import { createProjectDraft, updateProjectDraft, PROJECT_FIELDS, type ResearchProjectDraft } from "../research/research-project";
import { commitModule, ownedChanges, syncVariableLists } from "./commit";
import { MODULES, MODULE_IDS, getModule, moduleForTool, ownerOf, type ModuleId } from "./modules";
import { stagePosition } from "./navigation";
import { STAGE_STATUS_LABELS, nextStage, projectProgress } from "./progress";
import { completeProject, FULL_ONION } from "./test-helpers";
import { validateProject } from "./validation";
import { WORKSPACE_FORMAT, createWorkspace, editModule, parseWorkspace, recentModules, saveModule, serializeWorkspace, type Workspace } from "./workspace";

const NOW = 1_700_000_000_000;
const statusOf = (draft: ResearchProjectDraft, id: ModuleId, saved: Partial<Record<ModuleId, number>> = {}) => projectProgress(draft, saved).stages.find((stage) => stage.stage.id === id)!;
const issueIds = (draft: ResearchProjectDraft) => validateProject(draft).map((issue) => issue.id);

describe("stages", () => {
  it("lists every stage once, in project order", () => {
    assert.deepEqual(MODULES.map((stage) => stage.id), [...MODULE_IDS]);
    assert.equal(new Set(MODULE_IDS).size, MODULE_IDS.length);
  });

  it("gives every stage a name, a summary and at least one field", () => {
    for (const stage of MODULES) {
      assert.ok(stage.name && stage.summary.endsWith("."), stage.id);
      assert.ok(stage.owns.length > 0, stage.id);
    }
  });

  it("only depends on and reads stages that exist, never itself", () => {
    for (const stage of MODULES)
      for (const other of [...stage.dependsOn, ...stage.reads]) {
        assert.ok(MODULE_IDS.includes(other), `${stage.id} → ${other}`);
        assert.notEqual(other, stage.id);
      }
  });

  it("reads every stage it depends on, apart from the problem framing", () => {
    for (const stage of MODULES) for (const dependency of stage.dependsOn) if (dependency !== "problem") assert.ok(stage.reads.includes(dependency), `${stage.id} reads ${dependency}`);
  });

  it("gives every field of the project to a stage, except the free notes", () => {
    const owned = new Set(MODULES.flatMap((stage) => stage.owns));
    for (const field of PROJECT_FIELDS) if (field !== "notes") assert.ok(owned.has(field), field);
  });

  it("lets only the variables stage share fields, the named variable lists it keeps in step", () => {
    const counts = new Map<string, ModuleId[]>();
    for (const stage of MODULES) for (const field of stage.owns) counts.set(field, [...(counts.get(field) ?? []), stage.id]);
    const shared = [...counts].filter(([, modules]) => modules.length > 1);
    assert.deepEqual(shared.map(([field]) => field).sort(), ["dependentVariables", "independentVariables"]);
    for (const [, modules] of shared) assert.deepEqual(modules, ["question", "variables"]);
    assert.equal(ownerOf("independentVariables")?.id, "question");
    assert.equal(ownerOf("notes"), null);
  });

  it("finds the stage for a tool, and none for tools outside the workspace", () => {
    assert.equal(moduleForTool("variables-builder")?.id, "variables");
    assert.equal(moduleForTool("research-onion")?.id, "onion");
    assert.equal(moduleForTool("word-counter"), null);
    assert.throws(() => getModule("nope" as ModuleId), RangeError);
  });

  it("names every status", () => {
    for (const label of Object.values(STAGE_STATUS_LABELS)) assert.ok(label.length > 0);
  });
});

describe("committing a stage", () => {
  const base = completeProject();

  it("changes only the stage's own fields", () => {
    const edited = updateProjectDraft(base, { researchQuestion: "A new question?", hypotheses: null, topic: "Changed topic" });
    const next = commitModule(base, "hypotheses", edited);
    assert.equal(next.hypotheses, undefined);
    assert.equal(next.researchQuestion, base.researchQuestion);
    assert.equal(next.topic, base.topic);
    for (const field of PROJECT_FIELDS) if (field !== "hypotheses") assert.deepEqual(next[field], base[field], field);
  });

  it("clears a field the tool left empty", () => {
    const next = commitModule(base, "references", updateProjectDraft(base, { references: null }));
    assert.equal(next.references, undefined);
  });

  it("describes the change as the stage's fields only", () => {
    assert.deepEqual(Object.keys(ownedChanges("design", base)), ["researchDesign"]);
  });

  it("keeps the named variable lists in step with the defined variables", () => {
    let variables = addVariable([...base.variables!], "caffeine", "independent");
    variables = addVariable(variables, "stress", "mediator");
    const next = commitModule(base, "variables", updateProjectDraft(base, { variables }));
    assert.deepEqual(next.independentVariables, ["screen time", "caffeine"]);
    assert.deepEqual(next.mediatorVariables, ["stress"]);
    assert.deepEqual(next.controlVariables, ["year of study"]);
  });

  it("leaves the lists alone when there are no defined variables", () => {
    const draft = createProjectDraft({ independentVariables: ["a"] });
    assert.deepEqual(syncVariableLists(draft), draft);
  });

  it("takes the methodology from the onion's methodological choice", () => {
    const next = commitModule(createProjectDraft(), "onion", createProjectDraft({ researchOnionSelection: { choice: "mixed-methods" } }));
    assert.equal(next.methodology, "mixed-methods");
    const cleared = commitModule(next, "onion", createProjectDraft({ researchOnionSelection: { philosophy: "pragmatism" } }));
    assert.equal(cleared.methodology, undefined);
  });

  it("refuses values the project model rejects", () => {
    assert.throws(() => commitModule(base, "onion", { researchOnionSelection: { philosophy: "nonsense" } } as ResearchProjectDraft), RangeError);
  });
});

describe("the workspace", () => {
  it("starts with a title, marking the title stage as saved", () => {
    const workspace = createWorkspace("p1", NOW, "  Sleep study ");
    assert.equal(workspace.draft.projectTitle, "Sleep study");
    assert.deepEqual(workspace.saved, { title: NOW });
    assert.deepEqual(createWorkspace("p2", NOW).saved, {});
  });

  it("records when a stage changes the project", () => {
    const workspace = saveModule(createWorkspace("p", NOW), "question", createProjectDraft({ researchQuestion: "Why?" }), NOW + 5);
    assert.equal(workspace.draft.researchQuestion, "Why?");
    assert.equal(workspace.saved.question, NOW + 5);
    assert.equal(workspace.updatedAt, NOW + 5);
  });

  it("returns the same workspace when a tool saves nothing new, so opening a tool isn't an edit", () => {
    const workspace = saveModule(createWorkspace("p", NOW), "question", createProjectDraft({ researchQuestion: "Why?" }), NOW + 5);
    assert.equal(saveModule(workspace, "question", workspace.draft, NOW + 10), workspace);
    assert.equal(saveModule(workspace, "question", { ...workspace.draft, researchQuestion: "  Why? " }, NOW + 10), workspace);
  });

  it("ignores what a tool changed outside its stage", () => {
    const workspace = createWorkspace("p", NOW, "Title");
    const next = saveModule(workspace, "design", createProjectDraft({ projectTitle: "Other", researchQuestion: "Q?" }), NOW + 1);
    assert.equal(next, workspace);
  });

  it("edits workspace stages, refusing fields they don't own", () => {
    const workspace = editModule(createWorkspace("p", NOW), "objectives", { researchAim: "To understand", researchObjectives: ["One", "one", "Two"] }, NOW + 1);
    assert.deepEqual(workspace.draft.researchObjectives, ["One", "Two"]);
    assert.equal(workspace.saved.objectives, NOW + 1);
    assert.throws(() => editModule(workspace, "objectives", { researchQuestion: "Q?" }, NOW + 2), RangeError);
  });

  it("keeps paragraphs in long text", () => {
    const workspace = editModule(createWorkspace("p", NOW), "problem", { background: "First  point.\n\n\n  Second\npoint." }, NOW + 1);
    assert.equal(workspace.draft.background, "First point.\n\nSecond point.");
  });

  it("lists recently edited stages, newest first", () => {
    let workspace = createWorkspace("p", NOW, "T");
    workspace = saveModule(workspace, "question", createProjectDraft({ researchQuestion: "Q?" }), NOW + 10);
    workspace = saveModule(workspace, "references", createProjectDraft({ references: ["A"] }), NOW + 5);
    assert.deepEqual(recentModules(workspace).map((entry) => entry.stage.id), ["question", "references", "title"]);
    assert.deepEqual(recentModules(workspace, 1).map((entry) => entry.stage.id), ["question"]);
  });
});

describe("reading a saved or imported workspace", () => {
  const workspace: Workspace = { ...createWorkspace("p", NOW, "T"), draft: completeProject(), saved: { variables: NOW + 1 } };

  it("round-trips through a file", () => {
    const text = serializeWorkspace(workspace);
    assert.equal(JSON.parse(text).format, WORKSPACE_FORMAT);
    const parsed = parseWorkspace(JSON.parse(text));
    assert.ok(parsed.ok);
    assert.deepEqual(parsed.workspace, workspace);
  });

  it("refuses what isn't a workspace, with a reason", () => {
    for (const value of [null, 3, [], "text", { format: "other" }, { ...workspace, version: 2 }, { ...workspace, id: "" }, { ...workspace, createdAt: -1 }, { ...workspace, draft: [] }, { ...workspace, saved: { nope: 1 } }, { ...workspace, saved: { problem: "yesterday" } }]) {
      const parsed = parseWorkspace(value);
      assert.equal(parsed.ok, false, JSON.stringify(value)?.slice(0, 60));
      if (!parsed.ok) assert.ok(parsed.reason.endsWith("."));
    }
  });

  it("says a file that isn't a workspace isn't one, rather than blaming its version", () => {
    for (const value of [{ hello: "world" }, { format: "other", version: 1 }]) {
      const parsed = parseWorkspace(value);
      assert.ok(!parsed.ok && parsed.reason === "The file isn't a ResearchKit workspace.", JSON.stringify(value));
    }
    const newer = parseWorkspace({ ...workspace, version: 2 });
    assert.ok(!newer.ok && /version/.test(newer.reason));
  });

  it("refuses fields of the wrong kind rather than misreading them", () => {
    for (const draft of [{ references: "one" }, { researchQuestion: 4 }, { variables: [1] }, { questionnaire: "q" }, { researchObjectives: ["a", 2] }]) {
      const parsed = parseWorkspace({ ...workspace, draft });
      assert.equal(parsed.ok, false, JSON.stringify(draft));
    }
  });

  it("refuses values the project model rejects", () => {
    const parsed = parseWorkspace({ ...workspace, draft: { researchOnionSelection: { philosophy: "nonsense" } } });
    assert.equal(parsed.ok, false);
  });

  it("drops fields it doesn't know", () => {
    const parsed = parseWorkspace({ ...workspace, draft: { topic: "Sleep", secret: "x" } });
    assert.ok(parsed.ok);
    assert.deepEqual(parsed.workspace.draft, { topic: "Sleep" });
  });
});

describe("progress", () => {
  it("shows every stage as not started for an empty project", () => {
    const progress = projectProgress({});
    assert.ok(progress.stages.every((stage) => stage.status === "not-started"));
    assert.equal(progress.percent, 0);
    assert.equal(progress.applicable, MODULES.length);
    assert.equal(nextStage(progress)?.stage.id, "problem");
  });

  it("shows a complete project as 100% with nothing to resume", () => {
    const progress = projectProgress(completeProject());
    assert.deepEqual(progress.stages.filter((stage) => stage.status !== "completed").map((stage) => `${stage.stage.id}: ${stage.status} ${stage.missing.join(", ")} ${stage.reviewReasons.join(" ")}`), []);
    assert.equal(progress.percent, 100);
    assert.equal(nextStage(progress), null);
  });

  it("says what an in-progress stage still needs", () => {
    const stage = statusOf(createProjectDraft({ background: "Known." }), "problem");
    assert.equal(stage.status, "in-progress");
    assert.deepEqual(stage.missing, ["the research problem", "the research gap"]);
    assert.equal(statusOf(createProjectDraft({ projectTitle: "T" }), "problem").status, "not-started");
    assert.equal(statusOf(createProjectDraft({ projectTitle: "T" }), "title").status, "completed");
  });

  it("requires definitions and a level for every variable", () => {
    const draft = updateProjectDraft(completeProject(), { variables: addVariable([...completeProject().variables!], "caffeine", "independent") });
    const stage = statusOf(draft, "variables");
    assert.equal(stage.status, "in-progress");
    assert.equal(stage.missing.length, 3);
  });

  it("names the onion layers still to choose", () => {
    const stage = statusOf(createProjectDraft({ researchOnionSelection: { philosophy: "positivism" } }), "onion");
    assert.equal(stage.status, "in-progress");
    assert.match(stage.missing[0], /research approach, methodological choice/);
  });

  it("needs review when something a stage rests on changed after it was saved", () => {
    const draft = completeProject();
    const stage = statusOf(draft, "framework", { framework: NOW, variables: NOW + 1 });
    assert.equal(stage.status, "needs-review");
    assert.deepEqual(stage.reviewReasons, ["Variables changed after this was saved."]);
    assert.equal(statusOf(draft, "framework", { framework: NOW + 2, variables: NOW + 1 }).status, "completed");
  });

  it("needs review when the accepted analyses no longer match the project", () => {
    const draft = updateProjectDraft(completeProject(), { dataAnalysisPlan: { methods: ["one-way-anova"], notes: "" } });
    const stage = statusOf(draft, "analysis");
    assert.equal(stage.status, "needs-review");
    assert.match(stage.reviewReasons[0], /different set of analyses/);
  });

  it("needs review when a project check finds a problem in a completed stage", () => {
    const project = completeProject();
    const draft = updateProjectDraft(project, { variables: project.variables!.filter((variable) => variable.name !== "sleep quality") });
    const questionnaire = statusOf(draft, "questionnaire");
    assert.equal(questionnaire.status, "needs-review");
    assert.match(questionnaire.reviewReasons.join(" "), /no longer in your project/);
    assert.equal(statusOf(draft, "hypotheses").status, "needs-review");
  });

  it("treats a stage missing what it needs as in progress, not needing review", () => {
    const project = completeProject();
    const draft = updateProjectDraft(project, { samplingPlan: { ...project.samplingPlan!, population: { ...project.samplingPlan!.population, targetPopulation: "" } } });
    assert.equal(statusOf(draft, "sampling").status, "in-progress");
  });

  it("leaves statistical stages out of a qualitative project, and out of the percentage", () => {
    const draft = createProjectDraft({ methodology: "qualitative", researchQuestion: "How do students experience sleep?" });
    const progress = projectProgress(draft);
    for (const id of ["hypotheses", "sample-size", "assumptions"] as const) assert.equal(progress.stages.find((stage) => stage.stage.id === id)!.status, "not-needed");
    assert.equal(progress.applicable, MODULES.length - 3);
    assert.equal(progress.completed, 1);
    assert.equal(progress.percent, Math.round((1 / (MODULES.length - 3)) * 100));
  });

  it("counts every status", () => {
    const progress = projectProgress(createProjectDraft({ background: "Known.", researchQuestion: "Q?" }));
    assert.equal(Object.values(progress.counts).reduce((total, count) => total + count, 0), MODULES.length);
    assert.equal(progress.counts.completed, 1);
    assert.equal(progress.counts["in-progress"], 1);
  });

  it("resumes at the first stage that isn't complete", () => {
    const draft = updateProjectDraft(completeProject(), { hypotheses: null });
    assert.equal(nextStage(projectProgress(draft))?.stage.id, "hypotheses");
  });
});

describe("project checks", () => {
  it("finds nothing in an empty or complete project", () => {
    assert.deepEqual(validateProject({}), []);
    assert.deepEqual(validateProject(completeProject()).filter((issue) => issue.severity === "problem"), []);
  });

  it("finds objectives without a research question", () => {
    const issue = validateProject(createProjectDraft({ researchObjectives: ["One"] })).find((entry) => entry.id === "objectives-without-question")!;
    assert.equal(issue.severity, "problem");
    assert.equal(issue.fixIn, "question");
    assert.ok(issueIds(createProjectDraft({ researchObjectives: ["One"] })).includes("objectives-without-aim"));
  });

  it("finds variables without hypotheses, except in qualitative research", () => {
    const draft = updateProjectDraft(completeProject(), { hypotheses: null });
    assert.ok(issueIds(draft).includes("variables-without-hypotheses"));
    assert.ok(!issueIds(updateProjectDraft(draft, { methodology: "qualitative" })).includes("variables-without-hypotheses"));
  });

  it("finds hypotheses that name variables the project doesn't have", () => {
    const project = completeProject();
    const variables = project.variables!.filter((variable) => variable.name !== "screen time");
    const issue = validateProject(updateProjectDraft(project, { variables })).find((entry) => entry.id === "hypotheses-name-unknown-variables")!;
    assert.match(issue.message, /“screen time”, which isn't among your variables/);
    assert.equal(issue.fixIn, "variables");
  });

  it("finds a questionnaire without variables, and questions measuring removed variables", () => {
    const project = completeProject();
    assert.ok(issueIds(updateProjectDraft(project, { variables: null })).includes("questionnaire-without-variables"));
    const removed = project.variables!.filter((variable) => variable.name !== "sleep quality");
    assert.ok(issueIds(updateProjectDraft(project, { variables: removed })).includes("questionnaire-unknown-variables"));
  });

  it("finds sampling without a population", () => {
    const draft = createProjectDraft({ samplingPlan: { ...completeProject().samplingPlan!, population: { ...completeProject().samplingPlan!.population, targetPopulation: "" } } });
    assert.ok(issueIds(draft).includes("sampling-without-population"));
    assert.ok(!issueIds(updateProjectDraft(draft, { population: "students" })).includes("sampling-without-population"));
  });

  it("finds a framework without variables, and boxes that aren't variables", () => {
    const project = completeProject();
    assert.ok(issueIds(updateProjectDraft(project, { variables: null })).includes("framework-without-variables"));
    const renamed = { ...project.conceptualFramework!, variables: project.conceptualFramework!.variables.map((box, index) => (index === 0 ? { ...box, name: "phone use" } : box)) };
    const issue = validateProject(updateProjectDraft(project, { conceptualFramework: renamed })).find((entry) => entry.id === "framework-names-unknown-variables")!;
    assert.match(issue.message, /“phone use”/);
  });

  it("finds a design chosen before the onion, sample size before sampling, and results before a plan", () => {
    const project = completeProject();
    assert.ok(issueIds(updateProjectDraft(project, { researchOnionSelection: null })).includes("design-without-onion"));
    assert.ok(issueIds(updateProjectDraft(project, { samplingPlan: null })).includes("sample-size-without-technique"));
    assert.ok(issueIds(updateProjectDraft(project, { dataAnalysisPlan: null })).includes("interpretation-without-plan"));
  });

  it("finds a title that names neither the main variables nor the population", () => {
    const project = completeProject();
    assert.ok(!issueIds(project).some((id) => id.startsWith("title-")), "the complete project's title names both");
    const vague = updateProjectDraft(project, { projectTitle: "Evening habits of young people" });
    assert.ok(issueIds(vague).includes("title-without-variables"));
    assert.ok(issueIds(vague).includes("title-without-population"));
    const issue = validateProject(vague).find((entry) => entry.id === "title-without-population")!;
    assert.equal(issue.severity, "suggestion");
    assert.equal(issue.fixIn, "title");
  });

  it("finds hypotheses in qualitative research", () => {
    assert.ok(issueIds(updateProjectDraft(completeProject(), { researchOnionSelection: { ...FULL_ONION, choice: "qualitative" }, methodology: "qualitative" })).includes("hypotheses-in-qualitative"));
  });

  it("writes every message as a full sentence and names a stage to fix it in", () => {
    const drafts = [createProjectDraft({ researchObjectives: ["One"] }), updateProjectDraft(completeProject(), { variables: null, researchOnionSelection: null, samplingPlan: null })];
    for (const issue of drafts.flatMap(validateProject)) {
      assert.match(issue.message, /[.?]$/, issue.id);
      assert.ok(MODULE_IDS.includes(issue.fixIn), issue.id);
    }
  });

  it("gives each issue a unique id", () => {
    const ids = issueIds(updateProjectDraft(completeProject(), { variables: null, researchOnionSelection: null }));
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("navigation", () => {
  it("knows the stages before and after each one", () => {
    const position = stagePosition("hypotheses");
    assert.equal(position.previous?.id, "title");
    assert.equal(position.next?.id, "variables");
    assert.equal(position.number, 5);
    assert.equal(position.total, MODULES.length);
  });

  it("starts and ends the journey", () => {
    assert.equal(stagePosition("problem").previous, null);
    assert.equal(stagePosition("references").next, null);
  });

  it("follows the order question, objectives, title, hypotheses, variables, framework, onion, design, sampling, questionnaire, analysis", () => {
    const order = ["question", "objectives", "title", "hypotheses", "variables", "framework", "onion", "design", "sampling"] as const;
    for (let index = 1; index < order.length; index++) assert.equal(stagePosition(order[index]).previous?.id, order[index - 1]);
    assert.equal(stagePosition("questionnaire").next?.id, "analysis");
  });

  it("skips stages that don't apply to the project", () => {
    const qualitative = createProjectDraft({ methodology: "qualitative" });
    assert.equal(stagePosition("title", qualitative).next?.id, "variables");
    assert.equal(stagePosition("variables", qualitative).previous?.id, "title");
    assert.equal(stagePosition("sampling", qualitative).next?.id, "questionnaire");
    assert.equal(stagePosition("variables", qualitative).total, MODULES.length - 3);
  });

  it("still places a stage that doesn't apply, for a tool opened anyway", () => {
    const position = stagePosition("hypotheses", createProjectDraft({ methodology: "qualitative" }));
    assert.equal(position.previous?.id, "title");
    assert.equal(position.next?.id, "variables");
  });
});
