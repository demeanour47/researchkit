import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_SAMPLE_SIZE, cohensH, fisherZ, minimumDetectableEffect, powerFor, requiredSampleSize, type PowerParameters } from "./power";

// Reference values come from two independent published sources:
// - G*Power 3.1 manual (Faul, Erdfelder, Lang & Buchner), worked examples in sections 3, 10, 19 and 20.
// - The R pwr package's vignette (Champely et al.), rendered output on CRAN, for proportions and two-sample t tests.

const near = (actual: number, expected: number, tolerance: number, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label} ${actual} vs ${expected} (±${tolerance})`);

const base = (design: PowerParameters["design"], effect: number, overrides: Partial<PowerParameters> = {}): PowerParameters => ({ design, effect, alpha: 0.05, tails: "two-sided", groups: 2, ...overrides });

const sampleSize = (parameters: PowerParameters, power: number) => {
  const outcome = requiredSampleSize(parameters, power);
  assert.ok(outcome.ok, "sample size found");
  return outcome;
};

describe("one-sample mean (t test)", () => {
  it("G*Power §20: one-tailed, d = 0.625, α = .05, power .95 → N = 30, actual power 0.955144", () => {
    const result = sampleSize(base("one-sample-mean", 0.625, { tails: "one-sided" }), 0.95);
    assert.equal(result.n, 30);
    near(result.power, 0.955144, 1e-6);
  });

  it("G*Power §20: two-tailed, d = 0.1, α = .01, power .90 → N = 1492, actual power 0.900169", () => {
    const result = sampleSize(base("one-sample-mean", 0.1, { alpha: 0.01 }), 0.9);
    assert.equal(result.n, 1492);
    near(result.power, 0.900169, 1e-6);
  });
});

describe("paired means (t test on differences)", () => {
  it("G*Power §19: two-tailed, dz = 0.421637, α = .05, 50 pairs → power 0.832114", () => {
    near(powerFor(base("paired-means", 0.421637), 50), 0.832114, 1e-6);
  });

  it("G*Power §19: dz = 0.2828427 with 50 pairs → power 0.500352", () => {
    near(powerFor(base("paired-means", 0.2828427), 50), 0.500352, 1e-6);
  });
});

describe("two independent means (t test, equal groups)", () => {
  it("pwr: d = 0.5, 30 per group → power 0.4778965", () => {
    near(powerFor(base("two-means", 0.5), 30), 0.4778965, 1e-7);
  });

  it("pwr: d = 0.5, power .80 → 63.77 per group, so 64 per group (128 in total)", () => {
    const result = sampleSize(base("two-means", 0.5), 0.8);
    assert.equal(result.n, 64);
    assert.ok(powerFor(base("two-means", 0.5), 63) < 0.8, "63 per group falls short");
  });

  it("pwr: d = 1/3, power .80 → 142.25 per group, so 143", () => {
    assert.equal(sampleSize(base("two-means", 1 / 3), 0.8).n, 143);
  });
});

describe("one-way ANOVA (F test, equal groups)", () => {
  it("G*Power §10: f = 0.25, 10 groups, α = .05, power .95 → N = 390 (39 per group), actual power 0.952363", () => {
    const result = sampleSize(base("anova", 0.25, { groups: 10 }), 0.95);
    assert.equal(result.n, 39);
    near(result.power, 0.952363, 1e-6);
  });

  it("G*Power §10: f = 0.25, 10 groups of 20, at α = .159194 → power 0.840806", () => {
    near(powerFor(base("anova", 0.25, { groups: 10, alpha: 0.159194 }), 20), 0.840806, 2e-6);
  });
});

describe("correlation (Fisher z approximation)", () => {
  it("G*Power §3: ρ₀ = .80, ρ = .30, N = 8, two-sided α = .05 → approximate power 0.422599", () => {
    near(powerFor(base("correlation", Math.abs(fisherZ(0.3) - fisherZ(0.8))), 8), 0.422599, 1e-6);
  });

  it("G*Power §3: ρ₀ = .60, ρ = .65, α = .05, power .95 → approximate N = 1929", () => {
    assert.equal(sampleSize(base("correlation", fisherZ(0.65) - fisherZ(0.6)), 0.95).n, 1929);
  });
});

describe("proportions (Cohen's arcsine method)", () => {
  it("computes h as pwr's ES.h does", () => {
    near(cohensH(0.75, 0.5), 0.5235988, 1e-7);
    near(cohensH(0.55, 0.5), 0.1001674, 1e-7);
    near(cohensH(0.1, 0.05), 0.1924743, 1e-7);
  });

  it("pwr: one sample, h(0.75, 0.50), one-sided α = .05, power .80 → 22.55, so 23", () => {
    const parameters = base("one-proportion", cohensH(0.75, 0.5), { tails: "one-sided" });
    assert.equal(sampleSize(parameters, 0.8).n, 23);
    assert.ok(powerFor(parameters, 22) < 0.8);
  });

  it("pwr: one sample, h(0.75, 0.50), one-sided α = .01, n = 40 → power 0.8377325", () => {
    near(powerFor(base("one-proportion", cohensH(0.75, 0.5), { tails: "one-sided", alpha: 0.01 }), 40), 0.8377325, 1e-7);
  });

  it("pwr: two groups, 0.55 vs 0.50 → 1564.53 per group, so 1565", () => {
    assert.equal(sampleSize(base("two-proportions", cohensH(0.55, 0.5)), 0.8).n, 1565);
  });

  it("pwr: two groups, 0.10 vs 0.05 → 423.73, so 424; h = 0.2 → 392.44, so 393", () => {
    assert.equal(sampleSize(base("two-proportions", cohensH(0.1, 0.05)), 0.8).n, 424);
    assert.equal(sampleSize(base("two-proportions", 0.2), 0.8).n, 393);
  });
});

describe("general behaviour", () => {
  it("never rounds a sample size down: one fewer always falls short of the target", () => {
    for (const [design, effect] of [["one-sample-mean", 0.3], ["two-means", 0.4], ["paired-means", 0.35], ["one-proportion", 0.25], ["two-proportions", 0.3], ["correlation", 0.25], ["anova", 0.2]] as const) {
      for (const target of [0.8, 0.9, 0.95]) {
        const parameters = base(design, effect, { groups: 3 });
        const result = sampleSize(parameters, target);
        assert.ok(result.power >= target, `${design} ${target}`);
        if (result.n > 2) assert.ok(powerFor(parameters, result.n - 1) < target, `${design} ${target} minus one`);
      }
    }
  });

  it("needs more participants for smaller effects, higher power and stricter α", () => {
    const n = (effect: number, power = 0.8, alpha = 0.05) => sampleSize(base("two-means", effect, { alpha }), power).n;
    assert.ok(n(0.2) > n(0.5) && n(0.5) > n(0.8));
    assert.ok(n(0.5, 0.95) > n(0.5, 0.9) && n(0.5, 0.9) > n(0.5, 0.8));
    assert.ok(n(0.5, 0.8, 0.01) > n(0.5, 0.8, 0.05) && n(0.5, 0.8, 0.05) > n(0.5, 0.8, 0.1));
  });

  it("needs fewer participants for a one-sided test of the same effect", () => {
    assert.ok(sampleSize(base("two-means", 0.5, { tails: "one-sided" }), 0.8).n < sampleSize(base("two-means", 0.5), 0.8).n);
  });

  it("reports a requirement beyond the search limit instead of estimating it", () => {
    assert.deepEqual(requiredSampleSize(base("two-means", 0.0001), 0.95), { ok: false, reason: "too-large" });
    assert.equal(MAX_SAMPLE_SIZE, 10_000_000);
  });

  it("finds the minimum detectable effect, rounded up so it still reaches the target", () => {
    const outcome = minimumDetectableEffect({ design: "two-means", alpha: 0.05, tails: "two-sided", groups: 2 }, 64, 0.8);
    assert.ok(outcome.ok);
    near(outcome.effect, 0.5, 0.003);
    assert.ok(powerFor(base("two-means", outcome.effect), 64) >= 0.8);
    assert.ok(powerFor(base("two-means", outcome.effect - 0.0001), 64) < 0.8);
  });

  it("returns finite probabilities across the input range", () => {
    for (const design of ["one-sample-mean", "two-means", "paired-means", "one-proportion", "two-proportions", "correlation", "anova"] as const) {
      for (const effect of [1e-6, 0.01, 0.5, 2, 10]) {
        for (const n of [4, 10, 1000, 100000]) {
          const value = powerFor(base(design, effect, { groups: 4 }), n);
          assert.ok(Number.isFinite(value) && value >= 0 && value <= 1, `${design} ${effect} ${n}: ${value}`);
        }
      }
    }
  });
});
