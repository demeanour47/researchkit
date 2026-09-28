import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ANALYSIS_METHOD_IDS } from "../data-analysis-types";
import { FIT_LABELS, alternativesFor, answerProblems, assumptionCheckerCovers, assumptionsFor, describeSituation, findTests, interpreterCovers, type FinderResult } from "./finder";
import type { FinderAnswers } from "./questions";

const complete = (answers: FinderAnswers) => {
  const result = findTests(answers);
  assert.equal(result.status, "complete", JSON.stringify(result));
  return result as Extract<FinderResult, { status: "complete" }>;
};
const methods = (answers: FinderAnswers) => complete(answers).candidates.map((candidate) => [candidate.method, candidate.fit]);

const twoIndependent: FinderAnswers = { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "two", secondFactor: "no", covariate: "no", normality: "yes" };

describe("findTests: candidate tests for common situations", () => {
  it("one sample and a quantitative outcome: the one-sample t-test", () => {
    assert.deepEqual(methods({ purpose: "compare", comparison: "value", outcomeLevel: "ratio", normality: "yes" }), [["one-sample-t-test", "common"]]);
  });

  it("two independent groups and a quantitative outcome: the independent-samples t-test", () => {
    assert.deepEqual(methods(twoIndependent), [["independent-t-test", "common"]]);
  });

  it("two paired measurements of a quantitative outcome: the paired-samples t-test", () => {
    assert.deepEqual(methods({ purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "two", normality: "yes" }), [["paired-t-test", "common"]]);
  });

  it("two categorical variables: chi-square, with Fisher's exact test for small counts", () => {
    assert.deepEqual(methods({ purpose: "association", categoricalVariables: "two" }), [
      ["chi-square", "common"],
      ["fisher-exact", "also"],
    ]);
  });

  it("one categorical variable against expected shares: the goodness-of-fit test", () => {
    assert.deepEqual(methods({ purpose: "association", categoricalVariables: "one" }), [["chi-square-goodness-of-fit", "common"]]);
  });

  it("two quantitative variables examined together: Pearson correlation, with regression as a related option", () => {
    assert.deepEqual(methods({ purpose: "relationship", outcomeLevel: "interval", predictorLevel: "ratio", normality: "yes" }), [
      ["pearson", "common"],
      ["simple-regression", "also"],
    ]);
  });

  it("a quantitative outcome predicted from one quantitative predictor: simple linear regression", () => {
    assert.deepEqual(methods({ purpose: "predict", outcomeLevel: "interval", predictors: "one", predictorLevel: "ratio" }), [
      ["simple-regression", "common"],
      ["pearson", "also"],
    ]);
  });

  it("a quantitative outcome predicted from several predictors: multiple regression", () => {
    assert.deepEqual(methods({ purpose: "predict", outcomeLevel: "ratio", predictors: "several" }), [["multiple-regression", "common"]]);
  });

  it("a two-category outcome: logistic regression", () => {
    assert.deepEqual(methods({ purpose: "predict", outcomeLevel: "nominal", outcomeCategories: "two", predictors: "several" }), [["logistic-regression", "common"]]);
  });

  it("three or more independent groups: one-way ANOVA", () => {
    assert.deepEqual(methods({ ...twoIndependent, groups: "three-plus" }), [["one-way-anova", "common"]]);
  });

  it("two grouping variables: two-way ANOVA, with single-factor and regression options that may also fit", () => {
    const result = complete({ ...twoIndependent, secondFactor: "yes" });
    assert.deepEqual(
      result.candidates.map((candidate) => [candidate.method, candidate.fit]),
      [
        ["two-way-anova", "common"],
        ["independent-t-test", "also"],
        ["multiple-regression", "also"],
      ],
    );
    assert.match(result.candidates[1].caution!, /leaves out the second grouping variable/);
  });

  it("groups and a numeric covariate: ANCOVA", () => {
    const result = complete({ ...twoIndependent, covariate: "yes" });
    assert.deepEqual(
      result.candidates.map((candidate) => [candidate.method, candidate.fit]),
      [
        ["ancova", "common"],
        ["independent-t-test", "also"],
      ],
    );
    assert.match(result.candidates[1].caution!, /leaves out the covariate/);
  });

  it("three or more measurements of the same people: repeated measures ANOVA", () => {
    assert.deepEqual(methods({ purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "three-plus", normality: "yes" }), [["repeated-measures-anova", "common"]]);
  });

  it("ordinal outcomes: rank tests, with the parametric test only with justification", () => {
    assert.deepEqual(methods({ purpose: "compare", comparison: "independent", outcomeLevel: "ordinal", groups: "two" }), [
      ["mann-whitney", "common"],
      ["independent-t-test", "justify"],
    ]);
    assert.deepEqual(methods({ purpose: "compare", comparison: "paired", outcomeLevel: "ordinal", measurements: "two" }), [
      ["wilcoxon", "common"],
      ["paired-t-test", "justify"],
    ]);
    assert.deepEqual(methods({ purpose: "relationship", outcomeLevel: "ordinal", predictorLevel: "interval" }), [
      ["spearman", "common"],
      ["pearson", "justify"],
    ]);
  });

  it("describing a variable: summaries that suit its measurement level", () => {
    assert.deepEqual(methods({ purpose: "describe", outcomeLevel: "nominal" }), [
      ["mode", "common"],
      ["frequency", "common"],
      ["percentage", "also"],
    ]);
    assert.deepEqual(methods({ purpose: "describe", outcomeLevel: "ordinal" }), [
      ["median", "common"],
      ["frequency", "also"],
      ["mode", "also"],
    ]);
    assert.deepEqual(methods({ purpose: "describe", outcomeLevel: "ratio", normality: "yes" }), [
      ["mean", "common"],
      ["standard-deviation", "common"],
      ["median", "also"],
    ]);
    assert.deepEqual(methods({ purpose: "describe", outcomeLevel: "ratio", normality: "no" }), [
      ["median", "common"],
      ["mean", "also"],
      ["standard-deviation", "also"],
    ]);
  });
});

describe("findTests: missing information", () => {
  it("asks for the purpose first, and guesses nothing", () => {
    const result = findTests({});
    assert.equal(result.status, "incomplete");
    assert.deepEqual(result.status === "incomplete" && result.missing.map((entry) => entry.question), ["purpose"]);
  });

  it("says why it needs to know whether groups are independent or paired", () => {
    const result = findTests({ purpose: "compare" });
    assert.equal(result.status, "incomplete");
    if (result.status !== "incomplete") return;
    assert.deepEqual(result.missing.map((entry) => entry.question), ["comparison"]);
    assert.match(result.missing[0].why, /independent or paired/);
  });

  it("lists every question still needed, in the order they are asked", () => {
    const result = findTests({ purpose: "compare", comparison: "independent", outcomeLevel: "interval" });
    assert.equal(result.status, "incomplete");
    assert.deepEqual(result.status === "incomplete" && result.missing.map((entry) => entry.question), ["groups", "secondFactor", "covariate", "normality"]);
  });

  it("gives no candidates until everything that matters is answered", () => {
    const result = findTests({ ...twoIndependent, normality: undefined });
    assert.equal(result.status, "incomplete");
    assert.ok(!("candidates" in result));
  });
});

describe("findTests: normality", () => {
  it("leads with the rank-based test when the data aren't roughly normal", () => {
    const result = complete({ ...twoIndependent, normality: "no" });
    assert.deepEqual(
      result.candidates.map((candidate) => [candidate.method, candidate.fit]),
      [
        ["mann-whitney", "common"],
        ["independent-t-test", "also"],
      ],
    );
    assert.match(result.candidates[1].caution!, /aren't roughly normal/);
    assert.match(result.candidates[0].why.join(" "), /doesn't assume normality/);
  });

  it("adds the rank-based test as an option when normality isn't known yet", () => {
    const result = complete({ ...twoIndependent, normality: "unknown" });
    assert.deepEqual(
      result.candidates.map((candidate) => [candidate.method, candidate.fit]),
      [
        ["independent-t-test", "common"],
        ["mann-whitney", "also"],
      ],
    );
    assert.match(result.candidates[0].caution!, /Check normality/);
  });

  it("does the same for paired measurements, three or more groups and correlation", () => {
    assert.deepEqual(methods({ purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "two", normality: "no" }), [
      ["wilcoxon", "common"],
      ["paired-t-test", "also"],
    ]);
    assert.deepEqual(methods({ ...twoIndependent, groups: "three-plus", normality: "no" }), [
      ["kruskal-wallis", "common"],
      ["one-way-anova", "also"],
    ]);
    assert.deepEqual(methods({ purpose: "relationship", outcomeLevel: "interval", predictorLevel: "interval", normality: "no" }), [
      ["spearman", "common"],
      ["pearson", "also"],
      ["simple-regression", "also"],
    ]);
  });

  it("names the alternatives in words where the catalogue has no rank-based counterpart", () => {
    const result = complete({ purpose: "compare", comparison: "value", outcomeLevel: "interval", normality: "no" });
    assert.deepEqual(result.candidates.map((candidate) => [candidate.method, candidate.fit]), [["one-sample-t-test", "also"]]);
    assert.match(result.candidates[0].caution!, /One-sample Wilcoxon signed-rank test/);
  });
});

describe("findTests: validation and edge cases", () => {
  it("rejects two variables with the same name", () => {
    const result = findTests({ ...twoIndependent, outcomeName: "Satisfaction", predictorName: " satisfaction " });
    assert.equal(result.status, "invalid");
    assert.match(result.status === "invalid" ? result.problems[0] : "", /same name/);
  });

  it("redirects a relationship between categories to the categories purpose", () => {
    const result = findTests({ purpose: "relationship", outcomeLevel: "nominal" });
    assert.equal(result.status, "invalid");
    assert.match(result.status === "invalid" ? result.problems[0] : "", /Examine categories/);
    assert.deepEqual(answerProblems({ purpose: "relationship", outcomeLevel: "ordinal" }), []);
  });

  it("sets aside answers to questions that no longer apply", () => {
    const stale: FinderAnswers = { ...twoIndependent, purpose: "association", categoricalVariables: "two" };
    assert.deepEqual(methods(stale), methods({ purpose: "association", categoricalVariables: "two" }));
  });

  it("names a test it doesn't cover instead of suggesting one that doesn't fit", () => {
    const friedman = complete({ purpose: "compare", comparison: "paired", outcomeLevel: "ordinal", measurements: "three-plus" });
    assert.deepEqual(friedman.candidates, []);
    assert.match(friedman.notes.join(" "), /Friedman test/);

    const mcnemar = complete({ purpose: "compare", comparison: "paired", outcomeLevel: "nominal", measurements: "two" });
    assert.deepEqual(mcnemar.candidates, []);
    assert.match(mcnemar.notes.join(" "), /McNemar/);

    const wilcoxon = complete({ purpose: "compare", comparison: "value", outcomeLevel: "ordinal" });
    assert.deepEqual(wilcoxon.candidates, []);
    assert.match(wilcoxon.notes.join(" "), /one-sample Wilcoxon/);

    const multinomial = complete({ purpose: "predict", outcomeLevel: "nominal", outcomeCategories: "three-plus", predictors: "several" });
    assert.deepEqual(multinomial.candidates, []);
    assert.match(multinomial.notes.join(" "), /multinomial logistic regression/);
  });

  it("treats a categorical outcome compared across groups as an association", () => {
    const result = complete({ purpose: "compare", comparison: "independent", outcomeLevel: "nominal", groups: "two" });
    assert.equal(result.candidates[0].method, "chi-square");
    assert.match(result.notes.join(" "), /associated/);
  });

  it("gives the same result for the same answers, whatever order they were given in", () => {
    const reversed = Object.fromEntries(Object.entries(twoIndependent).reverse()) as FinderAnswers;
    assert.deepEqual(findTests(twoIndependent), findTests(reversed));
    assert.deepEqual(findTests({ ...twoIndependent, normality: "no" }), findTests({ ...twoIndependent, normality: "no" }));
  });

  it("explains every candidate, and uses only methods from the analysis catalogue", () => {
    const situations: FinderAnswers[] = [
      twoIndependent,
      { ...twoIndependent, secondFactor: "yes", covariate: "yes", normality: "no" },
      { purpose: "predict", outcomeLevel: "interval", predictors: "one", predictorLevel: "nominal", predictorCategories: "three-plus" },
      { purpose: "association", categoricalVariables: "two" },
      { purpose: "describe", outcomeLevel: "interval", normality: "unknown" },
    ];
    for (const answers of situations) {
      for (const candidate of complete(answers).candidates) {
        assert.ok(ANALYSIS_METHOD_IDS.includes(candidate.method), candidate.method);
        assert.ok(candidate.why.length > 0 && candidate.why.every((line) => line.endsWith(".")), candidate.method);
      }
    }
  });

  it("notes the two-way ANCOVA when both a second factor and a covariate are named", () => {
    const result = complete({ ...twoIndependent, secondFactor: "yes", covariate: "yes" });
    assert.equal(result.candidates[0].method, "ancova");
    assert.match(result.notes.join(" "), /two-way ANCOVA/);
  });
});

describe("describeSituation", () => {
  it("restates the answers in sentences, using the researcher's names", () => {
    assert.deepEqual(describeSituation({ ...twoIndependent, outcomeName: "Job satisfaction", predictorName: "Bank type" }), [
      "You are comparing separate groups of different people, formed by Bank type, so the groups are independent.",
      "Job satisfaction is measured at the interval level, so it is quantitative.",
      "There are two groups.",
      "You expect the data to be roughly normal.",
    ]);
  });
});

describe("candidate details", () => {
  it("takes assumptions from the Statistical Assumption Checker where it covers the method", () => {
    assert.equal(assumptionCheckerCovers("independent-t-test"), true);
    assert.deepEqual(
      assumptionsFor("independent-t-test").map((assumption) => assumption.name),
      ["Interval or ratio measurement", "Independence of observations", "Normality", "Homogeneity of variance", "No influential outliers"],
    );
  });

  it("falls back to the analysis catalogue's own assumptions where the checker has no guide", () => {
    assert.equal(assumptionCheckerCovers("chi-square-goodness-of-fit"), false);
    const assumptions = assumptionsFor("chi-square-goodness-of-fit");
    assert.ok(assumptions.length >= 2 && assumptions.every((assumption) => assumption.statement === null));
  });

  it("lists alternatives from the assumption guides, or the catalogue's rank-based counterpart", () => {
    assert.ok(alternativesFor("independent-t-test").some((alternative) => alternative.name === "Mann–Whitney U test"));
    assert.deepEqual(alternativesFor("kruskal-wallis"), []);
  });

  it("knows which results the Results Interpretation Assistant can read", () => {
    assert.equal(interpreterCovers("one-way-anova"), true);
    assert.equal(interpreterCovers("ancova"), false);
  });

  it("labels fit in methodological terms, never as right or wrong", () => {
    const text = Object.values(FIT_LABELS).join(" ").toLowerCase();
    for (const word of ["best", "worst", "correct", "incorrect", "wrong"]) assert.ok(!text.includes(word), word);
  });
});
