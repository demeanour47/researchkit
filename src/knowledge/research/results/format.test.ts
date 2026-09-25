import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatAlpha, formatBounded, formatP, formatPValue, formatPlain, formatStat, levelPercent, statisticText } from "./format";
import { significance } from "./significance";

describe("formatting", () => {
  it("writes statistics to two decimals with a leading zero", () => {
    assert.deepEqual([formatStat(2.456), formatStat(0.3), formatStat(-1.5), formatStat(-0.004), formatStat(3.14159, 3)], ["2.46", "0.30", "-1.50", "0.00", "3.142"]);
  });

  it("drops the leading zero for values that can't exceed 1", () => {
    assert.deepEqual([formatBounded(0.456), formatBounded(-0.3), formatBounded(1), formatBounded(0.05, 3)], [".46", "-.30", "1.00", ".050"]);
  });

  it("writes p to three decimals, and below .001 as p < .001", () => {
    assert.deepEqual([formatP(0.032), formatP(0.001), formatP(0.0004), formatP(0), formatP(0.5), formatP(0.9995), formatP(1)], ["p = .032", "p = .001", "p < .001", "p < .001", "p = .500", "p > .999", "p > .999"]);
    assert.deepEqual([formatPValue(0.032), formatPValue(0.0001), formatPValue(1)], [".032", "< .001", "> .999"]);
  });

  it("writes a statistic and value as text, keeping a value's own sign", () => {
    assert.deepEqual([statisticText("r", ".34"), statisticText("p", "< .001"), statisticText("p", "> .999")], ["r = .34", "p < .001", "p > .999"]);
  });

  it("writes plain numbers without trailing zeros", () => {
    assert.deepEqual([formatPlain(3.5), formatPlain(12), formatPlain(2.456), formatPlain(-0.1), formatPlain(100)], ["3.5", "12", "2.46", "-0.1", "100"]);
  });

  it("writes the significance level as a percentage and as alpha", () => {
    assert.deepEqual([levelPercent(0.05), levelPercent(0.01), levelPercent(0.1)], ["5%", "1%", "10%"]);
    assert.equal(formatAlpha(0.05), "α = .05");
  });
});

describe("significance", () => {
  it("is significant when p is below the level", () => {
    const result = significance(0.049, 0.05);
    assert.equal(result.status, "significant");
    assert.equal(result.statement, "p = .049 is below α = .05, so the result is statistically significant at the 5% level.");
    assert.match(result.meaning, /doesn't show the effect is large, important or certain/);
  });

  it("isn't significant when p equals the level", () => {
    const result = significance(0.05, 0.05);
    assert.equal(result.status, "not-significant");
    assert.equal(result.statement, "p = .050 is equal to α = .05, so the result is not statistically significant at the 5% level.");
  });

  it("isn't significant above the level, and says that isn't evidence of no effect", () => {
    const result = significance(0.2, 0.05);
    assert.equal(result.status, "not-significant");
    assert.match(result.meaning, /isn't evidence that there is no effect/);
  });

  it("depends on the chosen level", () => {
    assert.equal(significance(0.03, 0.01).status, "not-significant");
    assert.equal(significance(0.009, 0.01).status, "significant");
    assert.equal(significance(0.08, 0.1).status, "significant");
    assert.equal(significance(0.08, 0.1).statement, "p = .080 is below α = .10, so the result is statistically significant at the 10% level.");
  });

  it("reports no test when there is no p-value", () => {
    assert.equal(significance(undefined, 0.05).status, "no-test");
  });
});
