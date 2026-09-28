import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { announcements, ratingAnnouncement } from "./announcements";

describe("announcements", () => {
  it("says what happened to a title, quoting it", () => {
    assert.equal(announcements.added("Sleep and screens", true), "“Sleep and screens” added as your working title.");
    assert.equal(announcements.added("Sleep and screens", false), "“Sleep and screens” added as an alternative.");
    assert.equal(announcements.working("B"), "“B” is now your working title.");
    assert.equal(announcements.favourite("B", false), "“B” is no longer a favourite.");
    assert.equal(announcements.restored("A"), "Earlier version restored: “A”.");
  });

  it("explains what to do when copying fails", () => {
    assert.match(announcements.copyFailed, /Select it and press Control\+C/);
  });
});

describe("ratingAnnouncement", () => {
  it("announces the rating in words, never as a number", () => {
    assert.equal(ratingAnnouncement("excellent", []), "Working title rated Excellent. No criterion needs another look.");
    assert.equal(ratingAnnouncement("good", ["Length"]), "Working title rated Good. Worth another look: length.");
    assert.equal(ratingAnnouncement("needs-improvement", ["Clarity", "Length", "Jargon"]), "Working title rated Needs improvement. Worth another look: clarity, length and jargon.");
    assert.doesNotMatch(ratingAnnouncement("needs-improvement", ["Clarity"]), /\d/);
  });
});
