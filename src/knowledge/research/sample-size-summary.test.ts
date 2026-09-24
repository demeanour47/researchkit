import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectOfShape } from "./conceptual-test-helpers";
import { PROJECT_FIELDS, describeProject } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, chooseMethod, setSampleSizeText, updateInputs } from "./sample-size";
import { SAMPLE_SIZE_LIMITATIONS, SAMPLE_SIZE_REVIEW_ITEMS, applySampleSize, sampleSizeReport, sensitivity } from "./sample-size-summary";

const finite = chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { populationType: "finite", populationSize: 1000, responseRate: 70, designEffect: 1.5 }), "finite-population-correction");

describe("sensitivity", () => {
  it("shows every scenario together, marking the current one and recommending none", () => {
    const scenarios = sensitivity(finite);
    assert.deepEqual(
      scenarios.map((scenario) => [scenario.label, scenario.required, scenario.adjusted, scenario.invite, scenario.current]),
      [
        ["95% confidence, ±5% margin", 278, 417, 596, true],
        ["95% confidence, ±3% margin", 517, 776, 1109, false],
        ["99% confidence, ±5% margin", 400, 600, 858, false],
        ["99% confidence, ±3% margin", 649, 974, 1392, false],
        ["40% response rate", 278, 417, 1043, false],
        ["60% response rate", 278, 417, 695, false],
        ["70% response rate", 278, 417, 596, true],
        ["80% response rate", 278, 417, 522, false],
        ["100% response rate", 278, 417, 417, false],
        ["50% estimated proportion", 278, 417, 596, true],
        ["30% estimated proportion", 245, 368, 526, false],
        ["10% estimated proportion", 122, 183, 262, false],
      ],
    );
  });

  it("includes the current proportion and response rate when they aren't among the standard ones", () => {
    const labels = sensitivity(updateInputs(finite, { proportion: 20, responseRate: 55 })).map((scenario) => scenario.label);
    assert.ok(labels.includes("55% response rate"));
    assert.ok(labels.includes("20% estimated proportion"));
  });

  it("shows nothing for invalid inputs or power analysis", () => {
    assert.deepEqual(sensitivity(updateInputs(finite, { margin: 0 })), []);
    assert.deepEqual(sensitivity(chooseMethod(DEFAULT_SAMPLE_SIZE_PLAN, "power-analysis")), []);
  });
});

describe("sampleSizeReport", () => {
  const report = sampleSizeReport(setSampleSizeText(finite, "justification", "A census wasn't practical."), {});

  it("contains the summary, assumptions, steps, method, justification and limitations, in order", () => {
    const headings = ["Summary", "Assumptions", "Calculation steps", "Method", "Justification", "Limitations"];
    const positions = headings.map((heading) => report.split("\n").indexOf(heading));
    assert.ok(positions.every((position) => position > 0), String(positions));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  });

  it("states the result with the assumptions that produced it, as sentences for a thesis", () => {
    assert.ok(report.includes("Using the Cochran formula with finite population correction, for a population of 1000, with a 95% confidence level, a ±5% margin of error and an estimated proportion of 50%, the required sample size is 278."));
    assert.ok(report.includes("Allowing for a design effect of 1.5, the adjusted sample size is 417."));
    assert.ok(report.includes("With an expected response rate of 70%, 596 people will be invited, which should give about 417 responses."));
    assert.ok(report.includes("different assumptions give different figures"));
  });

  it("shows each calculation step in full", () => {
    assert.ok(report.includes("   Substitution: n = 384.1459 ÷ (1 + (384.1459 − 1) ÷ 1000)"));
    assert.ok(report.includes("   Result: 277.7335, used as 278"));
  });

  it("explains why a plan can't be calculated, and what power analysis is", () => {
    assert.match(sampleSizeReport(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: 0 }), {}), /can't be calculated yet: The margin of error must be/);
    assert.match(sampleSizeReport(chooseMethod(DEFAULT_SAMPLE_SIZE_PLAN, "power-analysis"), {}), /Power analysis is not calculated by this tool/);
  });

  it("states Yamane's fixed assumptions in its summary", () => {
    const yamane = sampleSizeReport(chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { populationType: "finite", populationSize: 1000 }), "yamane"), {});
    assert.ok(yamane.includes("with the formula's fixed assumptions of 95% confidence and a 50% proportion, the required sample size is 286."));
  });
});

describe("applySampleSize", () => {
  const project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0, controls: 1 });

  it("updates only the sample size section of the project draft", () => {
    const updated = applySampleSize(project, finite);
    for (const field of PROJECT_FIELDS) if (field !== "sampleSizePlan") assert.deepEqual(updated[field], project[field], field);
    assert.equal(updated.sampleSizePlan?.method, "finite-population-correction");
    assert.equal(project.sampleSizePlan, undefined);
  });

  it("stores inputs, not results, so later tools recalculate rather than copy", () => {
    assert.deepEqual(Object.keys(applySampleSize({}, finite).sampleSizePlan!), ["method", "inputs", "justification", "notes"]);
  });

  it("describes the section", () => {
    assert.deepEqual(describeProject(applySampleSize({}, finite)), [
      { field: "sampleSizePlan", label: "Sample size", value: "Cochran formula with finite population correction: 95% confidence, ±5% margin, population 1000." },
    ]);
  });
});

describe("limitations and review items", () => {
  it("says no number is universally correct, and what the formulas can't do", () => {
    assert.match(SAMPLE_SIZE_LIMITATIONS[0], /No sample size is universally correct/);
    assert.ok(SAMPLE_SIZE_LIMITATIONS.some((item) => item.includes("power analysis")));
  });

  it("leaves placeholders for statistical review, formula verification, references and examples", () => {
    assert.deepEqual(SAMPLE_SIZE_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Statistical review", "Formula verification", "References", "Examples"]);
  });
});
