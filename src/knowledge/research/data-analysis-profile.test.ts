import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEASURE_FOR_LEVEL, MEASURE_LABELS, MEASURES, analysisProfile, measureVariable, type Measure } from "./data-analysis-profile";
import { build, withIndicators } from "./data-analysis-test-helpers";
import { updateProjectDraft } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, chooseMethod, updateInputs } from "./sample-size";
import { applySampleSize } from "./sample-size-summary";
import type { QuestionType } from "./questionnaire-types";
import { MEASUREMENT_LEVELS, type MeasurementLevel } from "./variable-types";

const measureOf = (project: ReturnType<typeof build>, name = "x") => measureVariable(project.variables!.find((variable) => variable.name === name)!, project);

describe("MEASURE_FOR_LEVEL", () => {
  const expected: Record<MeasurementLevel, Measure> = {
    nominal: "categorical",
    ordinal: "ordinal",
    interval: "numeric",
    ratio: "numeric",
    binary: "binary",
    likert: "ordinal",
    continuous: "numeric",
    categorical: "categorical",
    "multiple-response": "multiple",
    "open-ended": "text",
  };
  for (const level of MEASUREMENT_LEVELS) {
    it(`treats the ${level} level as ${expected[level]}`, () => {
      assert.equal(MEASURE_FOR_LEVEL[level], expected[level]);
      const measured = measureOf(build({ variables: [["x", "independent", level]] }));
      assert.equal(measured.measure, expected[level]);
      assert.match(measured.source, /^Measurement level: /);
    });
  }

  it("labels every measure in words", () => {
    for (const measure of MEASURES) assert.ok(MEASURE_LABELS[measure].length > 0, measure);
  });
});

describe("measureVariable", () => {
  it("counts a binary variable as two groups, and others as unknown", () => {
    assert.equal(measureOf(build({ variables: [["x", "independent", "binary"]] })).groups, 2);
    assert.equal(measureOf(build({ variables: [["x", "independent", "nominal"]] })).groups, null);
  });

  it("makes a scale score from two or more rating items, but not from one", () => {
    const two = measureOf(build({ variables: [["x", "dependent", "likert"]], items: { x: 2 } }));
    assert.deepEqual([two.measure, two.items, two.source], ["scale-score", 2, "Measurement level: Likert, with 2 rating items"]);
    const one = measureOf(build({ variables: [["x", "dependent", "likert"]], items: { x: 1 } }));
    assert.deepEqual([one.measure, one.items], ["ordinal", 1]);
  });

  it("counts a matrix question's statements as rating items", () => {
    const project = build({ variables: [["x", "dependent", null]], questions: [["x", "matrix"]] });
    const question = project.questionnaire!.questions[0];
    const withRows = updateProjectDraft(project, { questionnaire: { ...project.questionnaire!, questions: [{ ...question, rows: ["a", "b", "c"] }] } });
    assert.deepEqual([measureOf(withRows).measure, measureOf(withRows).items], ["scale-score", 3]);
  });

  it("counts Likert indicators as items", () => {
    const project = withIndicators(build({ variables: [["x", "dependent", null]] }), "x", ["likert", "likert", "likert"]);
    const measured = measureOf(project);
    assert.deepEqual([measured.measure, measured.items], ["scale-score", 3]);
    assert.equal(measured.source, "Indicator measurement levels: Likert, with 3 rating items");
  });

  it("uses indicators' shared level when the variable has none", () => {
    const project = withIndicators(build({ variables: [["x", "dependent", null]] }), "x", ["ratio", "interval", null]);
    assert.equal(measureOf(project).measure, "numeric");
  });

  it("refuses to combine indicators measured differently, and says why", () => {
    const measured = measureOf(withIndicators(build({ variables: [["x", "dependent", null]] }), "x", ["ratio", "nominal"]));
    assert.equal(measured.measure, "unknown");
    assert.match(measured.source, /measured at different levels \(Ratio, Nominal\)/);
  });

  it("prefers the variable's own level to its indicators' and questions'", () => {
    const project = withIndicators(build({ variables: [["x", "dependent", "binary"]], questions: [["x", "numeric"]] }), "x", ["ratio"]);
    assert.equal(measureOf(project).measure, "binary");
  });

  const byQuestion: [QuestionType, Measure][] = [
    ["numeric", "numeric"],
    ["likert", "ordinal"],
    ["semantic-differential", "ordinal"],
    ["ranking", "ordinal"],
    ["yes-no", "binary"],
    ["true-false", "binary"],
    ["multiple-choice", "categorical"],
    ["dropdown", "categorical"],
    ["checkbox", "multiple"],
    ["short-answer", "text"],
    ["long-answer", "text"],
    ["paragraph", "text"],
    ["date", "unknown"],
    ["time", "unknown"],
    ["file-upload", "unknown"],
  ];
  for (const [type, measure] of byQuestion) {
    it(`reads a ${type} question as ${measure} when nothing else is recorded`, () => {
      assert.equal(measureOf(build({ variables: [["x", "independent", null]], questions: [["x", type]] })).measure, measure);
    });
  }

  it("counts groups from a choice question's written options", () => {
    assert.equal(measureOf(build({ variables: [["x", "independent", null]], questions: [["x", "multiple-choice", ["Arts", "Science", "Law"]]] })).groups, 3);
    assert.equal(measureOf(build({ variables: [["x", "independent", null]], questions: [["x", "multiple-choice"]] })).groups, null, "placeholder options aren't counted");
  });

  it("reports an unrecorded measure", () => {
    const measured = measureOf(build({ variables: [["x", "independent", null]] }));
    assert.deepEqual([measured.measure, measured.source], ["unknown", "No measurement level recorded"]);
  });
});

describe("analysisProfile", () => {
  it("reads the methodological choice from the onion, then the methodology, then the design", () => {
    assert.deepEqual([analysisProfile(build({ onion: { choice: "quantitative" } })).choice, analysisProfile(build({ onion: { choice: "quantitative" } })).choiceSource], ["quantitative", "Research onion: quantitative methodological choice"]);
    assert.equal(analysisProfile(build({ onion: { choice: "qualitative" } })).choice, "qualitative");
    assert.equal(analysisProfile(build({ onion: { choice: "mixed-methods" } })).choice, "mixed");
    assert.equal(analysisProfile(build({ onion: { choice: "multi-method" } })).choice, "mixed");
    assert.equal(analysisProfile(updateProjectDraft({}, { methodology: "qualitative" })).choice, "qualitative");
    assert.deepEqual([analysisProfile(build({ design: "phenomenology" })).choice, analysisProfile(build({ design: "phenomenology" })).choiceSource], ["qualitative", "Research design: Phenomenology"]);
    assert.equal(analysisProfile(build({ design: "sequential-mixed" })).choice, "mixed");
    assert.equal(analysisProfile(build({ design: "case-study" })).choice, "unknown", "a design used either way doesn't decide");
    assert.equal(analysisProfile({}).choice, "unknown");
  });

  it("finds repeated measurement in a longitudinal design or time horizon only", () => {
    assert.deepEqual([analysisProfile(build({ design: "longitudinal" })).repeated, analysisProfile(build({ design: "longitudinal" })).repeatedSource], [true, "Research design: Longitudinal"]);
    assert.deepEqual([analysisProfile(build({ onion: { timeHorizon: "longitudinal" } })).repeated, analysisProfile(build({ onion: { timeHorizon: "longitudinal" } })).repeatedSource], [true, "Research onion: longitudinal time horizon"]);
    for (const design of ["pre-experimental", "quasi-experimental", "survey", "cross-sectional"] as const) assert.equal(analysisProfile(build({ design })).repeated, false, design);
  });

  it("describes the chosen design's family, manipulation and causality", () => {
    assert.deepEqual(analysisProfile(build({ design: "true-experimental" })).design, { id: "true-experimental", name: "True experimental", family: "experimental", manipulation: "yes", causality: "strong" });
    assert.equal(analysisProfile({}).design, null);
  });

  it("takes the planned sample from a calculable sample size plan", () => {
    const profile = analysisProfile(build({ margin: 5 }));
    assert.deepEqual([profile.sampleSize, profile.sampleSource], [385, "Sample size plan: 385 completed responses"]);
    assert.equal(analysisProfile(build({ margin: 20 })).sampleSize, 25);
  });

  it("uses no sample size when the plan can't be calculated or is a power analysis", () => {
    assert.equal(analysisProfile(build({ margin: 0 })).sampleSize, null);
    assert.equal(analysisProfile(applySampleSize({}, chooseMethod(DEFAULT_SAMPLE_SIZE_PLAN, "power-analysis"))).sampleSize, null);
    assert.equal(analysisProfile(applySampleSize({}, updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { designEffect: 2 }))).sampleSize, 770, "the adjusted size, after the design effect");
  });

  it("knows whether sampling is probability-based", () => {
    assert.deepEqual([analysisProfile(build({ sampling: "simple-random" })).probabilitySampling, analysisProfile(build({ sampling: "simple-random" })).samplingSource], [true, "Sampling technique: Simple random sampling"]);
    assert.equal(analysisProfile(build({ sampling: "convenience" })).probabilitySampling, false);
    assert.equal(analysisProfile({}).probabilitySampling, null);
  });

  it("keeps only alternative hypotheses, which the analyses test", () => {
    const project = build({ variables: [["a", "independent", "ratio"], ["b", "dependent", "ratio"]], hypotheses: [{ form: "relationship", ivs: ["a"], dvs: ["b"] }] });
    const withNull = updateProjectDraft(project, { hypotheses: [...project.hypotheses!, { ...project.hypotheses![0], id: "h0", role: "null" }] });
    assert.deepEqual(analysisProfile(withNull).hypotheses.map((hypothesis) => hypothesis.id), ["h1"]);
  });

  it("lists every gap in an empty project, and none in a complete one", () => {
    assert.deepEqual(analysisProfile({}).gaps, [
      "No variables are recorded, so no analysis can be matched to them.",
      "No research design is chosen, so the design can't inform the recommendations.",
      "The methodological choice (quantitative, qualitative or mixed) isn't recorded.",
      "No planned sample size is available, so sample size can't inform the recommendations.",
    ]);
    const complete = build({ variables: [["a", "independent", "ratio"]], design: "survey", onion: { choice: "quantitative" }, margin: 5 });
    assert.deepEqual(analysisProfile(complete).gaps, []);
    assert.deepEqual(analysisProfile(build({ variables: [["a", "independent", null], ["b", "dependent", null]] })).gaps[0], "No measurement level is recorded for a, b; tests depend on it.");
  });

  it("reads variables named only in lists when there are none from the Variables Builder", () => {
    const profile = analysisProfile(updateProjectDraft({}, { independentVariables: ["exercise"], dependentVariables: ["mood"] }));
    assert.deepEqual(profile.variables.map((variable) => `${variable.name}:${variable.kind}:${variable.measure}`), ["exercise:independent:unknown", "mood:dependent:unknown"]);
  });
});
