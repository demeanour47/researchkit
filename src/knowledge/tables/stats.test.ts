import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { averageVarianceExtracted, chiSquareP, chiSquareTest, compositeReliability, cronbachAlpha, fTestP, incompleteBeta, incompleteGamma, kurtosis, logGamma, mean, pearson, ranks, skewness, spearman, standardDeviation, tTestP, variance } from "./stats";

const near = (actual: number, expected: number, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

describe("logGamma", () => {
  it("matches factorials", () => {
    near(logGamma(1), 0);
    near(logGamma(5), Math.log(24));
    near(logGamma(11), Math.log(3628800), 1e-9);
  });
  it("matches Γ(½) = √π", () => {
    near(logGamma(0.5), Math.log(Math.sqrt(Math.PI)));
  });
  it("handles arguments below one half by reflection", () => {
    near(logGamma(0.25), Math.log(3.6256099082219083));
  });
});

describe("incomplete beta and gamma", () => {
  it("gives 0 and 1 at the ends", () => {
    assert.deepEqual([incompleteBeta(0, 2, 3), incompleteBeta(1, 2, 3)], [0, 1]);
    assert.equal(incompleteGamma(2, 0), 0);
  });
  it("matches Iₓ(1, 1) = x", () => {
    near(incompleteBeta(0.3, 1, 1), 0.3);
  });
  it("is symmetric: Iₓ(a, b) = 1 − I₁₋ₓ(b, a)", () => {
    near(incompleteBeta(0.2, 2.5, 4), 1 - incompleteBeta(0.8, 4, 2.5));
  });
  it("matches P(1, x) = 1 − e^−x", () => {
    near(incompleteGamma(1, 2), 1 - Math.exp(-2));
    near(incompleteGamma(1, 0.1), 1 - Math.exp(-0.1));
  });
});

describe("p-values against published critical values", () => {
  const cases: [string, number, number][] = [
    ["t(10) = 2.228", tTestP(2.228139, 10), 0.05],
    ["t(30) = 2.750", tTestP(2.749996, 30), 0.01],
    ["t(5) = 4.032", tTestP(4.032143, 5), 0.01],
    ["t(∞) = 1.960", tTestP(1.959964, 1e7), 0.05],
    ["F(1, 10) = 4.965", fTestP(4.964603, 1, 10), 0.05],
    ["F(2, 27) = 3.354", fTestP(3.354131, 2, 27), 0.05],
    ["F(3, 60) = 4.126", fTestP(4.125892, 3, 60), 0.01],
    ["χ²(1) = 3.841", chiSquareP(3.841459, 1), 0.05],
    ["χ²(4) = 9.488", chiSquareP(9.487729, 4), 0.05],
    ["χ²(10) = 18.307", chiSquareP(18.307038, 10), 0.05],
    ["χ²(2) = 9.210", chiSquareP(9.21034, 2), 0.01],
  ];
  for (const [label, actual, expected] of cases)
    it(`gives p = ${expected} for ${label}`, () => {
      near(actual, expected, 1e-5);
    });
  it("gives p = 1 at zero", () => {
    assert.equal(tTestP(0, 10), 1);
    assert.equal(fTestP(0, 2, 10), 1);
    assert.equal(chiSquareP(0, 3), 1);
  });
  it("is two-tailed for t", () => {
    near(tTestP(-2.228139, 10), tTestP(2.228139, 10));
  });
  it("gives zero for infinite statistics", () => {
    assert.equal(tTestP(Infinity, 5), 0);
    assert.equal(fTestP(Infinity, 1, 5), 0);
  });
});

describe("descriptive statistics", () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];
  it("gives the mean and sample variance", () => {
    assert.equal(mean(data), 5);
    near(variance(data), 32 / 7);
    near(standardDeviation(data), Math.sqrt(32 / 7));
  });
  it("gives NaN variance for one value", () => {
    assert.ok(Number.isNaN(variance([3])));
  });
  it("gives the adjusted skewness and excess kurtosis SPSS reports", () => {
    near(skewness(data), 0.8184875533567995, 1e-9);
    near(kurtosis(data), 0.940625, 1e-9);
  });
  it("gives zero skewness for symmetric data", () => {
    near(skewness([1, 2, 3, 4, 5]), 0);
  });
  it("needs three values for skewness and four for kurtosis", () => {
    assert.ok(Number.isNaN(skewness([1, 2])));
    assert.ok(Number.isNaN(kurtosis([1, 2, 3])));
  });
  it("gives NaN when every value is the same", () => {
    assert.ok(Number.isNaN(skewness([3, 3, 3, 3])));
  });
});

describe("correlation", () => {
  it("gives Pearson's r with its p-value", () => {
    const result = pearson([1, 2, 3, 4, 5], [2, 1, 4, 3, 5]);
    near(result.r, 0.8);
    assert.equal(result.n, 5);
    near(result.p, tTestP((0.8 * Math.sqrt(3)) / Math.sqrt(1 - 0.64), 3));
  });
  it("uses only complete pairs", () => {
    assert.equal(pearson([1, 2, null, 4, 5], [2, 1, 4, null, 5]).n, 3);
  });
  it("gives r = −1 and p = 0 for a perfect negative line", () => {
    const result = pearson([1, 2, 3], [6, 4, 2]);
    near(result.r, -1);
    assert.equal(result.p, 0);
  });
  it("gives NaN when a variable doesn't vary or pairs are too few", () => {
    assert.ok(Number.isNaN(pearson([1, 1, 1], [1, 2, 3]).r));
    assert.ok(Number.isNaN(pearson([1, 2], [1, 2]).r));
  });
  it("averages tied ranks", () => {
    assert.deepEqual(ranks([10, 20, 20, 30]), [1, 2.5, 2.5, 4]);
  });
  it("gives Spearman's rho as r of the ranks", () => {
    near(spearman([1, 2, 3, 4, 5], [1, 4, 9, 16, 25]).r, 1);
    near(spearman([1, 2, 3, 4], [4, 3, 2, 1]).r, -1);
  });
});

describe("Cronbach's alpha", () => {
  it("matches 2r / (1 + r) for two items of equal variance", () => {
    near(cronbachAlpha([[1, 2, 3, 4, 5], [2, 1, 4, 3, 5]]).alpha, (2 * 0.8) / 1.8);
  });
  it("gives 1 for identical items", () => {
    near(cronbachAlpha([[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]).alpha, 1);
  });
  it("uses participants who answered every item", () => {
    const result = cronbachAlpha([[1, 2, 3, null, 5], [2, 1, 4, 3, 5]]);
    assert.equal(result.n, 4);
    assert.equal(result.items, 2);
  });
  it("gives item–total correlations and alpha if deleted", () => {
    const result = cronbachAlpha([[1, 2, 3, 4, 5], [2, 1, 4, 3, 5], [1, 3, 2, 5, 4]]);
    assert.equal(result.itemTotal.length, 3);
    assert.ok(result.itemTotal.every((item) => item.r > 0 && item.r <= 1));
    near(result.itemTotal[2].alphaIfDeleted, cronbachAlpha([[1, 2, 3, 4, 5], [2, 1, 4, 3, 5]]).alpha);
  });
  it("gives the mean and SD of the mean item score", () => {
    const result = cronbachAlpha([[1, 3], [3, 5]]);
    assert.equal(result.scaleMean, 3);
    near(result.scaleSd, Math.sqrt(2));
  });
  it("is negative when an item runs the other way", () => {
    assert.ok(cronbachAlpha([[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [1, 2, 3, 4, 4]]).alpha < 0.5);
  });
});

describe("composite reliability and AVE", () => {
  it("follows the standard formulas", () => {
    const loadings = [0.82, 0.79, 0.85];
    const sum = 0.82 + 0.79 + 0.85;
    near(compositeReliability(loadings), (sum * sum) / (sum * sum + (1 - 0.82 ** 2) + (1 - 0.79 ** 2) + (1 - 0.85 ** 2)));
    near(averageVarianceExtracted(loadings), (0.82 ** 2 + 0.79 ** 2 + 0.85 ** 2) / 3);
  });
  it("gives 1 for perfect loadings", () => {
    near(compositeReliability([1, 1]), 1);
    near(averageVarianceExtracted([1, 1]), 1);
  });
});

describe("chiSquareTest", () => {
  it("matches a hand calculation for a 2 × 2 table", () => {
    const result = chiSquareTest([
      [10, 20],
      [30, 40],
    ]);
    near(result.chi2, 0.7936507936507936);
    assert.equal(result.df, 1);
    near(result.p, 0.3729984836134872);
    near(result.cramersV, Math.sqrt(0.7936507936507936 / 100));
    assert.equal(result.minExpected, 12);
    assert.equal(result.smallExpected, 0);
  });
  it("gives df = (rows − 1)(columns − 1)", () => {
    assert.equal(chiSquareTest([[5, 5, 5], [5, 5, 5], [5, 5, 5]]).df, 4);
  });
  it("gives χ² = 0 for proportional rows", () => {
    near(chiSquareTest([[10, 20], [20, 40]]).chi2, 0);
  });
  it("reports the share of small expected counts", () => {
    assert.equal(chiSquareTest([[1, 2], [3, 4]]).smallExpected, 1);
  });
  it("ignores empty rows and columns", () => {
    const result = chiSquareTest([[10, 0, 20], [30, 0, 40]]);
    assert.equal(result.df, 1);
  });
  it("gives NaN p when there is only one category", () => {
    assert.ok(Number.isNaN(chiSquareTest([[10, 20]]).p));
  });
});
