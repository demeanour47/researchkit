import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ANALYSIS_METHOD_IDS, NON_PARAMETRIC_ALTERNATIVE, getAnalysisMethod } from "../data-analysis-types";
import { ASSUMPTION_IDS, type AssumptionId } from "./catalogue";
import { ASSUMPTION_METHODS, METHOD_GUIDES, getMethodGuide, isAssumptionMethod, type AssumptionMethod } from "./methods";

describe("ASSUMPTION_METHODS", () => {
  it("covers the 19 analyses the checker supports, all known to the analysis catalogue", () => {
    assert.equal(ASSUMPTION_METHODS.length, 19);
    for (const method of ASSUMPTION_METHODS) assert.ok(ANALYSIS_METHOD_IDS.includes(method), method);
    assert.deepEqual(Object.keys(METHOD_GUIDES), [...ASSUMPTION_METHODS]);
  });

  it("recognises supported methods", () => {
    assert.equal(isAssumptionMethod("ancova"), true);
    assert.equal(isAssumptionMethod("fisher-exact"), false);
    assert.equal(isAssumptionMethod("astrology"), false);
    assert.throws(() => getMethodGuide("fisher-exact" as AssumptionMethod), { message: "No assumption guide for: fisher-exact" });
  });
});

describe("METHOD_GUIDES", () => {
  for (const method of ASSUMPTION_METHODS) {
    it(`gives ${method} its assumptions, alternatives, a reporting example and common mistakes`, () => {
      const guide = METHOD_GUIDES[method];
      assert.equal(guide.method, method);
      assert.ok(guide.assumptions.length >= 2, "at least two assumptions");
      assert.equal(new Set(guide.assumptions).size, guide.assumptions.length, "no assumption repeated");
      for (const id of guide.assumptions) assert.ok(ASSUMPTION_IDS.includes(id), id);
      assert.ok(guide.reporting.startsWith("Example: ") && guide.reporting.endsWith("."));
      assert.ok(guide.mistakes.length >= 1 && guide.mistakes.every((mistake) => mistake.endsWith(".")));
      for (const alternative of [...guide.alternatives, ...guide.nonParametric]) {
        assert.ok(alternative.when.endsWith("."), alternative.name);
        if (alternative.method) assert.equal(alternative.name, getAnalysisMethod(alternative.method).name, "names come from the catalogue");
      }
      assert.ok(guide.alternatives.length + guide.nonParametric.length >= 1 || method === "factor-analysis", "something to use instead");
    });
  }

  const expected: Record<AssumptionMethod, AssumptionId[]> = {
    "descriptive-statistics": ["distribution-shape", "outliers"],
    correlation: ["numeric-measurement", "independence", "linearity", "normality", "outliers"],
    pearson: ["numeric-measurement", "independence", "linearity", "normality", "outliers"],
    spearman: ["ordinal-measurement", "independence", "monotonicity"],
    "simple-regression": ["numeric-measurement", "independence", "linearity", "normality-of-residuals", "homoscedasticity", "independent-errors", "outliers"],
    "multiple-regression": ["numeric-measurement", "independence", "linearity", "normality-of-residuals", "homoscedasticity", "independent-errors", "outliers", "multicollinearity"],
    "hierarchical-regression": ["numeric-measurement", "independence", "linearity", "normality-of-residuals", "homoscedasticity", "independent-errors", "outliers", "multicollinearity"],
    "logistic-regression": ["binary-outcome", "independence", "linearity-of-logit", "multicollinearity", "events-per-predictor", "outliers"],
    "independent-t-test": ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers"],
    "paired-t-test": ["numeric-measurement", "paired-observations", "normality-of-differences", "outliers"],
    "one-way-anova": ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers", "group-sizes"],
    "two-way-anova": ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers", "group-sizes"],
    "repeated-measures-anova": ["numeric-measurement", "paired-observations", "normality", "sphericity", "outliers"],
    ancova: ["numeric-measurement", "independence", "normality-of-residuals", "homogeneity-of-variance", "linearity", "homogeneity-of-slopes", "covariate-independence", "outliers"],
    manova: ["numeric-measurement", "independence", "multivariate-normality", "homogeneity-of-covariance", "related-outcomes", "multivariate-outliers", "group-sizes"],
    "chi-square": ["categorical-variables", "independence", "expected-counts"],
    "factor-analysis": ["factorability", "factor-sample-size", "linearity", "outliers"],
    sem: ["numeric-measurement", "independence", "multivariate-normality", "multivariate-outliers", "model-identification", "sem-sample-size", "measurement-model-quality", "discriminant-validity"],
    "pls-sem": ["independence", "measurement-model-quality", "discriminant-validity", "structural-collinearity", "sem-sample-size"],
  };
  for (const method of ASSUMPTION_METHODS) {
    it(`checks the textbook assumptions of ${method}, in the usual order`, () => {
      assert.deepEqual([...METHOD_GUIDES[method].assumptions], expected[method]);
    });
  }

  it("never asks logistic regression, chi-square or PLS-SEM for normality", () => {
    for (const method of ["logistic-regression", "chi-square", "pls-sem", "spearman"] as const) {
      assert.ok(!METHOD_GUIDES[method].assumptions.some((id) => id.startsWith("normality") || id === "multivariate-normality"), method);
    }
  });
});

describe("alternatives", () => {
  const names = (method: AssumptionMethod, group: "alternatives" | "nonParametric") => METHOD_GUIDES[method][group].map((alternative) => alternative.name);

  it("uses the catalogue's non-parametric counterparts where it has them", () => {
    assert.deepEqual(names("independent-t-test", "nonParametric"), [getAnalysisMethod(NON_PARAMETRIC_ALTERNATIVE["independent-t-test"]!).name]);
    assert.deepEqual(names("paired-t-test", "nonParametric"), ["Wilcoxon signed-rank test"]);
    assert.deepEqual(names("one-way-anova", "nonParametric"), ["Kruskal–Wallis test"]);
    assert.deepEqual(names("pearson", "nonParametric"), ["Spearman's rank correlation"]);
    assert.deepEqual(names("chi-square", "nonParametric"), ["Fisher's exact test"]);
  });

  it("names non-parametric methods the catalogue doesn't cover", () => {
    assert.deepEqual(names("repeated-measures-anova", "nonParametric"), ["Friedman test"]);
    assert.deepEqual(names("ancova", "nonParametric"), ["Quade's rank analysis of covariance"]);
    assert.deepEqual(names("manova", "nonParametric"), ["Permutation MANOVA (PERMANOVA)"]);
    assert.deepEqual(names("two-way-anova", "nonParametric"), ["Aligned rank transform ANOVA"]);
    for (const alternative of METHOD_GUIDES["repeated-measures-anova"].nonParametric) assert.equal(alternative.method, null);
  });

  it("offers the usual corrections when assumptions fail", () => {
    assert.ok(names("independent-t-test", "alternatives").includes("Welch's t-test"));
    assert.ok(names("one-way-anova", "alternatives").includes("Welch's ANOVA with Games–Howell post hoc tests"));
    assert.ok(names("repeated-measures-anova", "alternatives").includes("Greenhouse–Geisser or Huynh–Feldt correction"));
    assert.ok(names("multiple-regression", "alternatives").includes("Robust (heteroscedasticity-consistent) standard errors"));
    assert.ok(names("sem", "alternatives").includes("Robust maximum likelihood (Satorra–Bentler)"));
    assert.ok(names("logistic-regression", "alternatives").includes("Penalised (Firth) logistic regression"));
  });

  it("points SEM to PLS-SEM and PLS-SEM to CB-SEM", () => {
    assert.deepEqual(METHOD_GUIDES.sem.nonParametric.map((alternative) => alternative.method), ["pls-sem"]);
    assert.deepEqual(METHOD_GUIDES["pls-sem"].alternatives.map((alternative) => alternative.method), ["cb-sem"]);
  });
});

describe("reporting examples", () => {
  it("mention the checks their method needs", () => {
    assert.match(METHOD_GUIDES["independent-t-test"].reporting, /Levene's test/);
    assert.match(METHOD_GUIDES["repeated-measures-anova"].reporting, /Mauchly's test.*Greenhouse–Geisser/);
    assert.match(METHOD_GUIDES.ancova.reporting, /interaction was not significant/);
    assert.match(METHOD_GUIDES.manova.reporting, /Box's M/);
    assert.match(METHOD_GUIDES["factor-analysis"].reporting, /Kaiser–Meyer–Olkin.*Bartlett's test/);
    assert.match(METHOD_GUIDES["pls-sem"].reporting, /HTMT/);
    assert.match(METHOD_GUIDES["multiple-regression"].reporting, /VIF/);
    assert.match(METHOD_GUIDES["chi-square"].reporting, /expected counts/);
  });

  it("are consistent with their own thresholds", () => {
    assert.match(METHOD_GUIDES.manova.reporting, /not significant at the \.001 level, M = 18\.42, p = \.042/, "p = .042 is above .001");
    assert.match(METHOD_GUIDES["repeated-measures-anova"].reporting, /p = \.015.*Greenhouse–Geisser.*ε = \.68/, "a violation, then the correction the threshold calls for (ε below .75)");
  });
});
