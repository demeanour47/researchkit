import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { announcements, evaluationAnnouncement, stepPosition } from "./announcements";

describe("announcements", () => {
  it("names the category chosen", () => {
    assert.equal(announcements.categoryChosen("Relational"), "Relational category chosen.");
  });

  it("announces a move with a position out of the total", () => {
    assert.equal(announcements.objectiveMoved(2, 3), "Objective moved to position 2 of 3.");
  });

  it("capitalises the subject when confirming a copy", () => {
    assert.equal(announcements.copied("your objectives"), "Your objectives copied.");
  });

  it("gives a way forward when copying fails", () => {
    assert.match(announcements.copyFailed("your objectives"), /Control\+C/);
  });

  it("names the position removed or duplicated", () => {
    assert.equal(announcements.objectiveRemoved(2), "Objective 2 removed.");
    assert.equal(announcements.objectiveDuplicated(2), "Objective 2 duplicated.");
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

describe("evaluationAnnouncement", () => {
  it("says nothing when there is nothing to summarise", () => {
    assert.equal(evaluationAnnouncement([]), "");
  });

  it("says every check looks aligned or is for review when nothing needs a look", () => {
    assert.equal(evaluationAnnouncement(["aligned", "review", "aligned"]), "Checks updated. Every check looks aligned or is for you to review.");
  });

  it("names the labels that need a look, in a fixed order", () => {
    assert.equal(evaluationAnnouncement(["aligned", "worth-checking"]), 'Checks updated. Look for items marked “Worth checking”.');
    assert.equal(
      evaluationAnnouncement(["worth-checking", "missing", "clarify"]),
      'Checks updated. Look for items marked “Missing”, “Needs clarification” or “Worth checking”.',
    );
  });
});
