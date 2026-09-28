import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findTests } from "../../knowledge/research/test-finder";
import { resultAnnouncement, resultKey } from "./announcements";

const twoGroups = { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "two", secondFactor: "no", covariate: "no", normality: "yes" } as const;

describe("resultAnnouncement", () => {
  it("names the next question while answers are missing", () => {
    assert.equal(resultAnnouncement(findTests({})), "One more question: What are you trying to find out?");
    assert.equal(resultAnnouncement(findTests({ purpose: "compare", comparison: "independent", outcomeLevel: "interval" })), "4 questions still to answer. Next: How many groups are you comparing?");
  });

  it("counts the candidates without ranking them", () => {
    assert.equal(resultAnnouncement(findTests(twoGroups)), "1 candidate test shown, each with why it may fit.");
    assert.equal(resultAnnouncement(findTests({ ...twoGroups, normality: "no" })), "2 candidate tests shown, each with why it may fit.");
  });

  it("says when no covered test fits, and when answers need checking", () => {
    assert.match(resultAnnouncement(findTests({ purpose: "compare", comparison: "paired", outcomeLevel: "nominal", measurements: "two" })), /No test this tool covers/);
    assert.match(resultAnnouncement(findTests({ purpose: "relationship", outcomeLevel: "nominal" })), /^Check your answers\./);
  });
});

describe("resultKey", () => {
  it("ignores variable names, which don't change the tests", () => {
    assert.equal(resultKey(findTests(twoGroups)), resultKey(findTests({ ...twoGroups, outcomeName: "Job satisfaction" })));
    assert.notEqual(resultKey(findTests(twoGroups)), resultKey(findTests({ ...twoGroups, normality: "no" })));
  });
});
