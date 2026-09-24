import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addRelationship, addVariable, frameworkFromProject, moveVariable } from "./conceptual-framework";
import { layoutFramework } from "./conceptual-layout";
import { frameworkOfShape, projectOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK, type ConceptualFramework } from "./conceptual-types";
import { WARNING_CODES, findDuplicates, findLoops, validateFramework } from "./conceptual-validation";
import { createProjectDraft, updateProjectDraft } from "./research-project";

const codes = (framework: ConceptualFramework, project = {}) => validateFramework(framework, project, layoutFramework(framework)).map((warning) => warning.code);

function chain(...names: string[]): ConceptualFramework {
  let framework: ConceptualFramework = EMPTY_FRAMEWORK;
  names.forEach((name, index) => (framework = addVariable(framework, { name, type: index === 0 ? "independent" : index === names.length - 1 ? "dependent" : "mediator" })));
  return framework;
}

describe("validateFramework", () => {
  it("gives no warnings for an empty framework", () => {
    assert.deepEqual(codes(EMPTY_FRAMEWORK), []);
  });

  it("gives no warnings for a framework built from matching hypotheses and objectives", () => {
    const project = updateProjectDraft(projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 }), {
      researchObjectives: ["To examine whether predictor 1 predicts outcome 1"],
    });
    assert.deepEqual(codes(frameworkFromProject(project), project), []);
  });

  it("warns when there is no dependent or no independent variable", () => {
    assert.ok(codes(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "independent" })).includes("no-dependent"));
    assert.ok(codes(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "dependent" })).includes("no-independent"));
  });

  it("warns about disconnected variables, but not control or extraneous ones", () => {
    let framework = chain("a", "b");
    framework = addVariable(addVariable(framework, { name: "c", type: "control" }), { name: "d", type: "extraneous" });
    const warnings = validateFramework(framework, {}).filter((warning) => warning.code === "disconnected");
    assert.deepEqual(warnings.map((warning) => warning.targets[0]), ["v-a", "v-b"]);
    assert.equal(warnings[0].message, "“a” isn't connected to any other variable.");
  });

  it("finds loops among one-way relationships, once each", () => {
    let framework = chain("a", "b", "c");
    framework = addRelationship(framework, { source: "v-a", target: "v-b", type: "direct" });
    framework = addRelationship(framework, { source: "v-b", target: "v-c", type: "direct" });
    framework = addRelationship(framework, { source: "v-c", target: "v-a", type: "influence" });
    assert.deepEqual(findLoops(framework), [["v-a", "v-b", "v-c"]]);
    const loop = validateFramework(framework, {}).find((warning) => warning.code === "loop")!;
    assert.equal(loop.message, "The relationships form a loop: “a” → “b” → “c” → “a”.");
  });

  it("doesn't treat two-way or undirected relationships as loops", () => {
    let framework = chain("a", "b");
    framework = addRelationship(framework, { source: "v-a", target: "v-b", type: "correlation" });
    framework = addRelationship(framework, { source: "v-b", target: "v-a", type: "association" });
    assert.deepEqual(findLoops(framework), []);
  });

  it("finds duplicate relationships, including undirected ones in either order", () => {
    let framework = chain("a", "b");
    framework = addRelationship(framework, { source: "v-a", target: "v-b", type: "direct" });
    framework = addRelationship(framework, { source: "v-a", target: "v-b", type: "influence" });
    assert.equal(findDuplicates(framework).length, 1);
    let undirected = chain("a", "b");
    undirected = addRelationship(undirected, { source: "v-a", target: "v-b", type: "correlation" });
    undirected = addRelationship(undirected, { source: "v-b", target: "v-a", type: "association" });
    assert.equal(findDuplicates(undirected).length, 1);
    let opposite = chain("a", "b");
    opposite = addRelationship(opposite, { source: "v-a", target: "v-b", type: "direct" });
    opposite = addRelationship(opposite, { source: "v-b", target: "v-a", type: "direct" });
    assert.deepEqual(findDuplicates(opposite), [], "opposite directions are a loop, not a duplicate");
  });

  it("warns about variables used in no hypothesis", () => {
    const project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 });
    const framework = addVariable(frameworkFromProject(project), { name: "weather", type: "extraneous" });
    const unused = validateFramework(framework, project).filter((warning) => warning.code === "unused");
    assert.deepEqual(unused.map((warning) => warning.targets[0]), ["v-weather"]);
  });

  it("warns about relationships without a hypothesis or an objective", () => {
    const project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 });
    const framework = addRelationship(frameworkFromProject(project), { source: "v-outcome-1", target: "v-predictor-1", type: "correlation" });
    const warnings = validateFramework(framework, project);
    assert.deepEqual(warnings.filter((warning) => warning.code === "hypothesis-alignment").map((warning) => warning.targets[0]), ["r-outcome-1-predictor-1"]);
    assert.equal(warnings.filter((warning) => warning.code === "objective-alignment").length, 2);
  });

  it("warns when a connector passes behind a box, and when connectors overlap", () => {
    const framework = frameworkOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 0 });
    const layout = layoutFramework(framework);
    const main = layout.edges[0];
    const blocked = moveVariable(framework, "v-mediator-1", { x: (main.from.x + main.to.x) / 2 - 92, y: main.from.y - 20 });
    assert.ok(codes(blocked).includes("crossing"));
    let stacked = chain("a", "b", "c");
    stacked = moveVariable(moveVariable(moveVariable(stacked, "v-a", { x: 0, y: 0 }), "v-b", { x: 400, y: 0 }), "v-c", { x: 800, y: 0 });
    stacked = addRelationship(stacked, { source: "v-a", target: "v-c", type: "association" });
    stacked = addRelationship(stacked, { source: "v-a", target: "v-b", type: "association" });
    const warnings = codes(stacked);
    assert.ok(warnings.includes("crossing") || warnings.includes("overlap"));
  });

  it("explains every warning and never blocks editing", () => {
    let framework = chain("a", "b", "c");
    framework = addRelationship(framework, { source: "v-a", target: "v-b", type: "direct" });
    framework = addRelationship(framework, { source: "v-b", target: "v-a", type: "direct" });
    for (const warning of validateFramework(framework, createProjectDraft({ researchObjectives: ["x"] }), layoutFramework(framework))) {
      assert.ok(WARNING_CODES.includes(warning.code));
      assert.ok(warning.message.length > 10 && warning.why.length > 30, warning.code);
    }
    assert.doesNotThrow(() => addRelationship(framework, { source: "v-a", target: "v-b", type: "direct" }), "a duplicate can still be added");
  });
});
