import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge } from "./compatibility";
import { explainJudgement, explainOption } from "./explanation";
import { OPTIONS } from "./research-onion";

describe("explainOption", () => {
  for (const option of OPTIONS) {
    it(`explains ${option.id} with a summary and a complete "learn more"`, () => {
      const explanation = explainOption(option.id);
      assert.equal(explanation.summary, option.definition);
      assert.ok(explanation.summary.length > 40);
      assert.ok(explanation.whyUsed.length > 0);
      assert.ok(explanation.strengths.length >= 2);
      assert.ok(explanation.limitations.length >= 2);
      assert.ok(explanation.learnMore.examples.length >= 2);
      assert.ok(explanation.learnMore.mistakes.length >= 2);
      assert.ok(explanation.learnMore.furtherReading.length >= 1);
      assert.deepEqual(
        explanation.learnMore.furtherReading.map((reference) => reference.id),
        option.references,
      );
    });
  }

  it("gives each option distinct common mistakes", () => {
    const mistakes = OPTIONS.flatMap((option) => option.mistakes);
    assert.equal(new Set(mistakes).size, mistakes.length);
  });

  it("rejects unknown options", () => {
    assert.throws(() => explainOption("astrology"), { name: "RangeError", message: "Unknown option: astrology" });
  });
});

describe("explainJudgement", () => {
  it("resolves the sources of a strong fit's evidence", () => {
    const explanation = explainJudgement(judge("positivism", "deductive")!);
    assert.equal(
      explanation.summary,
      "A deductive approach usually tests an existing theory against data. This fits well with Positivism, which generally begins from objective measurement.",
    );
    assert.equal(explanation.justify, null);
    assert.deepEqual(
      explanation.learnMore.evidence.map((reference) => reference.cite),
      ["Saunders et al., 2019", "Bryman, 2016"],
    );
    assert.equal(explanation.learnMore.alternativeView, null);
  });

  it("resolves the sources of an alternative view", () => {
    const explanation = explainJudgement(judge("positivism", "grounded-theory")!);
    assert.deepEqual(explanation.learnMore.evidence, []);
    assert.deepEqual(
      explanation.learnMore.alternativeView?.references.map((reference) => reference.cite),
      ["Glaser & Strauss, 1967", "Charmaz, 2014"],
    );
    assert.ok(explanation.justify?.startsWith("Explain why Grounded Theory is appropriate alongside Positivism"));
  });
});
