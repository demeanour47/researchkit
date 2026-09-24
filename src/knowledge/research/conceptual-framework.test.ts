import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FORM_RELATIONSHIP,
  FRAMEWORK_LIMITATIONS,
  FRAMEWORK_REVIEW_ITEMS,
  addRelationship,
  addVariable,
  applyFramework,
  autoLayout,
  changeVariableType,
  defaultShortLabel,
  deleteRelationship,
  deleteVariable,
  frameworkFromProject,
  moveVariable,
  nudgeVariable,
  renameVariable,
  resetLayout,
  setDescription,
  setRelationshipLabel,
  setRelationshipType,
  setShortLabel,
  traceRelationship,
} from "./conceptual-framework";
import { layoutFramework } from "./conceptual-layout";
import { frameworkOfShape, projectOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK, type ConceptualFramework } from "./conceptual-types";
import { generateHypotheses } from "./hypothesis-builder";
import { applyHypotheses, toProjectHypotheses } from "./hypothesis-summary";
import { PROJECT_FIELDS, createProjectDraft } from "./research-project";

const pair = (): ConceptualFramework =>
  addVariable(addVariable(EMPTY_FRAMEWORK, { name: "Screen time", type: "independent" }), { name: "Sleep quality", type: "dependent" });

describe("frameworkFromProject", () => {
  it("builds nothing from an empty project", () => {
    assert.deepEqual(frameworkFromProject({}), EMPTY_FRAMEWORK);
  });

  it("creates a box for every listed variable, with its type, and no invented relationships", () => {
    const framework = frameworkFromProject(
      createProjectDraft({ independentVariables: ["screen time"], dependentVariables: ["sleep quality"], mediatorVariables: ["bedtime"], moderatorVariables: ["age"], controlVariables: ["income"] }),
    );
    assert.deepEqual(
      framework.variables.map((variable) => [variable.id, variable.type]),
      [
        ["v-screen-time", "independent"],
        ["v-sleep-quality", "dependent"],
        ["v-bedtime", "mediator"],
        ["v-age", "moderator"],
        ["v-income", "control"],
      ],
    );
    assert.deepEqual(framework.relationships, [], "without hypotheses, no relationship is drawn");
  });

  it("keeps a variable listed twice once, with its first type", () => {
    const framework = frameworkFromProject(createProjectDraft({ independentVariables: ["stress"], dependentVariables: ["Stress"] }));
    assert.deepEqual(framework.variables.map((variable) => [variable.name, variable.type]), [["stress", "independent"]]);
  });

  for (const form of ["difference", "relationship", "prediction"] as const) {
    it(`draws a ${form} hypothesis as a ${FORM_RELATIONSHIP[form]} relationship`, () => {
      const project = createProjectDraft({ independentVariables: ["screen time"], dependentVariables: ["sleep quality"] });
      const withHypotheses = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form, direction: "non-directional" }), {}));
      const [relationship] = frameworkFromProject(withHypotheses).relationships;
      assert.equal(relationship.type, FORM_RELATIONSHIP[form]);
      assert.equal(relationship.label, "H1");
      assert.deepEqual(relationship.hypothesisIds, ["main-1-1-null", "main-1-1-alternative"]);
    });
  }

  it("labels directional hypotheses with their sign", () => {
    const project = createProjectDraft({ independentVariables: ["a", "b"], dependentVariables: ["c"] });
    const positive = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "relationship", direction: "positive" }), {}));
    const negative = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "relationship", direction: "negative" }), {}));
    assert.deepEqual(frameworkFromProject(positive).relationships.map((relationship) => relationship.label), ["H1 (+)", "H2 (+)"]);
    assert.deepEqual(frameworkFromProject(negative).relationships.map((relationship) => relationship.label), ["H1 (−)", "H2 (−)"]);
  });

  it("draws moderations at the connector they moderate, and mediations as two paths", () => {
    const framework = frameworkOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 1 });
    assert.deepEqual(
      framework.relationships.map((relationship) => [relationship.source, relationship.target, relationship.type, relationship.label, relationship.moderates]),
      [
        ["v-predictor-1", "v-outcome-1", "influence", "H1", null],
        ["v-moderator-1", "v-outcome-1", "moderation", "H2", "r-predictor-1-outcome-1"],
        ["v-predictor-1", "v-mediator-1", "mediation", "H3", null],
        ["v-mediator-1", "v-outcome-1", "mediation", "H3", null],
      ],
    );
  });

  it("keeps one moderation per moderated connector, even for the same moderator and outcome", () => {
    const framework = frameworkOfShape({ independent: 2, dependent: 1, mediators: 0, moderators: 1 });
    const moderations = framework.relationships.filter((relationship) => relationship.type === "moderation");
    assert.deepEqual(moderations.map((relationship) => relationship.moderates), ["r-predictor-1-outcome-1", "r-predictor-2-outcome-1"]);
  });

  it("merges a path shared by several hypotheses, keeping every hypothesis and label", () => {
    const framework = frameworkOfShape({ independent: 2, dependent: 1, mediators: 1, moderators: 0 });
    const shared = framework.relationships.find((relationship) => relationship.source === "v-mediator-1")!;
    assert.equal(shared.label, "H2, H4");
    assert.equal(shared.hypothesisIds.length, 4);
    assert.equal(framework.relationships.filter((relationship) => relationship.source === "v-mediator-1").length, 1);
  });

  it("adds control variables named only in hypotheses", () => {
    const project = createProjectDraft({ independentVariables: ["a"], dependentVariables: ["b"], controlVariables: ["age"] });
    const withHypotheses = applyHypotheses(createProjectDraft({ ...project, controlVariables: undefined }), toProjectHypotheses(generateHypotheses(project, { form: "prediction", direction: "non-directional" }), {}));
    assert.ok(frameworkFromProject(withHypotheses).variables.some((variable) => variable.name === "age" && variable.type === "control"));
  });

  it("is deterministic", () => {
    const project = projectOfShape({ independent: 3, dependent: 2, mediators: 2, moderators: 1, controls: 2 });
    assert.deepEqual(frameworkFromProject(project), frameworkFromProject(project));
  });
});

describe("editing variables", () => {
  it("adds variables with unique ids and a default box label", () => {
    const framework = addVariable(addVariable(EMPTY_FRAMEWORK, { name: " Screen  time ", type: "independent" }), { name: "screen time", type: "dependent" });
    assert.deepEqual(framework.variables.map((variable) => [variable.id, variable.name, variable.shortLabel]), [
      ["v-screen-time", "Screen time", "Screen time"],
      ["v-screen-time-2", "screen time", "screen time"],
    ]);
  });

  it("shortens very long names for the box label", () => {
    const name = "Perceived organisational support for continuing professional development among nurses";
    assert.equal(defaultShortLabel(name).length, 40);
    assert.ok(defaultShortLabel(name).endsWith("…"));
    assert.equal(addVariable(EMPTY_FRAMEWORK, { name, type: "independent" }).variables[0].shortLabel, defaultShortLabel(name));
  });

  it("rejects an empty name or an unknown type", () => {
    assert.throws(() => addVariable(EMPTY_FRAMEWORK, { name: "  ", type: "independent" }), { message: "A variable needs a name." });
    assert.throws(() => addVariable(EMPTY_FRAMEWORK, { name: "x", type: "confounder" as never }), { message: "Unknown variable type: confounder" });
  });

  it("renames a variable, keeping its id, and updates a default box label", () => {
    const renamed = renameVariable(pair(), "v-screen-time", "Daily screen time");
    assert.deepEqual(renamed.variables[0], { id: "v-screen-time", name: "Daily screen time", shortLabel: "Daily screen time", description: "", type: "independent" });
  });

  it("keeps a custom box label when renaming", () => {
    const custom = setShortLabel(pair(), "v-screen-time", "Screens");
    assert.equal(renameVariable(custom, "v-screen-time", "Daily screen time").variables[0].shortLabel, "Screens");
    assert.equal(setShortLabel(custom, "v-screen-time", " ").variables[0].shortLabel, "Screen time", "an empty label returns to the default");
  });

  it("sets descriptions and changes types", () => {
    const edited = changeVariableType(setDescription(pair(), "v-sleep-quality", "Pittsburgh Sleep Quality Index"), "v-sleep-quality", "mediator");
    assert.deepEqual([edited.variables[1].description, edited.variables[1].type], ["Pittsburgh Sleep Quality Index", "mediator"]);
    assert.throws(() => changeVariableType(pair(), "v-sleep-quality", "cause" as never), RangeError);
  });

  it("deletes a variable with its relationships, moderations of them and its position", () => {
    let framework = frameworkOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 1 });
    framework = moveVariable(framework, "v-predictor-1", { x: 10, y: 10 });
    const after = deleteVariable(framework, "v-predictor-1");
    assert.deepEqual(after.variables.map((variable) => variable.id), ["v-outcome-1", "v-moderator-1"]);
    assert.deepEqual(after.relationships.map((relationship) => [relationship.type, relationship.moderates]), [["moderation", null]]);
    assert.deepEqual(after.positions, {});
  });

  it("rejects unknown variables", () => {
    for (const edit of [
      () => renameVariable(pair(), "v-x", "x"),
      () => deleteVariable(pair(), "v-x"),
      () => setDescription(pair(), "v-x", "x"),
      () => moveVariable(pair(), "v-x", { x: 0, y: 0 }),
    ]) {
      assert.throws(edit, { name: "RangeError", message: "Unknown variable: v-x" });
    }
  });

  it("never changes the framework it is given", () => {
    const original = pair();
    const copy = structuredClone(original);
    renameVariable(original, "v-screen-time", "Other");
    deleteVariable(original, "v-screen-time");
    addRelationship(original, { source: "v-screen-time", target: "v-sleep-quality", type: "direct" });
    assert.deepEqual(original, copy);
  });
});

describe("editing relationships", () => {
  it("adds a relationship between two existing variables", () => {
    const framework = addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "direct", label: " H1 " });
    assert.deepEqual(framework.relationships[0], {
      id: "r-screen-time-sleep-quality",
      source: "v-screen-time",
      target: "v-sleep-quality",
      type: "direct",
      label: "H1",
      moderates: null,
      hypothesisIds: [],
    });
  });

  it("gives repeated relationships unique ids", () => {
    let framework = addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "direct" });
    framework = addRelationship(framework, { source: "v-screen-time", target: "v-sleep-quality", type: "correlation" });
    assert.deepEqual(framework.relationships.map((relationship) => relationship.id), ["r-screen-time-sleep-quality", "r-screen-time-sleep-quality-2"]);
  });

  it("rejects a relationship from a variable to itself, to a missing variable, or of an unknown type", () => {
    assert.throws(() => addRelationship(pair(), { source: "v-screen-time", target: "v-screen-time", type: "direct" }), {
      message: "A relationship needs two different variables.",
    });
    assert.throws(() => addRelationship(pair(), { source: "v-screen-time", target: "v-x", type: "direct" }), { message: "Unknown variable: v-x" });
    assert.throws(() => addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "causes" as never }), RangeError);
    assert.throws(() => addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "moderation", moderates: "r-x" }), {
      message: "Unknown relationship: r-x",
    });
  });

  it("keeps a moderated relationship only for moderations", () => {
    let framework = addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "direct" });
    framework = addVariable(framework, { name: "age", type: "moderator" });
    framework = addRelationship(framework, { source: "v-age", target: "v-sleep-quality", type: "correlation", moderates: "r-screen-time-sleep-quality" });
    assert.equal(framework.relationships[1].moderates, null);
  });

  it("changes a label and a type, and clears the label when emptied", () => {
    let framework = addRelationship(pair(), { source: "v-screen-time", target: "v-sleep-quality", type: "direct", label: "H1" });
    framework = setRelationshipType(setRelationshipLabel(framework, "r-screen-time-sleep-quality", "H1 (+)"), "r-screen-time-sleep-quality", "influence");
    assert.deepEqual([framework.relationships[0].label, framework.relationships[0].type], ["H1 (+)", "influence"]);
    assert.equal(setRelationshipLabel(framework, "r-screen-time-sleep-quality", "  ").relationships[0].label, null);
    assert.throws(() => setRelationshipType(framework, "r-screen-time-sleep-quality", "x" as never), RangeError);
    assert.throws(() => setRelationshipLabel(framework, "r-x", "x"), { message: "Unknown relationship: r-x" });
  });

  it("deletes a relationship and clears moderations of it", () => {
    const framework = frameworkOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 1 });
    const after = deleteRelationship(framework, "r-predictor-1-outcome-1");
    assert.deepEqual(after.relationships.map((relationship) => [relationship.id, relationship.moderates]), [["r-moderator-1-outcome-1", null]]);
    assert.throws(() => deleteRelationship(framework, "r-x"), RangeError);
  });
});

describe("dragging and layout", () => {
  it("moves a box to a snapped, non-negative position", () => {
    const moved = moveVariable(pair(), "v-screen-time", { x: 10.6, y: -40 });
    assert.deepEqual(moved.positions, { "v-screen-time": { x: 11, y: 0 } });
    assert.throws(() => moveVariable(pair(), "v-screen-time", { x: Number.NaN, y: 0 }), { message: "A position needs finite coordinates." });
  });

  it("nudges a box by small or large steps from where it is drawn", () => {
    assert.deepEqual(nudgeVariable(pair(), "v-screen-time", { x: 100, y: 100 }, 1, 0).positions["v-screen-time"], { x: 108, y: 100 });
    assert.deepEqual(nudgeVariable(pair(), "v-screen-time", { x: 100, y: 100 }, 0, -1, true).positions["v-screen-time"], { x: 100, y: 60 });
  });

  it("reset layout clears every moved box but keeps the order", () => {
    const moved = moveVariable(moveVariable(pair(), "v-screen-time", { x: 1, y: 1 }), "v-sleep-quality", { x: 2, y: 2 });
    assert.deepEqual(resetLayout(moved), { ...pair(), positions: {} });
  });

  it("auto layout reorders boxes so connected variables line up, reducing crossings", () => {
    let framework: ConceptualFramework = EMPTY_FRAMEWORK;
    for (const name of ["a", "b"]) framework = addVariable(framework, { name, type: "independent" });
    for (const name of ["c", "d"]) framework = addVariable(framework, { name, type: "dependent" });
    framework = addRelationship(framework, { source: "v-a", target: "v-d", type: "direct" });
    framework = addRelationship(framework, { source: "v-b", target: "v-c", type: "direct" });
    const crossingsBefore = countEdgeCrossings(framework);
    const arranged = autoLayout(moveVariable(framework, "v-a", { x: 500, y: 500 }));
    assert.equal(crossingsBefore, 1);
    assert.equal(countEdgeCrossings(arranged), 0);
    assert.deepEqual(arranged.variables.map((variable) => variable.id), ["v-a", "v-b", "v-d", "v-c"]);
    assert.deepEqual(arranged.positions, {});
  });

  it("auto layout keeps the order when nothing would improve, and is deterministic", () => {
    const framework = frameworkOfShape({ independent: 2, dependent: 2, mediators: 1, moderators: 1, controls: 1 });
    assert.deepEqual(autoLayout(framework), autoLayout(framework));
    assert.deepEqual(autoLayout(autoLayout(framework)), autoLayout(framework));
    assert.deepEqual(autoLayout(framework).variables.map((variable) => variable.type), framework.variables.map((variable) => variable.type));
  });
});

function countEdgeCrossings(framework: ConceptualFramework): number {
  const edges = layoutFramework(framework).edges;
  const crosses = (a: (typeof edges)[number], b: (typeof edges)[number]) => {
    const d = (p: { x: number; y: number }, q: typeof p, r: typeof p) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    return d(a.from, a.to, b.from) * d(a.from, a.to, b.to) < 0 && d(b.from, b.to, a.from) * d(b.from, b.to, a.to) < 0;
  };
  let count = 0;
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) if (crosses(edges[i], edges[j])) count++;
  return count;
}

describe("traceRelationship", () => {
  const project = applyHypotheses(
    createProjectDraft({
      researchObjectives: ["To examine how screen time affects sleep quality", "To describe sleep habits"],
      independentVariables: ["screen time"],
      dependentVariables: ["sleep quality"],
      moderatorVariables: ["age"],
    }),
    toProjectHypotheses(
      generateHypotheses(createProjectDraft({ independentVariables: ["screen time"], dependentVariables: ["sleep quality"], moderatorVariables: ["age"] }), {
        form: "prediction",
        direction: "negative",
      }),
      {},
    ),
  );
  const framework = frameworkFromProject(project);

  it("shows which hypotheses created a relationship and which objectives support it", () => {
    const trace = traceRelationship(framework, "r-screen-time-sleep-quality", project);
    assert.deepEqual(trace.hypotheses.map((hypothesis) => hypothesis.id), ["main-1-1-null", "main-1-1-alternative"]);
    assert.deepEqual(trace.objectives, ["To examine how screen time affects sleep quality"]);
    assert.deepEqual([trace.source.name, trace.target.name, trace.moderated], ["screen time", "sleep quality", null]);
  });

  it("shows the relationship a moderation moderates", () => {
    const trace = traceRelationship(framework, "r-age-sleep-quality", project);
    assert.equal(trace.moderated?.id, "r-screen-time-sleep-quality");
    assert.deepEqual(trace.objectives, []);
  });

  it("finds no hypotheses for a relationship the researcher added", () => {
    const added = addRelationship(framework, { source: "v-age", target: "v-screen-time", type: "correlation" });
    assert.deepEqual(traceRelationship(added, "r-age-screen-time", project).hypotheses, []);
    assert.throws(() => traceRelationship(framework, "r-x", project), RangeError);
  });
});

describe("applyFramework", () => {
  it("updates only the conceptual framework section of the project draft", () => {
    const project = projectOfShape({ independent: 2, dependent: 1, mediators: 1, moderators: 1, controls: 1 });
    const updated = applyFramework(project, frameworkFromProject(project));
    for (const field of PROJECT_FIELDS) if (field !== "conceptualFramework") assert.deepEqual(updated[field], project[field], field);
    assert.equal(updated.conceptualFramework?.variables.length, 6);
    assert.equal(project.conceptualFramework, undefined);
  });

  it("clears the section for an empty framework", () => {
    assert.equal(applyFramework(createProjectDraft({ topic: "x" }), EMPTY_FRAMEWORK).conceptualFramework, undefined);
  });

  it("drops relationships to missing variables and positions of missing boxes", () => {
    const broken: ConceptualFramework = {
      ...pair(),
      relationships: [{ id: "r-1", source: "v-screen-time", target: "v-gone", type: "direct", label: null, moderates: null, hypothesisIds: [] }],
      positions: { "v-gone": { x: 1, y: 1 }, "v-screen-time": { x: 2, y: 3 } },
    };
    const stored = applyFramework({}, broken).conceptualFramework!;
    assert.deepEqual(stored.relationships, []);
    assert.deepEqual(stored.positions, { "v-screen-time": { x: 2, y: 3 } });
  });

  it("rejects repeated ids and unknown types", () => {
    const framework = pair();
    assert.throws(() => applyFramework({}, { ...framework, variables: [framework.variables[0], framework.variables[0]] }), { message: "Missing or repeated variable id: v-screen-time" });
    assert.throws(() => applyFramework({}, { ...framework, variables: [{ ...framework.variables[0], type: "x" as never }] }), RangeError);
  });
});

describe("limitations and review items", () => {
  it("states the limits of export and layout, and makes no claim of journal compliance", () => {
    const text = FRAMEWORK_LIMITATIONS.join(" ");
    for (const topic of ["Helvetica", "clipboard", "journal", "Nothing is saved"]) assert.ok(text.includes(topic), topic);
  });

  it("leaves placeholders for academic review, layout review and export verification", () => {
    assert.deepEqual(FRAMEWORK_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Academic review", "Layout review", "Export verification"]);
  });
});
