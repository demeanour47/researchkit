import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addObjective, duplicateObjective, editObjective, moveObjective, removeObjective } from "./objective-list";

const objectives = ["Identify variable A.", "Identify variable B.", "Examine the relationship."];

describe("addObjective", () => {
  it("adds text at the end", () => {
    assert.deepEqual(addObjective(objectives, "A new objective."), [...objectives, "A new objective."]);
  });

  it("trims the text before adding it", () => {
    assert.deepEqual(addObjective([], "  Spaced out.  "), ["Spaced out."]);
  });

  it("ignores blank text", () => {
    assert.deepEqual(addObjective(objectives, "   "), objectives);
  });

  it("adds to an empty list", () => {
    assert.deepEqual(addObjective([], "First objective."), ["First objective."]);
  });
});

describe("editObjective", () => {
  it("replaces the objective at a position", () => {
    assert.deepEqual(editObjective(objectives, 1, "Updated objective."), ["Identify variable A.", "Updated objective.", "Examine the relationship."]);
  });

  it("throws for an out-of-range index", () => {
    assert.throws(() => editObjective(objectives, 5, "x"), RangeError);
    assert.throws(() => editObjective(objectives, -1, "x"), RangeError);
  });
});

describe("removeObjective", () => {
  it("removes the objective at a position", () => {
    assert.deepEqual(removeObjective(objectives, 1), ["Identify variable A.", "Examine the relationship."]);
  });

  it("throws for an out-of-range index", () => {
    assert.throws(() => removeObjective(objectives, 5), RangeError);
  });

  it("can empty the list", () => {
    assert.deepEqual(removeObjective(["Only one."], 0), []);
  });
});

describe("duplicateObjective", () => {
  it("copies the objective directly after itself", () => {
    assert.deepEqual(duplicateObjective(objectives, 0), ["Identify variable A.", "Identify variable A.", "Identify variable B.", "Examine the relationship."]);
  });

  it("duplicates the last objective at the end", () => {
    assert.deepEqual(duplicateObjective(objectives, 2), [...objectives, "Examine the relationship."]);
  });

  it("throws for an out-of-range index", () => {
    assert.throws(() => duplicateObjective(objectives, 5), RangeError);
  });
});

describe("moveObjective", () => {
  it("moves an objective earlier", () => {
    assert.deepEqual(moveObjective(objectives, 2, 0), ["Examine the relationship.", "Identify variable A.", "Identify variable B."]);
  });

  it("moves an objective later", () => {
    assert.deepEqual(moveObjective(objectives, 0, 2), ["Identify variable B.", "Examine the relationship.", "Identify variable A."]);
  });

  it("clamps a target beyond the list to the end", () => {
    assert.deepEqual(moveObjective(objectives, 0, 99), ["Identify variable B.", "Examine the relationship.", "Identify variable A."]);
  });

  it("clamps a negative target to the start", () => {
    assert.deepEqual(moveObjective(objectives, 2, -5), ["Examine the relationship.", "Identify variable A.", "Identify variable B."]);
  });

  it("throws for an out-of-range source index", () => {
    assert.throws(() => moveObjective(objectives, 5, 0), RangeError);
  });
});
