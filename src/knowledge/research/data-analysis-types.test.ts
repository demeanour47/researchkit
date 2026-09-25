import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ANALYSIS_FAMILY_LABELS, ANALYSIS_METHODS, ANALYSIS_METHOD_IDS, NON_PARAMETRIC_ALTERNATIVE, RECOMMENDATION_STRENGTHS, STRENGTH_LABELS, getAnalysisMethod, type AnalysisMethodId } from "./data-analysis-types";

describe("ANALYSIS_METHODS", () => {
  it("covers every method the recommender names, once each, in catalogue order", () => {
    assert.equal(ANALYSIS_METHODS.length, 37);
    assert.deepEqual(
      ANALYSIS_METHODS.map((method) => method.id),
      [...ANALYSIS_METHOD_IDS],
    );
    assert.deepEqual(
      ANALYSIS_METHODS.map((method) => method.name),
      [
        "Descriptive statistics",
        "Frequency",
        "Percentage",
        "Mean",
        "Median",
        "Standard deviation",
        "Reliability",
        "Cronbach's alpha",
        "Validity",
        "Kaiser–Meyer–Olkin (KMO) measure",
        "Bartlett's test of sphericity",
        "Factor analysis",
        "Correlation",
        "Pearson correlation",
        "Spearman's rank correlation",
        "Regression",
        "Simple linear regression",
        "Multiple regression",
        "Hierarchical regression",
        "Logistic regression",
        "Moderation analysis",
        "Mediation analysis",
        "Independent-samples t-test",
        "Paired-samples t-test",
        "One-way ANOVA",
        "Two-way ANOVA",
        "MANOVA",
        "ANCOVA",
        "Repeated measures ANOVA",
        "Chi-square test of independence",
        "Fisher's exact test",
        "Wilcoxon signed-rank test",
        "Mann–Whitney U test",
        "Kruskal–Wallis test",
        "Structural equation modelling",
        "PLS-SEM",
        "CB-SEM",
      ],
    );
  });

  for (const method of ANALYSIS_METHODS) {
    it(`explains ${method.name}: its purpose, when it suits, assumptions and limitations, with no invented references`, () => {
      assert.ok(method.purpose.endsWith("."), "purpose");
      assert.ok(method.suitableWhen.endsWith("."), "when it suits");
      assert.ok(method.assumptions.length >= 1 && method.assumptions.every((item) => item.endsWith(".")), "assumptions");
      assert.ok(method.limitations.length >= 1 && method.limitations.every((item) => item.endsWith(".")), "limitations");
      assert.deepEqual(method.references, [], "references await academic review");
      assert.ok(ANALYSIS_FAMILY_LABELS[method.family]);
      for (const covered of method.covers) assert.ok(ANALYSIS_METHOD_IDS.includes(covered), `${method.id} covers ${covered}`);
    });
  }

  it("groups methods under family entries that cover only more specific methods", () => {
    const umbrellas = ANALYSIS_METHODS.filter((method) => method.covers.length > 0).map((method) => method.id);
    assert.deepEqual(umbrellas, ["descriptive-statistics", "reliability", "validity", "correlation", "regression", "sem"]);
    for (const id of umbrellas) assert.ok(!getAnalysisMethod(id).covers.some((covered) => umbrellas.includes(covered)), id);
  });

  it("never describes a method as invalid, forbidden or impossible", () => {
    const text = JSON.stringify(ANALYSIS_METHODS).toLowerCase();
    for (const word of ["invalid", "forbidden", "impossible", "never use", "must not"]) assert.ok(!text.includes(word), word);
  });
});

describe("NON_PARAMETRIC_ALTERNATIVE", () => {
  it("pairs each parametric method with a non-parametric one answering the same question", () => {
    for (const [parametric, alternative] of Object.entries(NON_PARAMETRIC_ALTERNATIVE) as [AnalysisMethodId, AnalysisMethodId][]) {
      assert.equal(getAnalysisMethod(parametric).parametric, true, parametric);
      assert.equal(getAnalysisMethod(alternative).parametric, false, alternative);
    }
    assert.equal(NON_PARAMETRIC_ALTERNATIVE["independent-t-test"], "mann-whitney");
    assert.equal(NON_PARAMETRIC_ALTERNATIVE["paired-t-test"], "wilcoxon");
    assert.equal(NON_PARAMETRIC_ALTERNATIVE["one-way-anova"], "kruskal-wallis");
    assert.equal(NON_PARAMETRIC_ALTERNATIVE.pearson, "spearman");
  });

  it("gives repeated measures ANOVA none, since its counterpart isn't among the methods covered", () => {
    assert.equal(NON_PARAMETRIC_ALTERNATIVE["repeated-measures-anova"], undefined);
  });
});

describe("strengths", () => {
  it("uses only the three verdicts, labelled in words", () => {
    assert.deepEqual([...RECOMMENDATION_STRENGTHS], ["strong", "possible", "justify"]);
    assert.deepEqual(Object.values(STRENGTH_LABELS), ["Strong recommendation", "Possible recommendation", "Needs justification"]);
  });
});

describe("getAnalysisMethod", () => {
  it("finds methods and rejects unknown ids", () => {
    assert.equal(getAnalysisMethod("kruskal-wallis").family, "difference");
    assert.throws(() => getAnalysisMethod("astrology" as AnalysisMethodId), { name: "RangeError", message: "Unknown analysis method: astrology" });
  });
});
