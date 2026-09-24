import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { announcements, narrowingAnnouncement } from "./announcements";

describe("announcements", () => {
  it("names the design added, removed or chosen", () => {
    assert.equal(announcements.added("Survey"), "Survey added to your shortlist.");
    assert.equal(announcements.removed("Survey"), "Survey removed from your shortlist.");
    assert.equal(announcements.chosen("Case study"), "You chose Case study. Its checks are shown under Justify your design.");
    assert.equal(announcements.chosen(null), "No design chosen.");
  });

  it("gives a way forward when copying fails", () => {
    assert.match(announcements.copyFailed, /Command\+C/);
  });
});

describe("narrowingAnnouncement", () => {
  it("describes how many designs fit, without choosing one", () => {
    assert.equal(narrowingAnnouncement(21, 0), "No answers yet. Every design is shown.");
    assert.equal(narrowingAnnouncement(1, 3), "1 design fits every answer so far.");
    assert.equal(narrowingAnnouncement(5, 2), "5 designs fit every answer so far.");
    assert.equal(narrowingAnnouncement(0, 4), "No design fits every answer. Each design shows where it differs.");
  });
});
