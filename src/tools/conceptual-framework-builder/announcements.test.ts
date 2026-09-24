import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARROW_KEYS, announcements, warningsAnnouncement } from "./announcements";

describe("announcements", () => {
  it("reports a move with whole-number coordinates", () => {
    assert.equal(announcements.moved("Screen time", 32.4, 154.6), "Screen time moved to 32, 155.");
  });

  it("says how to recover from a deletion", () => {
    assert.equal(announcements.deleted("Screen time"), "Screen time deleted. Use Undo to restore it.");
  });

  it("names what was added", () => {
    assert.equal(announcements.added("variable", "Age"), "Variable added: Age.");
    assert.equal(announcements.added("relationship", "Age moderates sleep."), "Relationship added: Age moderates sleep.");
  });

  it("gives a way forward when copying fails", () => {
    assert.match(announcements.copyFailed, /Download it as SVG or PNG instead/);
  });
});

describe("warningsAnnouncement", () => {
  it("counts warnings in words", () => {
    assert.equal(warningsAnnouncement(0), "No warnings.");
    assert.equal(warningsAnnouncement(1), "1 warning to review.");
    assert.equal(warningsAnnouncement(4), "4 warnings to review.");
  });
});

describe("ARROW_KEYS", () => {
  it("moves one step in each direction", () => {
    assert.deepEqual(ARROW_KEYS, { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] });
  });
});
