import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ASSUMPTIONS, ASSUMPTION_IDS, getAssumption, type AssumptionId } from "./catalogue";
import { ASSUMPTION_METHODS, METHOD_GUIDES } from "./methods";

describe("ASSUMPTIONS", () => {
  it("defines 35 assumptions, each once, under its own id", () => {
    assert.equal(ASSUMPTION_IDS.length, 35);
    assert.deepEqual(Object.keys(ASSUMPTIONS), [...ASSUMPTION_IDS]);
    for (const id of ASSUMPTION_IDS) assert.equal(ASSUMPTIONS[id].id, id);
    assert.equal(new Set(ASSUMPTION_IDS.map((id) => ASSUMPTIONS[id].name)).size, ASSUMPTION_IDS.length, "names are distinct");
  });

  for (const id of ASSUMPTION_IDS) {
    it(`explains ${id}: what, why, how to check, thresholds, violations and remedies, used by at least one method`, () => {
      const assumption = ASSUMPTIONS[id];
      for (const text of [assumption.statement, assumption.why, assumption.ifViolated]) assert.ok(text.length > 20 && text.endsWith("."), `${id}: “${text}”`);
      for (const group of [assumption.howToCheck, assumption.thresholds, assumption.remedies]) {
        assert.ok(group.length >= 1, id);
        for (const item of group) assert.ok(/[.?]$/.test(item), `${id}: “${item}”`);
      }
      assert.deepEqual(assumption.references, [], "sources await academic review; none are invented");
      assert.ok(
        ASSUMPTION_METHODS.some((method) => METHOD_GUIDES[method].assumptions.includes(id)),
        `${id} is checked by some method`,
      );
    });
  }

  it("marks as checkable from the design only what the design can show", () => {
    assert.deepEqual(
      ASSUMPTION_IDS.filter((id) => ASSUMPTIONS[id].checkableFromDesign),
      ["numeric-measurement", "ordinal-measurement", "categorical-variables", "binary-outcome", "independence", "paired-observations", "covariate-independence", "factor-sample-size", "model-identification", "sem-sample-size"],
    );
  });

  it("rejects an unknown assumption", () => {
    assert.throws(() => getAssumption("normal" as AssumptionId), { name: "RangeError", message: "Unknown assumption: normal" });
  });
});

describe("thresholds", () => {
  const has = (id: AssumptionId, text: string) => assert.ok(ASSUMPTIONS[id].thresholds.some((threshold) => threshold.includes(text)), `${id}: ${text}`);

  it("give the commonly used cut-offs for normality and equal variances", () => {
    has("normality", "Shapiro–Wilk p above .05");
    has("normality", "between −2 and +2");
    has("homogeneity-of-variance", "Levene's p above .05");
    has("homogeneity-of-variance", "below about 2 to 3");
  });

  it("give the regression diagnostics' cut-offs", () => {
    has("multicollinearity", "VIF below 10");
    has("multicollinearity", "below 5");
    has("independent-errors", "between about 1.5 and 2.5");
    has("outliers", "beyond ±3");
    has("outliers", "Cook's distance above 1");
    has("homoscedasticity", "Breusch–Pagan p above .05");
  });

  it("give the repeated measures and multivariate cut-offs", () => {
    has("sphericity", "Mauchly's p above .05");
    has("sphericity", "Greenhouse–Geisser correction when epsilon is below about .75");
    has("homogeneity-of-covariance", "p above .001");
    has("multivariate-outliers", "p < .001");
  });

  it("give the categorical and logistic cut-offs", () => {
    has("expected-counts", "80% of cells");
    has("expected-counts", "none below 1");
    has("events-per-predictor", "at least 10 cases");
  });

  it("give the factor analysis and SEM cut-offs", () => {
    has("factorability", "KMO of .60 or more");
    has("factorability", "Bartlett's test should be significant");
    has("factor-sample-size", "at least 100");
    has("sem-sample-size", "200 or more");
    has("measurement-model-quality", "AVE of .50 or more");
    has("measurement-model-quality", "between .70 and .95");
    has("discriminant-validity", "HTMT below .85");
    has("structural-collinearity", "VIF below 3");
  });

  it("present thresholds as conventions, not laws", () => {
    for (const id of ["normality", "multicollinearity", "events-per-predictor", "factor-sample-size"] as const) {
      assert.ok(ASSUMPTIONS[id].thresholds.some((threshold) => /common|often|some|debated/i.test(threshold)), id);
    }
  });
});
