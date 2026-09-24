import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GENERAL_JUSTIFICATION, summarise } from "./recommendation";
import type { OnionSelection } from "./types";

describe("summarise", () => {
  it("summarises a conventional quantitative design as strong throughout", () => {
    const summary = summarise({
      philosophy: "positivism",
      approach: "deductive",
      choice: "quantitative",
      strategy: "survey",
      timeHorizon: "cross-sectional",
      technique: "questionnaire",
    });
    assert.equal(summary.complete, true);
    assert.deepEqual(summary.missing, []);
    assert.deepEqual(
      summary.choices.map(({ layer, option }) => [layer, option.name]),
      [
        ["philosophy", "Positivism"],
        ["approach", "Deductive"],
        ["choice", "Quantitative"],
        ["strategy", "Survey"],
        ["timeHorizon", "Cross-sectional"],
        ["technique", "Questionnaire"],
      ],
    );
    assert.deepEqual(summary.counts, { strong: 9, possible: 0, careful: 0 });
    assert.equal(summary.whyItWorks.length, 9);
    assert.equal(
      summary.whyItWorks[0],
      "A deductive approach usually tests an existing theory against data. This fits well with Positivism, which generally begins from objective measurement.",
    );
    assert.deepEqual(summary.toJustify, [GENERAL_JUSTIFICATION]);
    assert.deepEqual(summary.weaknesses, [
      "Positivism: Can overlook the meanings people give to their experiences.",
      "Deductive: May miss unexpected findings outside the hypotheses.",
      "Quantitative: Can miss the reasons behind the numbers.",
      "Survey: Answers are limited to the questions asked.",
      "Cross-sectional: Can't show change over time.",
      "Questionnaire: Little chance to probe or clarify answers.",
    ]);
  });

  it("lists what to justify for each combination that is not a strong fit, in layer order", () => {
    const summary = summarise({
      philosophy: "positivism",
      approach: "inductive",
      choice: "qualitative",
      strategy: "grounded-theory",
      timeHorizon: "longitudinal",
      technique: "interview",
    });
    assert.deepEqual(summary.counts, { strong: 5, possible: 1, careful: 3 });
    assert.deepEqual(summary.toJustify, [
      GENERAL_JUSTIFICATION,
      "Explain why an inductive approach is appropriate alongside Positivism, and how you will address the tension between them.",
      "Explain why a qualitative design is appropriate alongside Positivism, and how you will address the tension between them.",
      "Explain why Grounded Theory is appropriate alongside Positivism, and how you will address the tension between them.",
      "Explain how a longitudinal design will work alongside Grounded Theory in your study.",
    ]);
    assert.equal(summary.whyItWorks.length, 5);
    assert.ok(
      summary.judgements.some(
        (judgement) =>
          judgement.reason ===
          "Grounded Theory usually develops theory inductively, while Positivism generally begins from objective measurement.",
      ),
    );
  });

  it("keeps whyItWorks, counts and toJustify consistent with the judgements", () => {
    const selections: OnionSelection[] = [
      { philosophy: "realism", approach: "abductive", choice: "multi-method", strategy: "archival-research" },
      { philosophy: "interpretivism", strategy: "experiment", technique: "secondary-data" },
      { choice: "mixed-methods", strategy: "case-study", timeHorizon: "cross-sectional", technique: "document-analysis" },
    ];
    for (const selection of selections) {
      const summary = summarise(selection);
      const strong = summary.judgements.filter((judgement) => judgement.fit === "strong");
      assert.equal(summary.whyItWorks.length, strong.length);
      assert.equal(summary.counts.strong + summary.counts.possible + summary.counts.careful, summary.judgements.length);
      assert.equal(summary.toJustify.length, 1 + summary.judgements.length - strong.length);
    }
  });

  it("summarises an empty selection without judgements or advice", () => {
    const summary = summarise({});
    assert.equal(summary.complete, false);
    assert.deepEqual(summary.choices, []);
    assert.deepEqual(summary.missing, ["philosophy", "approach", "choice", "strategy", "timeHorizon", "technique"]);
    assert.deepEqual(summary.judgements, []);
    assert.deepEqual(summary.counts, { strong: 0, possible: 0, careful: 0 });
    assert.deepEqual(summary.whyItWorks, []);
    assert.deepEqual(summary.weaknesses, []);
    assert.deepEqual(summary.toJustify, []);
  });

  it("summarises a partial selection and lists the missing layers", () => {
    const summary = summarise({ philosophy: "realism", timeHorizon: undefined });
    assert.equal(summary.complete, false);
    assert.deepEqual(summary.missing, ["approach", "choice", "strategy", "timeHorizon", "technique"]);
    assert.deepEqual(summary.judgements, []);
    assert.deepEqual(summary.weaknesses, ["Realism: Its concepts, such as underlying mechanisms, can be difficult to define and study."]);
    assert.deepEqual(summary.toJustify, [GENERAL_JUSTIFICATION]);
  });

  it("does not change the selection it is given", () => {
    const selection: OnionSelection = { philosophy: "pragmatism", approach: "deductive" };
    const copy = { ...selection };
    summarise(selection);
    assert.deepEqual(selection, copy);
  });

  it("rejects unknown options and options in the wrong layer", () => {
    assert.throws(() => summarise({ strategy: "astrology" }), RangeError);
    assert.throws(() => summarise({ technique: "survey" }), RangeError);
  });
});
