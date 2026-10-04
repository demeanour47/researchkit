import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CiMethod } from "./confidence-interval";
import { calculateConfidenceInterval, type CiCalculation, type CiFieldId, type CiRequest } from "./confidence-interval-request";

const run = (method: CiMethod, values: CiRequest["values"]) => calculateConfidenceInterval({ method, values: { confidence: "0.95", ...values } });
const errorsFor = (calculation: CiCalculation): Partial<Record<CiFieldId, string>> => (calculation.ok ? {} : Object.fromEntries(calculation.errors.map((error) => [error.field, error.message])));
const ok = (calculation: CiCalculation) => {
  assert.ok(calculation.ok, JSON.stringify(calculation));
  return calculation;
};

describe("valid requests", () => {
  it("calculates a one-mean t interval and keeps the decimals entered", () => {
    const calculation = ok(run("one-mean", { mean: "72.4", sd: "9.75", n: "20" }));
    assert.equal(calculation.interval.kind, "symmetric");
    assert.equal(calculation.decimals, 2);
    assert.ok(Math.abs(calculation.interval.lower - 67.8368) < 1e-4 && Math.abs(calculation.interval.upper - 76.9632) < 1e-4);
    assert.equal(calculation.includesZero, false);
    assert.equal(ok(run("one-mean", { mean: "9.261460", sd: "0.022789", n: "195" })).decimals, 6);
  });

  it("uses 90%, 95% and 99% confidence", () => {
    const widths = ["0.90", "0.95", "0.99"].map((confidence) => {
      const calculation = ok(calculateConfidenceInterval({ method: "one-mean", values: { confidence, mean: "10", sd: "2", n: "30" } }));
      assert.equal(calculation.interval.confidence, Number(confidence));
      assert.ok(Math.abs(calculation.interval.alpha - (1 - Number(confidence))) < 1e-12);
      return calculation.interval.upper - calculation.interval.lower;
    });
    assert.ok(widths[0] < widths[1] && widths[1] < widths[2]);
  });

  it("calculates a paired interval from the differences and flags an interval that includes 0", () => {
    assert.equal(ok(run("paired-mean", { meanDifference: "2.4", sdDifference: "1.51", pairs: "10" })).includesZero, false);
    assert.equal(ok(run("paired-mean", { meanDifference: "0.4", sdDifference: "3", pairs: "10" })).includesZero, true);
  });

  it("calculates Welch's interval for μ₁ − μ₂, allowing one SD of 0", () => {
    const calculation = ok(run("two-means", { mean1: "5.9", sd1: "0.86", n1: "7", mean2: "4.02", sd2: "0.94", n2: "11" }));
    assert.ok(calculation.interval.estimate > 0 && calculation.interval.critical.distribution === "t");
    ok(run("two-means", { mean1: "5", sd1: "0", n1: "5", mean2: "4", sd2: "1", n2: "8" }));
  });

  it("calculates Wilson and Newcombe intervals, including 0 and n successes", () => {
    assert.equal(ok(run("one-proportion", { successes: "0", n: "20" })).interval.lower, 0);
    assert.equal(ok(run("one-proportion", { successes: "20", n: "20" })).interval.upper, 1);
    assert.equal(ok(run("one-proportion", { successes: "1", n: "1" })).interval.upper, 1);
    const difference = ok(run("two-proportions", { successes1: "5", n1: "56", successes2: "0", n2: "29" }));
    assert.equal(difference.interval.kind, "newcombe");
    assert.equal(difference.includesZero, true);
  });

  it("calculates Fisher intervals for negative, zero and positive r, and accepts a typographic minus", () => {
    for (const r of ["-0.45", "0", "0.45", "−0.45", "0.999999"]) ok(run("correlation", { r, n: "30" }));
    assert.equal(ok(run("correlation", { r: "0", n: "30" })).includesZero, true);
    assert.equal(ok(run("correlation", { r: "−0.45", n: "30" })).interval.estimate, -0.45);
  });
});

describe("validation", () => {
  it("rejects a confidence level of 0, 1, a percentage, or nonsense", () => {
    for (const confidence of ["0", "1", "1.5", "-0.95", "", "abc", "NaN", "Infinity", "95%", "1e-2"]) {
      assert.ok(errorsFor(calculateConfidenceInterval({ method: "one-mean", values: { confidence, mean: "1", sd: "1", n: "10" } })).confidence, confidence);
    }
    assert.equal(errorsFor(calculateConfidenceInterval({ method: "one-mean", values: { confidence: "95", mean: "1", sd: "1", n: "10" } })).confidence, "Enter the confidence level as a decimal between 0 and 1, not a percentage: 0.95 rather than 95.");
  });

  it("requires at least 2 observations for a mean, and whole numbers", () => {
    for (const n of ["0", "1", "-5", "2.5", "", "ten"]) assert.ok(errorsFor(run("one-mean", { mean: "1", sd: "1", n })).n, n);
    assert.equal(errorsFor(run("one-mean", { mean: "1", sd: "1", n: "1" })).n, "Enter a sample size of at least 2.");
    assert.equal(errorsFor(run("paired-mean", { meanDifference: "1", sdDifference: "1", pairs: "1" })).pairs, "Enter a number of pairs of at least 2.");
    assert.equal(errorsFor(run("two-means", { mean1: "1", sd1: "1", n1: "1", mean2: "1", sd2: "1", n2: "5" })).n1, "Enter a sample size for group 1 of at least 2.");
  });

  it("rejects negative and zero standard deviations with an explanation", () => {
    assert.equal(errorsFor(run("one-mean", { mean: "1", sd: "-2", n: "10" })).sd, "The standard deviation can't be negative: a standard deviation is 0 or more.");
    assert.match(errorsFor(run("one-mean", { mean: "1", sd: "0", n: "10" })).sd ?? "", /^With a standard deviation of 0, every value is the same/);
    assert.match(errorsFor(run("paired-mean", { meanDifference: "1", sdDifference: "0", pairs: "10" })).sdDifference ?? "", /every value is the same/);
    assert.match(errorsFor(run("two-means", { mean1: "1", sd1: "0", n1: "5", mean2: "2", sd2: "0", n2: "5" })).sd1 ?? "", /^Both standard deviations are 0/);
  });

  it("rejects successes beyond the sample size, and a sample size of 0", () => {
    assert.equal(errorsFor(run("one-proportion", { successes: "21", n: "20" })).successes, "The number of successes (21) can't be more than the sample size (20).");
    assert.equal(errorsFor(run("one-proportion", { successes: "0", n: "0" })).n, "Enter a sample size of at least 1.");
    assert.ok(errorsFor(run("one-proportion", { successes: "-1", n: "20" })).successes);
    assert.ok(errorsFor(run("one-proportion", { successes: "2.5", n: "20" })).successes);
    assert.ok(errorsFor(run("two-proportions", { successes1: "3", n1: "10", successes2: "11", n2: "10" })).successes2);
  });

  it("rejects correlations outside (−1, 1) and too few pairs for Fisher's z", () => {
    assert.equal(errorsFor(run("correlation", { r: "1.2", n: "30" })).r, "Enter a correlation between -1 and 1, such as 0.45.");
    for (const r of ["1", "-1", "1.0", "−1"]) assert.match(errorsFor(run("correlation", { r, n: "30" })).r ?? "", /exactly 1 or -1/, r);
    assert.equal(errorsFor(run("correlation", { r: "0.3", n: "3" })).n, "Enter a sample size of at least 4.");
  });

  it("rejects values too large to calculate precisely", () => {
    assert.match(errorsFor(run("one-mean", { mean: "1e20", sd: "1", n: "10" })).mean ?? "", /as a number/);
    assert.match(errorsFor(run("one-mean", { mean: "10000000000000000", sd: "1", n: "10" })).mean ?? "", /between −10¹⁵ and 10¹⁵/);
    assert.match(errorsFor(run("one-mean", { mean: "9".repeat(400), sd: "1", n: "10" })).mean ?? "", /practical size/);
    assert.match(errorsFor(run("one-mean", { mean: "1", sd: "1", n: "10000001" })).n ?? "", /no more than 10,000,000/);
  });

  it("reports every invalid field at once, and only the method's own fields", () => {
    const errors = errorsFor(run("two-means", {}));
    assert.deepEqual(Object.keys(errors).sort(), ["mean1", "mean2", "n1", "n2", "sd1", "sd2"]);
  });
});

describe("numerical safety", () => {
  it("never returns NaN or Infinity, and always lower < estimate-containing upper", () => {
    const requests: [CiMethod, CiRequest["values"]][] = [
      ["one-mean", { mean: "-1000000000000000", sd: "1000000000000000", n: "2" }],
      ["one-mean", { mean: "0.000001", sd: "0.0000001", n: "10000000" }],
      ["two-means", { mean1: "0", sd1: "0.0000000001", n1: "2", mean2: "0", sd2: "1000000000000000", n2: "10000000" }],
      ["paired-mean", { meanDifference: "-3", sdDifference: "0.5", pairs: "2" }],
      ["one-proportion", { successes: "9999999", n: "10000000" }],
      ["two-proportions", { successes1: "0", n1: "1", successes2: "1", n2: "1" }],
      ["correlation", { r: "-0.99999999", n: "4" }],
      ["correlation", { r: "0.99999999", n: "10000000" }],
    ];
    for (const confidence of ["0.9", "0.95", "0.99", "0.999999"]) {
      for (const [method, values] of requests) {
        const calculation = calculateConfidenceInterval({ method, values: { confidence, ...values } });
        if (!calculation.ok) {
          assert.equal(calculation.failure, "unstable", `${method} ${JSON.stringify(values)}`);
          continue;
        }
        const { interval } = calculation;
        const numbers = Object.values(interval).filter((value): value is number => typeof value === "number");
        assert.ok(numbers.every(Number.isFinite), `${method} ${JSON.stringify(interval)}`);
        assert.ok(interval.lower <= interval.estimate && interval.estimate <= interval.upper && interval.lower < interval.upper, method);
      }
    }
  });
});
