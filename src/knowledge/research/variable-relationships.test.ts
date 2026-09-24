import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFramework, frameworkFromProject } from "./conceptual-framework";
import { projectOfShape } from "./conceptual-test-helpers";
import { updateProjectDraft } from "./research-project";
import { duplicateVariable } from "./variable-builder";
import { connectionsFor, describeSource, originOf, originSummary } from "./variable-relationships";
import { importVariables } from "./variables";

const project = (() => {
  const base = updateProjectDraft(projectOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 0 }), {
    researchQuestion: "How does predictor 1 affect outcome 1?",
    researchObjectives: ["To examine whether predictor 1 predicts outcome 1", "To describe outcome 1"],
  });
  return applyFramework(base, frameworkFromProject(base));
})();
const variables = importVariables(project);

describe("connectionsFor", () => {
  it("links a variable to the question, objectives, hypotheses and framework", () => {
    const connections = connectionsFor(variables[1], project);
    assert.equal(connections.question, true);
    assert.deepEqual(connections.objectives, ["To examine whether predictor 1 predicts outcome 1", "To describe outcome 1"]);
    assert.ok(connections.hypotheses.length > 0 && connections.hypotheses.every((entry) => entry.asKind === "dependent"));
    assert.equal(connections.framework?.name, "outcome 1");
    assert.equal(connections.frameworkRelationships.length, 2, "the main relationship and the mediation into it");
  });

  it("finds nothing for a variable the project doesn't mention", () => {
    const connections = connectionsFor({ ...variables[0], name: "noise" }, project);
    assert.deepEqual(connections, { question: false, objectives: [], hypotheses: [], framework: null, frameworkRelationships: [] });
  });

  it("finds nothing in an empty project", () => {
    assert.deepEqual(connectionsFor(variables[0], {}), { question: false, objectives: [], hypotheses: [], framework: null, frameworkRelationships: [] });
  });
});

describe("origins", () => {
  it("explains every place a variable came from", () => {
    assert.deepEqual(originOf(variables[2]), [
      "Listed as a mediator variable in your project details.",
      "Named as a mediator variable in 2 hypotheses.",
      "A box in your conceptual framework, as a mediator variable.",
    ]);
  });

  it("uses singular wording for one hypothesis and the right article", () => {
    assert.equal(describeSource({ kind: "hypothesis", asKind: "independent", references: ["h1"] }), "Named as an independent variable in 1 hypothesis.");
    assert.equal(describeSource({ kind: "list", asKind: "extraneous", references: [] }), "Listed as an extraneous variable in your project details.");
  });

  it("explains variables added or copied by the researcher", () => {
    const copied = duplicateVariable(variables, "var-predictor-1");
    assert.deepEqual(originOf(copied[1], copied), ["Added by you, as a copy of “predictor 1”."]);
    assert.equal(describeSource({ kind: "user", asKind: "control", references: [] }), "Added by you in the Variables Builder.");
  });
});

describe("originSummary", () => {
  it("names each kind of source once, in order", () => {
    assert.equal(originSummary(variables[0]), "Project details · Hypotheses · Framework");
    const copied = duplicateVariable(variables, "var-predictor-1");
    assert.equal(originSummary(copied[1]), "Added by you");
    assert.equal(originSummary({ ...variables[0], sources: [] }), "");
  });
});
