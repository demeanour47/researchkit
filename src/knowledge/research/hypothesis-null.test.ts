import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkNullAlternative, mediationNullWording, moderationNullWording, nullWording, statesAbsence } from "./hypothesis-null";

const parts = { independent: "screen time", dependent: "sleep quality", scope: " among students" };

describe("null hypothesis wording", () => {
  it("states the absence of an effect for each form", () => {
    assert.equal(nullWording("difference", parts), "There is no difference in sleep quality between groups defined by screen time among students.");
    assert.equal(nullWording("relationship", parts), "There is no relationship between screen time and sleep quality among students.");
    assert.equal(nullWording("prediction", parts), "Screen time does not predict sleep quality among students.");
  });

  it("states the absence of moderation and mediation", () => {
    assert.equal(moderationNullWording("age", parts), "Age does not moderate the relationship between screen time and sleep quality among students.");
    assert.equal(mediationNullWording("bedtime", parts), "The relationship between screen time and sleep quality is not mediated by bedtime among students.");
  });

  it("is always recognised as stating absence", () => {
    for (const text of [nullWording("difference", parts), nullWording("relationship", parts), nullWording("prediction", parts), moderationNullWording("age", parts), mediationNullWording("bedtime", parts)]) {
      assert.ok(statesAbsence(text), text);
    }
  });
});

describe("checkNullAlternative", () => {
  const variables = ["screen time", "sleep quality"];
  const good = {
    null: "There is no relationship between screen time and sleep quality.",
    alternative: "There is a relationship between screen time and sleep quality.",
  };

  it("accepts a null that mirrors its alternative", () => {
    assert.deepEqual(checkNullAlternative(good.null, good.alternative, variables), []);
  });

  it("notices a null that doesn't state absence", () => {
    assert.deepEqual(
      checkNullAlternative(good.alternative, good.alternative, variables).map((issue) => issue.issue),
      ["null-not-negative"],
    );
  });

  it("notices an alternative that states absence", () => {
    assert.deepEqual(checkNullAlternative(good.null, good.null, variables).map((issue) => issue.issue), ["alternative-negative"]);
  });

  it("notices when the two name different variables", () => {
    const issues = checkNullAlternative("There is no relationship between noise and sleep quality.", good.alternative, variables);
    assert.deepEqual(issues.map((issue) => issue.issue), ["variables-differ"]);
    assert.match(issues[0].explanation, /“screen time”/);
  });

  it("raises nothing about wording that hasn't been written yet", () => {
    assert.deepEqual(checkNullAlternative("", "", []), []);
  });
});
