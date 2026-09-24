import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFramework, frameworkFromProject } from "./conceptual-framework";
import { projectOfShape } from "./conceptual-test-helpers";
import { COMPATIBILITY_CHECK_IDS, QUESTION_DESIGNS, checkCompatibility, supportingElements } from "./design-compatibility";
import { DESIGN_IDS, RESEARCH_DESIGNS, type DesignId } from "./design-types";
import { QUESTION_TYPE_IDS } from "./question-types";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { addIndicator, addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";

const quantitative = (() => {
  let project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 });
  project = applyFramework(project, frameworkFromProject(project));
  return updateProjectDraft(project, {
    researchQuestion: "What is the relationship between predictor 1 and outcome 1 among adults?",
    researchObjectives: ["To examine the relationship between predictor 1 and outcome 1"],
    researchOnionSelection: { philosophy: "positivism", approach: "deductive", choice: "quantitative", strategy: "survey", timeHorizon: "cross-sectional" },
  });
})();
const qualitative = createProjectDraft({
  researchQuestion: "How do nurses experience night shifts?",
  researchObjectives: ["To explore nurses' lived experience of night shifts"],
  researchOnionSelection: { philosophy: "interpretivism", approach: "inductive", choice: "qualitative", strategy: "phenomenology", timeHorizon: "cross-sectional" },
});
const statuses = (id: DesignId, project: ResearchProjectDraft) =>
  Object.fromEntries(checkCompatibility(id, project).map((check) => [check.check, check.status]));

describe("checkCompatibility", () => {
  for (const design of RESEARCH_DESIGNS) {
    it(`explains the ${design.id} design against every part of the project, never missing or scored`, () => {
      for (const project of [{}, quantitative, qualitative]) {
        const checks = checkCompatibility(design.id, project);
        assert.deepEqual(checks.map((check) => check.check), [...COMPATIBILITY_CHECK_IDS]);
        for (const check of checks) {
          assert.ok(["aligned", "worth-checking", "clarify", "review"].includes(check.status), check.status);
          assert.ok(check.explanation.length > 20);
          if (check.status === "clarify") assert.ok(check.justify, `${design.id} ${check.check} says what to justify`);
        }
        assert.ok(!/\b\d+\s*(%|\/\s*\d|out of)/.test(JSON.stringify(checks)));
      }
    });

    it(`leaves the ${design.id} design for review against an empty project`, () => {
      const checks = checkCompatibility(design.id, {});
      for (const check of checks) {
        if (check.check === "hypotheses") continue;
        assert.equal(check.status, "review", check.check);
        assert.deepEqual(check.supports, []);
      }
    });
  }

  it("finds a correlational design aligned with a quantitative, relational project, naming what supports it", () => {
    assert.deepEqual(Object.values(statuses("correlational", quantitative)), ["aligned", "aligned", "aligned", "aligned", "aligned", "aligned", "aligned", "aligned", "aligned", "worth-checking"]);
    assert.ok(supportingElements("correlational", quantitative).includes("Research philosophy: Positivism"));
    assert.ok(supportingElements("correlational", quantitative).includes("Objective: “To examine the relationship between predictor 1 and outcome 1”"));
  });

  it("finds phenomenology aligned with a qualitative project about experience", () => {
    const checks = statuses("phenomenology", qualitative);
    for (const id of ["question", "philosophy", "approach", "choice", "strategy", "timeHorizon", "objectives", "hypotheses"]) assert.equal(checks[id], "aligned", id);
  });

  it("asks for clarification of a qualitative design in a quantitative project, saying what to justify", () => {
    const [, philosophy] = checkCompatibility("phenomenology", quantitative);
    assert.equal(philosophy.status, "clarify");
    assert.equal(philosophy.explanation, "Phenomenology designs aren't usually combined with Positivism. Positivism usually begins from objective measurement.");
    assert.equal(philosophy.justify, "Explain why a phenomenology design suits Positivism, or reconsider one of the two.");
    assert.equal(statuses("phenomenology", quantitative).hypotheses, "clarify");
  });

  it("uses each onion choice's in-sentence wording", () => {
    const approach = checkCompatibility("phenomenology", quantitative)[2];
    assert.match(approach.explanation, /aren't usually combined with a deductive approach\./);
  });

  it("marks possible combinations as worth checking, with something to justify", () => {
    const check = checkCompatibility("survey", updateProjectDraft(quantitative, { researchOnionSelection: { philosophy: "realism" } }))[1];
    assert.equal(check.status, "worth-checking");
    assert.equal(check.justify, "Explain why a survey design suits Realism.");
  });

  it("uses the stated methodology before the onion's methodological choice", () => {
    const project = updateProjectDraft(quantitative, { methodology: "qualitative" });
    assert.equal(statuses("phenomenology", project).choice, "aligned");
  });

  it("needs an independent and a dependent variable for experimental designs", () => {
    assert.equal(statuses("experimental", quantitative).variables, "aligned");
    assert.equal(statuses("experimental", createProjectDraft({ dependentVariables: ["outcome"] })).variables, "clarify");
  });

  it("uses measurement levels from the Variables Builder when there are any", () => {
    let variables = addVariable(addVariable([], "stress", "independent"), "coping", "dependent");
    variables = updateVariable(variables, "var-stress", { measurementLevel: "ratio" });
    variables = updateVariable(variables, "var-coping", { measurementLevel: "open-ended" });
    const project = applyVariables({}, addIndicator(variables, "var-stress", { name: "cortisol" }));
    assert.equal(statuses("sequential-mixed", project).variables, "aligned");
    assert.equal(statuses("correlational", project).variables, "worth-checking", "an open-ended main variable needs coding");
    assert.equal(statuses("phenomenology", project).variables, "worth-checking", "a numerically measured variable in a qualitative design");
  });

  it("asks mixed methods designs for both kinds of data", () => {
    const numeric = applyVariables({}, updateVariable(addVariable([], "income", "independent"), "var-income", { measurementLevel: "ratio" }));
    assert.equal(statuses("concurrent-mixed", numeric).variables, "worth-checking");
    assert.equal(statuses("concurrent-mixed", createProjectDraft({ independentVariables: ["income"] })).variables, "review");
  });

  it("notes influence relationships in the framework when a design can't establish cause", () => {
    assert.equal(statuses("survey", quantitative).framework, "worth-checking");
    assert.equal(statuses("true-experimental", quantitative).framework, "aligned");
    assert.equal(statuses("grounded-theory", quantitative).framework, "review");
  });

  it("notices a design used without the hypotheses it usually tests", () => {
    assert.equal(statuses("true-experimental", createProjectDraft({ independentVariables: ["x"] })).hypotheses, "review");
    assert.equal(statuses("ethnography", {}).hypotheses, "aligned");
  });

  it("rejects an unknown design", () => {
    assert.throws(() => checkCompatibility("delphi" as never, {}), RangeError);
  });

  it("checks every design for a large project quickly", () => {
    const large = updateProjectDraft(projectOfShape({ independent: 6, dependent: 4, mediators: 2, moderators: 2, controls: 3 }), {
      researchObjectives: Array.from({ length: 30 }, (_, index) => `To examine predictor ${index} and outcome ${index}`),
    });
    const times = [0, 1, 2].map(() => {
      const start = performance.now();
      for (const id of DESIGN_IDS) checkCompatibility(id, large);
      return performance.now() - start;
    });
    assert.ok(Math.min(...times) < 250, `${Math.min(...times).toFixed(0)} ms`);
  });
});

describe("QUESTION_DESIGNS", () => {
  it("links every question type to existing designs", () => {
    assert.deepEqual(Object.keys(QUESTION_DESIGNS), [...QUESTION_TYPE_IDS]);
    for (const designs of Object.values(QUESTION_DESIGNS)) for (const id of designs) assert.ok(DESIGN_IDS.includes(id));
  });

  it("links every design to at least one question type", () => {
    const linked = new Set(Object.values(QUESTION_DESIGNS).flat());
    for (const id of DESIGN_IDS) assert.ok(linked.has(id), id);
  });
});
