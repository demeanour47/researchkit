import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DESIGN_CHECK_IDS, SHORT_JUSTIFICATION_WORDS, validateDesign } from "./design-validator";
import { EMPTY_DESIGN, answerQuestion, chooseDesign, setJustification, shortlistDesign } from "./research-design";
import { createProjectDraft } from "./research-project";

const long = (text: string) => `${text} ${"This design suits the question because it measures the variables in context. ".repeat(6)}`;
const byCheck = (checks: ReturnType<typeof validateDesign>) => Object.fromEntries(checks.map((check) => [check.check, check]));

describe("validateDesign", () => {
  it("leaves the choice to the researcher when nothing is chosen", () => {
    assert.deepEqual(validateDesign(EMPTY_DESIGN, {}).map((check) => [check.check, check.status]), [
      ["choice", "review"],
      ["justification", "review"],
    ]);
    assert.match(validateDesign(shortlistDesign(EMPTY_DESIGN, "survey"), {})[0].explanation, /That is your decision/);
  });

  it("checks a chosen design's justification, fit and answers, in order", () => {
    const checks = validateDesign(chooseDesign(EMPTY_DESIGN, "survey"), {});
    assert.deepEqual(checks.map((check) => check.check), DESIGN_CHECK_IDS.filter((id) => id !== "dimension"));
    assert.equal(byCheck(checks).answers.status, "review");
  });

  it("asks for a longer justification that names the design", () => {
    const short = byCheck(validateDesign(setJustification(chooseDesign(EMPTY_DESIGN, "survey"), "It fits."), {}));
    assert.equal(short.justification.status, "worth-checking");
    assert.match(short.justification.explanation, /^Your justification is 2 words\./);
    const unnamed = byCheck(validateDesign(setJustification(chooseDesign(EMPTY_DESIGN, "case-study"), long("")), {}));
    assert.match(unnamed.justification.explanation, /doesn't name the design/);
    const named = byCheck(validateDesign(setJustification(chooseDesign(EMPTY_DESIGN, "case-study"), long("A case study")), {}));
    assert.equal(named.justification.status, "aligned");
    assert.ok(SHORT_JUSTIFICATION_WORDS >= 30);
  });

  it("reports compatibility problems from the checks", () => {
    const quantitative = createProjectDraft({ researchOnionSelection: { philosophy: "positivism", choice: "quantitative" } });
    const checks = byCheck(validateDesign(chooseDesign(EMPTY_DESIGN, "phenomenology"), quantitative));
    assert.equal(checks.compatibility.status, "clarify");
    assert.match(checks.compatibility.explanation, /research philosophy, methodological choice/);
  });

  it("explains where a chosen design differs from the answers", () => {
    const record = answerQuestion(answerQuestion(chooseDesign(EMPTY_DESIGN, "cross-sectional"), "timing", "repeated"), "cases", "multiple");
    const answers = byCheck(validateDesign(record, {})).answers;
    assert.equal(answers.status, "worth-checking");
    assert.equal(answers.explanation, "Cross-sectional designs collect data at one point in time, so they can't show change.");
  });

  it("notes that timing and purpose designs also need a strategy", () => {
    assert.equal(byCheck(validateDesign(chooseDesign(EMPTY_DESIGN, "longitudinal"), {})).dimension.status, "review");
    assert.match(byCheck(validateDesign(chooseDesign(EMPTY_DESIGN, "exploratory"), {})).dimension.explanation, /describes the purpose of a study/);
    assert.equal(byCheck(validateDesign(chooseDesign(EMPTY_DESIGN, "survey"), {})).dimension, undefined);
  });

  it("never uses the Missing status", () => {
    for (const record of [EMPTY_DESIGN, chooseDesign(EMPTY_DESIGN, "survey")]) {
      for (const check of validateDesign(record, {})) assert.notEqual(check.status, "missing");
    }
  });
});
