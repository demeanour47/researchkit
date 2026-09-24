import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseResponseRate } from "../../knowledge/research";
import { announcements, narrowingAnnouncement, responseRateError } from "./announcements";

describe("announcements", () => {
  it("names the technique added, removed or chosen", () => {
    assert.equal(announcements.added("Snowball"), "Snowball sampling added to your shortlist.");
    assert.equal(announcements.removed("Quota"), "Quota sampling removed from your shortlist.");
    assert.equal(announcements.chosen("Simple random"), "You chose simple random sampling. Its checks are shown below your plan.");
    assert.equal(announcements.chosen(null), "No technique chosen.");
    assert.equal(announcements.copied("Sampling plan"), "Sampling plan copied.");
  });
});

describe("narrowingAnnouncement", () => {
  it("describes how many techniques fit, without choosing one", () => {
    assert.equal(narrowingAnnouncement(13, 0), "No answers yet. Every technique is shown.");
    assert.equal(narrowingAnnouncement(1, 2), "1 technique fits every answer so far.");
    assert.equal(narrowingAnnouncement(5, 1), "5 techniques fit every answer so far.");
    assert.equal(narrowingAnnouncement(0, 3), "No technique fits every answer. Each technique shows where it differs.");
  });
});

describe("responseRateError", () => {
  it("explains an invalid response rate and accepts valid or empty ones", () => {
    assert.equal(responseRateError("65", parseResponseRate), null);
    assert.equal(responseRateError("", parseResponseRate), null);
    assert.equal(responseRateError("150", parseResponseRate), "Enter a percentage between 0 and 100.");
    assert.equal(responseRateError("most", parseResponseRate), "Enter a percentage between 0 and 100.");
  });
});
