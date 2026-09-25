import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analysisProfile } from "../data-analysis-profile";
import { recommend } from "../data-analysis-rules";
import { build, type ProjectSpec } from "../data-analysis-test-helpers";
import { ASSUMPTION_IDS, type AssumptionId } from "./catalogue";
import { assumptionChecklist, judgeAssumption, variablesOf } from "./checklist";
import { ASSUMPTION_METHODS, METHOD_GUIDES, type AssumptionMethod } from "./methods";

/** Judges one assumption for a project built from a spec, with the named variables. */
function judge(id: AssumptionId, spec: ProjectSpec, names: string[] = [], method: AssumptionMethod = "pearson") {
  const project = build(spec);
  const profile = analysisProfile(project);
  return judgeAssumption(id, { profile, project, method, variables: profile.variables.filter((variable) => names.includes(variable.name)) });
}
const status = (...args: Parameters<typeof judge>) => judge(...args).status;
type VariableSpec = NonNullable<ProjectSpec["variables"]>[number];
const pair = (x: VariableSpec, y: VariableSpec): ProjectSpec => ({ variables: [x, y] });

describe("judgeAssumption: measurement", () => {
  it("finds numeric variables aligned with interval measurement", () => {
    const result = judge("numeric-measurement", pair(["a", "independent", "ratio"], ["b", "dependent", "interval"]), ["a", "b"]);
    assert.deepEqual([result.status, result.note], ["aligned", "A and b are recorded as numeric."]);
    assert.deepEqual(result.basedOn, ["a: Measurement level: Ratio", "b: Measurement level: Interval"]);
  });

  it("lets grouping variables be categorical", () => {
    assert.equal(status("numeric-measurement", pair(["group", "independent", "binary"], ["score", "dependent", "ratio"]), ["group", "score"]), "aligned");
  });

  it("asks for a scale score to be stated as interval", () => {
    const result = judge("numeric-measurement", { variables: [["x", "independent", "ratio"], ["wellbeing", "dependent", "likert"]], items: { wellbeing: 4 } }, ["x", "wellbeing"]);
    assert.equal(result.status, "worth-checking");
    assert.match(result.note, /^Wellbeing is a scale score/);
  });

  it("asks for clarification of ordinal variables, and names missing levels", () => {
    assert.equal(status("numeric-measurement", pair(["x", "independent", "ratio"], ["pain", "dependent", "ordinal"]), ["x", "pain"]), "clarify");
    const missing = judge("numeric-measurement", pair(["x", "independent", null], ["y", "dependent", "ratio"]), ["x", "y"]);
    assert.deepEqual([missing.status, missing.note], ["missing", "No measurement level is recorded for x."]);
    assert.equal(status("numeric-measurement", {}, []), "review");
  });

  it("judges ordinal measurement for rank methods", () => {
    assert.equal(status("ordinal-measurement", pair(["x", "independent", "ordinal"], ["y", "dependent", "ratio"]), ["x", "y"]), "aligned");
    assert.equal(status("ordinal-measurement", pair(["x", "independent", "nominal"], ["y", "dependent", "ratio"]), ["x", "y"]), "clarify");
    assert.equal(status("ordinal-measurement", pair(["x", "independent", null], ["y", "dependent", "ratio"]), ["x", "y"]), "missing");
    assert.equal(status("ordinal-measurement", {}, []), "review");
  });

  it("judges categorical variables for chi-square", () => {
    assert.equal(status("categorical-variables", pair(["x", "independent", "nominal"], ["y", "dependent", "binary"]), ["x", "y"]), "aligned");
    assert.match(judge("categorical-variables", pair(["age", "independent", "ratio"], ["y", "dependent", "binary"]), ["age", "y"]).note, /^Age isn't categorical; cutting it into categories loses information\.$/);
    assert.equal(status("categorical-variables", pair(["x", "independent", null], ["y", "dependent", "binary"]), ["x", "y"]), "missing");
  });

  it("judges a binary outcome for logistic regression", () => {
    assert.equal(status("binary-outcome", pair(["x", "independent", "ratio"], ["passed", "dependent", "binary"]), ["x", "passed"]), "aligned");
    assert.equal(status("binary-outcome", pair(["x", "independent", "ratio"], ["grade", "dependent", "nominal"]), ["x", "grade"]), "clarify");
    assert.equal(status("binary-outcome", pair(["x", "independent", "ratio"], ["y", "dependent", null]), ["x", "y"]), "missing");
    assert.equal(status("binary-outcome", pair(["x", "independent", "ratio"], ["z", "independent", "ratio"]), ["x", "z"]), "review", "no outcome named");
  });
});

describe("judgeAssumption: independence and pairing", () => {
  it("flags cluster sampling", () => {
    const result = judge("independence", { design: "survey", sampling: "cluster" });
    assert.equal(result.status, "worth-checking");
    assert.deepEqual(result.basedOn, ["Sampling technique: Cluster sampling"]);
  });

  it("asks for a paired method when the same people are measured again", () => {
    assert.equal(status("independence", { design: "longitudinal" }, [], "independent-t-test"), "clarify");
    assert.notEqual(status("independence", { design: "longitudinal" }, [], "paired-t-test"), "clarify");
  });

  it("finds independence aligned with a design that doesn't relate observations, and asks otherwise", () => {
    assert.equal(status("independence", { design: "survey", sampling: "simple-random" }), "aligned");
    assert.equal(status("independence", {}), "review");
  });

  it("judges pairing and sphericity from repeated measurement", () => {
    assert.equal(status("paired-observations", { design: "longitudinal" }), "aligned");
    assert.equal(status("paired-observations", { design: "survey" }), "clarify");
    assert.equal(status("sphericity", { onion: { timeHorizon: "longitudinal" } }), "review");
    assert.equal(status("sphericity", { design: "survey" }), "clarify");
  });

  it("asks experiments to measure covariates first", () => {
    assert.equal(status("covariate-independence", { design: "true-experimental" }), "worth-checking");
    assert.equal(status("covariate-independence", { design: "survey" }), "review");
  });
});

describe("judgeAssumption: sample size", () => {
  for (const id of ["normality", "normality-of-residuals", "normality-of-differences", "multivariate-normality"] as const) {
    it(`treats ${id} as worth checking in a small planned sample, and for review otherwise`, () => {
      assert.equal(status(id, { margin: 20 }), "worth-checking");
      assert.match(judge(id, { margin: 5 }).note, /planned sample of 385.*commonly considered robust/);
      assert.equal(status(id, { margin: 5 }), "review");
      assert.equal(status(id, {}), "review");
    });
  }

  it("compares the planned sample with factor analysis's commonly cited minimum", () => {
    assert.equal(status("factor-sample-size", { margin: 5 }), "aligned");
    assert.equal(status("factor-sample-size", { margin: 10 }), "worth-checking", "97 is below 100");
    assert.equal(status("factor-sample-size", {}), "review");
  });

  it("compares the planned sample with CB-SEM's commonly cited minimum, and leaves PLS-SEM to review", () => {
    assert.equal(status("sem-sample-size", { margin: 5 }, [], "sem"), "aligned");
    assert.equal(status("sem-sample-size", { margin: 7 }, [], "sem"), "worth-checking", "196 is below 200");
    assert.equal(status("sem-sample-size", { margin: 7 }, [], "pls-sem"), "review");
    assert.equal(status("sem-sample-size", {}, [], "sem"), "review");
  });

  it("checks the planned sample against ten cases per predictor", () => {
    const spec: ProjectSpec = { variables: [["a", "independent", "ratio"], ["b", "independent", "ratio"], ["y", "dependent", "binary"]], margin: 20 };
    const small = judge("events-per-predictor", spec, ["a", "b", "y"], "logistic-regression");
    assert.equal(small.status, "worth-checking");
    assert.match(small.note, /With 2 predictors, the smaller outcome group needs at least 20 cases/);
    assert.equal(status("events-per-predictor", { ...spec, margin: 5 }, ["a", "b", "y"], "logistic-regression"), "review");
    assert.equal(status("events-per-predictor", { ...spec, margin: undefined }, ["a", "b", "y"], "logistic-regression"), "review");
  });

  it("warns that small samples give small expected counts", () => {
    assert.equal(status("expected-counts", { margin: 20 }), "worth-checking");
    assert.equal(status("expected-counts", { margin: 5 }), "review");
  });
});

describe("judgeAssumption: measurement models", () => {
  const scales = (items: number): ProjectSpec => ({ variables: [["a", "independent", "likert"], ["b", "dependent", "likert"]], items: { a: items, b: 4 } });

  it("needs multi-item scales", () => {
    for (const id of ["model-identification", "measurement-model-quality", "factorability"] as const) assert.equal(status(id, pair(["a", "independent", "ratio"], ["b", "dependent", "ratio"])), "clarify", id);
  });

  it("finds identification aligned when every construct has three or more items", () => {
    const result = judge("model-identification", scales(3));
    assert.equal(result.status, "aligned");
    assert.equal(result.note, "Every multi-item construct has at least three items: a (3) and b (4).");
  });

  it("flags constructs with only two items", () => {
    assert.equal(status("model-identification", scales(2)), "worth-checking");
    assert.equal(status("factorability", scales(2)), "worth-checking");
    assert.equal(status("measurement-model-quality", scales(2)), "review");
  });
});

describe("judgeAssumption: checks that need the data", () => {
  const dataOnly: AssumptionId[] = ["linearity", "monotonicity", "homoscedasticity", "homogeneity-of-variance", "homogeneity-of-covariance", "independent-errors", "outliers", "multivariate-outliers", "homogeneity-of-slopes", "linearity-of-logit", "group-sizes", "related-outcomes", "discriminant-validity", "structural-collinearity", "distribution-shape"];
  for (const id of dataOnly) {
    it(`leaves ${id} for review, saying how to check it`, () => {
      const result = judge(id, { design: "survey", margin: 5 });
      assert.equal(result.status, "review");
      assert.match(result.note, /\.$/);
      assert.ok(result.note.length > 40);
    });
  }

  it("names overlapping predictors for multicollinearity", () => {
    assert.match(judge("multicollinearity", { variables: [["a", "independent", "ratio"], ["b", "independent", "ratio"], ["y", "dependent", "ratio"]] }, ["a", "b", "y"]).note, /^A and b may overlap/);
  });

  it("judges every assumption without throwing, with a capitalised note", () => {
    for (const id of ASSUMPTION_IDS) {
      const result = judge(id, {});
      assert.ok(["aligned", "worth-checking", "clarify", "missing", "review"].includes(result.status), id);
      assert.match(result.note, /^[A-Z]/, id);
    }
  });
});

describe("variablesOf", () => {
  it("reads a recommendation's variables from its sources", () => {
    const project = build({ variables: [["screen time", "independent", "ratio"], ["sleep", "dependent", "ratio"], ["age", "control", "ratio"]] });
    const profile = analysisProfile(project);
    const recommendation = recommend("pearson", "strong", ["x"], ["screen time: Measurement level: Ratio", "sleep: Measurement level: Ratio", "Research design: Survey"]);
    assert.deepEqual(variablesOf(recommendation, profile).map((variable) => variable.name), ["screen time", "sleep"]);
  });
});

describe("assumptionChecklist", () => {
  const survey = (extra: ProjectSpec = {}) =>
    build({
      variables: [
        ["screen time", "independent", "ratio"],
        ["sleep quality", "dependent", "ratio"],
      ],
      hypotheses: [{ form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] }],
      design: "correlational",
      onion: { approach: "deductive", choice: "quantitative" },
      margin: 5,
      sampling: "simple-random",
      ...extra,
    });

  it("lists the supported methods the analysis plan recommends, strongest first", () => {
    const checklist = assumptionChecklist(survey());
    assert.deepEqual(
      checklist.methods.map((method) => `${method.method}:${method.strength}`),
      ["descriptive-statistics:strong", "pearson:strong", "simple-regression:possible", "spearman:possible"],
    );
    assert.deepEqual(checklist.methods[1].questions, ["Hypothesis 1"]);
  });

  it("gives each method its own assumptions, in order", () => {
    for (const method of assumptionChecklist(survey()).methods) {
      assert.deepEqual(
        method.items.map((item) => item.assumption),
        [...METHOD_GUIDES[method.method].assumptions],
      );
    }
  });

  it("judges what the project shows for Pearson's correlation", () => {
    const pearson = assumptionChecklist(survey()).methods.find((method) => method.method === "pearson")!;
    assert.deepEqual(
      pearson.items.map((item) => `${item.assumption}:${item.status}`),
      ["numeric-measurement:aligned", "independence:aligned", "linearity:review", "normality:review", "outliers:review"],
    );
  });

  it("leaves out methods it has no guide for, such as Fisher's exact test", () => {
    const project = build({ variables: [["gender", "independent", "nominal"], ["voted", "dependent", "binary"]], hypotheses: [{ form: "relationship", ivs: ["gender"], dvs: ["voted"] }] });
    const methods = assumptionChecklist(project).methods.map((method) => method.method);
    assert.ok(methods.includes("chi-square"));
    assert.ok(!methods.some((method) => !ASSUMPTION_METHODS.includes(method)));
  });

  it("includes measure checks for multi-item scales, and paired checks for repeated designs", () => {
    const scales = assumptionChecklist(build({ variables: [["a", "independent", "likert"], ["b", "dependent", "likert"]], items: { a: 4, b: 4 }, margin: 5 }));
    assert.ok(scales.methods.some((method) => method.method === "factor-analysis"));
    const repeated = assumptionChecklist(build({ variables: [["time", "independent", "binary"], ["score", "dependent", "ratio"]], hypotheses: [{ form: "difference", ivs: ["time"], dvs: ["score"] }], design: "longitudinal" }));
    const paired = repeated.methods.find((method) => method.method === "paired-t-test")!;
    assert.equal(paired.items.find((item) => item.assumption === "paired-observations")?.status, "aligned");
  });

  it("explains an empty project, and notes qualitative ones", () => {
    const empty = assumptionChecklist({});
    assert.deepEqual(empty.methods.map((method) => method.method), ["descriptive-statistics"]);
    assert.ok(empty.notes.includes("Record your variables and how they are measured to see which analyses, and so which assumptions, apply."));
    assert.ok(assumptionChecklist(survey({ onion: { choice: "qualitative" } })).notes.some((note) => note.startsWith("Your project is qualitative")));
  });

  it("is deterministic and doesn't change the project", () => {
    const project = survey();
    const copy = structuredClone(project);
    assert.deepEqual(assumptionChecklist(project), assumptionChecklist(project));
    assert.deepEqual(project, copy);
  });
});

describe("every assumption of every method", () => {
  const project = build({
    variables: [
      ["screen time", "independent", "ratio"],
      ["group", "independent", "binary"],
      ["sleep quality", "dependent", "likert"],
      ["passed", "dependent", "binary"],
    ],
    items: { "sleep quality": 4 },
    design: "survey",
    sampling: "stratified",
    margin: 5,
  });
  const profile = analysisProfile(project);
  for (const method of ASSUMPTION_METHODS) {
    for (const assumption of METHOD_GUIDES[method].assumptions) {
      it(`judges ${assumption} for ${method}`, () => {
        const result = judgeAssumption(assumption, { profile, project, method, variables: profile.variables });
        assert.ok(["aligned", "worth-checking", "clarify", "missing", "review"].includes(result.status));
        assert.match(result.note, /^[A-Z].+[.)]$/);
        for (const entry of result.basedOn) assert.ok(entry.includes(": "), entry);
      });
    }
  }
});
