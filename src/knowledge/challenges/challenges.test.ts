import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAnalysisMethod } from "../research/data-analysis-types";
import { findTests } from "../research/test-finder/finder";
import { CHALLENGES, getChallenge, isCorrect, nextChallenge } from "./challenges";

describe("research challenges", () => {
  it("has unique ids and at least four options each, one of them correct", () => {
    assert.equal(new Set(CHALLENGES.map((challenge) => challenge.id)).size, CHALLENGES.length);
    for (const challenge of CHALLENGES) {
      assert.ok(challenge.options.length >= 3, challenge.id);
      assert.equal(new Set(challenge.options.map((option) => option.method)).size, challenge.options.length, `${challenge.id} repeats an option`);
      assert.equal(challenge.options.filter((option) => option.method === challenge.correct).length, 1, challenge.id);
    }
  });

  it("keys each answer to what the Statistical Test Finder commonly uses for the situation", () => {
    for (const challenge of CHALLENGES) {
      const result = findTests(challenge.situation);
      assert.equal(result.status, "complete", challenge.id);
      if (result.status !== "complete") continue;
      const common = result.candidates.filter((candidate) => candidate.fit === "common").map((candidate) => candidate.method);
      assert.ok(common.includes(challenge.correct), `${challenge.id}: ${challenge.correct} is not among ${common.join(", ")}`);
      for (const option of challenge.options) {
        if (option.method !== challenge.correct) assert.ok(!common.includes(option.method), `${challenge.id}: distractor ${option.method} is also commonly used`);
      }
    }
  });

  it("explains every option, and names real tests", () => {
    for (const challenge of CHALLENGES) {
      for (const option of challenge.options) {
        assert.ok(option.explanation.length > 30, `${challenge.id}/${option.method}`);
        assert.ok(getAnalysisMethod(option.method).name);
      }
    }
  });

  it("includes the example from the brief", () => {
    const challenge = getChallenge("two-groups-scores");
    assert.ok(challenge);
    assert.equal(challenge.correct, "independent-t-test");
    assert.deepEqual(challenge.options.map((option) => option.method).sort(), ["chi-square", "independent-t-test", "one-way-anova", "pearson"]);
  });

  it("judges an answer", () => {
    const challenge = CHALLENGES[0];
    assert.equal(isCorrect(challenge, challenge.correct), true);
    assert.equal(isCorrect(challenge, "chi-square"), false);
  });

  it("moves to the next challenge, wraps round, and copes with an unknown id", () => {
    assert.equal(nextChallenge(CHALLENGES[0].id)?.id, CHALLENGES[1].id);
    assert.equal(nextChallenge(CHALLENGES[CHALLENGES.length - 1].id)?.id, CHALLENGES[0].id);
    assert.equal(nextChallenge("unknown")?.id, CHALLENGES[0].id);
    assert.equal(nextChallenge(undefined, []), undefined);
  });
});
