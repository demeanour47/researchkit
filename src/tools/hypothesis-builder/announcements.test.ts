import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { announcements, evaluationAnnouncement } from "./announcements";

describe("announcements", () => {
  it("describes new drafts in words", () => {
    assert.equal(announcements.drafted("relationship", "negative", 3), "Relationship hypotheses, directional: lower or negative. 3 pairs drafted.");
    assert.equal(announcements.drafted("difference", "non-directional", 1), "Difference hypotheses, non-directional. 1 pair drafted.");
  });

  it("confirms copying, and explains what to do when it fails", () => {
    assert.equal(announcements.copied("null hypothesis"), "Null hypothesis copied.");
    assert.match(announcements.copyFailed("null hypothesis"), /^The null hypothesis couldn't be copied automatically\. Select the text/);
  });
});

describe("evaluationAnnouncement", () => {
  it("says nothing before there is an evaluation", () => {
    assert.equal(evaluationAnnouncement([]), "");
  });

  it("reassures when nothing needs a second look", () => {
    assert.equal(evaluationAnnouncement(["aligned", "review", "aligned"]), "Evaluation updated. Every check looks aligned or is for you to review.");
  });

  it("names the labels to look for, most important first", () => {
    assert.equal(evaluationAnnouncement(["worth-checking", "aligned"]), "Evaluation updated. Look for items marked “Worth checking”.");
    assert.equal(
      evaluationAnnouncement(["worth-checking", "missing", "clarify"]),
      "Evaluation updated. Look for items marked “Missing”, “Needs clarification” or “Worth checking”.",
    );
  });

  it("never announces a count or score", () => {
    assert.ok(!/\d/.test(evaluationAnnouncement(["missing", "aligned", "aligned", "worth-checking"])));
  });
});
