import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { timeAgo } from "./copy";

const NOW = Date.UTC(2026, 8, 27, 12);

describe("timeAgo", () => {
  it("says just now for the last few seconds", () => {
    assert.equal(timeAgo(NOW - 10_000, NOW), "just now");
  });
  it("uses the largest whole unit", () => {
    assert.equal(timeAgo(NOW - 5 * 60_000, NOW), "5 minutes ago");
    assert.equal(timeAgo(NOW - 3 * 3_600_000, NOW), "3 hours ago");
    assert.equal(timeAgo(NOW - 86_400_000, NOW), "yesterday");
    assert.equal(timeAgo(NOW - 14 * 86_400_000, NOW), "2 weeks ago");
  });
  it("never speaks of the future: a save within the current minute is just now", () => {
    assert.equal(timeAgo(NOW + 30_000, NOW), "just now");
  });
  it("rounds a minute or so to a minute", () => {
    assert.equal(timeAgo(NOW - 50_000, NOW), "1 minute ago");
  });
});
