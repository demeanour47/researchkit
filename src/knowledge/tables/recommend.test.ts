import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { build } from "../research/data-analysis-test-helpers";
import { ANALYSIS_METHOD_IDS, RECOMMENDATION_STRENGTHS } from "../research/data-analysis-types";
import { EMPTY_TYPED_PROJECT, projectFromTyped } from "../research/typed-project";
import { METHOD_TABLES, mergeTableSuggestions, recommendTables, type TableSuggestion } from "./recommend";
import { TABLE_TYPES, type TableType } from "./types";

const types = (suggestions: readonly TableSuggestion[]) => suggestions.map((suggestion) => suggestion.type);
const find = (suggestions: readonly TableSuggestion[], type: TableType) => suggestions.find((suggestion) => suggestion.type === type);

describe("METHOD_TABLES", () => {
  for (const method of ANALYSIS_METHOD_IDS)
    it(`suggests well-formed tables for ${method}`, () => {
      const entries = METHOD_TABLES[method];
      assert.ok(entries.length > 0);
      for (const [type, strength, reason] of entries) {
        assert.ok(TABLE_TYPES.includes(type));
        assert.ok(RECOMMENDATION_STRENGTHS.includes(strength));
        assert.ok(reason.endsWith("."), reason);
      }
    });
  const leads: [(typeof ANALYSIS_METHOD_IDS)[number], TableType][] = [
    ["pearson", "correlation-matrix"],
    ["correlation", "correlation-matrix"],
    ["regression", "coefficients"],
    ["multiple-regression", "regression"],
    ["hierarchical-regression", "model-summary"],
    ["one-way-anova", "anova"],
    ["ancova", "anova"],
    ["chi-square", "chi-square"],
    ["cronbach-alpha", "reliability"],
    ["factor-analysis", "factor-analysis"],
    ["pls-sem", "validity"],
    ["frequency", "frequency"],
    ["descriptive-statistics", "descriptive-statistics"],
  ];
  for (const [method, type] of leads)
    it(`leads ${method} with the ${type} table`, () => {
      assert.equal(METHOD_TABLES[method][0][0], type);
    });
});

describe("mergeTableSuggestions", () => {
  const make = (type: TableType, strength: TableSuggestion["strength"], reason: string, basis: string): TableSuggestion => ({ type, strength, reasons: [reason], basedOn: [basis] });
  it("keeps one suggestion per table with the strongest strength", () => {
    const merged = mergeTableSuggestions([make("anova", "possible", "A.", "x"), make("anova", "strong", "B.", "y")]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].strength, "strong");
  });
  it("gathers every reason and basis once", () => {
    const merged = mergeTableSuggestions([make("anova", "possible", "A.", "x"), make("anova", "possible", "A.", "y")]);
    assert.deepEqual([merged[0].reasons, merged[0].basedOn], [["A."], ["x", "y"]]);
  });
  it("orders strong suggestions first, then by the catalogue", () => {
    const merged = mergeTableSuggestions([make("anova", "possible", "A.", "x"), make("custom", "strong", "B.", "y"), make("frequency", "strong", "C.", "z")]);
    assert.deepEqual(types(merged), ["frequency", "custom", "anova"]);
  });
  it("doesn't change its input", () => {
    const input = [make("anova", "possible", "A.", "x"), make("anova", "strong", "B.", "y")];
    mergeTableSuggestions(input);
    assert.deepEqual(input[0].reasons, ["A."]);
  });
});

describe("recommendTables", () => {
  const project = projectFromTyped(
    { ...EMPTY_TYPED_PROJECT, independent: "screen time\nfaculty", dependent: "sleep quality: time to fall asleep; feeling rested", control: "gender", choice: "quantitative", design: "correlational", technique: "stratified", margin: "5", hypotheses: "relationship" },
    { "var-screen-time": "ratio", "var-faculty": "nominal", "var-sleep-quality": "interval", "var-gender": "binary" },
  );
  const suggestions = recommendTables(project);
  it("suggests a correlation matrix for planned correlations", () => {
    assert.equal(find(suggestions, "correlation-matrix")?.strength, "strong");
    assert.ok(find(suggestions, "correlation-matrix")?.basedOn.some((basis) => /Pearson correlation/.test(basis)));
  });
  it("suggests the hypothesis summary for projects with hypotheses", () => {
    assert.equal(find(suggestions, "hypothesis-summary")?.strength, "strong");
  });
  it("suggests the operationalisation table for projects with variables", () => {
    assert.equal(find(suggestions, "operationalization")?.strength, "strong");
  });
  it("suggests a sample description and sample size table from the sampling plan", () => {
    assert.equal(find(suggestions, "demographic-profile")?.strength, "strong");
    assert.equal(find(suggestions, "sample-size-summary")?.strength, "strong");
  });
  it("suggests a timeline once a design is chosen", () => {
    assert.equal(find(suggestions, "research-timeline")?.strength, "possible");
  });
  it("always offers front matter as possible", () => {
    assert.equal(find(suggestions, "table-of-contents")?.strength, "possible");
    assert.equal(find(suggestions, "list-of-tables")?.strength, "possible");
  });
  it("lists strong suggestions before possible ones", () => {
    const firstPossible = suggestions.findIndex((suggestion) => suggestion.strength !== "strong");
    assert.ok(suggestions.slice(firstPossible).every((suggestion) => suggestion.strength !== "strong"));
  });
  it("gives one entry per table", () => {
    assert.equal(new Set(types(suggestions)).size, suggestions.length);
  });
  it("gives every suggestion a reason and a basis", () => {
    for (const suggestion of suggestions) {
      assert.ok(suggestion.reasons.length > 0 && suggestion.basedOn.length > 0, suggestion.type);
    }
  });
  it("suggests ANOVA and descriptive tables for an experiment comparing groups", () => {
    const experiment = recommendTables(build({ variables: [["Group", "independent", "categorical"], ["Anxiety", "dependent", "interval"]], hypotheses: [{ form: "difference", ivs: ["Group"], dvs: ["Anxiety"] }], design: "true-experimental" }));
    assert.ok(types(experiment).includes("anova"));
    assert.equal(find(experiment, "descriptive-statistics")?.strength, "strong");
  });
  it("suggests a chi-square table for two categorical variables", () => {
    const categorical = recommendTables(build({ variables: [["Faculty", "independent", "nominal"], ["Passed", "dependent", "binary"]], hypotheses: [{ form: "relationship", ivs: ["Faculty"], dvs: ["Passed"] }] }));
    assert.ok(types(categorical).includes("chi-square") || types(categorical).includes("cross-tabulation"));
  });
  it("suggests measurement and reliability tables for rating scales", () => {
    const rated = recommendTables(build({ variables: [["Engagement", "dependent", "likert"], ["Support", "independent", "likert"]], items: { Engagement: 4, Support: 4 } }));
    assert.equal(find(rated, "measurement-scale")?.strength, "strong");
    assert.ok(types(rated).includes("reliability"));
  });
  it("offers no project-specific tables for an empty project", () => {
    const empty = types(recommendTables(build({})));
    for (const type of ["hypothesis-summary", "operationalization", "sample-size-summary", "measurement-scale", "research-timeline"] as TableType[]) assert.ok(!empty.includes(type), type);
    assert.ok(empty.includes("table-of-contents"));
  });
});
