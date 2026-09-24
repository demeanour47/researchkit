import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { announcements, stepPosition } from "./announcements";

describe("announcements", () => {
  it("says what happened and how to recover", () => {
    assert.equal(announcements.deleted("Screen time"), "Screen time deleted. Use Undo to restore it.");
    assert.equal(announcements.indicatorDeleted("Weekday hours"), "Indicator Weekday hours deleted. Use Undo to restore it.");
  });

  it("announces moves with a position out of the total", () => {
    assert.equal(announcements.indicatorMoved("Weekday hours", 2, 3), "Weekday hours moved to position 2 of 3.");
  });

  it("uses singular and plural wording for imports", () => {
    assert.equal(announcements.imported(1), "1 new variable imported from your project.");
    assert.equal(announcements.imported(3), "3 new variables imported from your project.");
  });

  it("gives a way forward when copying fails", () => {
    assert.match(announcements.copyFailed, /Control\+C/);
  });
});

describe("stepPosition", () => {
  it("moves one step within the list", () => {
    assert.equal(stepPosition(1, 3, -1), 0);
    assert.equal(stepPosition(1, 3, 1), 2);
  });

  it("refuses to move past either end", () => {
    assert.equal(stepPosition(0, 3, -1), null);
    assert.equal(stepPosition(2, 3, 1), null);
    assert.equal(stepPosition(0, 1, 1), null);
  });
});
