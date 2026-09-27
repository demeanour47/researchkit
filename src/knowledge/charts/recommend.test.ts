import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { build, mv } from "../research/data-analysis-test-helpers";
import { MEASURES } from "../research/data-analysis-profile";
import { ANALYSIS_METHOD_IDS, RECOMMENDATION_STRENGTHS } from "../research/data-analysis-types";
import { MEASUREMENT_LEVELS } from "../research/variable-types";
import { CHART_PURPOSES, CHART_PURPOSE_INFO, MAX_PAIRS, chartsForLevel, chartsForMeasure, chartsForMethod, chartsForPair, chartsForPurpose, mergeSuggestions, noChartReason, purposesInText, recommendationsForProject, type ChartSuggestion } from "./recommend";
import { CHART_TYPES, CHART_TYPE_INFO, type ChartType } from "./types";

const types = (suggestions: readonly ChartSuggestion[]) => suggestions.map((suggestion) => suggestion.type);
const first = (suggestions: readonly ChartSuggestion[]) => suggestions[0];
const strong = (suggestions: readonly ChartSuggestion[]) => suggestions.filter((suggestion) => suggestion.strength === "strong").map((suggestion) => suggestion.type);
const wellFormed = (suggestion: ChartSuggestion) => {
  assert.ok(CHART_TYPES.includes(suggestion.type));
  assert.ok(RECOMMENDATION_STRENGTHS.includes(suggestion.strength));
  assert.ok(suggestion.reason.length > 20 && suggestion.reason.endsWith("."), suggestion.reason);
  if (!CHART_TYPE_INFO[suggestion.type].sortable) assert.equal(suggestion.sort, null);
};

describe("chartsForPurpose", () => {
  for (const purpose of CHART_PURPOSES)
    it(`suggests well-formed charts for ${purpose}, strongest first`, () => {
      const suggestions = chartsForPurpose(purpose);
      assert.ok(suggestions.length >= 2);
      suggestions.forEach(wellFormed);
      assert.equal(new Set(types(suggestions)).size, suggestions.length);
      assert.equal(first(suggestions).strength, "strong");
      assert.ok(CHART_PURPOSE_INFO[purpose].question.endsWith("?"));
    });
  const leads: [(typeof CHART_PURPOSES)[number], ChartType][] = [
    ["distribution", "histogram"],
    ["comparison", "bar"],
    ["composition", "stacked-bar-100"],
    ["relationship", "scatter"],
    ["trend", "line"],
    ["ranking", "horizontal-bar"],
    ["agreement", "likert"],
    ["population", "population-pyramid"],
    ["profile", "grouped-bar"],
  ];
  for (const [purpose, type] of leads)
    it(`leads ${purpose} with a ${CHART_TYPE_INFO[type].label.toLowerCase()}`, () => {
      assert.equal(first(chartsForPurpose(purpose)).type, type);
    });
  it("keeps pies to a possible choice, limited to a few parts", () => {
    const pie = chartsForPurpose("composition").find((suggestion) => suggestion.type === "pie");
    assert.equal(pie?.strength, "possible");
    assert.match(pie?.reason ?? "", /few parts/);
  });
  it("asks for justification of radar charts", () => {
    assert.equal(chartsForPurpose("profile").find((suggestion) => suggestion.type === "radar")?.strength, "justify");
  });
  it("suggests sorting rankings descending", () => {
    assert.equal(first(chartsForPurpose("ranking")).sort, "descending");
  });
  it("returns copies, so callers can't change the rules", () => {
    chartsForPurpose("trend")[0].reason = "changed";
    assert.notEqual(chartsForPurpose("trend")[0].reason, "changed");
  });
});

describe("chartsForMeasure", () => {
  it("suggests a histogram and box plot for numeric variables", () => {
    assert.deepEqual(strong(chartsForMeasure("numeric")), ["histogram", "box-plot"]);
  });
  it("suggests a histogram and box plot for scale scores, with the items as a Likert chart", () => {
    const suggestions = chartsForMeasure("scale-score");
    assert.deepEqual(strong(suggestions), ["histogram", "box-plot"]);
    assert.ok(types(suggestions).includes("likert"));
  });
  it("suggests a diverging Likert chart for Likert items", () => {
    assert.equal(first(chartsForMeasure("ordinal", { likert: true })).type, "likert");
  });
  it("keeps ordinal categories in their natural order", () => {
    const bar = first(chartsForMeasure("ordinal"));
    assert.deepEqual([bar.type, bar.sort], ["bar", "none"]);
  });
  it("suggests bars for nominal categories, sorted largest first", () => {
    const bar = first(chartsForMeasure("categorical"));
    assert.deepEqual([bar.type, bar.strength, bar.sort], ["bar", "strong", "descending"]);
  });
  it("offers a pie for a few categories", () => {
    assert.equal(chartsForMeasure("categorical", { groups: 4 }).find((suggestion) => suggestion.type === "pie")?.strength, "possible");
  });
  it("asks to justify a pie for many categories", () => {
    const pie = chartsForMeasure("categorical", { groups: 9 }).find((suggestion) => suggestion.type === "pie");
    assert.equal(pie?.strength, "justify");
    assert.match(pie?.reason ?? "", /With 9 categories/);
  });
  it("suggests bars for binary variables", () => {
    assert.equal(first(chartsForMeasure("binary")).type, "bar");
  });
  it("never suggests a pie for multiple-response questions, whose shares exceed 100%", () => {
    const suggestions = chartsForMeasure("multiple");
    assert.ok(!types(suggestions).includes("pie"));
    assert.match(first(suggestions).reason, /don't add up to 100%/);
  });
  it("suggests nothing for written answers, and says why", () => {
    assert.deepEqual(chartsForMeasure("text"), []);
    assert.match(noChartReason("text") ?? "", /Code them into categories first/);
  });
  it("suggests nothing for unknown measures, and says what to record", () => {
    assert.deepEqual(chartsForMeasure("unknown"), []);
    assert.match(noChartReason("unknown") ?? "", /Record how the variable is measured/);
  });
  it("has no reason to give when something is suggested", () => {
    assert.equal(noChartReason("numeric"), null);
  });
  for (const measure of MEASURES)
    it(`gives well-formed suggestions for ${measure} measures`, () => {
      chartsForMeasure(measure).forEach(wellFormed);
    });
});

describe("chartsForLevel", () => {
  const leads: [(typeof MEASUREMENT_LEVELS)[number], ChartType | null][] = [
    ["nominal", "bar"],
    ["categorical", "bar"],
    ["ordinal", "bar"],
    ["likert", "likert"],
    ["interval", "histogram"],
    ["ratio", "histogram"],
    ["continuous", "histogram"],
    ["binary", "bar"],
    ["multiple-response", "horizontal-bar"],
    ["open-ended", null],
  ];
  for (const [level, type] of leads)
    it(`leads ${level} measurement with ${type ?? "nothing"}`, () => {
      assert.equal(chartsForLevel(level)[0]?.type ?? null, type);
    });
});

describe("chartsForMethod", () => {
  const leads: [(typeof ANALYSIS_METHOD_IDS)[number], ChartType][] = [
    ["pearson", "scatter"],
    ["correlation", "scatter"],
    ["simple-regression", "scatter"],
    ["spearman", "scatter"],
    ["independent-t-test", "mean-comparison"],
    ["one-way-anova", "mean-comparison"],
    ["paired-t-test", "error-bar"],
    ["repeated-measures-anova", "error-bar"],
    ["two-way-anova", "multi-line"],
    ["chi-square", "grouped-bar"],
    ["fisher-exact", "grouped-bar"],
    ["mann-whitney", "box-plot"],
    ["kruskal-wallis", "box-plot"],
    ["wilcoxon", "box-plot"],
    ["frequency", "bar"],
    ["median", "box-plot"],
    ["cronbach-alpha", "likert"],
  ];
  for (const [method, type] of leads)
    it(`suggests a ${CHART_TYPE_INFO[type].label.toLowerCase()} for ${method}`, () => {
      assert.equal(first(chartsForMethod(method)).type, type);
    });
  it("treats Spearman's scatter plot as possible, since it works on ranks", () => {
    assert.equal(first(chartsForMethod("spearman")).strength, "possible");
  });
  it("warns that multiple regression scatter plots don't show adjusted effects", () => {
    assert.match(first(chartsForMethod("multiple-regression")).reason, /adjusted/);
  });
  it("asks for adjusted means with ANCOVA", () => {
    assert.match(first(chartsForMethod("ancova")).reason, /adjusted means/);
  });
  for (const method of ["sem", "pls-sem", "cb-sem", "mediation", "factor-analysis", "kmo", "bartlett"] as const)
    it(`suggests no chart for ${method}, whose results are diagrams or tables`, () => {
      assert.deepEqual(chartsForMethod(method), []);
    });
  for (const method of ANALYSIS_METHOD_IDS)
    it(`gives well-formed suggestions for ${method}`, () => {
      chartsForMethod(method).forEach(wellFormed);
    });
});

describe("chartsForPair", () => {
  it("suggests a scatter plot for two numeric variables, with axis titles", () => {
    const [scatter] = chartsForPair(mv("Screen time", "numeric"), mv("Sleep quality", "scale-score"));
    assert.deepEqual([scatter.type, scatter.xTitle, scatter.yTitle, scatter.title], ["scatter", "Screen time", "Sleep quality", "Sleep quality and Screen time"]);
  });
  it("suggests group means and box plots for groups and a numeric outcome", () => {
    const suggestions = chartsForPair(mv("Condition", "categorical"), mv("Anxiety", "numeric"));
    assert.deepEqual(strong(suggestions), ["mean-comparison", "box-plot"]);
    assert.equal(first(suggestions).yTitle, "Mean Anxiety");
    assert.equal(first(suggestions).title, "Mean Anxiety by Condition");
  });
  it("treats binary and ordinal predictors as groups", () => {
    assert.equal(first(chartsForPair(mv("Gender", "binary"), mv("Score", "numeric"))).type, "mean-comparison");
    assert.equal(first(chartsForPair(mv("Year", "ordinal"), mv("Score", "numeric"))).type, "mean-comparison");
  });
  it("suggests 100% stacked and grouped bars for two categorical variables", () => {
    const suggestions = chartsForPair(mv("Faculty", "categorical"), mv("Passed", "binary"));
    assert.deepEqual(types(suggestions), ["stacked-bar-100", "grouped-bar"]);
    assert.equal(first(suggestions).yTitle, "Percentage");
  });
  it("suggests box plots across outcome groups for a numeric predictor", () => {
    const [box] = chartsForPair(mv("Age", "numeric"), mv("Passed", "binary"));
    assert.deepEqual([box.type, box.xTitle, box.yTitle], ["box-plot", "Passed", "Age"]);
  });
  for (const measure of ["text", "unknown", "multiple"] as const)
    it(`suggests nothing when one variable is ${measure}`, () => {
      assert.deepEqual(chartsForPair(mv("A", measure), mv("B", "numeric")), []);
      assert.deepEqual(chartsForPair(mv("A", "numeric"), mv("B", measure)), []);
    });
});

describe("mergeSuggestions", () => {
  const make = (type: ChartType, strength: ChartSuggestion["strength"], reason = "A reason for this chart.") => ({ type, strength, reason, sort: null, title: "", xTitle: "", yTitle: "" });
  it("keeps one suggestion per chart type", () => {
    assert.deepEqual(types(mergeSuggestions([make("bar", "possible"), make("bar", "possible"), make("pie", "possible")])), ["bar", "pie"]);
  });
  it("keeps the strongest", () => {
    assert.equal(mergeSuggestions([make("bar", "justify"), make("bar", "strong", "Strong reason.")])[0].reason, "Strong reason.");
  });
  it("keeps the first order", () => {
    assert.deepEqual(types(mergeSuggestions([make("pie", "possible"), make("bar", "possible"), make("pie", "strong")])), ["pie", "bar"]);
  });
});

describe("purposesInText", () => {
  const cases: [string, string[]][] = [
    ["To examine the relationship between screen time and sleep", ["relationship"]],
    ["To compare anxiety between three groups", ["comparison"]],
    ["To track changes in wellbeing over time", ["trend"]],
    ["To explore students' perceptions of feedback", ["agreement"]],
    ["To describe the proportion of students in each faculty", ["composition"]],
    ["To identify the most common reasons for absence", ["ranking"]],
    ["To assess the level of digital literacy", ["distribution"]],
    ["To determine the impact of mentoring and compare cohorts", ["relationship", "comparison"]],
    ["To write a literature review", []],
  ];
  for (const [objective, purposes] of cases)
    it(`reads “${objective}” as ${purposes.join(" and ") || "no purpose"}`, () => {
      assert.deepEqual(purposesInText(objective), purposes);
    });
});

describe("recommendationsForProject", () => {
  const project = build({
    variables: [
      ["Screen time", "independent", "ratio"],
      ["Faculty", "independent", "nominal"],
      ["Sleep quality", "dependent", "interval"],
      ["Satisfaction", "dependent", "likert"],
      ["Comments", "control", "open-ended"],
    ],
    objectives: ["To examine the relationship between screen time and sleep quality", "To write up findings"],
  });
  const plan = recommendationsForProject(project);

  it("suggests charts for every variable, with titles from its name", () => {
    assert.deepEqual(plan.variables.map((group) => group.heading), ["Screen time", "Faculty", "Sleep quality", "Satisfaction", "Comments"]);
    const screen = plan.variables[0];
    assert.equal(first(screen.suggestions).type, "histogram");
    assert.deepEqual([first(screen.suggestions).title, first(screen.suggestions).xTitle, first(screen.suggestions).yTitle], ["Distribution of Screen time", "Screen time", "Frequency"]);
    assert.deepEqual(screen.basedOn, ["Measurement level: Ratio"]);
  });
  it("suggests a diverging chart for a Likert variable", () => {
    const satisfaction = plan.variables.find((group) => group.heading === "Satisfaction");
    assert.equal(first(satisfaction?.suggestions ?? []).type, "likert");
    assert.equal(first(satisfaction?.suggestions ?? []).xTitle, "Percentage of responses");
  });
  it("suggests counts of participants for a nominal variable", () => {
    const faculty = plan.variables.find((group) => group.heading === "Faculty");
    assert.deepEqual([first(faculty?.suggestions ?? []).type, first(faculty?.suggestions ?? []).yTitle], ["bar", "Number of participants"]);
  });
  it("explains why written answers have no chart", () => {
    const comments = plan.variables.find((group) => group.heading === "Comments");
    assert.deepEqual(comments?.suggestions, []);
    assert.match(comments?.empty ?? "", /Code them into categories/);
  });
  it("pairs predictors with outcomes", () => {
    assert.deepEqual(plan.pairs.map((group) => group.heading), ["Screen time and Sleep quality", "Screen time and Satisfaction", "Faculty and Sleep quality", "Faculty and Satisfaction"]);
    assert.equal(first(plan.pairs[0].suggestions).type, "scatter");
    assert.equal(first(plan.pairs[2].suggestions).type, "mean-comparison");
    assert.equal(first(plan.pairs[3].suggestions).type, "stacked-bar-100");
  });
  it("says what each pair rests on", () => {
    assert.deepEqual(plan.pairs[0].basedOn, ["Screen time: Measurement level: Ratio", "Sleep quality: Measurement level: Interval"]);
  });
  it("adds charts for the strongly recommended analyses", () => {
    assert.ok(plan.analyses.length > 0);
    for (const group of plan.analyses) {
      assert.ok(group.suggestions.length > 0);
      assert.match(group.basedOn[0], /^Data analysis plan: .+ \(strong recommendation\)$/);
    }
  });
  it("reads the objectives' wording, never more than a possible recommendation", () => {
    const [relationship, writing] = plan.objectives;
    assert.equal(first(relationship.suggestions).type, "scatter");
    assert.ok(relationship.suggestions.every((suggestion) => suggestion.strength !== "strong"));
    assert.match(first(relationship.suggestions).reason, /^The objective's wording suggests relationship\./);
    assert.deepEqual(writing.suggestions, []);
    assert.match(writing.empty ?? "", /Choose a purpose below/);
  });
  it("adds a line over time for repeated measurements", () => {
    const repeated = recommendationsForProject(build({ variables: [["Group", "independent", "binary"], ["Wellbeing", "dependent", "interval"]], design: "longitudinal" }));
    const overTime = repeated.pairs.find((group) => group.heading === "Wellbeing over time");
    assert.equal(first(overTime?.suggestions ?? []).type, "line");
    assert.equal(first(overTime?.suggestions ?? []).yTitle, "Mean Wellbeing");
  });
  it("notes when there are no variables", () => {
    const empty = recommendationsForProject(build({}));
    assert.deepEqual([empty.variables, empty.pairs], [[], []]);
    assert.match(empty.notes.join(" "), /No variables are recorded yet/);
  });
  it("notes variables without a measurement level", () => {
    const unknown = recommendationsForProject(build({ variables: [["Motivation", "independent", null]] }));
    assert.match(unknown.notes.join(" "), /No measurement level is recorded for Motivation, so no chart can be matched to it\./);
  });
  it("explains pairs that can't be charted", () => {
    const unknown = recommendationsForProject(build({ variables: [["Motivation", "independent", null], ["Score", "dependent", "ratio"]] }));
    assert.match(unknown.pairs[0].empty ?? "", /measurement not recorded/);
  });
  it("lists at most eight pairs, with a note", () => {
    const many = recommendationsForProject(build({ variables: [..."ABC".split("").map((name) => [name, "independent", "ratio"] as [string, "independent", "ratio"]), ..."XYZ".split("").map((name) => [name, "dependent", "ratio"] as [string, "dependent", "ratio"])] }));
    assert.equal(many.pairs.length, MAX_PAIRS);
    assert.match(many.notes.join(" "), /Only the first 8 of 9 predictor–outcome pairs are listed\./);
  });
  it("counts Likert rating items as a scale score", () => {
    const scale = recommendationsForProject(build({ variables: [["Engagement", "dependent", "likert"]], items: { Engagement: 4 } }));
    assert.equal(first(scale.variables[0].suggestions).type, "histogram");
  });
});
