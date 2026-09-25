import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { input, VALID } from "./test-helpers";
import { RESULT_FIELDS, RESULT_KINDS, type ResultKind, type SignificanceLevel } from "./types";
import { resultProblems } from "./validate";

const messages = (kind: ResultKind, values: Record<string, number>) => resultProblems(input(kind, values)).map((problem) => `${problem.field}: ${problem.message}`);

describe("resultProblems: complete results", () => {
  for (const kind of RESULT_KINDS) {
    it(`accepts the required numbers for ${kind}`, () => {
      assert.deepEqual(resultProblems(input(kind)), []);
    });
  }
});

describe("resultProblems: missing numbers", () => {
  for (const kind of RESULT_KINDS) {
    it(`asks for every required number for ${kind}`, () => {
      const required = RESULT_FIELDS[kind].filter((field) => field.required);
      assert.deepEqual(
        resultProblems(input(kind, {})).map((problem) => problem.field),
        required.map((field) => field.key),
      );
      assert.equal(resultProblems(input(kind, {}))[0].message, `Enter the ${required[0].label.toLowerCase()}.`);
    });
  }
});

describe("resultProblems: impossible values", () => {
  const cases: [ResultKind, Record<string, number>, string][] = [
    ["pearson", { r: 1.2, p: 0.01 }, "r: The pearson's r can't be more than 1."],
    ["pearson", { r: -1.01, p: 0.01 }, "r: The pearson's r must be at least -1."],
    ["pearson", { r: 0.3, p: 1.5 }, "p: The p-value can't be more than 1."],
    ["pearson", { r: 0.3, p: -0.01 }, "p: The p-value must be at least 0."],
    ["pearson", { r: 0.3, p: 0.01, n: 2 }, "n: The sample size must be at least 3."],
    ["pearson", { r: 0.3, p: 0.01, n: 50.5 }, "n: The sample size must be a whole number."],
    ["descriptive-statistics", { n: 10, mean: 3, sd: -1 }, "sd: The standard deviation must be at least 0."],
    ["descriptive-statistics", { n: 0, mean: 3, sd: 1 }, "n: The sample size must be at least 1."],
    ["frequency", { count: 2.5, total: 10 }, "count: The count in the category must be a whole number."],
    ["percentage", { percentage: 120 }, "percentage: The percentage can't be more than 100."],
    ["cronbach-alpha", { alpha: 1.1 }, "alpha: The cronbach's alpha can't be more than 1."],
    ["cronbach-alpha", { alpha: 0.8, items: 1 }, "items: The number of items must be at least 2."],
    ["logistic-regression", { oddsRatio: 0, p: 0.2 }, "oddsRatio: The odds ratio must be more than 0."],
    ["independent-t-test", { t: 2, df: 0, p: 0.05 }, "df: The degrees of freedom must be more than 0."],
    ["paired-t-test", { t: 2, df: 29.5, p: 0.05 }, "df: The degrees of freedom must be a whole number."],
    ["one-way-anova", { f: -1, df1: 2, df2: 50, p: 0.2 }, "f: The f statistic must be at least 0."],
    ["one-way-anova", { f: 3, df1: 0, df2: 50, p: 0.2 }, "df1: The between-groups degrees of freedom must be at least 1."],
    ["chi-square", { chi2: 3, df: 0, p: 0.2 }, "df: The degrees of freedom must be at least 1."],
    ["factor-analysis", { kmo: 1.2, bartlettP: 0.01 }, "kmo: The kmo measure can't be more than 1."],
    ["sem", { cfi: 0.95, rmsea: -0.01 }, "rmsea: The root mean square error of approximation must be at least 0."],
    ["pls-sem", { path: 1.5, p: 0.01 }, "path: The path coefficient can't be more than 1."],
    ["multiple-regression", { r2: 0.2, p: 0.01, predictors: 1 }, "predictors: The number of predictors must be at least 2."],
  ];
  for (const [kind, values, expected] of cases) {
    it(`rejects ${JSON.stringify(values)} for ${kind}`, () => {
      assert.ok(messages(kind, values).includes(expected), messages(kind, values).join(" | "));
    });
  }

  it("rejects numbers that aren't finite", () => {
    assert.deepEqual(messages("pearson", { r: Number.NaN, p: 0.01 }), ["r: The pearson's r must be a number."]);
    assert.deepEqual(messages("pearson", { r: 0.3, p: Number.POSITIVE_INFINITY }), ["p: The p-value must be a number."]);
  });

  it("rejects numbers that aren't reported for the analysis", () => {
    assert.deepEqual(messages("pearson", { r: 0.3, p: 0.01, chi2: 4 }), ["chi2: “chi2” isn't reported for this analysis."]);
  });

  it("accepts values at the edges of their ranges", () => {
    assert.deepEqual(messages("pearson", { r: -1, p: 0 }), []);
    assert.deepEqual(messages("percentage", { percentage: 0 }), []);
    assert.deepEqual(messages("cronbach-alpha", { alpha: -0.4 }), [], "a negative alpha is possible");
    assert.deepEqual(messages("independent-t-test", { t: -3.2, df: 41.7, p: 0.003 }), [], "Welch's df can have decimals");
  });
});

describe("resultProblems: numbers that can't all be true", () => {
  const cases: [ResultKind, Record<string, number>, string][] = [
    ["frequency", { count: 130, total: 120 }, "count: The count can't be more than the total."],
    ["mean", { mean: 3, scaleMin: 5, scaleMax: 1 }, "scaleMax: The highest possible score must be above the lowest."],
    ["mean", { mean: 6, scaleMin: 1, scaleMax: 5 }, "mean: The mean must lie between the lowest and highest possible scores."],
    ["median", { median: 0, scaleMin: 1, scaleMax: 7 }, "median: The median must lie between the lowest and highest possible scores."],
    ["descriptive-statistics", { n: 10, mean: 3, sd: 1, min: 4, max: 2 }, "max: The highest value observed can't be below the lowest."],
    ["descriptive-statistics", { n: 10, mean: 9, sd: 1, min: 1, max: 5 }, "mean: The mean must lie between the lowest and highest values observed."],
    ["multiple-regression", { r2: 0.2, adjustedR2: 0.25, p: 0.01 }, "adjustedR2: Adjusted R² can't be more than R²."],
    ["hierarchical-regression", { r2Change: 0.3, pChange: 0.01, r2: 0.2 }, "r2Change: The change in R² can't be more than the final R²."],
    ["logistic-regression", { oddsRatio: 1.5, p: 0.01, ciLower: 1.1 }, "ciUpper: Enter both confidence limits, or neither."],
    ["logistic-regression", { oddsRatio: 2.5, p: 0.01, ciLower: 1.1, ciUpper: 1.9 }, "oddsRatio: The odds ratio must lie between its confidence limits."],
  ];
  for (const [kind, values, expected] of cases) {
    it(`finds the conflict in ${JSON.stringify(values)} for ${kind}`, () => {
      assert.deepEqual(messages(kind, values), [expected]);
    });
  }

  it("checks ranges before combinations, so each problem is reported once", () => {
    assert.deepEqual(messages("frequency", { count: -1, total: 0 }), ["count: The count in the category must be at least 0.", "total: The total must be at least 1."]);
  });
});

describe("resultProblems: invalid requests", () => {
  it("throws for an unknown kind or significance level", () => {
    assert.throws(() => resultProblems({ ...input("pearson"), kind: "anova" as ResultKind }), { message: "Unknown result kind: anova" });
    assert.throws(() => resultProblems({ ...input("pearson"), alpha: 0.2 as SignificanceLevel }), { message: "Unsupported significance level: 0.2" });
  });

  it("doesn't change the input", () => {
    const values = { ...VALID.pearson };
    resultProblems(input("pearson", values));
    assert.deepEqual(values, VALID.pearson);
  });
});
