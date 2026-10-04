import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bisect,
  fUpper,
  fUpperQuantile,
  logGamma,
  noncentralFUpper,
  noncentralTCdf,
  normalCdf,
  normalUpper,
  normalUpperQuantile,
  regularizedBeta,
  studentTUpper,
  studentTUpperQuantile,
} from "./distributions";

const near = (actual: number, expected: number, tolerance: number, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label} ${actual} vs ${expected} (±${tolerance})`);

describe("ln Γ", () => {
  it("matches exact values", () => {
    near(logGamma(0.5), 0.5 * Math.log(Math.PI), 1e-14, "Γ(½) = √π");
    near(logGamma(1), 0, 1e-14);
    near(logGamma(5), Math.log(24), 1e-14);
    near(logGamma(10), Math.log(362880), 1e-13);
    near(logGamma(100), 359.13420536957540, 1e-11);
  });
});

describe("normal distribution", () => {
  // Reference values: standard normal table values to 15–16 significant digits.
  it("gives standard values", () => {
    near(normalCdf(0), 0.5, 1e-15);
    near(normalCdf(-1), 0.15865525393145707, 1e-15);
    near(normalCdf(1.959963984540054), 0.975, 1e-14);
    near(normalCdf(3), 0.9986501019683699, 1e-15);
  });

  it("keeps relative precision in the far tail", () => {
    near(normalUpper(8), 6.22096057427178e-16, 1e-28);
    near(normalUpper(-8), 1 - 6.22096057427178e-16, 1e-15);
  });

  it("inverts exactly at common levels", () => {
    near(normalUpperQuantile(0.025), 1.959963984540054, 1e-12);
    near(normalUpperQuantile(0.05), 1.6448536269514722, 1e-12);
    near(normalUpperQuantile(0.2), 0.8416212335729143, 1e-12);
    near(normalUpperQuantile(0.005), 2.5758293035489004, 1e-12);
    assert.throws(() => normalUpperQuantile(0));
    assert.throws(() => normalUpperQuantile(1));
  });
});

describe("Student t and F distributions", () => {
  it("gives the critical values G*Power reports", () => {
    // G*Power 3.1 manual, sections 19, 20 and 10.
    near(studentTUpperQuantile(0.05, 29), 1.699127, 5e-7, "one-tailed, df 29");
    near(studentTUpperQuantile(0.025, 49), 2.009575, 5e-7, "two-tailed, df 49");
    near(studentTUpperQuantile(0.005, 1491), 2.579131, 5e-7, "two-tailed α .01, df 1491");
    near(fUpperQuantile(0.05, 9, 380), 1.904538, 5e-7, "F(9, 380)");
    near(fUpper(1.47621, 9, 190), 0.159194, 5e-7, "P(F(9, 190) > 1.476210)");
  });

  it("reduces to known cases", () => {
    near(studentTUpper(0, 7), 0.5, 1e-15);
    // t with 1 df is Cauchy: P(T > 1) = ¼.
    near(studentTUpper(1, 1), 0.25, 1e-14);
    // F(1, ν) is t²: P(F > t²) = 2 P(T > t).
    near(fUpper(4, 1, 20), 2 * studentTUpper(2, 20), 1e-13);
    near(regularizedBeta(0.5, 2, 2), 0.5, 1e-14);
    near(regularizedBeta(0.3, 1, 1), 0.3, 1e-14);
  });
});

describe("noncentral distributions", () => {
  it("reproduces G*Power's noncentral t power values", () => {
    // Section 20: one-tailed, df 29, δ 3.423266, critical t 1.699127 → power 0.955144.
    near(1 - noncentralTCdf(1.699127, 29, 3.423266), 0.955144, 1e-6);
    // Section 19: two-tailed, df 49, δ 2.981424, critical t 2.009575 → power 0.832114.
    near(1 - noncentralTCdf(2.009575, 49, 2.981424) + noncentralTCdf(-2.009575, 49, 2.981424), 0.832114, 1e-6);
  });

  it("is the central t when δ = 0, and symmetric", () => {
    near(noncentralTCdf(1.3, 12, 0), 1 - studentTUpper(1.3, 12), 1e-13);
    near(noncentralTCdf(-1.1, 9, 2), 1 - noncentralTCdf(1.1, 9, -2), 1e-13);
  });

  it("stays a probability for very large noncentrality", () => {
    const value = noncentralTCdf(2, 5000, 60);
    assert.ok(value >= 0 && value < 1e-12, String(value));
  });

  it("reproduces G*Power's noncentral F power values", () => {
    // Section 10: λ 12.5, F(9, 190), critical F 1.476210 → power 0.840806.
    near(noncentralFUpper(1.47621, 9, 190, 12.5), 0.840806, 1e-6);
    // λ 24.375, F(9, 380), critical F 1.904538 → power 0.952363.
    near(noncentralFUpper(1.904538, 9, 380, 24.375), 0.952363, 1e-6);
    near(noncentralFUpper(2.1, 3, 40, 0), fUpper(2.1, 3, 40), 1e-15);
  });
});

describe("bisection", () => {
  it("finds a root inside the bracket, and refuses a bracket without one", () => {
    near(bisect((x) => x * x, 2, 0, 2) ?? Number.NaN, Math.SQRT2, 1e-11);
    assert.equal(bisect((x) => x, 5, 0, 1), null);
  });
});
