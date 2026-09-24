import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectOfShape } from "./conceptual-test-helpers";
import { PROJECT_FIELDS, describeProject } from "./research-project";
import { EMPTY_SAMPLING_PLAN, chooseTechnique, setPlanText, setResponseRate, updatePopulation } from "./sampling";
import { SAMPLING_ASPECTS, SAMPLING_LIMITATIONS, SAMPLING_REVIEW_ITEMS, applySampling, compareTechniques, samplingComparisonTable, samplingPlanText } from "./sampling-summary";
import { SAMPLING_TECHNIQUE_IDS, getTechnique } from "./sampling-types";

describe("compareTechniques", () => {
  it("compares the required aspects", () => {
    assert.deepEqual(SAMPLING_ASPECTS.map((aspect) => aspect.label), [
      "Definition",
      "Category",
      "Typical use",
      "Strengths",
      "Limitations",
      "Representativeness",
      "Bias risk",
      "Resources required",
      "Time required",
      "Typical research designs",
    ]);
  });

  it("compares probability and non-probability techniques side by side", () => {
    const comparison = compareTechniques(["stratified", "quota", "stratified"]);
    assert.deepEqual(comparison.techniques.map((technique) => technique.name), ["Stratified", "Quota"]);
    assert.deepEqual(comparison.rows[1].values, ["Probability sampling", "Non-probability sampling"]);
    assert.deepEqual(comparison.rows[9].values[1], "Survey, Cross-sectional, Descriptive");
  });

  it("compares every technique at once, with no empty cells", () => {
    for (const row of compareTechniques(SAMPLING_TECHNIQUE_IDS).rows) for (const value of row.values) assert.ok(value.length > 3, row.label);
  });
});

describe("samplingComparisonTable", () => {
  it("writes tab-separated text with one row per aspect", () => {
    const lines = samplingComparisonTable(["snowball", "purposive"]).split("\n");
    assert.equal(lines.length, 1 + SAMPLING_ASPECTS.length);
    assert.equal(lines[0], "Aspect\tSnowball\tPurposive");
    assert.equal(lines[1], `Definition\t${getTechnique("snowball").definition}\t${getTechnique("purposive").definition}`);
    for (const line of lines) assert.equal(line.split("\t").length, 3);
  });
});

describe("samplingPlanText", () => {
  it("includes only what the researcher entered, in order", () => {
    let plan = updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Nurses", inclusionCriteria: ["Registered", "Works nights"] });
    plan = setResponseRate(setPlanText(chooseTechnique(plan, "stratified"), "reason", "Because."), 65);
    assert.equal(
      samplingPlanText(plan),
      ["Sampling plan", "", "Target population: Nurses", "Inclusion criteria: Registered; Works nights", "Sampling technique: Stratified sampling (probability sampling)", "Reason: Because.", "Expected response rate: 65%"].join("\n"),
    );
  });

  it("writes only a heading for an empty plan", () => {
    assert.equal(samplingPlanText(EMPTY_SAMPLING_PLAN), "Sampling plan\n");
  });
});

describe("applySampling", () => {
  const project = projectOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 0, controls: 1 });
  const plan = setPlanText(chooseTechnique(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Nurses" }), "purposive"), "reason", "Fits.");

  it("updates only the sampling plan section of the project draft", () => {
    const updated = applySampling(project, plan);
    for (const field of PROJECT_FIELDS) if (field !== "samplingPlan") assert.deepEqual(updated[field], project[field], field);
    assert.equal(updated.samplingPlan?.chosen, "purposive");
    assert.equal(project.samplingPlan, undefined);
  });

  it("describes the section, and clears it for an empty plan", () => {
    assert.deepEqual(describeProject(applySampling({}, plan)), [{ field: "samplingPlan", label: "Sampling plan", value: "Technique: Purposive sampling. Target population: Nurses." }]);
    assert.equal(applySampling(project, EMPTY_SAMPLING_PLAN).samplingPlan, undefined);
  });
});

describe("limitations and review items", () => {
  it("states that the tool never chooses and doesn't calculate sample size", () => {
    assert.match(SAMPLING_LIMITATIONS[0], /never chooses a sampling technique for you/);
    assert.ok(SAMPLING_LIMITATIONS.some((item) => item.includes("doesn't calculate sample size")));
  });

  it("leaves placeholders for academic review, sampling methodology review, examples and references", () => {
    assert.deepEqual(SAMPLING_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Academic review", "Sampling methodology review", "Examples", "References"]);
  });
});
