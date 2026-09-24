import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TextStatistics } from "@/knowledge/text/text-statistics";
import { describeStats, formatCount, formatDuration, formatPace, formatStat, statFields, statLabels } from "./format";

// A fixed result, so these tests cover display only, never counting.
const stats: TextStatistics = {
  words: 1250,
  charactersWithSpaces: 7400,
  charactersWithoutSpaces: 6200,
  sentences: 61,
  paragraphs: 9,
  readingTime: { kind: "minutes", minutes: 6 },
  speakingTime: { kind: "minutes", minutes: 1 },
  averageWordsPerSentence: 20.5,
  averageCharactersPerWord: null,
  averageSentencesPerParagraph: 6.8,
  longestSentenceWords: 42,
  longestParagraphWords: 310,
  estimatedPagesSingleSpaced: 2.5,
  estimatedPagesDoubleSpaced: 5,
};

describe("formatCount", () => {
  it("groups thousands", () => {
    assert.equal(formatCount(0), "0");
    assert.equal(formatCount(999), "999");
    assert.equal(formatCount(1000), "1,000");
    assert.equal(formatCount(1234567), "1,234,567");
  });
});

describe("formatDuration", () => {
  it("describes every kind of duration", () => {
    assert.equal(formatDuration({ kind: "none" }), "0 minutes");
    assert.equal(formatDuration({ kind: "under-a-minute" }), "Less than one minute");
    assert.equal(formatDuration({ kind: "minutes", minutes: 1 }), "1 minute");
    assert.equal(formatDuration({ kind: "minutes", minutes: 2 }), "2 minutes");
    assert.equal(formatDuration({ kind: "minutes", minutes: 1500 }), "1,500 minutes");
  });
});

describe("formatStat", () => {
  it("formats counts and durations from the same result", () => {
    assert.equal(formatStat(stats, "words"), "1,250");
    assert.equal(formatStat(stats, "readingTime"), "6 minutes");
    assert.equal(formatStat(stats, "speakingTime"), "1 minute");
  });

  it("shows decimals only where a result has them", () => {
    assert.equal(formatStat(stats, "averageWordsPerSentence"), "20.5");
    assert.equal(formatStat(stats, "estimatedPagesDoubleSpaced"), "5");
  });

  it("says when a result has no value, instead of showing zero", () => {
    assert.equal(formatStat(stats, "averageCharactersPerWord"), "None");
  });
});

describe("formatPace", () => {
  it("states the pace in words per minute", () => {
    assert.equal(formatPace(200), "200 words per minute");
    assert.equal(formatPace(1000), "1,000 words per minute");
  });
});

describe("statFields", () => {
  it("pairs each result with its standard label, in the order asked for", () => {
    assert.deepEqual(statFields(["speakingTime", "words"]), [
      { key: "speakingTime", label: "Speaking time" },
      { key: "words", label: "Words" },
    ]);
  });

  it("labels every result the analysis produces", () => {
    assert.deepEqual(Object.keys(statLabels).sort(), Object.keys(stats).sort());
  });
});

describe("describeStats", () => {
  it("announces the chosen results in order, with their labels", () => {
    assert.equal(
      describeStats(stats, [
        { key: "readingTime", label: "Reading time" },
        { key: "speakingTime", label: "Speaking time" },
        { key: "words", label: "Words" },
      ]),
      "Reading time: 6 minutes. Speaking time: 1 minute. Words: 1,250.",
    );
  });

  it("announces nothing when no results are chosen", () => {
    assert.equal(describeStats(stats, []), "");
  });
});
