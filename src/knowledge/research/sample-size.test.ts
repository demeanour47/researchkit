import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SAMPLE_SIZE_PLAN,
  assertCalculable,
  calculateSampleSize,
  chooseMethod,
  cleanSampleSizePlan,
  formatNumber,
  parseNumber,
  setSampleSizeText,
  updateInputs,
  type SampleSizePlan,
} from "./sample-size";
import { SAMPLE_SIZE_METHOD_IDS, type SampleSizeMethodId } from "./sample-size-types";

const plan = (method: SampleSizeMethodId, inputs: Partial<SampleSizePlan["inputs"]> = {}) => chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, inputs), method);
const finite = (N: number, extra: Partial<SampleSizePlan["inputs"]> = {}) => ({ populationType: "finite" as const, populationSize: N, ...extra });

describe("calculateSampleSize", () => {
  it("calculates Cochran's formula for an unknown population, with every step inspectable", () => {
    const result = calculateSampleSize(DEFAULT_SAMPLE_SIZE_PLAN);
    assert.deepEqual([result.required, result.adjusted, result.invite, result.expectedResponses, result.samplingFraction], [385, 385, null, null, null]);
    const [method, design] = result.steps;
    assert.deepEqual([method.formula, method.substitution, method.rounded], ["n₀ = z² × p × (1 − p) ÷ e²", "n₀ = 1.959964² × 0.5 × (1 − 0.5) ÷ 0.05²", 385]);
    assert.deepEqual(method.intermediate, [
      { label: "z for 95% confidence", value: "1.959964" },
      { label: "z²", value: "3.841459" },
      { label: "p × (1 − p)", value: "0.25" },
      { label: "e²", value: "0.0025" },
    ]);
    assert.equal(method.explanation, "With 95% confidence, a ±5% margin of error and an estimated proportion of 50%, a very large population needs 385 participants (384.1459 rounded up).");
    assert.equal(design.explanation, "A design effect of 1 assumes simple random sampling, so the sample size is unchanged.");
  });

  it("works through the finite population correction, design effect and non-response", () => {
    const result = calculateSampleSize(plan("finite-population-correction", finite(1000, { responseRate: 70, designEffect: 1.5 })));
    assert.deepEqual(result.steps.map((step) => [step.id, step.rounded]), [
      ["method", 385],
      ["correction", 278],
      ["design-effect", 417],
      ["non-response", 596],
      ["expected-responses", 417],
      ["sampling-fraction", 41.7],
    ]);
    assert.equal(result.steps[1].substitution, "n = 384.1459 ÷ (1 + (384.1459 − 1) ÷ 1000)");
    assert.deepEqual([result.required, result.adjusted, result.invite, result.expectedResponses], [278, 417, 596, 417]);
    assert.equal(result.exceedsPopulation, false);
  });

  it("calculates Yamane and Slovin identically, stating their fixed assumptions", () => {
    const yamane = calculateSampleSize(plan("yamane", finite(1000)));
    const slovin = calculateSampleSize(plan("slovin", finite(1000)));
    assert.equal(yamane.required, 286);
    assert.equal(slovin.required, 286);
    assert.equal(yamane.steps[0].label, "Yamane's formula");
    assert.equal(slovin.steps[0].label, "Slovin's formula");
    assert.match(yamane.steps[0].explanation, /assumes 95% confidence and a 50% proportion, whatever values are entered/);
    assert.equal(calculateSampleSize(plan("yamane", finite(1000, { confidence: 99, proportion: 20 }))).required, 286, "the entered confidence and proportion aren't used");
  });

  it("reproduces the Krejcie and Morgan table, and says what rounding up would give", () => {
    const result = calculateSampleSize(plan("krejcie-morgan", finite(50)));
    assert.equal(result.required, 44);
    assert.equal(result.steps[0].explanation, "The formula gives 44.3437. Following the published table, it is rounded to the nearest whole number: 44. Rounded up, it would be 45.");
  });

  it("treats an unknown population with Cochran's formula", () => {
    assert.equal(calculateSampleSize(plan("unknown-population")).required, 385);
  });

  it("doesn't calculate power analysis, and says so", () => {
    const result = calculateSampleSize(plan("power-analysis"));
    assert.deepEqual([result.available, result.steps, result.required], [false, [], null]);
  });

  it("adjusts for non-response exactly, without floating-point errors", () => {
    const rates: [number, number][] = [
      [40, 963],
      [50, 770],
      [60, 642],
      [70, 550],
      [80, 482],
      [100, 385],
      [1, 38500],
    ];
    for (const [rate, invite] of rates) {
      const result = calculateSampleSize(plan("cochran", { responseRate: rate }));
      assert.equal(result.invite, invite, `${rate}%`);
      assert.ok(result.expectedResponses! >= result.adjusted!, `${rate}% gives at least the sample needed`);
    }
  });

  it("applies the design effect", () => {
    assert.equal(calculateSampleSize(plan("cochran", { designEffect: 2 })).adjusted, 770);
    assert.equal(calculateSampleSize(plan("cochran", { designEffect: 1.25 })).adjusted, 482);
    assert.equal(calculateSampleSize(plan("cochran", { designEffect: 0.8 })).adjusted, 308);
  });

  it("handles very small populations, never needing more than exist", () => {
    for (const N of [1, 2, 5, 10]) {
      const result = calculateSampleSize(plan("finite-population-correction", finite(N)));
      assert.ok(result.required! <= N, String(N));
    }
    assert.equal(calculateSampleSize(plan("finite-population-correction", finite(1))).required, 1);
  });

  it("handles very large populations, approaching Cochran's figure", () => {
    assert.equal(calculateSampleSize(plan("finite-population-correction", finite(1_000_000_000))).required, 385);
    assert.equal(calculateSampleSize(plan("yamane", finite(1_000_000))).required, 400);
  });

  it("notices a sample or invitation list larger than the population", () => {
    assert.equal(calculateSampleSize(plan("finite-population-correction", finite(100, { responseRate: 50 }))).exceedsPopulation, true);
    assert.equal(calculateSampleSize(plan("finite-population-correction", finite(100, { designEffect: 2 }))).exceedsPopulation, true);
    assert.equal(calculateSampleSize(plan("finite-population-correction", finite(10000, { responseRate: 50 }))).exceedsPopulation, false);
  });

  it("rejects inputs that can't be calculated", () => {
    const cases: [SampleSizePlan, string][] = [
      [plan("cochran", { margin: 0 }), "The margin of error must be more than 0% and less than 50%."],
      [plan("cochran", { margin: 50 }), "The margin of error must be more than 0% and less than 50%."],
      [plan("cochran", { proportion: 0 }), "The estimated proportion must be more than 0% and less than 100%."],
      [plan("cochran", { proportion: 100 }), "The estimated proportion must be more than 0% and less than 100%."],
      [plan("cochran", { responseRate: 0 }), "The response rate must be more than 0% and no more than 100%."],
      [plan("cochran", { responseRate: 101 }), "The response rate must be more than 0% and no more than 100%."],
      [plan("cochran", { designEffect: 0 }), "The design effect must be a positive number."],
      [plan("cochran", finite(0)), "The population size must be a whole number of at least 1."],
      [plan("cochran", finite(10.5)), "The population size must be a whole number of at least 1."],
      [plan("cochran", { populationType: "finite", populationSize: null }), "The population size must be a whole number of at least 1."],
      [plan("yamane"), "Yamane formula needs a known population size."],
      [plan("cochran", { confidence: 97 as never }), "Unsupported confidence level: 97"],
    ];
    for (const [candidate, message] of cases) {
      assert.throws(() => calculateSampleSize(candidate), { name: "RangeError", message });
      assert.throws(() => assertCalculable(candidate), RangeError);
    }
  });

  for (const method of SAMPLE_SIZE_METHOD_IDS) {
    it(`is deterministic for ${method}`, () => {
      const candidate = plan(method, finite(2500, { responseRate: 65, designEffect: 1.3 }));
      assert.deepEqual(calculateSampleSize(candidate), calculateSampleSize(candidate));
    });
  }
});

describe("editing and parsing", () => {
  it("changes the method, inputs and text without changing the original", () => {
    const edited = setSampleSizeText(chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: 3 }), "yamane"), "justification", "Because.");
    assert.deepEqual([edited.method, edited.inputs.margin, edited.justification], ["yamane", 3, "Because."]);
    assert.equal(DEFAULT_SAMPLE_SIZE_PLAN.inputs.margin, 5);
    assert.throws(() => chooseMethod(DEFAULT_SAMPLE_SIZE_PLAN, "bayesian" as never), RangeError);
  });

  it("parses numbers as typed, with separators and percent signs", () => {
    assert.equal(parseNumber("1,200"), 1200);
    assert.equal(parseNumber("1,234,567"), 1234567);
    assert.equal(parseNumber(" 62.5 % "), 62.5);
    assert.equal(parseNumber("  "), null);
    assert.throws(() => parseNumber("lots"), { message: "Enter a number." });
  });

  it("formats numbers without trailing zeros", () => {
    assert.equal(formatNumber(384.14588812959994), "384.1459");
    assert.equal(formatNumber(0.25), "0.25");
    assert.equal(formatNumber(10, 0), "10");
    assert.equal(formatNumber(100), "100");
    assert.equal(formatNumber(41.699999999999996, 1), "41.7");
  });

  it("cleans a plan for storage, rejecting unknown methods and settings", () => {
    assert.deepEqual(cleanSampleSizePlan(setSampleSizeText(DEFAULT_SAMPLE_SIZE_PLAN, "notes", "  Check   with statistician ")).notes, "Check with statistician");
    assert.throws(() => cleanSampleSizePlan({ ...DEFAULT_SAMPLE_SIZE_PLAN, method: "bayesian" as never }), RangeError);
    assert.throws(() => cleanSampleSizePlan(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { confidence: 97 as never })), RangeError);
    assert.throws(() => cleanSampleSizePlan(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { populationType: "partial" as never })), RangeError);
  });
});
