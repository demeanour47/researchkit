import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decimalsIn, formatValue, niceScale, project, tickDecimals } from "./scales";

const near = (values: readonly number[], expected: readonly number[]) => {
  assert.equal(values.length, expected.length, `${values} vs ${expected}`);
  values.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < 1e-9, `${value} ≠ ${expected[index]}`));
};

describe("niceScale", () => {
  it("starts bars at zero with steps of 1, 2 or 5 times a power of ten", () => {
    const scale = niceScale(15, 48, { includeZero: true });
    assert.deepEqual([scale.min, scale.max, scale.step], [0, 50, 10]);
    assert.deepEqual(scale.ticks, [0, 10, 20, 30, 40, 50]);
  });
  it("fits a narrow range without zero", () => {
    const scale = niceScale(6.5, 7.2);
    near([scale.min, scale.max, scale.step], [6.4, 7.2, 0.2]);
    near(scale.ticks, [6.4, 6.6, 6.8, 7, 7.2]);
  });
  it("covers negative and positive values", () => {
    const scale = niceScale(-3, 8, { includeZero: true });
    assert.deepEqual([scale.min, scale.max, scale.step], [-5, 10, 5]);
    assert.ok(scale.ticks.includes(0));
  });
  it("extends to zero for all-negative bars", () => {
    const scale = niceScale(-40, -10, { includeZero: true });
    assert.equal(scale.max, 0);
    assert.ok(scale.min <= -40);
  });
  it("pads a single value so it isn't on an edge", () => {
    const scale = niceScale(5, 5);
    assert.ok(scale.min < 5 && scale.max > 5);
  });
  it("runs from zero to a single value for bars", () => {
    const scale = niceScale(5, 5, { includeZero: true });
    assert.deepEqual([scale.min, scale.max], [0, 5]);
  });
  it("gives a unit scale for all zeros", () => {
    const scale = niceScale(0, 0, { includeZero: true });
    assert.deepEqual([scale.min, scale.max], [0, 1]);
  });
  it("runs from a single negative value up to zero for bars", () => {
    const scale = niceScale(-5, -5, { includeZero: true });
    assert.deepEqual([scale.min, scale.max], [-5, 0]);
  });
  it("falls back to 0 to 1 for non-finite input", () => {
    const scale = niceScale(Number.NaN, Infinity);
    assert.deepEqual([scale.min, scale.max], [0, 1]);
  });
  it("uses fewer ticks for a lower target", () => {
    assert.ok(niceScale(0, 60, { target: 2 }).ticks.length < niceScale(0, 60, { target: 6 }).ticks.length);
  });
  it("never produces negative zero", () => {
    assert.ok(niceScale(-1, 1).ticks.every((tick) => !Object.is(tick, -0)));
  });
  it("has evenly spaced ticks covering the data", () => {
    const scale = niceScale(123, 987);
    assert.ok(scale.min <= 123 && scale.max >= 987);
    scale.ticks.slice(1).forEach((tick, index) => assert.ok(Math.abs(tick - scale.ticks[index] - scale.step) < 1e-9));
  });
});

describe("tickDecimals", () => {
  const cases: [number, number][] = [
    [10, 0],
    [1, 0],
    [5, 0],
    [0.5, 1],
    [0.2, 1],
    [0.05, 2],
    [0.001, 3],
    [0, 0],
  ];
  for (const [step, expected] of cases)
    it(`needs ${expected} decimals for a step of ${step}`, () => {
      assert.equal(tickDecimals(step), expected);
    });
});

describe("formatValue", () => {
  const cases: [number, number, boolean, string][] = [
    [1234.5, 1, false, "1,234.5"],
    [1234567, 0, false, "1,234,567"],
    [-3, 0, false, "−3"],
    [-1234.25, 2, false, "−1,234.25"],
    [-0.001, 1, false, "0.0"],
    [45, 0, true, "45%"],
    [33.333, 1, true, "33.3%"],
    [7, 2, false, "7.00"],
    [999.96, 1, false, "1,000.0"],
  ];
  for (const [value, decimals, percent, expected] of cases)
    it(`formats ${value} with ${decimals} decimals${percent ? " as a percentage" : ""} as ${expected}`, () => {
      assert.equal(formatValue(value, decimals, percent), expected);
    });
  it("clamps decimals to a sensible range", () => {
    assert.equal(formatValue(1.5, -2), "2");
    assert.equal(formatValue(1, 50), "1.0000000000");
  });
});

describe("decimalsIn", () => {
  it("finds the decimals the data use", () => {
    assert.equal(decimalsIn([3.4, 2.7, 2.9]), 1);
  });
  it("gives none for whole numbers", () => {
    assert.equal(decimalsIn([48, 15, 0, -3]), 0);
  });
  it("caps at the maximum", () => {
    assert.equal(decimalsIn([1.23456]), 2);
    assert.equal(decimalsIn([1.23456], 3), 3);
  });
  it("uses the most any value needs", () => {
    assert.equal(decimalsIn([1, 2.5, 3.25]), 2);
  });
  it("ignores missing and non-finite values", () => {
    assert.equal(decimalsIn([null, Number.NaN, Infinity, 4]), 0);
  });
  it("tolerates floating-point noise", () => {
    assert.equal(decimalsIn([0.1 + 0.2]), 1);
  });
});

describe("project", () => {
  it("maps a value between two ends", () => {
    assert.equal(project(5, { min: 0, max: 10 }, 0, 100), 50);
  });
  it("maps onto reversed ends, as y axes run upwards", () => {
    assert.equal(project(10, { min: 0, max: 10 }, 300, 50), 50);
  });
  it("returns the start of a zero-width scale", () => {
    assert.equal(project(3, { min: 3, max: 3 }, 20, 80), 20);
  });
});
