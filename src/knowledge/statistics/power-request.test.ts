import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Design, Mode } from "./power";
import { calculatePower, type FieldId, type PowerCalculation, type PowerRequest } from "./power-request";

const run = (design: Design, values: PowerRequest["values"], mode: Mode = "sample-size", tails: PowerRequest["tails"] = "two-sided") => calculatePower({ design, mode, tails, values });
const errorsFor = (calculation: PowerCalculation): Partial<Record<FieldId, string>> => (calculation.ok ? {} : Object.fromEntries(calculation.errors.map((error) => [error.field, error.message])));
const ok = (calculation: PowerCalculation) => {
  assert.ok(calculation.ok, JSON.stringify(calculation));
  return calculation;
};
const defaults = { alpha: "0.05", power: "0.80" };

describe("sample size mode", () => {
  it("reports total and per-group sizes for two independent means", () => {
    const result = ok(run("two-means", { ...defaults, effect: "0.5" })).result;
    assert.equal(result.kind, "sample-size");
    if (result.kind !== "sample-size") return;
    assert.deepEqual([result.n, result.total, result.perGroup], [64, 128, 64]);
    assert.ok(result.achievedPower >= 0.8);
    assert.deepEqual(result.sensitivity.map((row) => [row.power, row.n, row.total]), [[0.8, 64, 128], [0.9, 86, 172], [0.95, 105, 210]]);
  });

  it("reports pairs for paired means and a total for one sample", () => {
    const paired = ok(run("paired-means", { ...defaults, effect: "0.5" })).result;
    assert.ok(paired.kind === "sample-size" && paired.perGroup === null && paired.total === paired.n);
    const single = ok(run("one-sample-mean", { ...defaults, effect: "0.625", power: "0.95" }, "sample-size", "one-sided")).result;
    assert.ok(single.kind === "sample-size" && single.n === 30);
  });

  it("multiplies by the number of groups for ANOVA", () => {
    const result = ok(run("anova", { ...defaults, power: "0.95", effect: "0.25", groups: "10" })).result;
    assert.ok(result.kind === "sample-size" && result.n === 39 && result.total === 390);
  });

  it("works from proportions and correlations", () => {
    const proportions = ok(run("two-proportions", { ...defaults, p1: "0.50", p2: "0.55" }));
    assert.ok(proportions.result.kind === "sample-size" && proportions.result.n === 1565);
    assert.ok(proportions.effect?.metric === "h" && Math.abs(proportions.effect.value - 0.1001674) < 1e-6);
    const correlation = ok(run("correlation", { ...defaults, power: "0.95", r: "0.65", r0: "0.60" }));
    assert.ok(correlation.result.kind === "sample-size" && correlation.result.n === 1929);
  });

  it("uses a two-sided test for ANOVA whatever is requested", () => {
    assert.equal(ok(run("anova", { ...defaults, effect: "0.25", groups: "3" }, "sample-size", "one-sided")).tails, "two-sided");
  });

  it("reports a requirement too large to compute instead of estimating it", () => {
    const calculation = run("two-means", { ...defaults, effect: "0.0001" });
    assert.ok(!calculation.ok && "failure" in calculation && calculation.failure === "too-large");
  });
});

describe("power mode", () => {
  it("gives model-based power for a planned sample, flagged as not observed power", () => {
    const calculation = ok(run("paired-means", { alpha: "0.05", effect: "0.421637", n: "50" }, "power"));
    assert.ok(calculation.result.kind === "power" && Math.abs(calculation.result.power - 0.832114) < 1e-6);
    assert.ok(calculation.warnings.includes("observed-power"));
    assert.equal(calculation.targetPower, null);
  });
});

describe("minimum detectable effect mode", () => {
  it("finds d for a planned sample", () => {
    const calculation = ok(run("two-means", { ...defaults, n: "64" }, "effect"));
    assert.ok(calculation.result.kind === "effect" && Math.abs(calculation.result.effect - 0.5) < 0.003);
  });

  it("converts h back to a proportion and z back to a correlation", () => {
    const proportion = ok(run("one-proportion", { ...defaults, p0: "0.50", n: "23" }, "effect", "one-sided"));
    assert.ok(proportion.result.kind === "effect" && proportion.result.equivalent !== null && Math.abs(proportion.result.equivalent - 0.75) < 0.01);
    const correlation = ok(run("correlation", { ...defaults, r0: "0", n: "85" }, "effect"));
    assert.ok(correlation.result.kind === "effect" && correlation.result.equivalent !== null && Math.abs(correlation.result.equivalent - 0.3) < 0.01);
  });
});

describe("validation", () => {
  it("accepts common α and power values, and rejects impossible ones", () => {
    for (const alpha of ["0.05", "0.01", "0.10", ".05"]) assert.ok(run("two-means", { alpha, power: "0.8", effect: "0.5" }).ok, alpha);
    for (const power of ["0.80", "0.90", "0.95"]) assert.ok(run("two-means", { alpha: "0.05", power, effect: "0.5" }).ok, power);
    for (const alpha of ["0", "1", "1.5", "-0.05", "abc", "", "5%", "NaN", "Infinity", "1e-2"]) assert.ok(errorsFor(run("two-means", { alpha, power: "0.8", effect: "0.5" })).alpha, alpha);
    for (const power of ["0", "1", "80", "80%", "-0.8"]) assert.ok(errorsFor(run("two-means", { alpha: "0.05", power, effect: "0.5" })).power, power);
    assert.match(errorsFor(run("two-means", { alpha: "0.05", power: "50%", effect: "0.5" })).power ?? "", /decimal, not a percentage: 0\.80 rather than 80%/);
    assert.match(errorsFor(run("two-means", { alpha: "0.10", power: "0.05", effect: "0.5" })).power ?? "", /greater than α/);
  });

  it("checks sample sizes are whole numbers above the design's minimum", () => {
    for (const n of ["0", "-10", "10.5", "1", "", "ten"]) assert.ok(errorsFor(run("two-means", { alpha: "0.05", effect: "0.5", n }, "power")).n, n);
    assert.ok(run("two-means", { alpha: "0.05", effect: "0.5", n: "2" }, "power").ok);
    assert.ok(errorsFor(run("correlation", { alpha: "0.05", r: "0.3", n: "3" }, "power")).n);
    assert.ok(run("correlation", { alpha: "0.05", r: "0.3", n: "4" }, "power").ok);
  });

  it("checks effect sizes are positive and plausible", () => {
    for (const effect of ["0", "-0.5", "11", "big"]) assert.ok(errorsFor(run("one-sample-mean", { ...defaults, effect })).effect, effect);
    for (const effect of ["0.0001", "0.2", "2.5"]) assert.ok(!errorsFor(run("one-sample-mean", { ...defaults, effect })).effect, effect);
  });

  it("checks correlations, allowing negative values but not ±1", () => {
    for (const r of ["-0.3", "0.3", "0.99"]) assert.ok(run("correlation", { ...defaults, r }).ok, r);
    for (const r of ["1", "-1", "1.2", "-1.5"]) assert.ok(errorsFor(run("correlation", { ...defaults, r })).r, r);
    assert.match(errorsFor(run("correlation", { ...defaults, r: "1" })).r ?? "", /exactly −1 or 1/);
    assert.ok(errorsFor(run("correlation", { ...defaults, r: "0" })).r, "no effect");
  });

  it("checks proportions are decimals from 0 to 1, and differ", () => {
    for (const [p0, p1] of [["0", "0.2"], ["0.5", "1"], ["0.5", "0.6"]]) assert.ok(run("one-proportion", { ...defaults, p0, p1 }).ok, `${p0} ${p1}`);
    for (const p1 of ["1.2", "-0.1", "50%", "65"]) assert.ok(errorsFor(run("one-proportion", { ...defaults, p0: "0.5", p1 })).p1, p1);
    assert.equal(errorsFor(run("two-proportions", { ...defaults, p1: "50", p2: "0.65" })).p1, "Enter the proportion in group 1 as a decimal from 0 to 1, not a percentage: 0.5 rather than 50.");
    assert.equal(errorsFor(run("two-means", { alpha: "0.05", power: "80", effect: "0.5" })).power, "Enter the target power as a decimal between 0 and 1, not a percentage: 0.8 rather than 80.");
    assert.equal(errorsFor(run("two-proportions", { ...defaults, p1: "150", p2: "0.65" })).p1, "Enter the proportion in group 1 from 0 to 1, such as 0.50.");
    assert.match(errorsFor(run("two-proportions", { ...defaults, p1: "0.4", p2: "0.4" })).p2 ?? "", /equal/);
  });

  it("checks the number of groups", () => {
    for (const groups of ["2", "3", "100"]) assert.ok(run("anova", { ...defaults, effect: "0.25", groups }).ok, groups);
    for (const groups of ["1", "0", "2.5", "101", ""]) assert.ok(errorsFor(run("anova", { ...defaults, effect: "0.25", groups })).groups, groups);
  });

  it("warns when a normal approximation for proportions rests on small expected counts", () => {
    const calculation = ok(run("one-proportion", { ...defaults, p0: "0.02", p1: "0.10" }));
    assert.ok(calculation.warnings.includes("normal-approximation"));
    assert.ok(!ok(run("two-proportions", { ...defaults, p1: "0.50", p2: "0.55" })).warnings.includes("normal-approximation"));
  });

  it("never returns NaN or Infinity", () => {
    for (const design of ["one-sample-mean", "two-means", "paired-means", "anova"] as const) {
      for (const mode of ["sample-size", "power", "effect"] as const) {
        const calculation = run(design, { ...defaults, effect: "0.4", n: "40", groups: "4" }, mode);
        const numbers = JSON.stringify(calculation).match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? [];
        assert.ok(numbers.every((value) => Number.isFinite(Number(value))), `${design} ${mode}`);
        assert.doesNotMatch(JSON.stringify(calculation), /NaN|Infinity/);
      }
    }
  });
});
