import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateHypotheses } from "./hypothesis-builder";
import { CHECK_STATUS_LABELS } from "./hypothesis-checks";
import { validateHypothesisPair } from "./hypothesis-validator";
import type { Direction, HypothesisForm } from "./hypothesis-types";
import { createProjectDraft } from "./research-project";

const project = createProjectDraft({ population: "nurses", location: "Kenya", independentVariables: ["shift length"], dependentVariables: ["fatigue"] });

function checks(form: HypothesisForm, direction: Direction, edits: Partial<{ null: string; alternative: string }> = {}) {
  const [pair] = generateHypotheses(project, { form, direction }).pairs;
  const texts = { null: edits.null ?? pair.null.text, alternative: edits.alternative ?? pair.alternative.text };
  return Object.fromEntries(validateHypothesisPair(texts, pair.relationship).map((check) => [check.check, check]));
}

describe("validateHypothesisPair", () => {
  it("finds generated relationship and prediction drafts testable, logical and consistent", () => {
    for (const form of ["relationship", "prediction"] as const) {
      for (const direction of ["non-directional", "positive", "negative"] as const) {
        const result = checks(form, direction);
        for (const id of ["testability", "wording", "nullAlternative", "direction"]) assert.equal(result[id].status, "aligned", `${form} ${direction} ${id}`);
      }
    }
  });

  it("always leaves measurability for the researcher to review", () => {
    assert.equal(checks("relationship", "non-directional").measurability.status, "review");
    assert.equal(CHECK_STATUS_LABELS.review, "For you to review");
  });

  it("asks for clarification of a question, a “should” claim, vague words or “prove”", () => {
    assert.equal(checks("relationship", "non-directional", { alternative: "Is shift length related to fatigue?" }).testability.status, "clarify");
    assert.equal(checks("relationship", "non-directional", { alternative: "Hospitals should shorten shift length to reduce fatigue." }).testability.status, "clarify");
    assert.equal(checks("relationship", "non-directional", { alternative: "Better shift length is related to fatigue." }).measurability.status, "clarify");
    assert.match(checks("relationship", "non-directional", { alternative: "This study will prove that shift length is related to fatigue." }).wording.explanation, /can't prove it/);
  });

  it("notices a hypothesis that doesn't name both variables", () => {
    assert.equal(checks("relationship", "non-directional", { alternative: "Shift length matters." }).testability.status, "worth-checking");
  });

  it("notices more than one claim, and empty wording", () => {
    assert.equal(checks("relationship", "non-directional", { alternative: "Shift length is related to fatigue. Fatigue is related to errors." }).wording.status, "worth-checking");
    assert.equal(checks("relationship", "non-directional", { null: "" }).wording.status, "missing");
    assert.equal(checks("relationship", "non-directional", { alternative: "" }).testability.status, "missing");
  });

  it("checks that the null mirrors the alternative", () => {
    const result = checks("relationship", "non-directional", { null: "Shift length is related to fatigue among nurses in Kenya." });
    assert.equal(result.nullAlternative.status, "worth-checking");
    assert.match(result.nullAlternative.explanation, /should state that there is no effect/);
  });

  it("compares the wording's direction with the direction chosen", () => {
    assert.equal(checks("relationship", "non-directional", { alternative: "Shift length is positively related to fatigue among nurses in Kenya." }).direction.status, "worth-checking");
    assert.equal(checks("relationship", "positive", { alternative: "There is a relationship between shift length and fatigue among nurses in Kenya." }).direction.status, "worth-checking");
    assert.equal(checks("relationship", "positive", { alternative: "Shift length is negatively related to fatigue among nurses in Kenya." }).direction.explanation, "The wording states the opposite direction to the one chosen.");
    assert.equal(checks("relationship", "positive", { alternative: "Longer shifts lead to more fatigue and less alertness." }).direction.status, "clarify");
  });

  it("never gives a score", () => {
    const text = JSON.stringify(checks("difference", "positive"));
    assert.ok(!/\b\d+\s*(%|\/|out of)/.test(text));
  });
});
