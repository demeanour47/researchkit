import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyDesign } from "./design-summary";
import { EMPTY_DESIGN, chooseDesign } from "./research-design";
import { createProjectDraft } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, chooseMethod, updateInputs } from "./sample-size";
import { assumptionsFor, suggestedInputs } from "./sample-size-assumptions";
import { EMPTY_SAMPLING_PLAN, chooseTechnique, setResponseRate, updatePopulation } from "./sampling";
import { applySampling } from "./sampling-summary";
import { addVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";

describe("assumptionsFor", () => {
  it("lists every assumption, marking the researcher's own choices", () => {
    const assumptions = assumptionsFor(DEFAULT_SAMPLE_SIZE_PLAN, {});
    assert.deepEqual(assumptions.map((assumption) => [assumption.label, assumption.value, assumption.source]), [
      ["Population size", "Unknown or very large", "Your entry"],
      ["Confidence level", "95% (z = 1.959964)", "Your choice"],
      ["Margin of error", "±5%", "Your choice"],
      ["Estimated proportion", "50%", "Your choice"],
      ["Expected response rate", "Not set", "Your entry"],
      ["Design effect", "1", "Your entry"],
      ["Random sampling", "Assumed", "The formulas' own assumption"],
    ]);
    for (const assumption of assumptions) assert.ok(assumption.explanation.length > 20);
  });

  it("traces assumptions to the question, objectives, variables, design and sampling plan", () => {
    let project = createProjectDraft({ researchQuestion: "How common is poor sleep among students?", researchObjectives: ["To estimate the prevalence of poor sleep"] });
    project = applyDesign(project, chooseDesign(EMPTY_DESIGN, "survey"));
    project = applyVariables(project, addVariable([], "poor sleep", "dependent"));
    project = applySampling(project, setResponseRate(chooseTechnique(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Students", samplingFrame: "Enrolment list" }), "cluster"), 60));
    const plan = updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { populationType: "finite", populationSize: 4000, responseRate: 60 });
    const sources = Object.fromEntries(assumptionsFor(plan, project).map((assumption) => [assumption.id, assumption.source]));
    assert.deepEqual(sources, {
      question: "Research question",
      population: "Sampling plan: sampling frame, “Enrolment list”",
      confidence: "Your choice",
      margin: "Your choice",
      proportion: "Objective: “To estimate the prevalence of poor sleep”",
      response: "Sampling plan: expected response rate",
      "design-effect": "Sampling plan: cluster sampling",
      random: "Sampling plan: cluster sampling",
      outcome: "Variables: dependent variables",
      design: "Research design",
    });
    const designEffect = assumptionsFor(plan, project).find((assumption) => assumption.id === "design-effect")!;
    assert.match(designEffect.explanation, /usually needs a design effect above 1/);
  });

  it("says when the formula fixes the confidence and proportion", () => {
    const plan = chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { populationType: "finite", populationSize: 500 }), "slovin");
    const values = Object.fromEntries(assumptionsFor(plan, {}).map((assumption) => [assumption.id, assumption.value]));
    assert.equal(values.confidence, "95% (fixed by the formula)");
    assert.equal(values.proportion, "50% (fixed by the formula)");
  });

  it("notes when the technique isn't random", () => {
    const project = applySampling({}, chooseTechnique(EMPTY_SAMPLING_PLAN, "convenience"));
    assert.equal(assumptionsFor(DEFAULT_SAMPLE_SIZE_PLAN, project).find((assumption) => assumption.id === "random")?.value, "Assumed, but your technique isn't random");
  });
});

describe("suggestedInputs", () => {
  it("takes the response rate from the sampling plan, and nothing it can't know", () => {
    assert.deepEqual(suggestedInputs({}), { responseRate: null });
    assert.deepEqual(suggestedInputs(applySampling({}, setResponseRate(EMPTY_SAMPLING_PLAN, 65))), { responseRate: 65 });
  });
});
