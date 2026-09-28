import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chiSquareTest } from "../../tables/stats";
import { calculateEffectSize, calculateEffectSizeFromText, EFFECT_SIZE_METHODS, getEffectSizeMethod, type EffectSizeInput } from "./effect-size-calculate";

const calculated = (input: EffectSizeInput) => {
  const result = calculateEffectSize(input);
  assert.equal(result.status, "complete", JSON.stringify(result));
  return result as Extract<typeof result, { status: "complete" }>;
};
const rejected = (input: EffectSizeInput) => {
  const result = calculateEffectSize(input);
  assert.equal(result.status, "invalid", JSON.stringify(result));
  return result as Extract<typeof result, { status: "invalid" }>;
};

describe("independent standardized mean differences", () => {
  it("shows pooled-SD work and keeps the sign of Cohen's d", () => {
    const result = calculated({ method: "cohens-d-independent", mean1: 12, sd1: 3, n1: 20, mean2: 10, sd2: 4, n2: 24 });
    const pooled = Math.sqrt(((19 * 9) + (23 * 16)) / 42);
    assert.equal(result.steps[0].value, pooled);
    assert.equal(result.value, 2 / pooled);
    assert.match(result.steps[2].substitution, / = 0\.*/);
    assert.match(result.note, /does not determine practical importance or statistical significance/);
  });

  it("applies a small-sample correction for Hedges' g", () => {
    const d = calculated({ method: "cohens-d-independent", mean1: 5, sd1: 2, n1: 8, mean2: 3, sd2: 2, n2: 8 });
    const g = calculated({ method: "hedges-g-independent", mean1: 5, sd1: 2, n1: 8, mean2: 3, sd2: 2, n2: 8 });
    assert.ok(Math.abs(g.value) < Math.abs(d.value));
    assert.equal(g.steps.at(-1)?.value, g.value);
    assert.match(g.formula, /J\(df\)/);
  });

  it("rejects insufficient samples and a zero pooled standard deviation", () => {
    assert.match(rejected({ method: "cohens-d-independent", mean1: 1, sd1: 1, n1: 1, mean2: 0, sd2: 1, n2: 2 }).problems[0], /at least two observations/);
    assert.match(rejected({ method: "cohens-d-independent", mean1: 1, sd1: 0, n1: 3, mean2: 1, sd2: 0, n2: 3 }).problems[0], /pooled standard deviation must be greater than 0/);
    assert.match(rejected({ method: "hedges-g-independent", mean1: 2, sd1: -1, n1: 4, mean2: 1, sd2: 1, n2: 4 }).problems[0], /cannot be negative/);
  });
});

describe("paired standardized mean differences", () => {
  it("labels the SD-of-differences denominator as d_z", () => {
    const result = calculated({ method: "cohens-d-paired-dz", meanDifference: 2, sdDifferences: 4, nPairs: 10 });
    assert.equal(result.value, 0.5);
    assert.match(result.note, /SD of within-pair differences/);
  });

  it("uses the average marginal variance for d_av, not the SD of differences", () => {
    const result = calculated({ method: "cohens-d-paired-dav", meanDifference: 2, sd1: 3, sd2: 4, nPairs: 10 });
    assert.equal(result.steps[0].value, Math.sqrt(12.5));
    assert.equal(result.value, 2 / Math.sqrt(12.5));
    assert.match(result.note, /differs from d_z/);
  });

  it("rejects zero variance and fewer than two complete pairs", () => {
    assert.match(rejected({ method: "cohens-d-paired-dz", meanDifference: 0, sdDifferences: 0, nPairs: 8 }).problems[0], /must be greater than 0/);
    assert.match(rejected({ method: "cohens-d-paired-dav", meanDifference: 1, sd1: 1, sd2: 1, nPairs: 1 }).problems[0], /at least two complete pairs/);
  });
});

describe("correlation and variance-explained measures", () => {
  it("squares positive and negative correlations without losing the original r", () => {
    const positive = calculated({ method: "correlation-r-squared", r: 0.5 });
    const negative = calculated({ method: "correlation-r-squared", r: -0.5 });
    assert.deepEqual(positive.outputs.map(({ value }) => value), [0.5, 0.25]);
    assert.deepEqual(negative.outputs.map(({ value }) => value), [-0.5, 0.25]);
    assert.match(rejected({ method: "correlation-r-squared", r: 1.01 }).problems[0], /between −1 and 1/);
  });

  it("calculates eta squared and partial eta squared from their different denominators", () => {
    assert.equal(calculated({ method: "eta-squared", ssEffect: 20, ssTotal: 100 }).value, 0.2);
    assert.equal(calculated({ method: "partial-eta-squared", ssEffect: 20, ssError: 80 }).value, 0.2);
    assert.match(rejected({ method: "eta-squared", ssEffect: 101, ssTotal: 100 }).problems[0], /cannot exceed total/);
    assert.match(rejected({ method: "partial-eta-squared", ssEffect: 0, ssError: 0 }).problems[0], /denominator must be greater than 0/);
  });

  it("calculates Phi only for 2×2 counts and Cramér's V for larger tables", () => {
    const twoByTwo = [[20, 10], [10, 20]] as const;
    const base = chiSquareTest(twoByTwo);
    assert.equal(calculated({ method: "phi", observed: twoByTwo }).value, Math.sqrt(base.chi2 / base.n));
    assert.equal(calculated({ method: "cramers-v", observed: twoByTwo }).value, Math.sqrt(base.chi2 / base.n));
    const larger = [[10, 20, 15], [15, 10, 30]] as const;
    const largerResult = chiSquareTest(larger);
    assert.equal(calculated({ method: "cramers-v", observed: larger }).value, Math.sqrt(largerResult.chi2 / (largerResult.n * 1)));
    assert.match(rejected({ method: "phi", observed: larger }).problems[0], /only for a 2 × 2/);
    assert.match(rejected({ method: "cramers-v", observed: [[1, 2], [3]] }).problems[0], /same number of categories/);
    assert.match(rejected({ method: "cramers-v", observed: [[1, -1], [3, 4]] }).problems[0], /whole numbers of 0 or more/);
  });

  it("calculates R² and adjusted R² with the finite residual-df boundary", () => {
    assert.equal(calculated({ method: "r-squared", rSquared: 0 }).value, 0);
    assert.equal(calculated({ method: "r-squared", rSquared: 1 }).value, 1);
    const adjusted = calculated({ method: "adjusted-r-squared", rSquared: 0.5, sampleSize: 20, predictors: 2 });
    assert.equal(adjusted.value, 1 - (0.5 * 19) / 17);
    assert.ok(Number.isFinite(adjusted.value));
    assert.match(rejected({ method: "adjusted-r-squared", rSquared: 0.5, sampleSize: 3, predictors: 2 }).problems[0], /residual degrees of freedom/);
    assert.match(rejected({ method: "adjusted-r-squared", rSquared: 1.1, sampleSize: 20, predictors: 2 }).problems[0], /between 0 and 1/);
  });
});

describe("determinism and finite precision", () => {
  it("returns the same full-precision calculation for repeated inputs", () => {
    const input: EffectSizeInput = { method: "hedges-g-independent", mean1: 4.1, sd1: 1.2, n1: 23, mean2: 3.4, sd2: 1.5, n2: 28 };
    assert.deepEqual(calculateEffectSize(input), calculateEffectSize(input));
    assert.ok(Number.isFinite(calculated(input).value));
  });
});

describe("effect-size form metadata and boundary parsing", () => {
  it("defines one accessible field schema for every calculator method", () => {
    assert.equal(new Set(EFFECT_SIZE_METHODS.map((method) => method.id)).size, EFFECT_SIZE_METHODS.length);
    for (const method of EFFECT_SIZE_METHODS) {
      assert.ok(method.description.length > 20, method.id);
      assert.ok(method.formula.length > 3, method.id);
      assert.ok(method.fields.length > 0, method.id);
      for (const field of method.fields) assert.ok(field.label && field.hint.endsWith("."), `${method.id}.${field.key}`);
    }
    assert.throws(() => getEffectSizeMethod("not-a-method" as never), { name: "RangeError" });
  });

  it("reports missing and malformed entries before attempting a calculation", () => {
    assert.deepEqual(calculateEffectSizeFromText("cohens-d-independent", {}).status, "invalid");
    const missing = calculateEffectSizeFromText("cohens-d-independent", { mean1: "4", sd1: "1", n1: "20", mean2: "3", sd2: "1" });
    assert.equal(missing.status, "invalid");
    assert.match(missing.problems.join(" "), /group 2 sample size/);
    const invalid = calculateEffectSizeFromText("correlation-r-squared", { r: "1.01" });
    assert.equal(invalid.status, "invalid");
    assert.match(invalid.problems[0], /cannot be more than 1/);
  });

  it("parses integer contingency tables and rejects ragged or noninteger counts", () => {
    const valid = calculateEffectSizeFromText("phi", { observed: "20, 10; 10, 20" });
    assert.equal(valid.status, "complete");
    assert.ok(Math.abs(valid.value - 1 / 3) < 1e-14);
    assert.match(calculateEffectSizeFromText("cramers-v", { observed: "1,2;3" }).status, /invalid/);
    const fractional = calculateEffectSizeFromText("cramers-v", { observed: "1.5,2;3,4" });
    assert.equal(fractional.status, "invalid");
    assert.match(fractional.problems[0], /whole numbers/);
  });

  it("accepts formatted negative decimal text without losing its sign", () => {
    const result = calculateEffectSizeFromText("correlation-r-squared", { r: "−0.40" });
    assert.equal(result.status, "complete");
    assert.equal(result.outputs[0].value, -0.4);
    assert.equal(result.outputs[1].value, 0.16000000000000003);
  });

  it("accepts valid thousands grouping but rejects malformed grouping", () => {
    const grouped = calculateEffectSizeFromText("adjusted-r-squared", { rSquared: "0.5", sampleSize: "1,200", predictors: "4" });
    assert.equal(grouped.status, "complete");
    const malformed = calculateEffectSizeFromText("cohens-d-independent", { mean1: "1,2", sd1: "1", n1: "20", mean2: "3", sd2: "1", n2: "20" });
    assert.equal(malformed.status, "invalid");
    assert.match(malformed.problems[0], /use commas only as thousands separators/);
  });
});