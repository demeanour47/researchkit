import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretNumbers } from "./interpret";
import { COMMON_MISTAKES } from "./mistakes";
import { input, VALID } from "./test-helpers";
import { RESULT_KINDS, type ResultKind } from "./types";

const read = (kind: ResultKind, values: Record<string, number> = { ...VALID[kind] }, extra = {}) => interpretNumbers(input(kind, values, extra));

describe("every kind", () => {
  for (const kind of RESULT_KINDS) {
    it(`explains ${kind} fully: meaning, numbers, plain and academic wording, implication and mistakes`, () => {
      const result = read(kind);
      assert.equal(result.kind, kind);
      assert.ok(result.name.length > 0);
      for (const text of [result.meaning, result.plain, result.academic, result.implication, result.significance.statement, result.significance.meaning]) {
        assert.ok(text.length > 20 && /[.)]$/.test(text), `${kind}: “${text}”`);
        assert.ok(!/undefined|NaN|\[object/.test(text), `${kind}: “${text}”`);
      }
      assert.ok(result.statistics.length > 0);
      assert.deepEqual(result.mistakes, COMMON_MISTAKES[kind]);
      assert.ok(result.mistakes.length >= 2);
      assert.ok(!/\bprove[sd]?\b(?! )/.test(result.plain), "never claims proof");
    });
  }

  it("uses placeholder names when no variables are chosen", () => {
    const result = interpretNumbers(input("pearson", VALID.pearson, { variables: [] }));
    assert.match(result.plain, /higher the predictor tended to go with higher the outcome/);
  });
});

describe("descriptive results", () => {
  it("describes the mean, spread and range", () => {
    const result = read("descriptive-statistics", { n: 120, mean: 3.4, sd: 0.8, min: 1, max: 5 });
    assert.equal(result.plain, "Across 120 participants, screen time averaged 3.4, and values typically lay about 0.8 from that average, range 1 to 5.");
    assert.equal(result.academic, "Screen time had a mean of 3.40 (SD = 0.80, N = 120).");
    assert.equal(result.significance.status, "no-test");
    assert.equal(result.testsHypothesis, false);
  });

  it("spots skew from the mean and median", () => {
    const right = read("descriptive-statistics", { n: 120, mean: 4, sd: 1, median: 3 });
    assert.match(right.plain, /right skew/);
    assert.ok(right.warnings.some((warning) => warning.includes("mean and median differ")));
    assert.match(read("descriptive-statistics", { n: 120, mean: 3, sd: 1, median: 4 }).plain, /left skew/);
    assert.ok(!/skew/.test(read("descriptive-statistics", { n: 120, mean: 3.1, sd: 1, median: 3 }).plain), "a small gap isn't skew");
  });

  it("notes when there is no variation, and small samples", () => {
    assert.match(read("descriptive-statistics", { n: 10, mean: 3, sd: 0 }).plain, /no variation/);
    assert.ok(read("descriptive-statistics", { n: 10, mean: 3, sd: 1 }).warnings.includes("With only 10 participants, the estimate is imprecise; treat it with caution."));
  });

  it("derives a frequency's percentage and warns about small totals", () => {
    const result = read("frequency", { count: 3, total: 12 });
    assert.equal(result.plain, "3 of 12 participants (25.0%) were in this category of screen time.");
    assert.equal(result.warnings[0], "With a total of 12, each participant changes the percentage by 8.3 points, so small differences mean little.");
    assert.deepEqual(read("frequency", { count: 0, total: 50 }).warnings, []);
  });

  it("asks for a percentage's base", () => {
    assert.ok(read("percentage", { percentage: 25 }).warnings[0].startsWith("Report the number the percentage is of"));
    assert.equal(read("percentage", { percentage: 25, total: 200 }).academic, "25.0% of participants (N = 200) were in this category of screen time.");
  });

  it("places a mean or median on its scale", () => {
    assert.match(read("mean", { mean: 3.8, sd: 0.7, scaleMin: 1, scaleMax: 5 }).plain, /a mean of 3.8 is above the midpoint of 3\./);
    assert.match(read("mean", { mean: 2.2, scaleMin: 1, scaleMax: 5 }).plain, /below the midpoint/);
    assert.match(read("median", { median: 4, scaleMin: 1, scaleMax: 7 }).plain, /at the midpoint of 4\./);
    assert.ok(read("mean", { mean: 3 }).warnings[0].startsWith("Report the standard deviation"));
    assert.equal(read("mean", { mean: 3, sd: 1, n: 40 }).academic, "The mean screen time was 3.00 (SD = 1.00, N = 40).");
  });

  it("describes spread against the scale and the mean", () => {
    const result = read("standard-deviation", { sd: 1.2, mean: 3, scaleMin: 1, scaleMax: 5 });
    assert.match(result.plain, /That is 30% of the scale's range of 4\./);
    assert.match(result.plain, /the spread is 40% \(the coefficient of variation/);
    assert.match(read("standard-deviation", { sd: 0 }).plain, /no variation/);
    assert.ok(read("standard-deviation", { sd: 1 }).warnings[0].startsWith("Report the mean"));
  });
});

describe("Cronbach's alpha", () => {
  it("labels consistency and says whether to combine the items", () => {
    const good = read("cronbach-alpha", { alpha: 0.84, items: 6 });
    assert.equal(good.magnitude?.label, "good");
    assert.equal(good.academic, "The screen time scale showed good internal consistency (Cronbach's α = .84, k = 6).");
    assert.match(good.implication, /can reasonably be combined/);
    assert.match(read("cronbach-alpha", { alpha: 0.62 }).implication, /needs justifying/);
    assert.match(read("cronbach-alpha", { alpha: 0.4 }).plain, /not consistent enough/);
  });

  it("warns about negative, very high and two-item alphas", () => {
    assert.match(read("cronbach-alpha", { alpha: -0.2 }).warnings[0], /reverse-worded item/);
    assert.match(read("cronbach-alpha", { alpha: 0.97 }).warnings[0], /repeat each other/);
    assert.match(read("cronbach-alpha", { alpha: 0.75, items: 2 }).warnings[0], /only two items/);
  });
});

describe("correlations", () => {
  it("interprets a significant negative Pearson correlation", () => {
    const result = read("pearson", { r: -0.34, p: 0.002, n: 120 });
    assert.deepEqual([result.significance.status, result.direction, result.magnitude?.label], ["significant", "negative", "medium"]);
    assert.equal(result.plain, "In this sample, higher screen time tended to go with lower sleep quality. The relationship is medium.");
    assert.equal(result.academic, "There was a statistically significant medium negative correlation between screen time and sleep quality, r(118) = -.34, p = .002.");
    assert.deepEqual(result.statistics.map((line) => `${line.symbol} ${line.value}`), ["r -.34", "r² .12", "p .002"]);
  });

  it("interprets a non-significant correlation without claiming no relationship", () => {
    const result = read("pearson", { r: 0.12, p: 0.21 });
    assert.equal(result.significance.status, "not-significant");
    assert.match(result.plain, /doesn't show a reliable relationship.*could be chance/);
    assert.equal(result.academic, "There was no statistically significant correlation between screen time and sleep quality, r = .12, p = .210.");
    assert.match(result.implication, /A larger sample might detect/);
  });

  it("reports Spearman's rho with its symbol and without r squared", () => {
    const result = read("spearman", { r: 0.45, p: 0.0001, n: 52 });
    assert.equal(result.academic, "There was a statistically significant medium positive correlation between screen time and sleep quality, rₛ(50) = .45, p < .001.");
    assert.ok(!result.statistics.some((line) => line.symbol === "r²"));
    assert.match(result.meaning, /ranks/);
  });

  it("treats the generic correlation like Pearson", () => {
    assert.equal(read("correlation", { r: 0.5, p: 0.01 }).magnitude?.label, "large");
  });

  it("warns about very strong, negligible-but-significant and small-sample correlations", () => {
    assert.match(read("pearson", { r: 0.93, p: 0.001, n: 100 }).warnings[0], /overlap or measure the same thing/);
    assert.match(read("pearson", { r: 0.05, p: 0.01, n: 3000 }).warnings[0], /tiny relationships reach significance/);
    assert.match(read("pearson", { r: 0.4, p: 0.04, n: 25 }).warnings[0], /only 25 participants/);
  });

  it("describes a zero correlation as having no direction", () => {
    const result = read("pearson", { r: 0, p: 1 });
    assert.equal(result.direction, "none");
    assert.match(result.statistics[0].meaning, /^A negligible relationship$/);
  });

  it("follows the chosen significance level", () => {
    assert.equal(read("pearson", { r: 0.3, p: 0.03 }, { alpha: 0.01 }).significance.status, "not-significant");
    assert.equal(read("pearson", { r: 0.3, p: 0.07 }, { alpha: 0.1 }).significance.status, "significant");
  });
});

describe("regression", () => {
  it("interprets a simple regression's slope and R²", () => {
    const result = read("simple-regression", { b: -0.45, beta: -0.32, r2: 0.1, p: 0.003, n: 100 });
    assert.equal(result.plain, "Each one-unit increase in screen time went with a 0.45-unit decrease in sleep quality, and screen time explains 10% of the variation in sleep quality.");
    assert.equal(result.academic, "Screen time significantly predicted sleep quality, B = -0.45, β = -.32, p = .003, R² = .10.");
    assert.deepEqual([result.direction, result.magnitude?.label], ["negative", "small"]);
  });

  it("judges size from β when R² isn't given, and warns about signs that disagree", () => {
    assert.equal(read("simple-regression", { b: 2, beta: 0.35, p: 0.01 }).magnitude?.label, "medium");
    assert.equal(read("simple-regression", { b: 2, p: 0.01 }).magnitude, null);
    assert.match(read("simple-regression", { b: 2, beta: -0.3, p: 0.01 }).warnings[0], /opposite signs/);
    assert.match(read("simple-regression", { b: 2, p: 0.4 }).plain, /didn't reliably predict/);
  });

  it("interprets a multiple regression model and one predictor within it", () => {
    const result = read("multiple-regression", { r2: 0.28, adjustedR2: 0.26, f: 12.4, p: 0.0001, beta: 0.31, predictorP: 0.002, predictors: 3, n: 150 });
    assert.equal(result.significance.status, "significant", "judged on the predictor");
    assert.equal(result.direction, "positive");
    assert.match(result.plain, /^Together, the predictors explain 28% of the variation in sleep quality, more than chance would\. Holding the other predictors constant, screen time was a significant predictor \(β = \.31, p = \.002\)\.$/);
    assert.match(result.academic, /^The model significantly predicted sleep quality, F = 12\.40, p < \.001, R² = \.28, adjusted R² = \.26\./);
    assert.equal(result.magnitude?.label, "large");
  });

  it("judges a multiple regression on the model when no predictor is given, and asks for the predictor's p", () => {
    const model = read("multiple-regression", { r2: 0.05, p: 0.2 });
    assert.equal(model.significance.status, "not-significant");
    assert.equal(model.direction, null);
    assert.match(model.plain, /don't reliably explain/);
    assert.match(read("multiple-regression", { r2: 0.2, p: 0.01, beta: 0.3 }).warnings.join(" "), /Enter the predictor's p-value/);
    assert.match(read("multiple-regression", { r2: 0.3, adjustedR2: 0.2, p: 0.01 }).warnings.join(" "), /Adjusted R² is noticeably below R²/);
  });

  it("interprets the change in a hierarchical regression", () => {
    const result = read("hierarchical-regression", { r2Change: 0.06, pChange: 0.004, r2: 0.25, fChange: 8.9 });
    assert.equal(result.plain, "Adding screen time explained an extra 6.0% of the variation in sleep quality beyond the earlier steps.");
    assert.equal(result.academic, "Adding screen time in the final step significantly increased the variance explained in sleep quality, ΔR² = .06, ΔF = 8.90, p = .004.");
    assert.equal(result.magnitude?.label, "small", "f² = .06 / .75 = .08");
    assert.match(read("hierarchical-regression", { r2Change: 0.01, pChange: 0.3 }).academic, /did not significantly increase/);
  });

  it("interprets an odds ratio in both directions", () => {
    const higher = read("logistic-regression", { oddsRatio: 1.45, ciLower: 1.1, ciUpper: 1.9, p: 0.008 });
    assert.equal(higher.plain, "For each one-unit increase in screen time, the odds of sleep quality were 45% higher.");
    assert.equal(higher.academic, "Screen time was a significant predictor of sleep quality, OR = 1.45, 95% CI [1.10, 1.90], p = .008.");
    assert.deepEqual(higher.warnings, []);
    const lower = read("logistic-regression", { oddsRatio: 0.6, p: 0.01 });
    assert.equal(lower.direction, "negative");
    assert.match(lower.statistics[0].meaning, /40% lower/);
    assert.match(lower.warnings.join(" "), /Report the odds ratio's confidence interval/);
  });

  it("warns when an odds ratio's interval and p disagree, or the interval is very wide", () => {
    assert.match(read("logistic-regression", { oddsRatio: 1.45, ciLower: 1.1, ciUpper: 1.9, p: 0.3 }).warnings[0], /disagree/);
    assert.match(read("logistic-regression", { oddsRatio: 1.5, ciLower: 0.8, ciUpper: 2.9, p: 0.01 }).warnings[0], /disagree/);
    assert.deepEqual(read("logistic-regression", { oddsRatio: 1.5, ciLower: 0.8, ciUpper: 2.9, p: 0.2 }).warnings, [], "consistent at .05");
    assert.deepEqual(read("logistic-regression", { oddsRatio: 1.5, ciLower: 1.1, ciUpper: 2.9, p: 0.2 }, { alpha: 0.1 }).warnings, [], "a 95% interval isn't compared with a 10% level");
    assert.match(read("logistic-regression", { oddsRatio: 3, ciLower: 0.5, ciUpper: 18, p: 0.2 }).warnings.join(" "), /very wide/);
  });
});

describe("t-tests", () => {
  it("interprets an independent t-test with group means and d", () => {
    const result = read("independent-t-test", { t: 2.1, df: 58, p: 0.04, mean1: 3.9, mean2: 3.4, d: 0.54 });
    assert.equal(result.plain, "Sleep quality was higher in the first screen time group (M = 3.90) than in the second group (M = 3.40); the difference is unlikely to be chance and is medium in size.");
    assert.equal(result.academic, "There was a statistically significant difference in sleep quality between the screen time groups, t(58) = 2.10, p = .040, d = 0.54.");
    assert.deepEqual(result.warnings, []);
    assert.equal(result.direction, "positive");
  });

  it("describes a lower first group, and uses t's sign without means", () => {
    assert.match(read("independent-t-test", { t: -2.5, df: 40, p: 0.02, mean1: 2, mean2: 3, d: -0.8 }).plain, /^Sleep quality was lower in the first screen time group/);
    assert.equal(read("independent-t-test", { t: -2.5, df: 40, p: 0.02 }).direction, "negative");
  });

  it("warns when t's sign contradicts the means, when d is missing, or when a significant d is negligible", () => {
    assert.match(read("independent-t-test", { t: -2.1, df: 58, p: 0.04, mean1: 3.9, mean2: 3.4, d: 0.5 }).warnings[0], /sign of t doesn't match/);
    assert.match(read("independent-t-test", { t: 2.1, df: 58, p: 0.04 }).warnings[0], /Report Cohen's d/);
    assert.match(read("independent-t-test", { t: 2.1, df: 3000, p: 0.04, d: 0.1 }).warnings[0], /negligible in size/);
  });

  it("interprets a paired t-test as a change over time", () => {
    const result = read("paired-t-test", { t: 3.2, df: 29, p: 0.003, mean1: 4.1, mean2: 3.2, d: 0.6 });
    assert.match(result.plain, /^Sleep quality was higher at the first time \(M = 4\.10\) than at the second time \(M = 3\.20\)/);
    assert.equal(result.academic, "There was a statistically significant difference in sleep quality between the two times, t(29) = 3.20, p = .003, d = 0.60.");
    assert.match(result.implication, /Without a comparison group/);
    assert.match(read("paired-t-test", { t: 0.8, df: 29, p: 0.43 }).plain, /doesn't show a reliable difference in sleep quality between the two times/);
  });

  it("writes Welch's decimal degrees of freedom as entered", () => {
    assert.match(read("independent-t-test", { t: 2.3, df: 41.7, p: 0.03 }).academic, /t\(41\.7\) = 2\.30/);
  });
});

describe("ANOVA", () => {
  it("interprets a one-way ANOVA and asks for post hoc tests", () => {
    const result = read("one-way-anova", { f: 4.56, df1: 2, df2: 117, p: 0.012, etaSquared: 0.07 });
    assert.equal(result.academic, "There was a statistically significant effect of screen time on sleep quality, F(2, 117) = 4.56, p = .012, η² = .07.");
    assert.equal(result.magnitude?.label, "medium");
    assert.match(result.warnings[0], /post hoc tests/);
  });

  it("notes a two-group ANOVA equals a t-test, and asks for an effect size", () => {
    const result = read("one-way-anova", { f: 3, df1: 1, df2: 60, p: 0.09 });
    assert.deepEqual(result.warnings, ["With two groups, one-way ANOVA gives the same answer as an independent t-test (F = t²).", "Report an effect size such as eta squared with F."]);
    assert.match(result.plain, /doesn't show that the screen time groups differ/);
  });

  it("interprets a two-way ANOVA's interaction first, then its main effects", () => {
    const result = read("two-way-anova", { fInteraction: 5.2, pInteraction: 0.02, partialEta: 0.05, fA: 8, pA: 0.005, fB: 1.1, pB: 0.3 });
    assert.equal(result.significance.status, "significant");
    assert.match(result.plain, /^The effect of screen time on sleep quality depends on the other factor\. The main effect of the first factor was significant, F = 8\.00, p = \.005\. The main effect of the second factor was not significant/);
    assert.match(result.warnings[0], /simple effects/);
    assert.equal(result.magnitude?.label, "small");
    assert.match(read("two-way-anova", { fInteraction: 0.4, pInteraction: 0.6 }).implication, /Each factor's effect can be described on its own/);
  });
});

describe("chi-square", () => {
  it("interprets an association with Cramér's V for a 2 × 2 table", () => {
    const result = read("chi-square", { chi2: 5.12, df: 1, p: 0.024, n: 200, cramersV: 0.16 });
    assert.equal(result.academic, "There was a statistically significant association between screen time and sleep quality, χ²(1, N = 200) = 5.12, p = .024, V = .16.");
    assert.equal(result.magnitude?.label, "small");
    assert.deepEqual(result.warnings, []);
  });

  it("needs the table's shape to judge V in a larger table", () => {
    assert.equal(read("chi-square", { chi2: 12, df: 4, p: 0.02, cramersV: 0.2 }).magnitude, null);
    assert.match(read("chi-square", { chi2: 12, df: 4, p: 0.02, cramersV: 0.2 }).warnings[0], /smaller of rows − 1 and columns − 1/);
    assert.equal(read("chi-square", { chi2: 12, df: 4, p: 0.02, cramersV: 0.2, smallerSide: 2 }).magnitude?.label, "small");
  });

  it("recommends Fisher's exact test for small expected counts, and asks for an effect size", () => {
    assert.match(read("chi-square", { chi2: 4, df: 1, p: 0.045, minExpected: 3.2, cramersV: 0.3 }).warnings[0], /below 5.*Fisher's exact test/);
    assert.match(read("chi-square", { chi2: 4, df: 1, p: 0.045 }).warnings[0], /Report an effect size such as Cramér's V/);
    assert.match(read("chi-square", { chi2: 1, df: 1, p: 0.3 }).plain, /doesn't show an association/);
  });
});

describe("measurement models", () => {
  it("judges a factor analysis suitable, and describes the factors", () => {
    const result = read("factor-analysis", { kmo: 0.82, bartlettP: 0.0001, factors: 3, variance: 64.2, lowestLoading: 0.52 });
    assert.equal(result.plain, "The items for screen time are suitable for factor analysis, and they grouped into 3 factors explaining 64.2% of the variance.");
    assert.equal(result.magnitude?.label, "meritorious");
    assert.equal(result.testsHypothesis, false);
    assert.deepEqual(result.warnings, []);
    assert.match(result.significance.statement, /^Bartlett's test: p < \.001 is below/);
  });

  it("flags a low KMO, a non-significant Bartlett's test, weak loadings and little variance explained", () => {
    const result = read("factor-analysis", { kmo: 0.55, bartlettP: 0.2, lowestLoading: 0.32, variance: 41 });
    assert.match(result.plain, /may not be suitable/);
    assert.equal(result.warnings.length, 4);
    assert.match(result.warnings.join(" "), /\.60 or more.*Bartlett's test isn't significant.*below about \.40.*leaving over half unexplained/);
  });

  it("judges SEM fit by commonly cited cut-offs", () => {
    const good = read("sem", { cfi: 0.96, rmsea: 0.04, srmr: 0.05, tli: 0.95 });
    assert.equal(good.plain, "By commonly cited cut-offs, the model fits the data well.");
    assert.equal(good.academic, "The model fits the data well (CFI = .960, RMSEA = .040, SRMR = .050, TLI = .950).");
    const mixed = read("sem", { cfi: 0.91, rmsea: 0.09 });
    assert.equal(mixed.plain, "By commonly cited cut-offs, the model doesn't fit the data well by some indices. RMSEA falls short.");
    assert.match(mixed.warnings[0], /indices disagree/);
    assert.match(read("sem", { cfi: 0.92, rmsea: 0.07 }).plain, /fits the data acceptably/);
  });

  it("explains that a significant SEM chi-square means misfit, often with large samples", () => {
    const result = read("sem", { cfi: 0.96, rmsea: 0.04, chi2P: 0.001 });
    assert.equal(result.significance.status, "significant");
    assert.match(result.significance.meaning, /differ from the data's.*even for good models/);
    assert.match(read("sem", { cfi: 0.96, rmsea: 0.04, chi2P: 0.3 }).significance.meaning, /supports the model's fit/);
    assert.equal(read("sem", { cfi: 0.96, rmsea: 0.04 }).significance.status, "no-test");
  });

  it("interprets a PLS-SEM path and its measurement quality", () => {
    const result = read("pls-sem", { path: 0.32, p: 0.0004, r2: 0.41, ave: 0.62, cr: 0.88, htmt: 0.71 });
    assert.equal(result.plain, "Screen time has a positive effect on sleep quality in the model. The model explains 41% of sleep quality's variance.");
    assert.equal(result.academic, "The path from screen time to sleep quality was significant, β = .32, p < .001; R² for sleep quality = .41.");
    assert.equal(result.magnitude?.label, "weak");
    assert.deepEqual(result.warnings, []);
  });

  it("flags low AVE, low or very high CR, and high HTMT", () => {
    assert.equal(read("pls-sem", { path: 0.3, p: 0.01, ave: 0.42, cr: 0.65, htmt: 0.93 }).warnings.length, 3);
    assert.match(read("pls-sem", { path: 0.3, p: 0.01, cr: 0.97 }).warnings[0], /redundant items/);
    assert.match(read("pls-sem", { path: 0.3, p: 0.01, htmt: 0.87 }).warnings[0], /passes the \.90 threshold but not the stricter \.85/);
  });
});
