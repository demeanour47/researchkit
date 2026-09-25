import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommendAnalyses } from "./data-analysis";
import { DATA_ANALYSIS_LIMITATIONS, DATA_ANALYSIS_REVIEW_ITEMS, analysisPlanText } from "./data-analysis-summary";
import { build } from "./data-analysis-test-helpers";

const project = build({
  variables: [
    ["screen time", "independent", "ratio"],
    ["sleep quality", "dependent", "ratio"],
  ],
  hypotheses: [{ form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] }],
  design: "survey",
  onion: { approach: "deductive", choice: "quantitative" },
  margin: 5,
  sampling: "convenience",
});
const text = analysisPlanText(recommendAnalyses(project));

describe("analysisPlanText", () => {
  it("starts with what the plan is based on", () => {
    assert.ok(
      text.startsWith(
        "Data analysis plan\n\nWhat the plan is based on\n- Methodological choice: quantitative\n- Research design: Survey\n- Repeated measurements: no\n- Planned sample: 385\n- screen time (independent): numeric [Measurement level: Ratio]\n- sleep quality (dependent): numeric [Measurement level: Ratio]\n",
      ),
    );
  });

  it("gives every stage, with each recommendation's verdict, reasons, fallback and justification", () => {
    for (const heading of ["Describe your data", "Check your measures", "Answer your research questions", "Test the whole model", "Notes"]) assert.ok(text.includes(`\n${heading}\n`), heading);
    assert.ok(text.includes("Hypothesis 1: screen time relates to sleep quality\n- Pearson correlation: Strong recommendation\n  Why: The hypothesis concerns a relationship, and screen time and sleep quality are both numeric."));
    assert.ok(text.includes("  If normality doesn't hold: Spearman's rank correlation"));
    assert.ok(text.includes("- Spearman's rank correlation: Possible recommendation"));
  });

  it("includes the plan's notes and a closing reminder", () => {
    assert.ok(text.includes("- Your sample is chosen without probability sampling"));
    assert.ok(text.endsWith("Check each method's assumptions against your data before reporting results.\n"));
  });

  it("says what to justify when a verdict needs it", () => {
    const qualitative = analysisPlanText(recommendAnalyses({ ...project, researchOnionSelection: { choice: "qualitative" } }));
    assert.ok(qualitative.includes("Pearson correlation: Needs justification"));
    assert.ok(qualitative.includes("  To justify: Explain what a statistical test adds to a qualitative study"));
  });

  it("describes an empty project honestly", () => {
    const empty = analysisPlanText(recommendAnalyses({}));
    assert.ok(empty.includes("- Methodological choice: not recorded\n- Research design: not chosen\n- Repeated measurements: no\n- Planned sample: not recorded\n"));
  });
});

describe("limitations and review items", () => {
  it("state what the recommender can't do, including that it never calls a method wrong", () => {
    assert.ok(DATA_ANALYSIS_LIMITATIONS.some((item) => item.includes("Normality")));
    assert.ok(DATA_ANALYSIS_LIMITATIONS.some((item) => item.includes("never says a method is wrong")));
    assert.deepEqual(DATA_ANALYSIS_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Statistical review", "Sample size guidance", "References", "Worked examples"]);
  });
});
