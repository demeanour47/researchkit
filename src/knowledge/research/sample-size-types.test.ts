import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_INPUTS, INPUT_INFO, SAMPLE_SIZE_METHODS, SAMPLE_SIZE_METHOD_IDS, getSampleSizeMethod } from "./sample-size-types";

describe("SAMPLE_SIZE_METHODS", () => {
  it("supports the seven methods, all but power analysis calculable", () => {
    assert.deepEqual(SAMPLE_SIZE_METHODS.map((method) => method.id), [...SAMPLE_SIZE_METHOD_IDS]);
    assert.deepEqual(SAMPLE_SIZE_METHODS.filter((method) => !method.available).map((method) => method.id), ["power-analysis"]);
  });

  for (const method of SAMPLE_SIZE_METHODS) {
    it(`describes the ${method.id} method completely, with no invented references`, () => {
      assert.ok(method.definition.length > 40);
      assert.ok(method.formula.length > 5);
      assert.ok(method.symbols.length >= 1);
      assert.ok(method.whenUsed.endsWith("."));
      for (const list of [method.assumptions, method.strengths, method.limitations]) assert.ok(list.length >= 1);
      assert.deepEqual(method.references, []);
    });
  }

  it("says which methods need a known population", () => {
    assert.deepEqual(SAMPLE_SIZE_METHODS.filter((method) => method.needsPopulation).map((method) => method.id), ["finite-population-correction", "yamane", "slovin", "krejcie-morgan"]);
  });

  it("states that Slovin's formula is Yamane's, and Krejcie and Morgan's is Cochran's with correction", () => {
    assert.equal(getSampleSizeMethod("slovin").formula, getSampleSizeMethod("yamane").formula);
    assert.match(getSampleSizeMethod("krejcie-morgan").definition, /algebraically the same as Cochran's formula with finite population correction/);
  });

  it("rejects unknown methods", () => {
    assert.throws(() => getSampleSizeMethod("bayesian" as never), { message: "Unknown sample size method: bayesian" });
  });
});

describe("INPUT_INFO", () => {
  it("explains every input: meaning, when it matters, typical values and limitations", () => {
    assert.deepEqual(Object.keys(INPUT_INFO), ["populationSize", "confidence", "margin", "proportion", "responseRate", "designEffect", "finite", "unknown"]);
    for (const [id, info] of Object.entries(INPUT_INFO)) {
      for (const text of [info.label, info.meaning, info.whenMatters, info.typicalValues, info.limitations]) assert.ok(text.length > 3, id);
    }
  });

  it("starts from common, cautious defaults", () => {
    assert.deepEqual(DEFAULT_INPUTS, { populationType: "unknown", populationSize: null, confidence: 95, margin: 5, proportion: 50, responseRate: null, designEffect: 1 });
  });
});
