import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analysisProfile, type Measure } from "./data-analysis-profile";
import { applyContext, controlRules, manovaRule, mediationRules, mergeRecommendations, moderationRules, multipleRules, pairRules, recommend, stronger, twoGroups, weaken, withFallbacks, type Recommendation } from "./data-analysis-rules";
import { build, mv } from "./data-analysis-test-helpers";
import type { HypothesisForm } from "./hypothesis-types";

const verdicts = (recommendations: readonly Recommendation[]) => recommendations.map((recommendation) => `${recommendation.method}:${recommendation.strength}`);

describe("pairRules", () => {
  type Case = [iv: Measure, dv: Measure, form: HypothesisForm | null, repeated: boolean, expected: string[], ivGroups?: number | null];
  const cases: Case[] = [
    // Numeric outcomes.
    ["numeric", "numeric", null, false, ["pearson:strong", "simple-regression:possible"]],
    ["numeric", "numeric", "relationship", false, ["pearson:strong", "simple-regression:possible"]],
    ["numeric", "numeric", "prediction", false, ["simple-regression:strong", "pearson:possible"]],
    ["numeric", "numeric", "difference", false, ["pearson:justify"]],
    ["scale-score", "numeric", "relationship", false, ["pearson:strong", "simple-regression:possible"]],
    ["numeric", "scale-score", "prediction", false, ["simple-regression:strong", "pearson:possible"]],
    ["ordinal", "numeric", "relationship", false, ["spearman:strong"]],
    ["ordinal", "numeric", "difference", false, ["spearman:strong"]],
    ["binary", "numeric", "difference", false, ["independent-t-test:strong"]],
    ["binary", "numeric", "relationship", false, ["independent-t-test:possible"]],
    ["binary", "numeric", "prediction", false, ["independent-t-test:possible", "simple-regression:possible"]],
    ["binary", "numeric", null, false, ["independent-t-test:possible"]],
    ["binary", "numeric", "difference", true, ["paired-t-test:strong"]],
    ["binary", "numeric", null, true, ["paired-t-test:strong"]],
    ["binary", "numeric", "relationship", true, ["paired-t-test:possible"]],
    ["categorical", "numeric", "difference", false, ["independent-t-test:strong"], 2],
    ["categorical", "numeric", "difference", false, ["one-way-anova:strong"], 3],
    ["categorical", "numeric", "relationship", false, ["one-way-anova:possible"], 5],
    ["categorical", "numeric", "difference", false, ["one-way-anova:possible", "independent-t-test:possible"], null],
    ["categorical", "numeric", "difference", true, ["repeated-measures-anova:strong"], 4],
    ["categorical", "numeric", null, true, ["repeated-measures-anova:possible", "paired-t-test:possible"], null],
    ["categorical", "scale-score", "difference", false, ["one-way-anova:strong"], 3],
    // Ordinal outcomes.
    ["numeric", "ordinal", "relationship", false, ["spearman:strong", "pearson:justify"]],
    ["ordinal", "ordinal", null, false, ["spearman:strong", "pearson:justify"]],
    ["scale-score", "ordinal", "prediction", false, ["spearman:strong", "pearson:justify"]],
    ["binary", "ordinal", "difference", false, ["mann-whitney:strong", "independent-t-test:justify"]],
    ["binary", "ordinal", "difference", true, ["wilcoxon:strong", "paired-t-test:justify"]],
    ["categorical", "ordinal", "difference", false, ["kruskal-wallis:strong", "one-way-anova:justify"], 3],
    ["categorical", "ordinal", "difference", true, ["kruskal-wallis:strong", "one-way-anova:justify"], 3],
    // Binary outcomes.
    ["numeric", "binary", "prediction", false, ["logistic-regression:strong"]],
    ["ordinal", "binary", "relationship", false, ["logistic-regression:strong"]],
    ["scale-score", "binary", null, false, ["logistic-regression:strong"]],
    ["binary", "binary", "relationship", false, ["chi-square:strong", "fisher-exact:possible"]],
    ["categorical", "binary", "difference", false, ["chi-square:strong", "fisher-exact:possible"]],
    // Categorical outcomes.
    ["binary", "categorical", "relationship", false, ["chi-square:strong", "fisher-exact:possible"]],
    ["categorical", "categorical", null, false, ["chi-square:strong", "fisher-exact:possible"]],
    ["numeric", "categorical", "prediction", false, ["logistic-regression:justify", "one-way-anova:possible"]],
    ["ordinal", "categorical", "relationship", false, ["logistic-regression:justify", "one-way-anova:possible"]],
    // Several ticked choices.
    ["multiple", "numeric", "relationship", false, ["chi-square:justify"]],
    ["binary", "multiple", "difference", false, ["chi-square:justify"]],
  ];

  for (const [iv, dv, form, repeated, expected, groups] of cases) {
    it(`recommends ${expected.join(", ")} for ${iv} → ${dv}, ${form ?? "no hypothesis"}${repeated ? ", repeated" : ""}${groups !== undefined ? `, ${groups ?? "unknown"} groups` : ""}`, () => {
      const result = pairRules(mv("x", iv, groups !== undefined ? { groups } : {}), mv("y", dv, { kind: "dependent" }), form, repeated);
      assert.deepEqual(verdicts(result.recommendations), expected);
      for (const recommendation of result.recommendations) {
        assert.ok(recommendation.reasons.length > 0, `${recommendation.method} has reasons`);
        assert.deepEqual(recommendation.basedOn, ["x: x source", "y: y source"]);
      }
    });
  }

  it("asks for a justification whenever the verdict is Needs justification", () => {
    for (const [iv, dv, form, repeated, , groups] of cases) {
      for (const recommendation of pairRules(mv("x", iv, groups !== undefined ? { groups } : {}), mv("y", dv), form, repeated).recommendations) {
        if (recommendation.strength === "justify") assert.ok(recommendation.justify, `${iv} → ${dv}: ${recommendation.method}`);
      }
    }
  });

  it("notes that a scale score is analysed as numeric", () => {
    const [pearson] = pairRules(mv("x", "numeric"), mv("wellbeing", "scale-score", { items: 5 }), "relationship", false).recommendations;
    assert.ok(pearson.reasons.includes("wellbeing combines 5 rating items into one score, which is commonly analysed as numeric; state this in your method."));
  });

  it("names the Friedman test for repeated measurements that aren't normal", () => {
    const [anova] = pairRules(mv("time", "categorical", { groups: 3 }), mv("y", "numeric"), "difference", true).recommendations;
    assert.match(anova.reasons[0], /measured 3 times.*Friedman test/);
  });

  it("recommends nothing, with a note, when a measure is unknown", () => {
    const result = pairRules(mv("x", "unknown"), mv("y", "unknown"), "relationship", false);
    assert.deepEqual(result.recommendations, []);
    assert.deepEqual(result.notes, ["Record how x and y are measured to see which tests suit x and y."]);
    assert.deepEqual(pairRules(mv("x", "numeric"), mv("y", "unknown"), null, false).notes, ["Record how y is measured to see which tests suit x and y."]);
  });

  it("sends written answers to qualitative analysis first", () => {
    const result = pairRules(mv("views", "text"), mv("y", "numeric"), "relationship", false);
    assert.deepEqual(result.recommendations, []);
    assert.match(result.notes[0], /^views is collected as written answers, which need qualitative analysis/);
    assert.match(pairRules(mv("a", "text"), mv("b", "text"), null, false).notes[0], /^a and b are collected/);
  });

  it("never gives a verdict outside the three strengths, or calls a method wrong", () => {
    const measures: Measure[] = ["numeric", "scale-score", "ordinal", "binary", "categorical", "multiple", "text", "unknown"];
    for (const iv of measures) {
      for (const dv of measures) {
        for (const form of [null, "relationship", "prediction", "difference"] as const) {
          const result = pairRules(mv("x", iv), mv("y", dv), form, false);
          for (const recommendation of result.recommendations) {
            assert.ok(["strong", "possible", "justify"].includes(recommendation.strength));
            assert.ok(!/invalid|forbidden|impossible|wrong/i.test(recommendation.reasons.join(" ")), `${iv} → ${dv}`);
          }
        }
      }
    }
  });
});

describe("twoGroups", () => {
  it("counts binary variables and categorical variables with two groups", () => {
    assert.equal(twoGroups(mv("x", "binary")), true);
    assert.equal(twoGroups(mv("x", "categorical", { groups: 2 })), true);
    assert.equal(twoGroups(mv("x", "categorical", { groups: 3 })), false);
    assert.equal(twoGroups(mv("x", "categorical")), false);
    assert.equal(twoGroups(mv("x", "numeric")), false);
  });
});

describe("multipleRules", () => {
  it("recommends multiple regression for several predictors of a numeric outcome", () => {
    assert.deepEqual(verdicts(multipleRules([mv("a", "numeric"), mv("b", "ordinal")], mv("y", "numeric"), "prediction")), ["multiple-regression:strong"]);
    assert.deepEqual(verdicts(multipleRules([mv("a", "numeric"), mv("b", "numeric")], mv("y", "numeric"), "difference")), ["multiple-regression:possible"]);
  });

  it("adds two-way ANOVA when exactly two grouping factors meet a numeric outcome", () => {
    assert.deepEqual(verdicts(multipleRules([mv("a", "binary"), mv("b", "categorical")], mv("y", "numeric"), "difference")), ["multiple-regression:possible", "two-way-anova:strong"]);
    assert.deepEqual(verdicts(multipleRules([mv("a", "binary"), mv("b", "binary")], mv("y", "numeric"), "relationship")), ["multiple-regression:strong", "two-way-anova:possible"]);
    assert.deepEqual(verdicts(multipleRules([mv("a", "binary"), mv("b", "binary"), mv("c", "binary")], mv("y", "numeric"), "difference")), ["multiple-regression:possible"]);
  });

  it("recommends logistic regression for a binary outcome", () => {
    assert.deepEqual(verdicts(multipleRules([mv("a", "numeric"), mv("b", "binary")], mv("y", "binary"), "prediction")), ["logistic-regression:strong"]);
  });

  it("asks for justification when an ordinal outcome is treated as numeric", () => {
    const [regression] = multipleRules([mv("a", "numeric"), mv("b", "numeric")], mv("y", "ordinal"), "prediction");
    assert.equal(regression.strength, "justify");
    assert.ok(regression.justify);
  });

  it("needs two usable predictors and a usable outcome", () => {
    assert.deepEqual(multipleRules([mv("a", "numeric")], mv("y", "numeric"), null), []);
    assert.deepEqual(multipleRules([mv("a", "numeric"), mv("b", "unknown")], mv("y", "numeric"), null), []);
    assert.deepEqual(multipleRules([mv("a", "numeric"), mv("b", "text")], mv("y", "numeric"), null), []);
    assert.deepEqual(multipleRules([mv("a", "numeric"), mv("b", "numeric")], mv("y", "unknown"), null), []);
    assert.deepEqual(multipleRules([mv("a", "numeric"), mv("b", "numeric")], mv("y", "categorical"), null), []);
  });
});

describe("manovaRule", () => {
  it("recommends MANOVA for one grouping variable and several numeric outcomes", () => {
    assert.deepEqual(verdicts(manovaRule([mv("group", "binary")], [mv("y1", "numeric"), mv("y2", "scale-score")], "difference")), ["manova:strong"]);
    assert.deepEqual(verdicts(manovaRule([mv("group", "binary")], [mv("y1", "numeric"), mv("y2", "numeric")], "relationship")), ["manova:possible"]);
    assert.deepEqual(verdicts(manovaRule([mv("g1", "binary"), mv("g2", "categorical")], [mv("y1", "numeric"), mv("y2", "numeric")], "difference")), ["manova:possible"]);
  });

  it("needs two numeric outcomes and a grouping variable", () => {
    assert.deepEqual(manovaRule([mv("group", "binary")], [mv("y1", "numeric"), mv("y2", "ordinal")], "difference"), []);
    assert.deepEqual(manovaRule([mv("x", "numeric")], [mv("y1", "numeric"), mv("y2", "numeric")], "difference"), []);
  });
});

describe("controlRules", () => {
  it("recommends ANCOVA for groups compared with a numeric control", () => {
    const [ancova] = controlRules([mv("group", "binary")], mv("y", "numeric"), [mv("age", "numeric")]);
    assert.equal(`${ancova.method}:${ancova.strength}`, "ancova:strong");
    assert.match(ancova.reasons[0], /age is a numeric control variable, so ANCOVA compares the groups after adjusting for it/);
  });

  it("recommends hierarchical regression otherwise, entering controls first", () => {
    assert.deepEqual(verdicts(controlRules([mv("x", "numeric")], mv("y", "numeric"), [mv("age", "numeric")])), ["hierarchical-regression:strong"]);
    assert.deepEqual(verdicts(controlRules([mv("group", "binary")], mv("y", "numeric"), [mv("gender", "binary")])), ["hierarchical-regression:strong"], "categorical controls enter a regression");
    assert.match(controlRules([mv("x", "numeric")], mv("y", "numeric"), [mv("a", "numeric"), mv("b", "binary")])[0].reasons[0], /a, b are control variables/);
  });

  it("recommends nothing without usable controls, predictors or a numeric outcome", () => {
    assert.deepEqual(controlRules([mv("x", "numeric")], mv("y", "numeric"), []), []);
    assert.deepEqual(controlRules([mv("x", "numeric")], mv("y", "numeric"), [mv("c", "unknown")]), []);
    assert.deepEqual(controlRules([mv("x", "numeric")], mv("y", "binary"), [mv("c", "numeric")]), []);
    assert.deepEqual(controlRules([], mv("y", "numeric"), [mv("c", "numeric")]), []);
  });
});

describe("moderationRules", () => {
  it("recommends moderation analysis by the outcome's measure", () => {
    assert.deepEqual(verdicts(moderationRules([mv("x", "numeric")], mv("y", "numeric"), [mv("m", "numeric")])), ["moderation:strong"]);
    assert.deepEqual(verdicts(moderationRules([mv("x", "numeric")], mv("y", "binary"), [mv("m", "numeric")])), ["moderation:possible"]);
    assert.deepEqual(verdicts(moderationRules([mv("x", "numeric")], mv("y", "ordinal"), [mv("m", "numeric")])), ["moderation:justify"]);
  });

  it("adds two-way ANOVA when the predictor and moderator both form groups", () => {
    assert.deepEqual(verdicts(moderationRules([mv("x", "binary")], mv("y", "numeric"), [mv("m", "categorical")])), ["moderation:strong", "two-way-anova:possible"]);
  });

  it("needs a moderator and a predictor", () => {
    assert.deepEqual(moderationRules([mv("x", "numeric")], mv("y", "numeric"), []), []);
    assert.deepEqual(moderationRules([], mv("y", "numeric"), [mv("m", "numeric")]), []);
  });
});

describe("mediationRules", () => {
  const profileFor = (design?: "true-experimental" | "correlational" | "longitudinal") => analysisProfile(build(design ? { design } : {}));

  it("is strong when the design supports the causal order", () => {
    assert.deepEqual(verdicts(mediationRules([mv("x", "numeric")], mv("y", "numeric"), [mv("m", "numeric")], profileFor("true-experimental"))), ["mediation:strong"]);
    const longitudinal = mediationRules([mv("x", "numeric")], mv("y", "numeric"), [mv("m", "numeric")], profileFor("longitudinal"));
    assert.equal(longitudinal[0].strength, "strong");
    assert.match(longitudinal[0].reasons[1], /more than one time/);
  });

  it("is possible, with the causal order to justify, when everything is measured at once", () => {
    const [mediation] = mediationRules([mv("x", "numeric")], mv("y", "numeric"), [mv("m", "scale-score")], profileFor("correlational"));
    assert.equal(mediation.strength, "possible");
    assert.match(mediation.justify!, /causal order/);
    assert.equal(mediationRules([mv("x", "numeric")], mv("y", "numeric"), [mv("m", "numeric")], profileFor())[0].strength, "possible");
  });

  it("needs justification for non-numeric mediators or outcomes", () => {
    const [mediation] = mediationRules([mv("x", "numeric")], mv("y", "binary"), [mv("m", "numeric")], profileFor("true-experimental"));
    assert.equal(mediation.strength, "justify");
    assert.match(mediation.justify!, /Explain how y will be modelled/);
  });

  it("needs a mediator and a predictor", () => {
    assert.deepEqual(mediationRules([mv("x", "numeric")], mv("y", "numeric"), [], profileFor()), []);
    assert.deepEqual(mediationRules([], mv("y", "numeric"), [mv("m", "numeric")], profileFor()), []);
  });
});

describe("applyContext", () => {
  const pearson = () => recommend("pearson", "strong", ["Both numeric."], ["x: source"]);
  const context = (spec: Parameters<typeof build>[0], fromHypothesis = true) => ({ profile: analysisProfile(build(spec)), fromHypothesis });

  it("needs justification for any test in a qualitative project", () => {
    const result = applyContext(pearson(), context({ onion: { choice: "qualitative" } }));
    assert.equal(result.strength, "justify");
    assert.ok(result.reasons.includes("Your project is qualitative, where statistical tests usually aren't the main analysis."));
    assert.ok(result.basedOn.includes("Research onion: qualitative methodological choice"));
    assert.ok(result.justify);
  });

  it("leaves descriptive statistics alone in every context", () => {
    const frequency = recommend("frequency", "strong", ["Counts."]);
    assert.deepEqual(applyContext(frequency, context({ onion: { choice: "qualitative" } })), frequency);
  });

  it("treats a test without a hypothesis as exploring, not confirming", () => {
    const result = applyContext(pearson(), context({}, false));
    assert.equal(result.strength, "possible");
    assert.ok(result.reasons.includes("No hypothesis states this relationship, so the test explores it rather than confirming a prediction."));
  });

  it("explains that a deductive approach tests stated hypotheses", () => {
    const result = applyContext(pearson(), context({ onion: { approach: "deductive" } }));
    assert.equal(result.strength, "strong");
    assert.ok(result.basedOn.includes("Research onion: deductive approach"));
  });

  it("weakens tests in a descriptive design", () => {
    assert.equal(applyContext(pearson(), context({ design: "descriptive" })).strength, "possible");
  });

  it("links group comparisons to a manipulating design, and relationships to a measuring one", () => {
    const tTest = applyContext(recommend("independent-t-test", "strong", ["Two groups."]), context({ design: "true-experimental" }));
    assert.ok(tTest.reasons.includes("Your true experimental design creates the groups being compared."));
    const correlation = applyContext(pearson(), context({ design: "survey" }));
    assert.ok(correlation.reasons.includes("Your survey design measures variables as they occur, which suits tests of relationships."));
    const qualitativeDesign = applyContext(pearson(), context({ design: "case-study" }));
    assert.ok(!qualitativeDesign.reasons.some((reason) => reason.includes("measures variables as they occur")));
  });

  it("weakens parametric tests for a small planned sample, pointing to the alternative", () => {
    const result = applyContext(pearson(), context({ margin: 20 }));
    assert.equal(result.strength, "possible");
    assert.ok(result.reasons.includes("Your planned sample of 25 is small, so whether the data are normally distributed matters more."));
    assert.equal(result.justify, "Check normality before relying on this test, and use Spearman's rank correlation if it doesn't hold.");
    assert.equal(applyContext(pearson(), context({ margin: 10 })).strength, "strong", "97 is not small");
    const spearman = recommend("spearman", "strong", ["Ranks."]);
    assert.equal(applyContext(spearman, context({ margin: 20 })).strength, "strong", "non-parametric tests aren't weakened");
  });
});

describe("withFallbacks", () => {
  it("adds each parametric method's alternative once, as a possible recommendation", () => {
    const result = withFallbacks([recommend("pearson", "strong", ["a"]), recommend("independent-t-test", "possible", ["b"]), recommend("mann-whitney", "strong", ["c"])]);
    assert.deepEqual(verdicts(result), ["pearson:strong", "independent-t-test:possible", "mann-whitney:strong", "spearman:possible"]);
    assert.match(result[3].reasons[0], /^If the data don't meet Pearson correlation's assumption of normality, Spearman's rank correlation answers the same question without it\.$/);
  });

  it("keeps a needs-justification verdict for the alternative of a method that needs justification", () => {
    const result = withFallbacks([recommend("one-way-anova", "justify", ["a"], [], "Explain.")]);
    assert.deepEqual(verdicts(result), ["one-way-anova:justify", "kruskal-wallis:justify"]);
    assert.equal(result[1].justify, "Explain.");
  });

  it("adds nothing for non-parametric methods", () => {
    assert.deepEqual(verdicts(withFallbacks([recommend("chi-square", "strong", ["a"])])), ["chi-square:strong"]);
  });
});

describe("mergeRecommendations", () => {
  it("keeps the stronger verdict and every distinct reason, strongest first", () => {
    const merged = mergeRecommendations([recommend("pearson", "justify", ["a"], ["x"], "Explain."), recommend("spearman", "possible", ["s"]), recommend("pearson", "strong", ["b", "a"], ["y"])]);
    assert.deepEqual(verdicts(merged), ["pearson:strong", "spearman:possible"]);
    assert.deepEqual(merged[0].reasons, ["a", "b"]);
    assert.deepEqual(merged[0].basedOn, ["x", "y"]);
    assert.equal(merged[0].justify, null, "a strong verdict needs no justification");
  });

  it("doesn't change the recommendations it is given", () => {
    const original = recommend("pearson", "possible", ["a"]);
    mergeRecommendations([original, recommend("pearson", "strong", ["b"])]);
    assert.deepEqual(original.reasons, ["a"]);
    assert.equal(original.strength, "possible");
  });
});

describe("weaken and stronger", () => {
  it("steps verdicts down, and picks the stronger of two", () => {
    assert.deepEqual([weaken("strong"), weaken("possible"), weaken("justify")], ["possible", "justify", "justify"]);
    assert.deepEqual([stronger("possible", "strong"), stronger("justify", "possible"), stronger("justify", "justify")], ["strong", "possible", "justify"]);
  });
});
