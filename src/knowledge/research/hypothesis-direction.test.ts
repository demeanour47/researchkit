import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DIRECTION_LABELS, describeDirection, readDirection } from "./hypothesis-direction";
import { DIRECTIONS, HYPOTHESIS_FORMS } from "./hypothesis-types";

describe("readDirection", () => {
  const cases: [string, string][] = [
    ["There is a relationship between screen time and sleep quality.", "non-directional"],
    ["Screen time predicts sleep quality.", "non-directional"],
    ["Screen time is positively related to sleep quality.", "positive"],
    ["Screen time is negatively related to sleep quality.", "negative"],
    ["Sleep quality is higher in students who use screens less.", "mixed"],
    ["Higher screen time predicts higher sleep quality.", "positive"],
    ["Higher screen time predicts lower sleep quality.", "negative"],
    ["Mentoring increases retention.", "positive"],
    ["Mentoring reduces dropout.", "negative"],
    ["", "non-directional"],
  ];
  for (const [text, expected] of cases) {
    it(`reads “${text}” as ${expected}`, () => {
      assert.equal(readDirection(text), expected);
    });
  }

  it("doesn't mistake words that contain direction words", () => {
    assert.equal(readDirection("Gender moderates the relationship."), "non-directional");
    assert.equal(readDirection("Unless and lessons are not directions."), "non-directional");
  });
});

describe("describeDirection", () => {
  it("explains every direction for every form", () => {
    for (const form of HYPOTHESIS_FORMS) {
      for (const direction of DIRECTIONS) {
        assert.ok(describeDirection(form, direction).startsWith("The hypothesis states"), `${form} ${direction}`);
      }
    }
  });

  it("describes directional differences between named groups", () => {
    assert.equal(describeDirection("difference", "negative"), "The hypothesis states that the outcome is lower in one named group than in the other.");
    assert.equal(describeDirection("relationship", "positive"), "The hypothesis states that as one variable increases, the other increases.");
  });

  it("labels every direction", () => {
    assert.deepEqual(Object.keys(DIRECTION_LABELS), [...DIRECTIONS]);
  });
});
