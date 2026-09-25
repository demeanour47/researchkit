import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alphaMagnitude, correlationMagnitude, cramersVMagnitude, dMagnitude, etaMagnitude, fitIndices, kmoMagnitude, plsR2Magnitude, r2Magnitude, type Magnitude } from "./effect-size";

function table(name: string, judge: (value: number) => Magnitude, cases: [number, string][]) {
  describe(name, () => {
    for (const [value, label] of cases) {
      it(`labels ${value} as ${label}`, () => {
        assert.equal(judge(value).label, label);
      });
    }
    it("names the convention it follows", () => {
      assert.ok(judge(cases[0][0]).convention.length > 10);
    });
  });
}

table("correlationMagnitude", correlationMagnitude, [
  [0, "negligible"],
  [0.09, "negligible"],
  [0.1, "small"],
  [-0.29, "small"],
  [0.3, "medium"],
  [-0.49, "medium"],
  [0.5, "large"],
  [-1, "large"],
]);

table("dMagnitude", dMagnitude, [
  [0.19, "negligible"],
  [0.2, "small"],
  [-0.5, "medium"],
  [0.79, "medium"],
  [0.8, "large"],
  [-1.4, "large"],
]);

table("etaMagnitude", etaMagnitude, [
  [0.009, "negligible"],
  [0.01, "small"],
  [0.059, "small"],
  [0.06, "medium"],
  [0.14, "large"],
]);

table("r2Magnitude", r2Magnitude, [
  [0.0196, "negligible"],
  [0.02, "small"],
  [0.13, "small"],
  [0.14, "medium"],
  [0.25, "medium"],
  [0.26, "large"],
  [1, "large"],
]);

table("alphaMagnitude", alphaMagnitude, [
  [-0.2, "unacceptable"],
  [0.49, "unacceptable"],
  [0.5, "poor"],
  [0.6, "questionable"],
  [0.7, "acceptable"],
  [0.8, "good"],
  [0.9, "excellent"],
  [0.97, "excellent"],
]);

table("kmoMagnitude", kmoMagnitude, [
  [0.49, "unacceptable"],
  [0.5, "miserable"],
  [0.6, "mediocre"],
  [0.7, "middling"],
  [0.8, "meritorious"],
  [0.9, "marvellous"],
]);

table("plsR2Magnitude", plsR2Magnitude, [
  [0.24, "very weak"],
  [0.25, "weak"],
  [0.5, "moderate"],
  [0.75, "substantial"],
]);

describe("cramersVMagnitude", () => {
  it("uses Cohen's thresholds for a 2 × 2 table", () => {
    assert.deepEqual([0.09, 0.1, 0.3, 0.5].map((value) => cramersVMagnitude(value).label), ["negligible", "small", "medium", "large"]);
  });

  it("lowers the thresholds for larger tables", () => {
    assert.deepEqual([0.07, 0.08, 0.21, 0.22, 0.36].map((value) => cramersVMagnitude(value, 2).label), ["negligible", "small", "small", "medium", "large"]);
    assert.deepEqual([0.05, 0.15, 0.25].map((value) => cramersVMagnitude(value, 4).label), ["small", "medium", "large"]);
    assert.match(cramersVMagnitude(0.2, 3).convention, /is 3$/);
  });
});

describe("fitIndices", () => {
  it("judges each index by its commonly cited cut-off", () => {
    assert.deepEqual(
      fitIndices({ cfi: 0.95, rmsea: 0.06, srmr: 0.08, tli: 0.95 }).map((index) => `${index.index}:${index.verdict}`),
      ["CFI:good", "RMSEA:good", "SRMR:good", "TLI:good"],
    );
    assert.deepEqual(
      fitIndices({ cfi: 0.9, rmsea: 0.08, srmr: 0.1, tli: 0.9 }).map((index) => index.verdict),
      ["acceptable", "acceptable", "acceptable", "acceptable"],
    );
    assert.deepEqual(
      fitIndices({ cfi: 0.89, rmsea: 0.081, srmr: 0.11, tli: 0.8 }).map((index) => index.verdict),
      ["poor", "poor", "poor", "poor"],
    );
  });

  it("leaves out indices that weren't entered", () => {
    assert.deepEqual(fitIndices({ cfi: 0.96, rmsea: 0.04 }).map((index) => index.index), ["CFI", "RMSEA"]);
  });
});
