import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STAGE_IDS, analysisProfile, recommendAnalyses, variablesFromLines } from "../../knowledge/research";
import { announcements, planAnnouncement } from "./announcements";
import { exampleInputs, exampleLevels } from "./example";
import { EMPTY_PROJECT_INPUTS, MARGINS, VARIABLE_FIELDS, projectFromInputs, variablesFromInputs } from "./project-input";

const example = () => projectFromInputs(exampleInputs, exampleLevels);

describe("announcements", () => {
  it("describes the plan's verdicts in words, and never as a score", () => {
    assert.equal(planAnnouncement({ stages: [] }), "No recommendations yet. Add your variables to see them.");
    const plan = recommendAnalyses(example());
    assert.match(planAnnouncement(plan), /^Plan updated: \d+ strong recommendations?, \d+ possible recommendations?, \d+ methods? needing justification\.$/);
    assert.equal(announcements.copied, "Analysis plan copied.");
  });
});

describe("variablesFromLines", () => {
  it("reads variables of every kind, with indicators and levels", () => {
    const variables = variablesFromLines([["a: one; two", "independent"], ["b", "moderator"], ["A\nc", "mediator"]], { "var-b": "binary" });
    assert.deepEqual(variables.map((variable) => [variable.name, variable.variableType, variable.measurementLevel, variable.possibleIndicators.length]), [
      ["a", "independent", null, 2],
      ["b", "moderator", "binary", 0],
      ["c", "mediator", null, 0],
    ]);
  });
});

describe("projectFromInputs", () => {
  it("builds the example with every part the recommender reads", () => {
    const project = example();
    assert.deepEqual(project.researchOnionSelection, { philosophy: "positivism", approach: "deductive", choice: "quantitative", timeHorizon: "cross-sectional" });
    assert.equal(project.researchDesign?.chosen, "correlational");
    assert.equal(project.samplingPlan?.chosen, "stratified");
    assert.equal(project.sampleSizePlan?.inputs.margin, 5);
    assert.deepEqual(project.variables?.map((variable) => variable.variableType), ["independent", "dependent", "mediator", "control"]);
    assert.ok((project.hypotheses ?? []).some((hypothesis) => hypothesis.relationship.kind === "mediation"));
  });

  it("gives the example a full plan: scales to check, a mediation hypothesis and a whole model", () => {
    const plan = recommendAnalyses(example());
    assert.deepEqual(plan.stages.map((stage) => stage.id), [...STAGE_IDS]);
    assert.deepEqual(analysisProfile(example()).variables.map((variable) => variable.measure), ["scale-score", "scale-score", "scale-score", "ordinal"]);
    assert.ok(plan.stages[1].questions[0].recommendations.some((recommendation) => recommendation.method === "cronbach-alpha" && recommendation.strength === "strong"));
    assert.ok(plan.stages[2].questions.some((question) => question.recommendations.some((recommendation) => recommendation.method === "mediation")));
    assert.ok(plan.stages[3].questions[0].recommendations.some((recommendation) => recommendation.method === "sem"));
  });

  it("leaves out what isn't entered", () => {
    assert.deepEqual(projectFromInputs(EMPTY_PROJECT_INPUTS, {}), {});
    assert.equal(projectFromInputs({ ...exampleInputs, hypotheses: "" }, exampleLevels).hypotheses, undefined);
    assert.equal(projectFromInputs({ ...exampleInputs, dependent: "" }, exampleLevels).hypotheses, undefined, "no hypotheses without a dependent variable");
  });

  it("drafts hypotheses of the chosen form", () => {
    for (const form of ["relationship", "difference", "prediction"] as const) {
      const main = projectFromInputs({ ...exampleInputs, hypotheses: form }, exampleLevels).hypotheses!.filter((hypothesis) => hypothesis.relationship.kind === "main");
      assert.ok(main.length > 0 && main.every((hypothesis) => hypothesis.relationship.form === form), form);
    }
  });

  it("offers sample size plans that calculate", () => {
    for (const margin of MARGINS) assert.ok(analysisProfile(projectFromInputs({ ...EMPTY_PROJECT_INPUTS, margin }, {})).sampleSize, margin);
    assert.deepEqual(VARIABLE_FIELDS, ["independent", "dependent", "moderator", "mediator", "control"]);
    assert.equal(variablesFromInputs(EMPTY_PROJECT_INPUTS).length, 0);
  });
});
