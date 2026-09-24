import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cochran, finitePopulationCorrection, krejcieMorgan, roundDown, roundNearest, roundUp, yamane, zScore } from "./sample-size-formulas";
import { CONFIDENCE_LEVELS } from "./sample-size-types";

// Expected values were computed independently with Python's statistics.NormalDist and
// plain arithmetic, and the Krejcie and Morgan values checked against the published table.
const close = (actual: number, expected: number, tolerance = 1e-4) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

describe("zScore", () => {
  it("gives the standard normal z-score for each supported confidence level", () => {
    assert.deepEqual(
      CONFIDENCE_LEVELS.map((entry) => [entry.level, zScore(entry.level)]),
      [
        [80, 1.281552],
        [85, 1.439531],
        [90, 1.644854],
        [95, 1.959964],
        [98, 2.326348],
        [99, 2.575829],
        [99.9, 3.290527],
      ],
    );
  });

  it("rejects unsupported confidence levels", () => {
    assert.throws(() => zScore(97 as never), { name: "RangeError", message: "Unsupported confidence level: 97" });
  });
});

describe("rounding", () => {
  it("rounds sample sizes up, ignoring floating-point noise", () => {
    assert.equal(roundUp(384.1459), 385);
    assert.equal(roundUp(550.0000000001), 550);
    assert.equal(roundUp(385 / 0.7), 550);
    assert.equal(roundUp(80), 80);
    assert.equal(roundUp(0.9975), 1);
  });

  it("rounds down and to the nearest whole number", () => {
    assert.equal(roundDown(417.2), 417);
    assert.equal(roundDown(384.99999999999994), 385);
    assert.equal(roundNearest(44.3437), 44);
    assert.equal(roundNearest(79.5093), 80);
    assert.equal(roundNearest(2.5), 3);
  });
});

describe("cochran", () => {
  const z95 = zScore(95);
  it("gives the classic 385 for 95% confidence, a 5% margin and a 50% proportion", () => {
    close(cochran(z95, 0.5, 0.05), 384.1459);
  });

  it("grows with confidence", () => {
    const expected: Record<number, number> = { 80: 164.2376, 85: 207.2249, 90: 270.5545, 95: 384.1459, 98: 541.1895, 99: 663.4895, 99.9: 1082.7568 };
    for (const { level, z } of CONFIDENCE_LEVELS) close(cochran(z, 0.5, 0.05), expected[level]);
  });

  it("roughly quadruples when the margin halves", () => {
    const expected: Record<number, number> = { 0.01: 9604, 0.02: 2401, 0.03: 1068, 0.05: 385, 0.1: 97 };
    for (const [margin, n] of Object.entries(expected)) assert.equal(roundUp(cochran(z95, 0.5, Number(margin))), n, margin);
  });

  it("is largest at a 50% proportion and symmetric around it", () => {
    const expected: Record<number, number> = { 0.01: 16, 0.1: 139, 0.3: 323, 0.5: 385, 0.7: 323, 0.9: 139, 0.99: 16 };
    for (const [p, n] of Object.entries(expected)) assert.equal(roundUp(cochran(z95, Number(p), 0.05)), n, p);
  });
});

describe("finitePopulationCorrection", () => {
  const n0 = cochran(zScore(95), 0.5, 0.05);
  const expected: [number, number, number][] = [
    [1, 1, 1],
    [2, 1.9948, 2],
    [10, 9.7711, 10],
    [50, 44.3437, 45],
    [100, 79.5093, 80],
    [500, 217.4872, 218],
    [1000, 277.7335, 278],
    [10000, 369.9706, 370],
    [1000000, 383.9988, 384],
    [1000000000, 384.1457, 385],
  ];
  for (const [N, value, rounded] of expected) {
    it(`corrects for a population of ${N}`, () => {
      close(finitePopulationCorrection(n0, N), value);
      assert.equal(roundUp(finitePopulationCorrection(n0, N)), rounded);
    });
  }

  it("never asks for more than the population", () => {
    for (const N of [1, 3, 7, 20, 99]) assert.ok(roundUp(finitePopulationCorrection(n0, N)) <= N, String(N));
  });
});

describe("yamane", () => {
  const expected: [number, number, number][] = [
    [1, 0.9975, 1],
    [10, 9.7561, 10],
    [100, 80, 80],
    [400, 200, 200],
    [1000, 285.7143, 286],
    [10000, 384.6154, 385],
    [1000000, 399.8401, 400],
  ];
  for (const [N, value, rounded] of expected) {
    it(`gives ${rounded} for a population of ${N} at a 5% margin`, () => {
      close(yamane(N, 0.05), value);
      assert.equal(roundUp(yamane(N, 0.05)), rounded);
    });
  }

  it("approaches 1 ÷ e² for very large populations", () => {
    close(yamane(1e12, 0.05), 400, 1e-6);
  });
});

describe("krejcieMorgan", () => {
  // The published table's values for 95% confidence, P = 0.5 and d = 0.05.
  const table: [number, number][] = [
    [10, 10],
    [50, 44],
    [100, 80],
    [500, 217],
    [1000, 278],
    [5000, 357],
    [10000, 370],
  ];
  for (const [N, s] of table) {
    it(`reproduces the published table for a population of ${N}`, () => {
      assert.equal(roundNearest(krejcieMorgan(N, zScore(95), 0.5, 0.05)), s);
    });
  }

  it("is algebraically the same as Cochran's formula with the finite population correction", () => {
    for (const N of [10, 137, 1000, 25000]) {
      for (const p of [0.1, 0.5, 0.8]) {
        for (const { z } of CONFIDENCE_LEVELS) close(krejcieMorgan(N, z, p, 0.05), finitePopulationCorrection(cochran(z, p, 0.05), N), 1e-6);
      }
    }
  });

  it("uses other confidence levels through z²", () => {
    close(krejcieMorgan(1000, zScore(99), 0.5, 0.05), 399.0940);
  });
});
